import { supabase } from "@/integrations/supabase/client";

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

function uniqueLanguages(languages: readonly string[]): string[] {
  return Array.from(new Set(languages.map((lang) => lang.trim().toLowerCase()).filter(Boolean)));
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

  const [{ data: existingTranslations, error: translationsError }, { data: existingJobs, error: jobsError }] =
    await Promise.all([
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

  if (translationsError) throw translationsError;
  if (jobsError) throw jobsError;

  const translatedLanguages = new Set<string>();
  for (const row of existingTranslations ?? []) {
    if (!row?.language_code) continue;
    const code = row.language_code.toLowerCase();
    if (row.translation_status === "translated") {
      translatedLanguages.add(code);
    }
  }

  const queuedLanguages = new Set<string>();
  for (const row of existingJobs ?? []) {
    if (!row?.target_lang) continue;
    const code = row.target_lang.toLowerCase();
    if (row.status === "queued" || row.status === "processing") {
      queuedLanguages.add(code);
    }
  }

  const languagesToQueue = langs.filter(
    (lang) => !translatedLanguages.has(lang) && !queuedLanguages.has(lang),
  );

  if (languagesToQueue.length > 0) {
    const now = new Date().toISOString();
    const payload = languagesToQueue.map((targetLang) => ({
      listing_id: normalizedListingId,
      source_lang: "en",
      target_lang: targetLang as ListingTranslationLang,
      status: "queued" as const,
      last_error: null,
      locked_at: null,
      updated_at: now,
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

