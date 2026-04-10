import {
  DEFAULT_LOCALE,
  LOCALE_CONFIGS,
  LOCALE_LANGUAGE_MAP,
  LOCALE_PREFIX_PATTERN,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n/locale-definitions";

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function isValidLocale(value: string | undefined | null): value is Locale {
  if (!value) return false;
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function normalizeLocale(locale: string | null | undefined): Locale {
  if (isValidLocale(locale)) {
    return locale;
  }

  return DEFAULT_LOCALE;
}

export function getLocaleFromPathname(pathname: string): Locale {
  const segments = normalizePathname(pathname).split("/").filter(Boolean);
  const maybeLocale = segments[0]?.toLowerCase();

  if (maybeLocale && isValidLocale(maybeLocale)) {
    return maybeLocale;
  }

  return DEFAULT_LOCALE;
}

export const getLocaleFromPathnameSafe = getLocaleFromPathname;

export function stripLocaleFromPathname(pathname: string): string {
  return normalizePathname(pathname).replace(LOCALE_PREFIX_PATTERN, "") || "/";
}

export function hasLocalePrefix(pathname: string): boolean {
  const first = normalizePathname(pathname).split("/").filter(Boolean)[0]?.toLowerCase();
  return !!first && isValidLocale(first);
}

export function addLocaleToPathname(pathname: string, locale: Locale): string {
  const stripped = stripLocaleFromPathname(pathname);
  const normalizedPath = stripped === "/" ? "" : stripped;
  return `/${locale}${normalizedPath ? `/${normalizedPath.replace(/^\//, "")}` : ""}`;
}

export function resolveLocaleFromAcceptLanguage(acceptLanguage: string | null): Locale {
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
