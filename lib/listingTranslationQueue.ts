import { supabase } from "@/integrations/supabase/client";

/**
 * Compute SLA fields from a listing tier.
 * Matches the DB trigger logic exactly:
 *   signature → 2 h / priority 100
 *   verified  → 4 h / priority 10
 *   default   → 24 h / priority 1
 */
function computeSla(tier: string | null | undefined): {
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

export const LISTING_TRANSLATION_TARGET_LANGS = [
  "pt-pt",
  "fr",
  "de",
  "es",
  "it",
  "nl",
  "sv",
  "no",
  "da",
] as const;

type ListingTranslationLang = (typeof LISTING_TRANSLATION_TARGET_LANGS)[number];

interface QueueListingTranslationJobsResult {
  queued: number;
  alreadyTranslated: number;
  alreadyQueued: number;
  queuedLanguages: string[];
}

export function normalizeListingTranslationLanguageCode(raw: unknown): string {
  if (typeof raw !== "string") return "";

  const normalized = raw.toLowerCase().replaceAll("_", "-").trim();

  if (normalized === "pt" || normalized === "pt-pt") return "pt-pt";
  if (normalized.startsWith("de")) return "de";
  if (normalized.startsWith("fr")) return "fr";
  if (normalized.startsWith("es")) return "es";
  if (normalized.startsWith("it")) return "it";
  if (normalized.startsWith("nl")) return "nl";
  if (normalized.startsWith("sv")) return "sv";
  if (normalized === "no" || normalized.startsWith("nb") || normalized.startsWith("nn")) return "no";
  if (normalized.startsWith("da")) return "da";
  if (normalized.startsWith("en")) return "en";

  return normalized;
}

function isCompletedTranslationStatus(status: unknown): boolean {
  if (typeof status !== "string") return false;
  const normalized = status.toLowerCase();
  return (
    normalized === "auto" ||
    normalized === "reviewed" ||
    normalized === "edited" ||
    normalized === "translated"
  );
}

function uniqueLanguages(languages: readonly string[]): string[] {
  return Array.from(
    new Set(
      languages
        .map((lang) => normalizeListingTranslationLanguageCode(lang))
        .filter(Boolean),
    ),
  );
}

export async function queueListingTranslationJobs(
  listingId: string,
  targetLanguages: readonly string[] = LISTING_TRANSLATION_TARGET_LANGS,
): Promise<QueueListingTranslationJobsResult> {
  const normalizedListingId = listingId.trim();
  if (!normalizedListingId) {
    return {
      queued: 0,
      alreadyTranslated: 0,
      alreadyQueued: 0,
      queuedLanguages: [],
    };
  }

  const langs = uniqueLanguages(targetLanguages);
  if (langs.length === 0) {
    return {
      queued: 0,
      alreadyTranslated: 0,
      alreadyQueued: 0,
      queuedLanguages: [],
    };
  }

  const [
    { data: listingRow },
    { data: existingTranslations, error: translationsError },
    { data: existingJobs, error: jobsError },
  ] = await Promise.all([
    supabase.from("listings").select("tier").eq("id", normalizedListingId).maybeSingle(),
    supabase
      .from("listing_translations")
      .select("language_code, translation_status")
      .eq("listing_id", normalizedListingId)
      .in("language_code", langs),
    supabase
      .from("translation_jobs")
      .select("target_lang, status")
      .eq("listing_id", normalizedListingId)
      .in("target_lang", langs),
  ]);

  const sla = computeSla((listingRow as { tier?: string } | null)?.tier);

  if (translationsError) throw translationsError;
  if (jobsError) throw jobsError;

  const translatedLanguages = new Set<string>();
  for (const row of existingTranslations ?? []) {
    if (!row?.language_code) continue;
    const code = normalizeListingTranslationLanguageCode(row.language_code);
    if (isCompletedTranslationStatus(row.translation_status)) {
      translatedLanguages.add(code);
    }
  }

  const queuedLanguages = new Set<string>();
  for (const row of existingJobs ?? []) {
    if (!row?.target_lang) continue;
    const code = normalizeListingTranslationLanguageCode(row.target_lang);
    if (row.status === "queued") {
      queuedLanguages.add(code);
    }
  }

  const languagesToQueue = langs.filter(
    (lang) => !translatedLanguages.has(lang) && !queuedLanguages.has(lang),
  );

  if (languagesToQueue.length > 0) {
    const now = new Date().toISOString();
    const payload = languagesToQueue.map((targetLang) => ({
      listing_id:   normalizedListingId,
      source_lang:  "en",
      target_lang:  targetLang as ListingTranslationLang,
      status:       "queued" as const,
      sla_deadline: sla.sla_deadline,
      sla_priority: sla.sla_priority,
      last_error:   null,
      locked_at:    null,
      updated_at:   now,
    }));

    const { error: upsertError } = await supabase
      .from("translation_jobs")
      .upsert(payload, { onConflict: "listing_id,target_lang" });

    if (upsertError) throw upsertError;
  }

  return {
    queued: languagesToQueue.length,
    alreadyTranslated: translatedLanguages.size,
    alreadyQueued: queuedLanguages.size,
    queuedLanguages: languagesToQueue,
  };
}
