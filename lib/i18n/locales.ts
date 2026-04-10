export const SUPPORTED_LOCALES = [
  "en",
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

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";

export function isValidLocale(value: string): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}
