export type TranslationStatus =
  | "missing"
  | "queued"
  | "auto"
  | "reviewed"
  | "edited"
  | "failed";

export interface TranslationJob {
  id: string;
  listing_id: string;
  source_lang: string;
  target_lang: string;
  status: TranslationStatus;
  attempts: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingRow {
  id: string;
  name: string;
  city: string;
  category: string;
  tier: "signature" | "verified";
  status: "published" | "draft";
}

export interface ListingJobGroup {
  listing: ListingRow;
  jobs: TranslationJob[];
  priorityScore: number;
}

export interface StatusCounts {
  missing: number;
  queued: number;
  auto: number;
  reviewed: number;
  edited: number;
  failed: number;
}

export interface TranslationFilters {
  status?: TranslationStatus | "";
  city?: string;
  category?: string;
  tier?: "signature" | "verified" | "";
  target_lang?: string;
  page?: number;
}

export interface FilterOptions {
  cities: string[];
  categories: string[];
  languages: string[];
}

export const DONE_STATUSES: TranslationStatus[] = ["auto", "reviewed", "edited"];
export const PROBLEM_STATUSES: TranslationStatus[] = ["missing", "failed"];
export const HIGH_PRIORITY_CITIES = [
  "Lisbon",
  "Porto",
  "Faro",
  "Albufeira",
  "Tavira",
  "Lagos",
  "Portimão",
  "Vilamoura",
  "Cascais",
  "Sintra",
];

export const STATUS_LABELS: Record<TranslationStatus, string> = {
  missing: "Missing",
  queued: "Queued",
  auto: "Auto",
  reviewed: "Reviewed",
  edited: "Edited",
  failed: "Failed",
};

export const STATUS_COLORS: Record<TranslationStatus, string> = {
  missing: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  queued: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  auto: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  reviewed: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  edited: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  failed: "bg-red-500/15 text-red-400 border-red-500/20",
};

export const PAGE_SIZE = 25;
