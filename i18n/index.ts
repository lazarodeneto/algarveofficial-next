import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { loadLocale, normalizeLocaleCode, type LocaleMessages } from "./locale-loader";
import {
  enforcePremiumInLocaleData,
  forceBundledLocaleValues,
  preserveBundledLocaleValues,
} from "@/lib/i18n/premiumGuard";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { SUPPORTED_LOCALES } from "@/lib/i18n/locales";

// Map our locale codes to the codes stored in i18n_locale_data
const LOCALE_DB_MAP: Record<string, string> = {
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

/** Deep-merge source into target (source wins on conflicts) */
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object"
    ) {
      result[key] = deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      );
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

const bundled = new Map<string, LocaleMessages>();
let englishSourcePromise: Promise<LocaleMessages> | null = null;

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

function normalizeLocale(locale: string | null | undefined): string {
  return normalizeLocaleCode(locale);
}

function getInitialLang(): string {
  if (typeof document === "undefined") {
    return DEFAULT_LOCALE;
  }

  const documentLocale =
    document.documentElement.getAttribute("data-locale") ??
    document.documentElement.lang;

  return normalizeLocale(documentLocale);
}

i18n
  .use(initReactI18next)
  .init({
    resources: {},
    lng: getInitialLang(),
    fallbackLng: false,
    supportedLngs: [...SUPPORTED_LOCALES],
    load: "currentOnly",
    lowerCaseLng: true,
    interpolation: { escapeValue: false },
  });

const loadedLocales = new Set<string>();
const localeLoadPromises = new Map<string, Promise<void>>();

function addBundledLocale(locale: string, data: LocaleMessages) {
  bundled.set(locale, data);
  i18n.addResourceBundle(locale, "translation", data, true, true);
}

export function primeLocale(locale: string, data: LocaleMessages) {
  const normalizedLocale = normalizeLocale(locale);
  addBundledLocale(normalizedLocale, data);
}

async function loadEnglishSource() {
  if (!englishSourcePromise) {
    englishSourcePromise = loadLocale("en");
  }
  return englishSourcePromise;
}

async function loadBundledLocale(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const existing = bundled.get(normalizedLocale);
  if (existing) return existing;

  const rawLocaleData = await loadLocale(normalizedLocale);
  if (normalizedLocale === "en") {
    addBundledLocale(normalizedLocale, rawLocaleData);
    return rawLocaleData;
  }

  const englishSource = await loadEnglishSource();
  const premiumSafeData = enforcePremiumInLocaleData(rawLocaleData, englishSource);
  addBundledLocale(normalizedLocale, premiumSafeData);
  return premiumSafeData;
}

async function patchLocaleFromSupabase(locale: string) {
  const dbLocale = LOCALE_DB_MAP[locale];
  if (!dbLocale) return;

  try {
    const { supabase } = await import("@/integrations/supabase/client");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as unknown as { from: (table: string) => any };
    const { data, error } = await sb
      .from("i18n_locale_data")
      .select("data")
      .eq("locale", dbLocale)
      .maybeSingle();

    if (error || !data?.data || typeof data.data !== "object") return;

    const bundledLocale = await loadBundledLocale(locale);
    const englishSource = await loadEnglishSource();
    const merged = deepMerge(bundledLocale, data.data as Record<string, unknown>);
    const bundledSafeMerged = preserveBundledLocaleValues(
      merged,
      bundledLocale,
      englishSource,
      BUNDLED_PRIORITY_I18N_KEYS,
    );
    const forcedBundledMerged = forceBundledLocaleValues(
      bundledSafeMerged,
      bundledLocale,
      BUNDLED_FORCE_I18N_KEYS,
    );
    const premiumSafeMerged = enforcePremiumInLocaleData(forcedBundledMerged, englishSource);

    i18n.addResourceBundle(locale, "translation", premiumSafeMerged, true, true);
  } catch {
    // Silently fall back to bundled data — the app always works without Supabase.
  }
}

export async function ensureLocaleLoaded(locale: string) {
  const normalizedLocale = normalizeLocale(locale);

  if (loadedLocales.has(normalizedLocale)) return;

  const inFlight = localeLoadPromises.get(normalizedLocale);
  if (inFlight) {
    await inFlight;
    return;
  }

  const loadPromise = (async () => {
    await loadBundledLocale(normalizedLocale);
    await patchLocaleFromSupabase(normalizedLocale);
    loadedLocales.add(normalizedLocale);
  })().finally(() => {
    localeLoadPromises.delete(normalizedLocale);
  });

  localeLoadPromises.set(normalizedLocale, loadPromise);
  await loadPromise;
}

export async function initI18n() {
  // Already initialized by static code above
  return;
}

export default i18n;
