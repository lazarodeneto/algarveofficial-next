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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isStale(updatedAt: string): boolean {
  const ms = Date.now() - new Date(updatedAt).getTime();
  return ms > STALE_DAYS * 24 * 60 * 60 * 1000;
}

function calcPriorityScore(listing: ListingRow, jobs: TranslationJob[]): number {
  const hasFailed = jobs.some((j) => j.status === "failed");
  const hasMissing = jobs.some((j) => j.status === "missing");
  const hasQueued = jobs.some((j) => j.status === "queued");
  const hasHighTrafficLocaleGap = jobs.some(
    (j) =>
      (HIGH_TRAFFIC_LOCALES as readonly string[]).includes(j.target_lang) &&
      (ATTENTION_STATUSES as TranslationStatus[]).includes(j.status),
  );
  const hasStaleJob = jobs.some((j) => isStale(j.updated_at));

  let score = listing.tier === "signature" ? 100 : 10;
  if (hasFailed) score += 80;
  if (hasMissing) score += 50;
  if (hasQueued) score += 20;
  if (HIGH_PRIORITY_CITIES.includes(listing.city)) score += 25;
  if (listing.is_homepage_visible) score += 40;
  if (listing.is_top_category) score += 30;
  if (hasHighTrafficLocaleGap) score += 20;
  if (hasStaleJob) score += 15;

  return score;
}

function calcSeoCoverage(jobs: TranslationJob[]): {
  seoCoverage: number;
  seoCoverageLabel: SeoCoverageLabel;
} {
  const completedCount = (SEO_REQUIRED_LOCALES as readonly string[]).filter((locale) =>
    jobs.some((j) => j.target_lang === locale && DONE_STATUSES.includes(j.status)),
  ).length;

  const pct = Math.round((completedCount / SEO_REQUIRED_LOCALES.length) * 100);
  const label: SeoCoverageLabel = pct === 100 ? "complete" : pct < 50 ? "critical" : "partial";

  return { seoCoverage: pct, seoCoverageLabel: label };
}

function enrichGroup(listing: ListingRow, jobs: TranslationJob[]): ListingJobGroup {
  const doneCount = jobs.filter((j) => DONE_STATUSES.includes(j.status)).length;
  const problemCount = jobs.filter((j) => j.status === "missing" || j.status === "failed").length;
  const pendingCount = jobs.filter((j) => j.status === "queued").length;
  const attentionCount = jobs.filter((j) =>
    (ATTENTION_STATUSES as TranslationStatus[]).includes(j.status),
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
  };
}

// ─── Status Counts ────────────────────────────────────────────────────────────
// Uses parallel head-only count queries — never fetches row data.
// Safe with 9 000+ rows; each query is O(index scan) on the status column.

export async function getStatusCounts(supabase: Supabase): Promise<StatusCounts> {
  const statuses: TranslationStatus[] = [
    "missing",
    "queued",
    "auto",
    "reviewed",
    "edited",
    "failed",
  ];

  const results = await Promise.all(
    statuses.map((s) =>
      supabase
        .from("translation_jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", s),
    ),
  );

  const counts: StatusCounts = {
    missing: 0,
    queued: 0,
    auto: 0,
    reviewed: 0,
    edited: 0,
    failed: 0,
  };

  statuses.forEach((s, i) => {
    const r = results[i];
    if (!r.error) counts[s] = r.count ?? 0;
  });

  // SLA placeholder — queued jobs at risk of breaching processing SLA
  const slaRiskCount = counts.queued;
  console.log("[TranslationStatusCounts]", counts, { slaRiskCount });

  return counts;
}

// ─── Attention Counts (for CommandModeBar) ────────────────────────────────────

export async function getAttentionCounts(supabase: Supabase): Promise<AttentionCounts> {
  const { data, error } = await supabase
    .from("translation_jobs")
    .select("listing_id, status")
    .in("status", ATTENTION_STATUSES);

  if (error) throw error;

  const rows = data ?? [];
  const uniqueListings = new Set(rows.map((r) => r.listing_id));

  return {
    total: uniqueListings.size,
    missing: rows.filter((r) => r.status === "missing").length,
    queued: rows.filter((r) => r.status === "queued").length,
    failed: rows.filter((r) => r.status === "failed").length,
  };
}

// ─── Jobs (Grouped) ───────────────────────────────────────────────────────────

export async function getTranslationJobsGrouped(
  supabase: Supabase,
  filters: TranslationFilters,
): Promise<{ groups: ListingJobGroup[]; total: number }> {
  const page = filters.page ?? 1;
  const offset = (page - 1) * PAGE_SIZE;

  // ── Step 1: Resolve listing_ids for needs_attention filter ─────────────────
  let attentionListingIds: string[] | null = null;
  if (filters.needs_attention) {
    const { data: attentionRows, error: attErr } = await supabase
      .from("translation_jobs")
      .select("listing_id")
      .in("status", ATTENTION_STATUSES);

    if (attErr) throw attErr;

    attentionListingIds = [...new Set((attentionRows ?? []).map((r) => r.listing_id as string))];
    if (attentionListingIds.length === 0) return { groups: [], total: 0 };
  }

  // ── Step 2: Build main query ───────────────────────────────────────────────
  let query = supabase
    .from("translation_jobs")
    .select(
      `
      id, listing_id, source_lang, target_lang, status, attempts, last_error, created_at, updated_at,
      listing:listings!inner(id, name, city, category, tier, status, is_homepage_visible, is_top_category)
    `,
      { count: "exact" },
    );

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.target_lang) query = query.eq("target_lang", filters.target_lang);
  if (filters.tier) query = query.eq("listings.tier", filters.tier);
  if (filters.city) query = query.eq("listings.city", filters.city);
  if (filters.category) query = query.eq("listings.category", filters.category);
  if (attentionListingIds) query = query.in("listing_id", attentionListingIds);

  const { data, error, count } = await query
    .order("updated_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) throw error;

  // ── Step 3: Group by listing_id ────────────────────────────────────────────
  const map = new Map<string, { listing: ListingRow; jobs: TranslationJob[] }>();

  for (const row of data ?? []) {
    const listing = (Array.isArray(row.listing) ? row.listing[0] : row.listing) as ListingRow | null;
    if (!listing) continue;

    const job: TranslationJob = {
      id: row.id,
      listing_id: row.listing_id,
      source_lang: row.source_lang,
      target_lang: row.target_lang,
      status: row.status as TranslationStatus,
      attempts: row.attempts ?? 0,
      last_error: row.last_error ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };

    if (!map.has(listing.id)) {
      map.set(listing.id, { listing, jobs: [] });
    }
    map.get(listing.id)!.jobs.push(job);
  }

  // ── Step 4: Enrich and sort by priority ───────────────────────────────────
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

export async function enqueueTranslationJob(
  supabase: Supabase,
  listing_id: string,
  target_lang: string,
): Promise<void> {
  const { error } = await supabase.from("translation_jobs").upsert(
    {
      listing_id,
      target_lang,
      source_lang: "en",
      status: "queued" as TranslationStatus,
      attempts: 0,
      last_error: null,
      updated_at: new Date().toISOString(),
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
    cities: uniq((citiesRes.data ?? []).map((r) => r.city).filter(Boolean) as string[]),
    categories: uniq((catsRes.data ?? []).map((r) => r.category).filter(Boolean) as string[]),
    languages: uniq((langsRes.data ?? []).map((r) => r.target_lang).filter(Boolean) as string[]),
  };
}
