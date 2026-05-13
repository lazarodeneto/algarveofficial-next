import { NextRequest, NextResponse } from "next/server";

import {
  getAttentionCounts,
  getStatusCounts,
  getTranslationJobsGrouped,
} from "@/lib/admin/translations/queries";
import { adminErrorResponse, requireAdminSession, requireAdminWriteClient } from "@/lib/server/admin-auth";
import type { TranslationFilters, TranslationStatus } from "@/lib/admin/translations/types";
import { sanitizeHtmlString } from "@/lib/sanitizeHtml";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  TRANSLATION_PROCESSOR_UNAVAILABLE,
  isTranslationProcessorConfigured,
} from "@/lib/translations/processorConfig";

export const runtime = "nodejs";

const TARGET_LANGS = new Set(["pt-pt", "fr", "de", "es", "it", "nl", "sv", "no", "da"]);
const DONE_TRANSLATION_STATUSES: TranslationStatus[] = ["auto", "reviewed", "edited"];
const MAX_JOB_IDS = 50;
const JOB_CONSOLE_PAGE_SIZE = 12;
const JOB_STATUS_FILTERS = new Set<TranslationStatus>([
  "missing",
  "queued",
  "auto",
  "reviewed",
  "edited",
  "failed",
]);
const TRANSLATION_TEXT_FIELDS = [
  "title",
  "short_description",
  "description",
  "seo_title",
  "seo_description",
] as const;
const UNSAFE_TRANSLATION_CONTENT_PATTERN =
  /<\s*\/?\s*(script|style|iframe|object|embed|noscript|meta|link|base)\b|(?:\s|^)on[a-z]+\s*=|javascript\s*:|srcdoc\s*=/i;

type TranslationWriteClient = Awaited<ReturnType<typeof requireAdminWriteClient>> extends infer T
  ? T extends { writeClient: infer C }
    ? C
    : never
  : never;

interface QueryError {
  message: string;
}

interface QueryResult<T = unknown> {
  data: T | null;
  error: QueryError | null;
}

interface AdminQueryBuilder<T = unknown> extends PromiseLike<QueryResult<T>> {
  select(columns?: string, options?: unknown): AdminQueryBuilder<T>;
  update(payload: Record<string, unknown>): AdminQueryBuilder<T>;
  upsert(payload: Record<string, unknown>, options?: Record<string, unknown>): AdminQueryBuilder<T>;
  eq(column: string, value: unknown): AdminQueryBuilder<T>;
  in(column: string, values: readonly unknown[]): AdminQueryBuilder<T>;
  not(column: string, operator: string, value: unknown): AdminQueryBuilder<T>;
  lt(column: string, value: unknown): AdminQueryBuilder<T>;
  maybeSingle(): Promise<QueryResult<T>>;
}

interface AdminWriteClientLike {
  from<T = unknown>(table: string): AdminQueryBuilder<T>;
}

interface ListingRow {
  id?: string;
  name?: string | null;
  short_description?: string | null;
  description?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  slug?: string | null;
  tier?: string | null;
  status?: string | null;
  content_updated_at?: string | null;
}

interface TranslationJobRow {
  id: string;
  listing_id?: string;
  target_lang?: string;
  source_lang?: string;
  status?: TranslationStatus;
  attempts?: number | null;
  last_error?: string | null;
  updated_at?: string;
  listing?: ListingRow | ListingRow[] | null;
}

interface ListingTranslationRow {
  id?: string;
  title?: string | null;
  short_description?: string | null;
  description?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  translation_status?: TranslationStatus;
  updated_at?: string;
}

function adminClient(client: TranslationWriteClient): AdminWriteClientLike {
  return client as unknown as AdminWriteClientLike;
}

interface TranslationJobActionBody {
  action?: unknown;
  jobId?: unknown;
  jobIds?: unknown;
  listingId?: unknown;
  targetLang?: unknown;
  translation?: unknown;
}

function normalizeId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 128 ? trimmed : null;
}

function normalizeJobIds(body: TranslationJobActionBody): string[] {
  const ids = Array.isArray(body.jobIds)
    ? body.jobIds
    : body.jobId
      ? [body.jobId]
      : [];

  return Array.from(new Set(ids.map(normalizeId).filter(Boolean) as string[])).slice(0, MAX_JOB_IDS);
}

