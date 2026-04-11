import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import pt from "./locales/pt-pt.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import it from "./locales/it.json";
import nl from "./locales/nl.json";
import sv from "./locales/sv.json";
import no from "./locales/no.json";
import da from "./locales/da.json";
import {
  enforcePremiumInLocaleData,
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

const englishSource = en as Record<string, unknown>;

const bundledRaw: Record<string, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  "pt-pt": pt as Record<string, unknown>,
  de: de as Record<string, unknown>,
  fr: fr as Record<string, unknown>,
  es: es as Record<string, unknown>,
  it: it as Record<string, unknown>,
  nl: nl as Record<string, unknown>,
  sv: sv as Record<string, unknown>,
  no: no as Record<string, unknown>,
  da: da as Record<string, unknown>,
};

const bundled = Object.fromEntries(
  Object.entries(bundledRaw).map(([code, data]) => [
    code,
    code === "en" ? data : enforcePremiumInLocaleData(data, englishSource),
  ]),
) as Record<string, Record<string, unknown>>;

const BUNDLED_PRIORITY_I18N_KEYS = [
  "newsletter.footerTitle",
  "newsletter.footerSubtitle",
  "newsletter.footerCta",
  "footer.email",
  "footer.tagline",
];

function normalizeLocale(locale: string | null | undefined): string {
  const normalized = String(locale ?? "").trim().toLowerCase();
  if (!normalized) return DEFAULT_LOCALE;
  if (normalized === "pt" || normalized.startsWith("pt-pt")) return "pt-pt";
  if (normalized.startsWith("de")) return "de";
  if (normalized.startsWith("fr")) return "fr";
  if (normalized.startsWith("es")) return "es";
  if (normalized.startsWith("it")) return "it";
  if (normalized.startsWith("nl")) return "nl";
  if (normalized.startsWith("sv")) return "sv";
  if (normalized === "no" || normalized.startsWith("nb") || normalized.startsWith("nn")) return "no";
  if (normalized.startsWith("da")) return "da";
  if (SUPPORTED_LOCALES.includes(normalized as (typeof SUPPORTED_LOCALES)[number])) {
    return normalized;
  }
  return DEFAULT_LOCALE;
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
    resources: Object.fromEntries(
      Object.entries(bundled).map(([code, data]) => [code, { translation: data }])
    ),
    lng: getInitialLang(),
    fallbackLng: false,
    supportedLngs: [...SUPPORTED_LOCALES],
    load: "currentOnly",
    lowerCaseLng: true,
    interpolation: { escapeValue: false },
  });

const loadedLocales = new Set<string>(["en"]);
const localeLoadPromises = new Map<string, Promise<void>>();

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

    const merged = deepMerge(
      bundled[locale] ?? {},
      data.data as Record<string, unknown>,
    );
    const bundledSafeMerged = preserveBundledLocaleValues(
      merged,
      bundled[locale] ?? {},
      englishSource,
      BUNDLED_PRIORITY_I18N_KEYS,
    );
    const premiumSafeMerged = enforcePremiumInLocaleData(bundledSafeMerged, englishSource);

    i18n.addResourceBundle(locale, "translation", premiumSafeMerged, true, true);
  } catch {
    // Silently fall back to bundled data — the app always works without Supabase.
  }
}

export async function ensureLocaleLoaded(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  if (normalizedLocale === "en") return;

  if (loadedLocales.has(normalizedLocale)) return;

  const inFlight = localeLoadPromises.get(normalizedLocale);
  if (inFlight) {
    await inFlight;
    return;
  }

  const loadPromise = (async () => {
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
