import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FilterOptions,
  ListingJobGroup,
  ListingRow,
  StatusCounts,
  TranslationFilters,
  TranslationJob,
  TranslationStatus,
} from "./types";
import { HIGH_PRIORITY_CITIES, PAGE_SIZE } from "./types";

type Supabase = SupabaseClient;

// ─── Status Counts ────────────────────────────────────────────────────────────

export async function getStatusCounts(supabase: Supabase): Promise<StatusCounts> {
  const { data, error } = await supabase.from("translation_jobs").select("status");

  if (error) throw error;

  const counts: StatusCounts = {
    missing: 0,
    queued: 0,
    auto: 0,
    reviewed: 0,
    edited: 0,
    failed: 0,
  };

  for (const row of data ?? []) {
    const s = row.status as TranslationStatus;
    if (s in counts) counts[s]++;
  }

  return counts;
}

// ─── Priority Score ───────────────────────────────────────────────────────────

function calcPriorityScore(
  listing: Pick<ListingRow, "tier" | "city">,
  status: TranslationStatus,
): number {
  let score = listing.tier === "signature" ? 100 : 10;
  if (status === "failed") score += 80;
  if (status === "missing") score += 50;
  if (HIGH_PRIORITY_CITIES.includes(listing.city)) score += 25;
  return score;
}

// ─── Jobs (Grouped) ───────────────────────────────────────────────────────────

export async function getTranslationJobsGrouped(
  supabase: Supabase,
  filters: TranslationFilters,
): Promise<{ groups: ListingJobGroup[]; total: number }> {
  const page = filters.page ?? 1;
  const offset = (page - 1) * PAGE_SIZE;

  // Build join query
  let query = supabase
    .from("translation_jobs")
    .select(
      `
      id, listing_id, source_lang, target_lang, status, attempts, last_error, created_at, updated_at,
      listing:listings!inner(id, name, city, category, tier, status)
    `,
      { count: "exact" },
    );

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.target_lang) query = query.eq("target_lang", filters.target_lang);
  if (filters.tier) query = query.eq("listings.tier", filters.tier);
  if (filters.city) query = query.eq("listings.city", filters.city);
  if (filters.category) query = query.eq("listings.category", filters.category);

  const { data, error, count } = await query
    .order("updated_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) throw error;

  // Group by listing_id — keeps locale rows together
  const map = new Map<string, ListingJobGroup>();

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

    const score = calcPriorityScore(listing, job.status);

    if (!map.has(listing.id)) {
      map.set(listing.id, { listing, jobs: [], priorityScore: score });
    }

    const group = map.get(listing.id)!;
    group.jobs.push(job);
    if (score > group.priorityScore) group.priorityScore = score;
  }

  const groups = [...map.values()].sort((a, b) => b.priorityScore - a.priorityScore);

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

export async function enqueueTranslationJob(
  supabase: Supabase,
  listing_id: string,
  target_lang: string,
): Promise<void> {
  // Upsert: reset existing row or insert new
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
  // Store edited content — extend this to write to your translations content table if needed
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
