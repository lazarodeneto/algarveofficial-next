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
  SLA_HOURS,
  SLA_PRIORITY,
  STALE_DAYS,
} from "./types";

type Supabase = SupabaseClient;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isStale(updatedAt: string): boolean {
  return Date.now() - new Date(updatedAt).getTime() > STALE_DAYS * 86_400_000;
}

function isSlaBreached(job: Pick<TranslationJob, "sla_deadline" | "status">): boolean {
  return (
    !!job.sla_deadline &&
    (ATTENTION_STATUSES as TranslationStatus[]).includes(job.status) &&
    new Date(job.sla_deadline) < new Date()
  );
}

function slaDeadlineFor(tier: "signature" | "verified"): string | null {
  const hours = SLA_HOURS[tier];
  if (hours == null) return null;
  return new Date(Date.now() + hours * 3_600_000).toISOString();
}

// ─── Priority Score ────────────────────────────────────────────────────────────

function calcPriorityScore(listing: ListingRow, jobs: TranslationJob[]): number {
  const hasFailed  = jobs.some((j) => j.status === "failed");
  const hasMissing = jobs.some((j) => j.status === "missing");
  const hasQueued  = jobs.some((j) => j.status === "queued");
  const maxSlaPriority = Math.max(0, ...jobs.map((j) => j.sla_priority ?? 0));
  const hasHighTrafficGap = jobs.some(
    (j) =>
      (HIGH_TRAFFIC_LOCALES as readonly string[]).includes(j.target_lang) &&
      (ATTENTION_STATUSES as TranslationStatus[]).includes(j.status),
  );
  const hasStale = jobs.some((j) => isStale(j.updated_at));

  let score = listing.tier === "signature" ? 100 : 10;
  score += maxSlaPriority;                       // SLA weight (signature = +100)
  if (hasFailed)            score += 80;
  if (hasMissing)           score += 50;
  if (hasQueued)            score += 20;
  if (HIGH_PRIORITY_CITIES.includes(listing.city)) score += 25;
  if (listing.is_homepage_visible)  score += 40;
  if (listing.is_top_category)      score += 30;
  if (hasHighTrafficGap)    score += 20;
  if (hasStale)             score += 15;

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
  const label: SeoCoverageLabel = pct === 100 ? "complete" : pct < 50 ? "critical" : "partial";

  return { seoCoverage: pct, seoCoverageLabel: label };
}

// ─── Group Enrichment ─────────────────────────────────────────────────────────

function enrichGroup(listing: ListingRow, jobs: TranslationJob[]): ListingJobGroup {
  const now = new Date();

  const doneCount     = jobs.filter((j) => DONE_STATUSES.includes(j.status)).length;
  const problemCount  = jobs.filter((j) => j.status === "missing" || j.status === "failed").length;
  const pendingCount  = jobs.filter((j) => j.status === "queued").length;
  const attentionCount = jobs.filter((j) =>
    (ATTENTION_STATUSES as TranslationStatus[]).includes(j.status),
  ).length;
  const slaBreachCount = jobs.filter((j) =>
    j.sla_deadline &&
    (ATTENTION_STATUSES as TranslationStatus[]).includes(j.status) &&
    new Date(j.sla_deadline) < now,
  ).length;

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
  };
}

// ─── Status Counts — single query + JS aggregate ──────────────────────────────
// Fetches only the status column. Fast at current scale (<50k rows).
// Upgrade path: replace with supabase.rpc("get_translation_status_counts")
// backed by: SELECT status, COUNT(*) FROM translation_jobs GROUP BY status;

export async function getStatusCounts(supabase: Supabase): Promise<StatusCounts> {
  const { data, error } = await supabase.from("translation_jobs").select("status");
  if (error) throw error;

  const counts: StatusCounts = {
    missing: 0,
    queued:  0,
    auto:    0,
    reviewed: 0,
    edited:  0,
    failed:  0,
  };

  for (const row of data ?? []) {
    const s = row.status as TranslationStatus;
    if (s in counts) counts[s]++;
  }

  // Real SLA risk = queued jobs; full breach count lives in getAttentionCounts
  const slaRiskCount = counts.queued;
  console.log("[TranslationStatusCounts]", counts, { slaRiskCount });

  return counts;
}

// ─── Attention Counts (CommandModeBar) ────────────────────────────────────────

export async function getAttentionCounts(supabase: Supabase): Promise<AttentionCounts> {
  const { data, error } = await supabase
    .from("translation_jobs")
    .select(
      "listing_id, status, sla_deadline, listing:listings!inner(tier)",
    )
    .in("status", ATTENTION_STATUSES);

  if (error) throw error;

  const rows = data ?? [];
  const now  = new Date();

  // Unique listings needing attention
  const uniqueListingIds = new Set(rows.map((r) => r.listing_id as string));

  // Signature listings count
  const seenSignature = new Set<string>();
  for (const r of rows) {
    const listing = (Array.isArray(r.listing) ? r.listing[0] : r.listing) as { tier?: string } | null;
    if (listing?.tier === "signature") seenSignature.add(r.listing_id as string);
  }

  const slaRiskCount = rows.filter(
    (r) => r.sla_deadline && new Date(r.sla_deadline as string) < now,
  ).length;

  return {
    total:           uniqueListingIds.size,
    missing:         rows.filter((r) => r.status === "missing").length,
    queued:          rows.filter((r) => r.status === "queued").length,
    failed:          rows.filter((r) => r.status === "failed").length,
    slaRiskCount,
    signatureCount:  seenSignature.size,
  };
}

