"use client";

import i18n from "@/lib/i18n/i18n";

type EnsureLocaleOptions = {
  force?: boolean;
};

const localeLoaders: Record<string, () => Promise<Record<string, unknown>>> = {
  en: () => import("./locales/en.json").then((module) => module.default as Record<string, unknown>),
  "pt-pt": () => import("./locales/pt.json").then((module) => module.default as Record<string, unknown>),
  de: () => import("./locales/de.json").then((module) => module.default as Record<string, unknown>),
  fr: () => import("./locales/fr.json").then((module) => module.default as Record<string, unknown>),
  es: () => import("./locales/es.json").then((module) => module.default as Record<string, unknown>),
  it: () => import("./locales/it.json").then((module) => module.default as Record<string, unknown>),
  nl: () => import("./locales/nl.json").then((module) => module.default as Record<string, unknown>),
  sv: () => import("./locales/sv.json").then((module) => module.default as Record<string, unknown>),
  no: () => import("./locales/no.json").then((module) => module.default as Record<string, unknown>),
  da: () => import("./locales/da.json").then((module) => module.default as Record<string, unknown>),
};

export async function initI18n() {
  if (i18n.isInitialized) return;
  await i18n.init();
}

export async function ensureLocaleLoaded(locale: string, options?: EnsureLocaleOptions) {
  const safeLocale = localeLoaders[locale] ? locale : "en";
  const alreadyLoaded = i18n.hasResourceBundle(safeLocale, "translation");

  if (alreadyLoaded && !options?.force) {
    return;
  }

  const resources = await localeLoaders[safeLocale]();
  i18n.addResourceBundle(safeLocale, "translation", resources, true, true);
}

export default i18n;
