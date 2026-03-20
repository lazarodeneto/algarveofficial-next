export const SUPPORTED_LOCALES = [
  "en",
  "pt-pt",
  "de",
  "fr",
  "es",
  "it",
  "nl",
  "sv",
  "no",
  "da",
] as const;

export const DEFAULT_LOCALE = "en" as const;
export const ALL_LOCALES = [DEFAULT_LOCALE, ...SUPPORTED_LOCALES] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export type Locale = (typeof ALL_LOCALES)[number];

const HTML_LANG_MAP: Record<Locale, string> = {
  en: "en",
  "pt-pt": "pt-PT",
  de: "de",
  fr: "fr",
  es: "es",
  it: "it",
  nl: "nl",
  sv: "sv",
  no: "no",
  da: "da",
};

export function isValidLocale(lang: string): lang is Locale {
  return ALL_LOCALES.includes(lang as Locale);
}

export function isSupportedLocalePrefix(lang: string): lang is SupportedLocale {
  return SUPPORTED_LOCALES.includes(lang as SupportedLocale);
}

export function getLocaleFromParam(param: string | undefined): Locale {
  if (!param) {
    return DEFAULT_LOCALE;
  }

  return isValidLocale(param) ? param : DEFAULT_LOCALE;
}

export function getLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];

  if (!segment) {
    return DEFAULT_LOCALE;
  }

  return isSupportedLocalePrefix(segment) ? segment : DEFAULT_LOCALE;
}

export function toHtmlLang(locale: Locale): string {
  return HTML_LANG_MAP[locale];
}