// ─── Jobs (Grouped + Paginated) ───────────────────────────────────────────────

export async function getTranslationJobsGrouped(
  supabase: Supabase,
  filters: TranslationFilters,
): Promise<{ groups: ListingJobGroup[]; total: number }> {
  const page   = filters.page ?? 1;
  const offset = (page - 1) * PAGE_SIZE;

  // ── Step 1: Pre-resolve listing IDs for needs_attention filter ─────────────
  let attentionListingIds: string[] | null = null;
  if (filters.needs_attention) {
    const { data: rows, error } = await supabase
      .from("translation_jobs")
      .select("listing_id")
      .in("status", ATTENTION_STATUSES);
    if (error) throw error;

    attentionListingIds = [...new Set((rows ?? []).map((r) => r.listing_id as string))];
    if (attentionListingIds.length === 0) return { groups: [], total: 0 };
  }

  // ── Step 2: Main query ────────────────────────────────────────────────────
  let query = supabase
    .from("translation_jobs")
    .select(
      `
      id, listing_id, source_lang, target_lang, status, attempts, last_error,
      created_at, updated_at, sla_deadline, sla_priority,
      listing:listings!inner(id, name, city, category, tier, status, is_homepage_visible, is_top_category)
      `,
      { count: "exact" },
    );

  if (filters.status)       query = query.eq("status", filters.status);
  if (filters.target_lang)  query = query.eq("target_lang", filters.target_lang);
  if (filters.tier)         query = query.eq("listings.tier", filters.tier);
  if (filters.city)         query = query.eq("listings.city", filters.city);
  if (filters.category)     query = query.eq("listings.category", filters.category);
  if (attentionListingIds)  query = query.in("listing_id", attentionListingIds);

  // SLA breach filter: only jobs past their deadline in attention states
  if (filters.sla_breach) {
    query = query
      .not("sla_deadline", "is", null)
      .lt("sla_deadline", new Date().toISOString())
      .in("status", ATTENTION_STATUSES);
  }

  // Sort: SLA breach mode → ASC deadline (most urgent first); default → latest updated
  const { data, error, count } = await (
    filters.sla_breach
      ? query.order("sla_deadline", { ascending: true })
      : query.order("updated_at",   { ascending: false })
  ).range(offset, offset + PAGE_SIZE - 1);

  if (error) throw error;

  // ── Step 3: Group by listing_id ───────────────────────────────────────────
  const map = new Map<string, { listing: ListingRow; jobs: TranslationJob[] }>();

  for (const row of data ?? []) {
    const listing = (Array.isArray(row.listing) ? row.listing[0] : row.listing) as ListingRow | null;
    if (!listing) continue;

    const job: TranslationJob = {
      id:           row.id,
      listing_id:   row.listing_id,
      source_lang:  row.source_lang,
      target_lang:  row.target_lang,
      status:       row.status as TranslationStatus,
      attempts:     row.attempts ?? 0,
      last_error:   row.last_error ?? null,
      created_at:   row.created_at,
      updated_at:   row.updated_at,
      sla_deadline: row.sla_deadline ?? null,
      sla_priority: row.sla_priority ?? 0,
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

export async function updateTranslationStatus(
  supabase: Supabase,
  id: string,
  status: TranslationStatus,
): Promise<void> {
  const { error } = await supabase
    .from("translation_jobs")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function bulkUpdateTranslationStatus(
  supabase: Supabase,
  ids: string[],
  status: TranslationStatus,
): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase
    .from("translation_jobs")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", ids);
  if (error) throw error;
}

/**
 * Enqueue or re-queue a translation job.
 * Pass `tier` so SLA fields are set correctly at write time.
 * Defaults to "verified" (no deadline) when tier is unknown.
 */
export async function enqueueTranslationJob(
  supabase: Supabase,
  listing_id: string,
  target_lang: string,
  tier: "signature" | "verified" = "verified",
): Promise<void> {
  const { error } = await supabase.from("translation_jobs").upsert(
    {
      listing_id,
      target_lang,
      source_lang:  "en",
      status:       "queued" as TranslationStatus,
      attempts:     0,
      last_error:   null,
      sla_deadline: slaDeadlineFor(tier),
      sla_priority: SLA_PRIORITY[tier],
      updated_at:   new Date().toISOString(),
    },
    { onConflict: "listing_id,target_lang" },
  );
  if (error) throw error;
}

export async function saveTranslationEdit(
  supabase: Supabase,
  id: string,
  _content: string,
): Promise<void> {
  const { error } = await supabase
    .from("translation_jobs")
    .update({ status: "edited" as TranslationStatus, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// ─── Filter Options ───────────────────────────────────────────────────────────

export async function getFilterOptions(supabase: Supabase): Promise<FilterOptions> {
  const [citiesRes, catsRes, langsRes] = await Promise.all([
    supabase.from("listings").select("city").not("city", "is", null),
    supabase.from("listings").select("category").not("category", "is", null),
    supabase.from("translation_jobs").select("target_lang").not("target_lang", "is", null),
  ]);

  const uniq = <T>(arr: T[]) => [...new Set(arr)].sort();

  return {
    cities:     uniq((citiesRes.data ?? []).map((r) => r.city).filter(Boolean) as string[]),
    categories: uniq((catsRes.data ?? []).map((r) => r.category).filter(Boolean) as string[]),
    languages:  uniq((langsRes.data ?? []).map((r) => r.target_lang).filter(Boolean) as string[]),
  };
}
