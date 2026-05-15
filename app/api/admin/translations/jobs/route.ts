import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
const AUTO_REQUEUE_STATUSES: TranslationStatus[] = ["auto", "reviewed"];
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
const TRANSLATION_FIELD_LIMITS = {
  title: 180,
  short_description: 500,
  description: 8000,
  seo_title: 180,
  seo_description: 320,
} as const;
const UNSAFE_TRANSLATION_CONTENT_PATTERN =
  /<\s*\/?\s*(script|style|iframe|object|embed|noscript|meta|link|base)\b|(?:\s|^)on[a-z]+\s*=|javascript\s*:|srcdoc\s*=/i;
const translationPayloadSchema = z
  .object({
    title: z.string().nullable().optional(),
    short_description: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    seo_title: z.string().nullable().optional(),
    seo_description: z.string().nullable().optional(),
  })
  .strict();
const saveStatusSchema = z.enum(["edited", "reviewed"]);

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
  listing_id?: string;
  language_code?: string;
  title?: string | null;
  short_description?: string | null;
  description?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  translation_status?: TranslationStatus;
  translation_source?: string | null;
  updated_at?: string;
}

interface ManualTranslationConflict {
  listingId: string;
  targetLang: string;
  updatedAt: string | null;
}

function isProtectedManualTranslation(row: Pick<ListingTranslationRow, "translation_status" | "translation_source"> | null | undefined) {
  return row?.translation_source === "manual" || row?.translation_status === "edited";
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
  saveStatus?: unknown;
  overwriteManual?: unknown;
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

function textField(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return sanitizeHtmlString(trimmed).trim() || null;
}

function unsafeTranslationFields(data: Record<string, unknown>): string[] {
  return TRANSLATION_TEXT_FIELDS.filter((field) => {
    const value = data[field];
    return typeof value === "string" && UNSAFE_TRANSLATION_CONTENT_PATTERN.test(value);
  });
}

function parseTranslationPayload(raw: unknown) {
  const parsed = translationPayloadSchema.safeParse(raw);
  if (!parsed.success) return null;
  const data = parsed.data as Record<string, unknown>;
  const unsafeFields = unsafeTranslationFields(data);
  const overLimitFields = TRANSLATION_TEXT_FIELDS.filter((field) => {
    const value = data[field];
    return typeof value === "string" && value.trim().length > TRANSLATION_FIELD_LIMITS[field];
  });

  return {
    unsafeFields,
    overLimitFields,
    translation: {
      title: textField(data.title),
      short_description: textField(data.short_description),
      description: textField(data.description),
      seo_title: textField(data.seo_title),
      seo_description: textField(data.seo_description),
    },
  };
}

type ListingTranslationPayload = NonNullable<ReturnType<typeof parseTranslationPayload>>["translation"];
type ListingTranslationField = keyof ListingTranslationPayload;

function requiredFieldsForListing(listing: ListingRow): ListingTranslationField[] {
  const fields: ListingTranslationField[] = ["title"];
  if (listing.short_description?.trim()) fields.push("short_description");
  if (listing.description?.trim()) fields.push("description");
  if (listing.meta_title?.trim()) fields.push("seo_title");
  if (listing.meta_description?.trim()) fields.push("seo_description");
  return fields;
}

function missingRequiredFields(listing: ListingRow, translation: ListingTranslationPayload): string[] {
  return requiredFieldsForListing(listing).filter((field) => !translation[field]?.trim());
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

function queuePayloadForListing(
  listing: { tier?: string | null; content_updated_at?: string | null },
  allowManualOverwrite = false,
) {
  const sla = slaForTier(listing.tier);
  return {
    status: "queued" as TranslationStatus,
    source_lang: "en",
    attempts: 0,
    last_error: null,
    locked_at: null,
    allow_manual_overwrite: allowManualOverwrite,
    source_updated_at: listing.content_updated_at ?? new Date().toISOString(),
    sla_deadline: sla.sla_deadline,
    sla_priority: sla.sla_priority,
    updated_at: new Date().toISOString(),
  };
}

async function findManualTranslationConflicts(
  client: TranslationWriteClient,
  pairs: Array<{ listingId: string; targetLang: string }>,
): Promise<ManualTranslationConflict[]> {
  const uniquePairs = Array.from(
    new Map(pairs.map((pair) => [`${pair.listingId}:${pair.targetLang}`, pair])).values(),
  );
  if (uniquePairs.length === 0) return [];

  const listingIds = Array.from(new Set(uniquePairs.map((pair) => pair.listingId)));
  const targetLangs = Array.from(new Set(uniquePairs.map((pair) => pair.targetLang)));
  const requestedPairKeys = new Set(uniquePairs.map((pair) => `${pair.listingId}:${pair.targetLang}`));

  const { data, error } = await adminClient(client)
    .from<ListingTranslationRow[]>("listing_translations")
    .select("listing_id, language_code, translation_status, translation_source, updated_at")
    .in("listing_id", listingIds)
    .in("language_code", targetLangs);

  if (error) throw error;

  return (data ?? [])
    .filter(isProtectedManualTranslation)
    .filter((row) => row.listing_id && row.language_code && requestedPairKeys.has(`${row.listing_id}:${row.language_code}`))
    .map((row) => ({
      listingId: row.listing_id!,
      targetLang: row.language_code!,
      updatedAt: row.updated_at ?? null,
    }));
}

async function queueExistingJobs(
  client: TranslationWriteClient,
  jobIds: string[],
  allowManualOverwrite = false,
) {
  if (jobIds.length === 0) return { updated: 0, conflicts: [] as ManualTranslationConflict[] };

  const db = adminClient(client);
  const { data, error } = await db
    .from<TranslationJobRow[]>("translation_jobs")
    .select("id, listing_id, target_lang, listing:listings!inner(tier, content_updated_at)")
    .in("id", jobIds);

  if (error) throw error;

  const rows = data ?? [];
  const conflicts = allowManualOverwrite
    ? []
    : await findManualTranslationConflicts(
        client,
        rows
          .filter((row) => row.listing_id && row.target_lang)
          .map((row) => ({ listingId: row.listing_id!, targetLang: row.target_lang! })),
      );

  if (conflicts.length > 0) return { updated: 0, conflicts };

  let updated = 0;
  for (const row of rows) {
    const listing = (Array.isArray(row.listing) ? row.listing[0] : row.listing) as
      | { tier?: string | null; content_updated_at?: string | null }
      | null;

    const { error: updateError } = await db
      .from("translation_jobs")
      .update(queuePayloadForListing(listing ?? {}, allowManualOverwrite))
      .eq("id", row.id);

    if (updateError) throw updateError;
    updated += 1;
  }

  return { updated, conflicts: [] as ManualTranslationConflict[] };
}

async function queueListingTarget(
  client: TranslationWriteClient,
  listingId: string,
  targetLang: string,
  allowManualOverwrite = false,
) {
  const db = adminClient(client);
  const { data: listing, error: listingError } = await db
    .from<ListingRow>("listings")
    .select("id, tier, content_updated_at")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) throw listingError;
  if (!listing) {
    return { updated: 0, notFound: true, conflicts: [] as ManualTranslationConflict[] };
  }

  if (!allowManualOverwrite) {
    const conflicts = await findManualTranslationConflicts(client, [{ listingId, targetLang }]);
    if (conflicts.length > 0) {
      return { updated: 0, notFound: false, conflicts };
    }
  }

  const { error } = await db
    .from("translation_jobs")
    .upsert(
      {
        listing_id: listingId,
        target_lang: targetLang,
        ...queuePayloadForListing(listing, allowManualOverwrite),
      },
      { onConflict: "listing_id,target_lang" },
    );

  if (error) throw error;
  return { updated: 1, notFound: false, conflicts: [] as ManualTranslationConflict[] };
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
    .from<Array<{ id: string; listing_id?: string; target_lang?: string }>>("translation_jobs")
    .select("id, listing_id, target_lang")
    .eq("listing_id", listingId)
    .in("status", AUTO_REQUEUE_STATUSES)
    .not("source_updated_at", "is", null)
    .lt("source_updated_at", listing.content_updated_at);

  if (staleError) throw staleError;
  const rows = staleJobs ?? [];
  const conflicts = await findManualTranslationConflicts(
    client,
    rows
      .filter((job) => job.listing_id && job.target_lang)
      .map((job) => ({ listingId: job.listing_id!, targetLang: job.target_lang! })),
  );
  const conflictKeys = new Set(conflicts.map((conflict) => `${conflict.listingId}:${conflict.targetLang}`));
  const ids = rows
    .filter((job) => !conflictKeys.has(`${job.listing_id}:${job.target_lang}`))
    .map((job) => job.id);
  const result = await queueExistingJobs(client, ids);
  return result.updated;
}

async function saveTranslationEdit(
  client: TranslationWriteClient,
  listingId: string,
  targetLang: string,
  translation: ListingTranslationPayload,
  saveStatus: "edited" | "reviewed",
) {
  const now = new Date().toISOString();
  const db = adminClient(client);
  const { data: listing, error: listingError } = await db
    .from<ListingRow>("listings")
    .select("id, name, short_description, description, meta_title, meta_description, tier, content_updated_at")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) throw listingError;
  if (!listing) return { updated: 0, notFound: true, missingFields: [] as string[] };

  const missingFields = missingRequiredFields(listing, translation);
  if (saveStatus === "reviewed" && missingFields.length > 0) {
    return { updated: 0, notFound: false, missingFields };
  }

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
        translation_status: saveStatus as TranslationStatus,
        translation_source: "manual",
        translated_at: now,
        updated_at: now,
      },
      { onConflict: "listing_id,language_code" },
    );

  if (translationError) throw translationError;

  const sla = slaForTier(listing.tier);
  const { error: jobError } = await db
    .from("translation_jobs")
    .upsert(
      {
        listing_id: listingId,
        target_lang: targetLang,
        source_lang: "en",
        status: saveStatus as TranslationStatus,
        attempts: 0,
        last_error: null,
        locked_at: null,
        allow_manual_overwrite: false,
        source_updated_at: listing.content_updated_at ?? now,
        sla_deadline: sla.sla_deadline,
        sla_priority: sla.sla_priority,
        updated_at: now,
      },
      { onConflict: "listing_id,target_lang" },
    );

  if (jobError) throw jobError;
  return { updated: 1, notFound: false, missingFields: [] as string[] };
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
        .select("id, name, slug, short_description, description, meta_title, meta_description, tier, status, content_updated_at")
        .eq("id", job.listing_id)
        .maybeSingle(),
      db
        .from<ListingTranslationRow>("listing_translations")
        .select("id, listing_id, language_code, title, short_description, description, seo_title, seo_description, translation_status, translation_source, updated_at")
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
      const overwriteManual = body.overwriteManual === true;

      if (jobIds.length > 0) {
        const result = await queueExistingJobs(auth.writeClient, jobIds, overwriteManual);
        if (result.conflicts.length > 0) {
          return adminErrorResponse(
            409,
            "MANUAL_TRANSLATION_EXISTS",
            "A manual translation already exists. Confirm overwrite before queueing automatic translation.",
          );
        }
        const updated = result.updated;
        return NextResponse.json({ ok: true, data: { updated } });
      }

      if (listingId && targetLang) {
        const result = await queueListingTarget(auth.writeClient, listingId, targetLang, overwriteManual);
        if (result.notFound) {
          return adminErrorResponse(404, "LISTING_NOT_FOUND", "Listing not found.");
        }
        if (result.conflicts.length > 0) {
          return adminErrorResponse(
            409,
            "MANUAL_TRANSLATION_EXISTS",
            "A manual translation already exists. Confirm overwrite before queueing automatic translation.",
          );
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
      if (parsedTranslation.overLimitFields.length > 0) {
        return adminErrorResponse(
          400,
          "VALIDATION_ERROR",
          `Translation fields exceed length limits: ${parsedTranslation.overLimitFields.join(", ")}.`,
        );
      }
      const parsedSaveStatus = saveStatusSchema.safeParse(body.saveStatus);
      const saveStatus = parsedSaveStatus.success ? parsedSaveStatus.data : "edited";
      const result = await saveTranslationEdit(
        auth.writeClient,
        listingId,
        targetLang,
        parsedTranslation.translation,
        saveStatus,
      );
      if (result.notFound) {
        return adminErrorResponse(404, "LISTING_NOT_FOUND", "Listing not found.");
      }
      if (result.missingFields.length > 0) {
        return adminErrorResponse(
          400,
          "REQUIRED_FIELDS_MISSING",
          `Required translation fields are missing: ${result.missingFields.join(", ")}.`,
        );
      }
      return NextResponse.json({ ok: true, data: { updated: result.updated } });
    }

    return adminErrorResponse(400, "UNKNOWN_ACTION", "Unknown translation job action.");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return adminErrorResponse(500, "TRANSLATION_JOB_ACTION_FAILED", message);
  }
}
