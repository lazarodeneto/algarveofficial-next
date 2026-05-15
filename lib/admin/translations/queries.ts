import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AttentionCounts,
  FilterOptions,
  ListingJobGroup,
  ListingRow,
  SeoCoverageLabel,
  StatusCounts,
  TranslationFilters,
  TranslationJob,
  TranslationStatus,
} from "./types";
import {
  ATTENTION_STATUSES,
  DONE_STATUSES,
  HIGH_PRIORITY_CITIES,
  HIGH_TRAFFIC_LOCALES,
  PAGE_SIZE,
  SEO_REQUIRED_LOCALES,
  STALE_DAYS,
} from "./types";

type Supabase = SupabaseClient;

type EmbeddedName = { name?: string | null } | Array<{ name?: string | null }> | string | null | undefined;

interface EmbeddedListingRow {
  id?: string | null;
  name?: string | null;
  city?: EmbeddedName;
  category?: EmbeddedName;
  tier?: string | null;
  status?: string | null;
  is_homepage_visible?: boolean | null;
  is_top_category?: boolean | null;
  content_updated_at?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isStale(updatedAt: string): boolean {
  return Date.now() - new Date(updatedAt).getTime() > STALE_DAYS * 86_400_000;
}

/** A job is outdated when it is done but the listing content has since changed. */
function isOutdated(job: TranslationJob, listing: ListingRow): boolean {
  return (
    DONE_STATUSES.includes(job.status) &&
    !!job.source_updated_at &&
    !!listing.content_updated_at &&
    new Date(job.source_updated_at) < new Date(listing.content_updated_at)
  );
}

function embeddedName(value: EmbeddedName): string {
  if (typeof value === "string") return value;
  const row = Array.isArray(value) ? value[0] : value;
  return row?.name ?? "";
}

function normalizeEmbeddedListing(raw: unknown): ListingRow | null {
  const row = (Array.isArray(raw) ? raw[0] : raw) as EmbeddedListingRow | null;
  if (!row?.id) return null;

  return {
    id: row.id,
    name: row.name ?? "Untitled listing",
    city: embeddedName(row.city),
    category: embeddedName(row.category),
    tier: row.tier ?? "unverified",
    status: row.status ?? "draft",
    is_homepage_visible: row.is_homepage_visible ?? false,
    is_top_category: row.is_top_category ?? false,
    content_updated_at: row.content_updated_at ?? "",
  };
}

// ─── Priority Score ────────────────────────────────────────────────────────────

function calcPriorityScore(listing: ListingRow, jobs: TranslationJob[]): number {
  const hasFailed  = jobs.some((j) => j.status === "failed");
  const hasMissing = jobs.some((j) => j.status === "missing");
  const hasQueued  = jobs.some((j) => j.status === "queued");
  const hasOutdated = jobs.some((j) => isOutdated(j, listing));
  const maxSlaPriority = Math.max(0, ...jobs.map((j) => j.sla_priority ?? 0));
  const hasHighTrafficGap = jobs.some(
    (j) =>
      (HIGH_TRAFFIC_LOCALES as readonly string[]).includes(j.target_lang) &&
      (ATTENTION_STATUSES as TranslationStatus[]).includes(j.status),
  );
  const hasStale = jobs.some((j) => isStale(j.updated_at));

  let score = listing.tier === "signature" ? 100 : 10;
  score += maxSlaPriority;
  if (hasFailed)                              score += 80;
  if (hasMissing)                             score += 50;
  if (hasQueued)                              score += 20;
  if (hasOutdated)                            score += 35;  // stale content penalises score
  if (HIGH_PRIORITY_CITIES.includes(listing.city)) score += 25;
  if (listing.is_homepage_visible)            score += 40;
  if (listing.is_top_category)               score += 30;
  if (hasHighTrafficGap)                      score += 20;
  if (hasStale)                               score += 15;

  return score;
}

// ─── SEO Coverage ─────────────────────────────────────────────────────────────

function calcSeoCoverage(jobs: TranslationJob[]): {
  seoCoverage: number;
  seoCoverageLabel: SeoCoverageLabel;
} {
  const completedCount = (SEO_REQUIRED_LOCALES as readonly string[]).filter((locale) =>
    jobs.some((j) => j.target_lang === locale && DONE_STATUSES.includes(j.status)),
  ).length;

  const pct   = Math.round((completedCount / SEO_REQUIRED_LOCALES.length) * 100);
  const label: SeoCoverageLabel =
    pct === 100 ? "complete" : pct < 50 ? "critical" : "partial";

  return { seoCoverage: pct, seoCoverageLabel: label };
}

// ─── Group Enrichment ─────────────────────────────────────────────────────────

function enrichGroup(listing: ListingRow, jobs: TranslationJob[]): ListingJobGroup {
  const now = new Date();

  const doneCount      = jobs.filter((j) => DONE_STATUSES.includes(j.status)).length;
  const problemCount   = jobs.filter((j) => j.status === "missing" || j.status === "failed").length;
  const pendingCount   = jobs.filter((j) => j.status === "queued").length;
  const attentionCount = jobs.filter((j) =>
    (ATTENTION_STATUSES as TranslationStatus[]).includes(j.status),
  ).length;
  const slaBreachCount = jobs.filter(
    (j) =>
      j.sla_deadline &&
      (ATTENTION_STATUSES as TranslationStatus[]).includes(j.status) &&
      new Date(j.sla_deadline) < now,
  ).length;
  const outdatedCount = jobs.filter((j) => isOutdated(j, listing)).length;

  const { seoCoverage, seoCoverageLabel } = calcSeoCoverage(jobs);
  const priorityScore = calcPriorityScore(listing, jobs);

  return {
    listing,
    jobs,
    priorityScore,
    seoCoverage,
    seoCoverageLabel,
    doneCount,
    problemCount,
    pendingCount,
    attentionCount,
    slaBreachCount,
    outdatedCount,
  };
}

// ─── Status Counts ────────────────────────────────────────────────────────────

export async function getStatusCounts(supabase: Supabase): Promise<StatusCounts> {
  const counts: StatusCounts = {
    missing: 0, queued: 0, auto: 0, reviewed: 0, edited: 0, failed: 0,
  };

  await Promise.all(
    (Object.keys(counts) as TranslationStatus[]).map(async (status) => {
      const { count, error } = await supabase
        .from("translation_jobs")
        .select("id", { count: "exact", head: true })
        .eq("status", status);

      if (error) throw error;
      counts[status] = count ?? 0;
    }),
  );

  return counts;
}

// ─── Attention Counts (CommandModeBar) ────────────────────────────────────────

export async function getAttentionCounts(supabase: Supabase): Promise<AttentionCounts> {
  // ── Attention jobs (missing / queued / failed) ─────────────────────────────
  const { data: attentionRows, error: attentionError } = await supabase
    .from("translation_jobs")
    .select("listing_id, status, sla_deadline, listing:listings!inner(tier)")
    .in("status", ATTENTION_STATUSES);

  if (attentionError) throw attentionError;

  const rows = attentionRows ?? [];
  const now  = new Date();

  const uniqueListingIds = new Set(rows.map((r) => r.listing_id as string));

  const seenSignature = new Set<string>();
  for (const r of rows) {
    const listing = (Array.isArray(r.listing) ? r.listing[0] : r.listing) as
      | { tier?: string }
      | null;
    if (listing?.tier === "signature") seenSignature.add(r.listing_id as string);
  }

  const slaRiskCount = rows.filter(
    (r) => r.sla_deadline && new Date(r.sla_deadline as string) < now,
  ).length;

  // ── Outdated jobs (done but source version stale) ─────────────────────────
  const { data: doneRows, error: doneError } = await supabase
    .from("translation_jobs")
    .select(
      "listing_id, source_updated_at, listing:listings!inner(content_updated_at)",
    )
    .in("status", DONE_STATUSES)
    .not("source_updated_at", "is", null);

  if (doneError) throw doneError;

  const outdatedCount = (doneRows ?? []).filter((r) => {
    const lst = (Array.isArray(r.listing) ? r.listing[0] : r.listing) as
      | { content_updated_at?: string }
      | null;
    return (
      lst?.content_updated_at &&
      new Date(r.source_updated_at as string) < new Date(lst.content_updated_at)
    );
  }).length;

  return {
    total:          uniqueListingIds.size,
    missing:        rows.filter((r) => r.status === "missing").length,
    queued:         rows.filter((r) => r.status === "queued").length,
    failed:         rows.filter((r) => r.status === "failed").length,
    slaRiskCount,
    signatureCount: seenSignature.size,
    outdatedCount,
  };
}

// ─── Jobs (Grouped + Paginated) ───────────────────────────────────────────────

export async function getTranslationJobsGrouped(
  supabase: Supabase,
  filters: TranslationFilters,
): Promise<{ groups: ListingJobGroup[]; total: number }> {
  const page   = filters.page ?? 1;
  const offset = (page - 1) * PAGE_SIZE;

  // ── Step 1a: Pre-resolve listing IDs for needs_attention filter ────────────
  let attentionListingIds: string[] | null = null;
  if (filters.needs_attention) {
    const { data: rows, error } = await supabase
      .from("translation_jobs")
      .select("listing_id")
      .in("status", ATTENTION_STATUSES);
    if (error) throw error;

    attentionListingIds = [
      ...new Set((rows ?? []).map((r) => r.listing_id as string)),
    ];
    if (attentionListingIds.length === 0) return { groups: [], total: 0 };
  }

  // ── Step 1b: Pre-resolve listing IDs for outdated filter ──────────────────
  let outdatedListingIds: string[] | null = null;
  if (filters.outdated) {
    const { data: rows, error } = await supabase
      .from("translation_jobs")
      .select(
        "listing_id, source_updated_at, listing:listings!inner(content_updated_at)",
      )
      .in("status", DONE_STATUSES)
      .not("source_updated_at", "is", null);
    if (error) throw error;

    outdatedListingIds = [
      ...new Set(
        (rows ?? [])
          .filter((r) => {
            const lst = (Array.isArray(r.listing)
              ? r.listing[0]
              : r.listing) as { content_updated_at?: string } | null;
            return (
              lst?.content_updated_at &&
              new Date(r.source_updated_at as string) <
                new Date(lst.content_updated_at)
            );
          })
          .map((r) => r.listing_id as string),
      ),
    ];
    if (outdatedListingIds.length === 0) return { groups: [], total: 0 };
  }

  // ── Step 2: Main query ────────────────────────────────────────────────────
  let query = supabase
    .from("translation_jobs")
    .select(
      `
      id, listing_id, source_lang, target_lang, status, attempts, last_error,
      created_at, updated_at, sla_deadline, sla_priority, source_updated_at,
      listing:listings!inner(
        id, name, tier, status, content_updated_at,
        city:cities!inner(name),
        category:categories!inner(name)
      )
      `,
      { count: "exact" },
    );

  if (filters.status)          query = query.eq("status", filters.status);
  if (filters.target_lang)     query = query.eq("target_lang", filters.target_lang);
  if (filters.tier)            query = query.eq("listings.tier", filters.tier);
  if (filters.city)            query = query.eq("listing.city.name", filters.city);
  if (filters.category)        query = query.eq("listing.category.name", filters.category);
  if (attentionListingIds)     query = query.in("listing_id", attentionListingIds);
  if (outdatedListingIds)      query = query.in("listing_id", outdatedListingIds);

  if (filters.sla_breach) {
    query = query
      .not("sla_deadline", "is", null)
      .lt("sla_deadline", new Date().toISOString())
      .in("status", ATTENTION_STATUSES);
  }

  const { data, error, count } = await (
    filters.sla_breach
      ? query.order("sla_deadline", { ascending: true })
      : query.order("updated_at",   { ascending: false })
  ).range(offset, offset + PAGE_SIZE - 1);

  if (error) throw error;

  // ── Step 3: Group by listing_id ───────────────────────────────────────────
  const map = new Map<string, { listing: ListingRow; jobs: TranslationJob[] }>();

  for (const row of data ?? []) {
    const listing = normalizeEmbeddedListing(row.listing);
    if (!listing) continue;

    const job: TranslationJob = {
      id:               row.id,
      listing_id:       row.listing_id,
      source_lang:      row.source_lang,
      target_lang:      row.target_lang,
      status:           row.status as TranslationStatus,
      attempts:         row.attempts ?? 0,
      last_error:       row.last_error ?? null,
      created_at:       row.created_at,
      updated_at:       row.updated_at,
      sla_deadline:     row.sla_deadline ?? null,
      sla_priority:     row.sla_priority ?? 0,
      source_updated_at: row.source_updated_at ?? null,
    };

    if (!map.has(listing.id)) map.set(listing.id, { listing, jobs: [] });
    map.get(listing.id)!.jobs.push(job);
  }

  // ── Step 4: Enrich + sort by priority ────────────────────────────────────
  const groups = [...map.values()]
    .map(({ listing, jobs }) => enrichGroup(listing, jobs))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  return { groups, total: count ?? 0 };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

type TranslationJobActionResponse<T = unknown> = {
  ok?: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
};

export class TranslationAdminApiError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "TranslationAdminApiError";
    this.status = status;
    this.code = code;
  }
}

