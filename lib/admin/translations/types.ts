export type TranslationStatus =
  | "missing"
  | "queued"
  | "auto"
  | "reviewed"
  | "edited"
  | "failed";

export type SeoCoverageLabel = "complete" | "partial" | "critical";

export interface TranslationJob {
  id:               string;
  listing_id:       string;
  source_lang:      string;
  target_lang:      string;
  status:           TranslationStatus;
  attempts:         number;
  last_error:       string | null;
  created_at:       string;
  updated_at:       string;
  // SLA fields (migration 018)
  sla_deadline:     string | null;
  sla_priority:     number;
  // Content-version tracking (migration 019)
  source_updated_at: string | null;
}

export interface ListingRow {
  id:                 string;
  name:               string;
  city:               string;
  category:           string;
  tier:               "signature" | "verified";
  status:             "published" | "draft";
  is_homepage_visible?: boolean;
  is_top_category?:    boolean;
  // Content-version tracking (migration 019)
  content_updated_at:  string;
}

export interface ListingJobGroup {
  listing:          ListingRow;
  jobs:             TranslationJob[];
  // ── Backend-computed — never derived in UI ─────────────────────────────────
  priorityScore:    number;
  seoCoverage:      number;           // 0–100
  seoCoverageLabel: SeoCoverageLabel;
  doneCount:        number;
  problemCount:     number;           // missing + failed
  pendingCount:     number;           // queued only
  attentionCount:   number;           // missing + queued + failed
  slaBreachCount:   number;           // jobs past sla_deadline
  outdatedCount:    number;           // done jobs whose source version is stale
}

export interface StatusCounts {
  missing:  number;
  queued:   number;
  auto:     number;
  reviewed: number;
  edited:   number;
  failed:   number;
}

export interface AttentionCounts {
  total:          number;  // unique listings with ≥1 attention job
  missing:        number;  // total missing jobs
  queued:         number;  // total queued jobs
  failed:         number;  // total failed jobs
  slaRiskCount:   number;  // jobs past sla_deadline in attention states
  signatureCount: number;  // unique signature listings needing attention
  outdatedCount:  number;  // done jobs whose source version is behind listing
}

export interface TranslationFilters {
  status?:          TranslationStatus | "";
  city?:            string;
  category?:        string;
  tier?:            "signature" | "verified" | "";
  target_lang?:     string;
  needs_attention?: boolean;
  sla_breach?:      boolean;  // jobs past sla_deadline
  outdated?:        boolean;  // done jobs with stale source version
  page?:            number;
}

export interface FilterOptions {
  cities:     string[];
  categories: string[];
  languages:  string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const DONE_STATUSES: TranslationStatus[]      = ["auto", "reviewed", "edited"];
export const PROBLEM_STATUSES: TranslationStatus[]   = ["missing", "failed"];
export const ATTENTION_STATUSES: TranslationStatus[] = ["missing", "queued", "failed"];

export const SEO_REQUIRED_LOCALES  = ["pt-pt", "fr", "de", "es"] as const;
export const HIGH_TRAFFIC_LOCALES  = ["pt-pt", "fr", "de"] as const;

export const HIGH_PRIORITY_CITIES = [
  "Lisbon", "Porto", "Faro", "Albufeira", "Tavira",
  "Lagos", "Portimão", "Vilamoura", "Cascais", "Sintra",
];

export const STALE_DAYS = 30;

// SLA deadlines applied at enqueue time (offset from now in hours)
export const SLA_HOURS: Record<"signature" | "verified", number | null> = {
  signature: 2,
  verified:  null,
};

export const SLA_PRIORITY: Record<"signature" | "verified", number> = {
  signature: 100,
  verified:  10,
};

export const STATUS_LABELS: Record<TranslationStatus, string> = {
  missing:  "Missing",
  queued:   "Queued",
  auto:     "Auto",
  reviewed: "Reviewed",
  edited:   "Edited",
  failed:   "Failed",
};

export const STATUS_COLORS: Record<TranslationStatus, string> = {
  missing:  "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  queued:   "bg-blue-500/15 text-blue-400 border-blue-500/20",
  auto:     "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  reviewed: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  edited:   "bg-amber-500/15 text-amber-400 border-amber-500/20",
  failed:   "bg-red-500/15 text-red-400 border-red-500/20",
};

export const SEO_COVERAGE_COLORS: Record<SeoCoverageLabel, string> = {
  complete: "bg-emerald-400",
  partial:  "bg-amber-400",
  critical: "bg-red-400",
};

export const SEO_COVERAGE_TEXT: Record<SeoCoverageLabel, string> = {
  complete: "text-emerald-400",
  partial:  "text-amber-400",
  critical: "text-red-400",
};

export const PAGE_SIZE = 25;
