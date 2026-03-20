export const SUPPORTED_LOCALES = ["en", "pt-pt", "fr", "de", "es", "nl"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

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
};

export const LOCALE_LANGUAGE_MAP: Record<string, Locale> = {
  en: "en",
  "en-gb": "en",
  "en-us": "en",
  pt: "pt-pt",
  "pt-pt": "pt-pt",
  "pt-br": "pt-pt",
  fr: "fr",
  "fr-fr": "fr",
  "fr-be": "fr",
  de: "de",
  "de-de": "de",
  "de-at": "de",
  "de-ch": "de",
  es: "es",
  "es-es": "es",
  "es-mx": "es",
  nl: "nl",
  "nl-nl": "nl",
  "nl-be": "nl",
};

export const LOCALE_PREFIX_REGEX =
  /^\/(en|pt-pt|fr|de|es|nl)(?=\/|$)/;

export function isValidLocale(value: string | undefined | null): value is Locale {
  if (!value) return false;
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function getLocaleFromPathname(pathname: string): Locale {
  const match = pathname.match(LOCALE_PREFIX_REGEX);
  if (match && isValidLocale(match[1])) {
    return match[1] as Locale;
  }
  return DEFAULT_LOCALE;
}

export function stripLocaleFromPathname(pathname: string): string {
  return pathname.replace(LOCALE_PREFIX_REGEX, "") || "/";
}

export function addLocaleToPathname(pathname: string, locale: Locale): string {
  const stripped = stripLocaleFromPathname(pathname);
  const normalizedPath = stripped === "/" ? "" : stripped;
  return `/${locale}${normalizedPath ? `/${normalizedPath.replace(/^\//, "")}` : ""}`;
}

export function resolveLocaleFromAcceptLanguage(
  acceptLanguage: string | null,
): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, q] = lang.trim().split(";q=");
      return {
        code: code.trim().toLowerCase(),
        q: q ? Number.parseFloat(q) : 1,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { code } of languages) {
    if (isValidLocale(code)) return code;
    const mapped = LOCALE_LANGUAGE_MAP[code];
    if (mapped) return mapped;
  }

  return DEFAULT_LOCALE;
}

export function buildLocaleAlternates(
  basePath: string,
): Record<string, string> {
  const result: Record<string, string> = {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://algarveofficial.com";

  for (const locale of SUPPORTED_LOCALES) {
    const localizedPath = addLocaleToPathname(basePath, locale);
    result[LOCALE_CONFIGS[locale].hreflang] = `${siteUrl}${localizedPath}`;
  }

  return result;
}
