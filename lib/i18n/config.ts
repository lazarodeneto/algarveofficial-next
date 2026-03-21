export const SUPPORTED_LOCALES = ["en", "pt-pt", "fr", "de", "es", "it", "nl", "sv", "no", "da"] as const;
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

// Auto-generated from SUPPORTED_LOCALES — never hardcode locale lists in regex
export const LOCALE_PREFIX_PATTERN = new RegExp(
  `^\\/(${SUPPORTED_LOCALES.join("|")})(?=\\/|$)`
);

/** @deprecated Use LOCALE_PREFIX_PATTERN instead */
export const LOCALE_PREFIX_REGEX = LOCALE_PREFIX_PATTERN;

export function isValidLocale(value: string | undefined | null): value is Locale {
  if (!value) return false;
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0]?.toLowerCase();
  if (maybeLocale && isValidLocale(maybeLocale)) {
    return maybeLocale;
  }
  return DEFAULT_LOCALE;
}

export function stripLocaleFromPathname(pathname: string): string {
  return pathname.replace(LOCALE_PREFIX_PATTERN, "") || "/";
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

export function getLocaleFromParam(param: string | undefined): Locale {
  if (!param) return DEFAULT_LOCALE;
  return isValidLocale(param) ? param : DEFAULT_LOCALE;
}

export function toHtmlLang(locale: Locale): string {
  return LOCALE_CONFIGS[locale]?.hreflang ?? "en";
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