async function requestTranslationJobAction<T = unknown>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch("/api/admin/translations/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as TranslationJobActionResponse<T>;

  if (!response.ok || payload.ok === false) {
    throw new TranslationAdminApiError(
      response.status,
      payload.error?.code ?? "TRANSLATION_ADMIN_REQUEST_FAILED",
      payload.error?.message ?? "Translation request failed.",
    );
  }

  return payload.data as T;
}

export interface TranslationEditorData {
  job: TranslationJob;
  listing: {
    id: string;
    name: string | null;
    slug: string | null;
    short_description: string | null;
    description: string | null;
    meta_title: string | null;
    meta_description: string | null;
    tier: string | null;
    status: string | null;
    content_updated_at?: string | null;
  };
  translation: {
    id?: string;
    listing_id?: string;
    language_code?: string;
    title: string | null;
    short_description: string | null;
    description: string | null;
    seo_title: string | null;
    seo_description: string | null;
    translation_status?: TranslationStatus | null;
    translation_source?: "manual" | "automatic" | null;
    updated_at?: string | null;
  } | null;
}

export type ManualTranslationPayload = {
  title: string | null;
  short_description: string | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

export async function getTranslationEditorData(jobId: string): Promise<TranslationEditorData> {
  const params = new URLSearchParams({ jobId });
  const response = await fetch(`/api/admin/translations/jobs?${params.toString()}`);
  const payload = (await response.json().catch(() => ({}))) as TranslationJobActionResponse<TranslationEditorData>;

  if (!response.ok || payload.ok === false || !payload.data) {
    throw new TranslationAdminApiError(
      response.status,
      payload.error?.code ?? "TRANSLATION_EDITOR_FETCH_FAILED",
      payload.error?.message ?? "Translation editor data could not be loaded.",
    );
  }

  return payload.data;
}

export async function updateTranslationStatus(
  _supabase: Supabase,
  id: string,
  status: TranslationStatus,
): Promise<void> {
  await requestTranslationJobAction({
    action: status === "reviewed" ? "review" : "queue",
    jobIds: [id],
  });
}

export async function bulkUpdateTranslationStatus(
  _supabase: Supabase,
  ids: string[],
  status: TranslationStatus,
  options: { overwriteManual?: boolean } = {},
): Promise<void> {
  if (ids.length === 0) return;
  await requestTranslationJobAction({
    action: status === "reviewed" ? "review" : "queue",
    jobIds: ids,
    overwriteManual: options.overwriteManual === true,
  });
}

/**
 * Enqueue or re-queue a translation job.
 * Fetches the listing's tier and content_updated_at so SLA is always correct
 * regardless of which caller triggers this — no tier parameter needed.
 */
export async function enqueueTranslationJob(
  _supabase: Supabase,
  listing_id: string,
  target_lang: string,
  options: { overwriteManual?: boolean } = {},
): Promise<void> {
  await requestTranslationJobAction({
    action: "queue",
    listingId: listing_id,
    targetLang: target_lang,
    overwriteManual: options.overwriteManual === true,
  });
}

/**
 * Re-queue all outdated done jobs for a listing.
 * Outdated = status in (auto, reviewed, edited) AND
 *            source_updated_at < listings.content_updated_at.
 *
 * For Signature: called automatically by the DB trigger; exposed here for
 *                manual override or admin-triggered re-runs.
 * For Verified:  must be called explicitly from the dashboard.
 *
 * Returns the number of jobs re-queued.
 */
export async function requeueOutdatedJobs(
  _supabase: Supabase,
  listing_id: string,
  _tier: string,
): Promise<number> {
  const result = await requestTranslationJobAction<{ updated?: number }>({
    action: "requeue_outdated",
    listingId: listing_id,
  });
  return result.updated ?? 0;
}

export async function saveManualTranslation({
  listingId,
  targetLang,
  translation,
  saveStatus,
}: {
  listingId: string;
  targetLang: string;
  translation: ManualTranslationPayload;
  saveStatus: "edited" | "reviewed";
}): Promise<void> {
  await requestTranslationJobAction({
    action: "save_edit",
    listingId,
    targetLang,
    translation,
    saveStatus,
  });
}

// ─── Filter Options ───────────────────────────────────────────────────────────

export async function getFilterOptions(supabase: Supabase): Promise<FilterOptions> {
  const [citiesRes, catsRes, langsRes] = await Promise.all([
    supabase.from("listings").select("city:cities!inner(name)"),
    supabase.from("listings").select("category:categories!inner(name)"),
    supabase.from("translation_jobs").select("target_lang").not("target_lang", "is", null),
  ]);

  const uniq = <T>(arr: T[]) => [...new Set(arr)].sort();

  return {
    cities:     uniq((citiesRes.data ?? []).map((r) => embeddedName(r.city)).filter(Boolean)),
    categories: uniq((catsRes.data ?? []).map((r) => embeddedName(r.category)).filter(Boolean)),
    languages:  uniq((langsRes.data ?? []).map((r) => r.target_lang).filter(Boolean) as string[]),
  };
}