function normalizeTargetLang(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.toLowerCase().replaceAll("_", "-").trim();
  const canonical = normalized === "pt" ? "pt-pt" : normalized;
  return TARGET_LANGS.has(canonical) ? canonical : null;
}

function textField(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return sanitizeHtmlString(trimmed.slice(0, maxLength)).trim() || null;
}

function unsafeTranslationFields(data: Record<string, unknown>): string[] {
  return TRANSLATION_TEXT_FIELDS.filter((field) => {
    const value = data[field];
    return typeof value === "string" && UNSAFE_TRANSLATION_CONTENT_PATTERN.test(value);
  });
}

function parseTranslationPayload(raw: unknown) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const data = raw as Record<string, unknown>;
  const unsafeFields = unsafeTranslationFields(data);
  return {
    unsafeFields,
    translation: {
      title: textField(data.title, 180),
      short_description: textField(data.short_description, 500),
      description: textField(data.description, 8000),
      seo_title: textField(data.seo_title, 180),
      seo_description: textField(data.seo_description, 320),
    },
  };
}

function slaForTier(tier: string | null | undefined): {
  sla_deadline: string;
  sla_priority: number;
} {
  const now = Date.now();
  if (tier === "signature") {
    return { sla_deadline: new Date(now + 2 * 3_600_000).toISOString(), sla_priority: 100 };
  }
  if (tier === "verified") {
    return { sla_deadline: new Date(now + 4 * 3_600_000).toISOString(), sla_priority: 10 };
  }
  return { sla_deadline: new Date(now + 24 * 3_600_000).toISOString(), sla_priority: 1 };
}

function queuePayloadForListing(listing: { tier?: string | null; content_updated_at?: string | null }) {
  const sla = slaForTier(listing.tier);
  return {
    status: "queued" as TranslationStatus,
    source_lang: "en",
    attempts: 0,
    last_error: null,
    locked_at: null,
    source_updated_at: listing.content_updated_at ?? new Date().toISOString(),
    sla_deadline: sla.sla_deadline,
    sla_priority: sla.sla_priority,
    updated_at: new Date().toISOString(),
  };
}

async function queueExistingJobs(client: TranslationWriteClient, jobIds: string[]) {
  if (jobIds.length === 0) return 0;

  const db = adminClient(client);
  const { data, error } = await db
    .from<TranslationJobRow[]>("translation_jobs")
    .select("id, listing_id, target_lang, listing:listings!inner(tier, content_updated_at)")
    .in("id", jobIds);

  if (error) throw error;

  let updated = 0;
  for (const row of data ?? []) {
    const listing = (Array.isArray(row.listing) ? row.listing[0] : row.listing) as
      | { tier?: string | null; content_updated_at?: string | null }
      | null;

    const { error: updateError } = await db
      .from("translation_jobs")
      .update(queuePayloadForListing(listing ?? {}))
      .eq("id", row.id);

    if (updateError) throw updateError;
    updated += 1;
  }

  return updated;
}

async function queueListingTarget(
  client: TranslationWriteClient,
  listingId: string,
  targetLang: string,
) {
  const db = adminClient(client);
  const { data: listing, error: listingError } = await db
    .from<ListingRow>("listings")
    .select("id, tier, content_updated_at")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) throw listingError;
  if (!listing) {
    return { updated: 0, notFound: true };
  }

  const { error } = await db
    .from("translation_jobs")
    .upsert(
      {
        listing_id: listingId,
        target_lang: targetLang,
        ...queuePayloadForListing(listing),
      },
      { onConflict: "listing_id,target_lang" },
    );

  if (error) throw error;
  return { updated: 1, notFound: false };
}

async function reviewJobs(client: TranslationWriteClient, jobIds: string[]) {
  if (jobIds.length === 0) return 0;

  const { data, error } = await adminClient(client)
    .from<Array<{ id: string }>>("translation_jobs")
    .update({ status: "reviewed" as TranslationStatus, updated_at: new Date().toISOString() })
    .in("id", jobIds)
    .select("id");

  if (error) throw error;
  return data?.length ?? 0;
}

