import type { Locale } from "./locales";
import { createClient } from "../supabase/server";

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

const localeLoaders: Record<Locale, () => Promise<TranslationNode>> = {
  en: () => import("@/i18n/locales/en.json").then((module) => module.default as TranslationNode),
  "pt-pt": () => import("@/i18n/locales/pt.json").then((module) => module.default as TranslationNode),
  de: () => import("@/i18n/locales/de.json").then((module) => module.default as TranslationNode),
  fr: () => import("@/i18n/locales/fr.json").then((module) => module.default as TranslationNode),
  es: () => import("@/i18n/locales/es.json").then((module) => module.default as TranslationNode),
  it: () => import("@/i18n/locales/it.json").then((module) => module.default as TranslationNode),
  nl: () => import("@/i18n/locales/nl.json").then((module) => module.default as TranslationNode),
  sv: () => import("@/i18n/locales/sv.json").then((module) => module.default as TranslationNode),
  no: () => import("@/i18n/locales/no.json").then((module) => module.default as TranslationNode),
  da: () => import("@/i18n/locales/da.json").then((module) => module.default as TranslationNode),
};

function flattenTranslations(
  input: TranslationNode,
  prefix = "",
): TranslationLeafMap {
  const output: TranslationLeafMap = {};

  Object.entries(input).forEach(([key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "string") {
      output[nextKey] = value;
      return;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(output, flattenTranslations(value as TranslationNode, nextKey));
    }
  });

  return output;
}

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

export async function getServerTranslations(
  locale: Locale,
  keys?: string[],
): Promise<Record<string, string>> {
  const bundle = flattenTranslations(await localeLoaders[locale]());
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("i18n_locale_data")
      .select("data")
      .eq("locale", DB_LOCALE_MAP[locale])
      .maybeSingle();

    if (error || !data?.data || typeof data.data !== "object") {
      return pickTranslationKeys(bundle, keys);
    }

    const patch = flattenTranslations(data.data as TranslationNode);
    return pickTranslationKeys({ ...bundle, ...patch }, keys);
  } catch (error) {
    console.error("[i18n] Failed to load server translations", { locale, error });
    return pickTranslationKeys(bundle, keys);
  }
}
