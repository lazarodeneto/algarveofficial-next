import { cache } from "react";
import { loadLocale } from "@/i18n/locale-loader";
import type { Locale } from "./config";
import { createPublicServerClient } from "../supabase/public-server";
import {
  enforcePremiumInLocaleData,
  flattenI18nData,
  forceBundledLocaleValues,
  preserveBundledLocaleValues,
  unflattenI18nData,
} from "./premiumGuard";

type TranslationLeafMap = Record<string, string>;
type TranslationNode = Record<string, unknown>;

const DB_LOCALE_MAP: Record<Locale, string> = {
  en: "en",
  "pt-pt": "pt",
  de: "de",
  fr: "fr",
  es: "es",
  it: "it",
  nl: "nl",
  sv: "sv",
  no: "no",
  da: "da",
};

const BUNDLED_PRIORITY_I18N_KEYS = [
  "newsletter.footerTitle",
  "newsletter.footerSubtitle",
  "newsletter.footerCta",
  "footer.email",
  "footer.tagline",
];

const BUNDLED_FORCE_I18N_KEYS = [
  "categoryNames.things-to-do",
  "categoryNames.places-to-stay",
  "categoryNames.real-estate",
];

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
  const englishBundleNode = await loadLocale("en") as TranslationNode;
  const localeBundleNode = await loadLocale(locale) as TranslationNode;
  const premiumSafeBundleNode =
    locale === "en"
      ? localeBundleNode
      : enforcePremiumInLocaleData(localeBundleNode, englishBundleNode);
  const bundle = flattenI18nData(premiumSafeBundleNode);
  const supabase = createPublicServerClient();

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
    const bundledSafeMerged = preserveBundledLocaleValues(
      mergedNode,
      premiumSafeBundleNode,
      englishBundleNode,
      BUNDLED_PRIORITY_I18N_KEYS,
    );
    const forcedBundledMerged = forceBundledLocaleValues(
      bundledSafeMerged,
      premiumSafeBundleNode,
      BUNDLED_FORCE_I18N_KEYS,
    );
    const premiumSafeMerged = enforcePremiumInLocaleData(forcedBundledMerged, englishBundleNode);
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