async function requeueOutdatedListing(client: TranslationWriteClient, listingId: string) {
  const db = adminClient(client);
  const { data: listing, error: listingError } = await db
    .from<ListingRow>("listings")
    .select("id, tier, content_updated_at")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) throw listingError;
  if (!listing?.content_updated_at) return 0;

  const { data: staleJobs, error: staleError } = await db
    .from<Array<{ id: string }>>("translation_jobs")
    .select("id")
    .eq("listing_id", listingId)
    .in("status", DONE_TRANSLATION_STATUSES)
    .not("source_updated_at", "is", null)
    .lt("source_updated_at", listing.content_updated_at);

  if (staleError) throw staleError;
  const ids = (staleJobs ?? []).map((job: { id: string }) => job.id);
  return queueExistingJobs(client, ids);
}

async function saveTranslationEdit(
  client: TranslationWriteClient,
  listingId: string,
  targetLang: string,
  translation: NonNullable<ReturnType<typeof parseTranslationPayload>>["translation"],
) {
  const now = new Date().toISOString();
  const db = adminClient(client);
  const { data: listing, error: listingError } = await db
    .from<ListingRow>("listings")
    .select("id, name")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) throw listingError;
  if (!listing) return { updated: 0, notFound: true };

  const { error: translationError } = await db
    .from("listing_translations")
    .upsert(
      {
        listing_id: listingId,
        language_code: targetLang,
        title: translation.title ?? listing.name ?? "Untitled listing",
        short_description: translation.short_description,
        description: translation.description,
        seo_title: translation.seo_title,
        seo_description: translation.seo_description,
        translation_status: "edited" as TranslationStatus,
        translated_at: now,
        updated_at: now,
      },
      { onConflict: "listing_id,language_code" },
    );

  if (translationError) throw translationError;

  const { error: jobError } = await db
    .from("translation_jobs")
    .update({ status: "edited" as TranslationStatus, updated_at: now })
    .eq("listing_id", listingId)
    .eq("target_lang", targetLang);

  if (jobError) throw jobError;
  return { updated: 1, notFound: false };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request, ["admin", "editor"]);
  if ("error" in auth) return auth.error;

  const serviceClient = createServiceRoleClient();
  if (!serviceClient) {
    return adminErrorResponse(
      500,
      "SERVER_MISCONFIGURED",
      "Server is missing SUPABASE_SERVICE_ROLE_KEY for translation admin reads.",
    );
  }

  const jobId = normalizeId(request.nextUrl.searchParams.get("jobId"));
  if (!jobId) {
    const requestedFilter = request.nextUrl.searchParams.get("filter")?.trim() ?? "attention";
    const filters: TranslationFilters = {
      page: 1,
      ...(requestedFilter === "attention"
        ? { needs_attention: true }
        : requestedFilter === "all"
          ? {}
          : JOB_STATUS_FILTERS.has(requestedFilter as TranslationStatus)
            ? { status: requestedFilter as TranslationStatus }
            : { needs_attention: true }),
    };

    try {
      const [counts, attention, jobs] = await Promise.all([
        getStatusCounts(serviceClient),
        getAttentionCounts(serviceClient),
        getTranslationJobsGrouped(serviceClient, filters),
      ]);

      return NextResponse.json({
        ok: true,
        data: {
          counts,
          attention,
          groups: jobs.groups.slice(0, JOB_CONSOLE_PAGE_SIZE),
          total: jobs.total,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return adminErrorResponse(500, "JOB_CONSOLE_FETCH_FAILED", message);
    }
  }

  const db = serviceClient as unknown as AdminWriteClientLike;

  const { data: job, error: jobError } = await db
    .from<TranslationJobRow>("translation_jobs")
    .select("id, listing_id, target_lang, source_lang, status, attempts, last_error, updated_at")
    .eq("id", jobId)
    .maybeSingle();

  if (jobError) {
    return adminErrorResponse(500, "JOB_FETCH_FAILED", jobError.message);
  }
  if (!job?.listing_id || !job.target_lang) {
    return adminErrorResponse(404, "JOB_NOT_FOUND", "Translation job not found.");
  }

  const [{ data: listing, error: listingError }, { data: translation, error: translationError }] =
    await Promise.all([
      db
        .from<ListingRow>("listings")
        .select("id, name, slug, short_description, description, meta_title, meta_description, tier, status")
        .eq("id", job.listing_id)
        .maybeSingle(),
      db
        .from<ListingTranslationRow>("listing_translations")
        .select("id, title, short_description, description, seo_title, seo_description, translation_status, updated_at")
        .eq("listing_id", job.listing_id)
        .eq("language_code", job.target_lang)
        .maybeSingle(),
    ]);

  if (listingError) {
    return adminErrorResponse(500, "LISTING_FETCH_FAILED", listingError.message);
  }
  if (translationError) {
    return adminErrorResponse(500, "TRANSLATION_FETCH_FAILED", translationError.message);
  }

  return NextResponse.json({
    ok: true,
    data: {
      job,
      listing,
      translation,
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins or editors can manage translation jobs.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for translation job writes.",
      allowedRoles: ["admin", "editor"],
      auditAction: "POST /api/admin/translations/jobs",
    },
  );
  if ("error" in auth) return auth.error;

  let body: TranslationJobActionBody;
  try {
    body = (await request.json()) as TranslationJobActionBody;
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const action = typeof body.action === "string" ? body.action.trim() : "";

  try {
    if (action === "queue") {
      if (!isTranslationProcessorConfigured()) {
        return adminErrorResponse(
          409,
          "TRANSLATION_PROCESSOR_UNCONFIGURED",
          TRANSLATION_PROCESSOR_UNAVAILABLE,
        );
      }
      const jobIds = normalizeJobIds(body);
      const listingId = normalizeId(body.listingId);
      const targetLang = normalizeTargetLang(body.targetLang);

      if (jobIds.length > 0) {
        const updated = await queueExistingJobs(auth.writeClient, jobIds);
        return NextResponse.json({ ok: true, data: { updated } });
      }

      if (listingId && targetLang) {
        const result = await queueListingTarget(auth.writeClient, listingId, targetLang);
        if (result.notFound) {
          return adminErrorResponse(404, "LISTING_NOT_FOUND", "Listing not found.");
        }
        return NextResponse.json({ ok: true, data: { updated: result.updated } });
      }

      return adminErrorResponse(400, "VALIDATION_ERROR", "Queue action requires jobIds or listingId and targetLang.");
    }

    if (action === "review") {
      const jobIds = normalizeJobIds(body);
      if (jobIds.length === 0) {
        return adminErrorResponse(400, "VALIDATION_ERROR", "Review action requires jobIds.");
      }
      const updated = await reviewJobs(auth.writeClient, jobIds);
      return NextResponse.json({ ok: true, data: { updated } });
    }

    if (action === "requeue_outdated") {
      const listingId = normalizeId(body.listingId);
      if (!listingId) {
        return adminErrorResponse(400, "VALIDATION_ERROR", "Requeue outdated action requires listingId.");
      }
      const updated = await requeueOutdatedListing(auth.writeClient, listingId);
      return NextResponse.json({ ok: true, data: { updated } });
    }

    if (action === "save_edit") {
      const listingId = normalizeId(body.listingId);
      const targetLang = normalizeTargetLang(body.targetLang);
      const parsedTranslation = parseTranslationPayload(body.translation);
      if (!listingId || !targetLang || !parsedTranslation) {
        return adminErrorResponse(400, "VALIDATION_ERROR", "Save edit requires listingId, targetLang, and translation.");
      }
      if (parsedTranslation.unsafeFields.length > 0) {
        return adminErrorResponse(
          400,
          "UNSAFE_TRANSLATION_CONTENT",
          `Translation contains unsafe content in: ${parsedTranslation.unsafeFields.join(", ")}.`,
        );
      }
      const result = await saveTranslationEdit(auth.writeClient, listingId, targetLang, parsedTranslation.translation);
      if (result.notFound) {
        return adminErrorResponse(404, "LISTING_NOT_FOUND", "Listing not found.");
      }
      return NextResponse.json({ ok: true, data: { updated: result.updated } });
    }

    return adminErrorResponse(400, "UNKNOWN_ACTION", "Unknown translation job action.");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return adminErrorResponse(500, "TRANSLATION_JOB_ACTION_FAILED", message);
  }
}
