import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type AppLocale,
} from "@/lib/i18n/locales";

export { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
export type Locale = AppLocale;

export const LOCALE_CONFIGS: Record<
  Locale,
  {
    name: string;
    hreflang: string;
    shortName: string;
    dateLocale: string;
  }
> = {
  en: {
    name: "English",
    hreflang: "en",
    shortName: "EN",
    dateLocale: "en-GB",
  },
  "pt-pt": {
    name: "Português",
    hreflang: "pt-PT",
    shortName: "PT",
    dateLocale: "pt-PT",
  },
  fr: {
    name: "Français",
    hreflang: "fr-FR",
    shortName: "FR",
    dateLocale: "fr-FR",
  },
  de: {
    name: "Deutsch",
    hreflang: "de-DE",
    shortName: "DE",
    dateLocale: "de-DE",
  },
  es: {
    name: "Español",
    hreflang: "es-ES",
    shortName: "ES",
    dateLocale: "es-ES",
  },
  nl: {
    name: "Nederlands",
    hreflang: "nl-NL",
    shortName: "NL",
    dateLocale: "nl-NL",
  },
  it: {
    name: "Italiano",
    hreflang: "it-IT",
    shortName: "IT",
    dateLocale: "it-IT",
  },
  sv: {
    name: "Svenska",
    hreflang: "sv-SE",
    shortName: "SV",
    dateLocale: "sv-SE",
  },
  no: {
    name: "Norsk",
    hreflang: "nb-NO",
    shortName: "NO",
    dateLocale: "nb-NO",
  },
  da: {
    name: "Dansk",
    hreflang: "da-DK",
    shortName: "DA",
    dateLocale: "da-DK",
  },
};

export const LOCALE_LANGUAGE_MAP: Record<string, Locale> = {
  en: "en",
  "en-gb": "en",
  "en-us": "en",
  "en-au": "en",
  "en-ca": "en",
  pt: "pt-pt",
  "pt-pt": "pt-pt",
  "pt-br": "pt-pt",
  fr: "fr",
  "fr-fr": "fr",
  "fr-be": "fr",
  "fr-ch": "fr",
  "fr-ca": "fr",
  de: "de",
  "de-de": "de",
  "de-at": "de",
  "de-ch": "de",
  "de-li": "de",
  es: "es",
  "es-es": "es",
  "es-mx": "es",
  "es-ar": "es",
  "es-co": "es",
  it: "it",
  "it-it": "it",
  "it-ch": "it",
  nl: "nl",
  "nl-nl": "nl",
  "nl-be": "nl",
  sv: "sv",
  "sv-se": "sv",
  "sv-fi": "sv",
  no: "no",
  "no-no": "no",
  nb: "no",
  "nb-no": "no",
  nn: "no",
  "nn-no": "no",
  da: "da",
  "da-dk": "da",
};

export const LOCALE_PREFIX_PATTERN = new RegExp(
  `^\\/(${SUPPORTED_LOCALES.join("|")})(?=\\/|$)`
);

/** @deprecated Use LOCALE_PREFIX_PATTERN instead */
export const LOCALE_PREFIX_REGEX = LOCALE_PREFIX_PATTERN;
