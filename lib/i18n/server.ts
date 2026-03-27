import { cache } from "react";
import type { Locale } from "./locales";
import { createClient } from "../supabase/server";
import {
  enforcePremiumInLocaleData,
  flattenI18nData,
  unflattenI18nData,
} from "./premiumGuard";

type TranslationLeafMap = Record<string, string>;
type TranslationNode = Record<string, unknown>;

const DB_LOCALE_MAP: Record<string, string> = {
  en: "en",
};

const localeLoaders: Record<string, () => Promise<TranslationNode>> = {
  en: () => import("@/i18n/locales/en.json").then((module) => module.default as TranslationNode),
};

function pickTranslationKeys(
  translations: TranslationLeafMap,
  keys?: string[],
): TranslationLeafMap {
  if (typeof keys === "undefined") {
    return translations;
  }

  if (keys.length === 0) {
    return {};
  }

  return keys.reduce<TranslationLeafMap>((acc, key) => {
    if (key in translations) {
      acc[key] = translations[key];
    }
    return acc;
  }, {});
}

/**
 * Internal: loads, merges, and caches the FULL translation bundle for a locale.
 *
 * Wrapped with React.cache so that multiple server components (or generateMetadata
 * + the page body) calling getServerTranslations for the same locale within one
 * render tree share a single Supabase round-trip rather than firing one each.
 *
 * Cache is per-request (React.cache is scoped to the current React rendering
 * context — it does NOT persist across separate requests).
 */
const getFullLocaleBundle = cache(async (locale: Locale): Promise<TranslationLeafMap> => {
  const englishBundleNode = await localeLoaders.en();
  const localeBundleNode = await localeLoaders[locale]();
  const premiumSafeBundleNode =
    locale === "en"
      ? localeBundleNode
      : enforcePremiumInLocaleData(localeBundleNode, englishBundleNode);
  const bundle = flattenI18nData(premiumSafeBundleNode);
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("i18n_locale_data")
      .select("data")
      .eq("locale", DB_LOCALE_MAP[locale])
      .maybeSingle();

    if (error || !data?.data || typeof data.data !== "object") {
      return bundle;
    }

    const mergedFlat = {
      ...bundle,
      ...flattenI18nData(data.data as TranslationNode),
    };
    const mergedNode = unflattenI18nData(mergedFlat);
    const premiumSafeMerged = enforcePremiumInLocaleData(mergedNode, englishBundleNode);
    return flattenI18nData(premiumSafeMerged);
  } catch (err) {
    console.error("[i18n] Failed to load server translations", { locale, error: err });
    return bundle;
  }
});

/**
 * Public API — returns translated strings for the given locale.
 * Pass `keys` to receive only the subset needed; omit for the full bundle.
 *
 * Shares the underlying Supabase fetch with any other call for the same locale
 * in the same render tree via React.cache deduplication.
 */
export async function getServerTranslations(
  locale: Locale,
  keys?: string[],
): Promise<Record<string, string>> {
  const fullBundle = await getFullLocaleBundle(locale);
  return pickTranslationKeys(fullBundle, keys);
}
