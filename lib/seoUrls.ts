import { buildLocalizedPath } from "@/lib/i18n/localized-routing";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { stripLocaleFromPathname } from "@/lib/i18n/locale-utils";

const SITE_URL = "https://algarveofficial.com";

export function toAbsoluteSeoUrl(url: string): string {
  return toAbsoluteUrl(url).toString();
}

function toAbsoluteUrl(url: string): URL {
  if (url.startsWith("http")) {
    return new URL(url);
  }

  return new URL(url.startsWith("/") ? `${SITE_URL}${url}` : `${SITE_URL}/${url}`);
}

export function stripLanguagePrefix(pathname: string): string {
  return stripLocaleFromPathname(pathname);
}

export function localizeSeoUrl(url: string, locale?: Locale | string | null): string {
  try {
    const absoluteUrl = toAbsoluteUrl(url);
    if (absoluteUrl.origin !== SITE_URL) {
      return absoluteUrl.toString();
    }

    if (!locale || !isValidLocale(locale)) {
      return absoluteUrl.toString();
    }

    const barePath = stripLanguagePrefix(absoluteUrl.pathname);
    absoluteUrl.pathname = buildLocalizedPath(locale, barePath);
    return absoluteUrl.toString();
  } catch {
    return url;
  }
}

export function localizeCanonicalUrl(
  preferredCanonical: string,
  locale?: Locale | string | null,
): string {
  try {
    const preferred = toAbsoluteUrl(preferredCanonical);
    if (!locale || !isValidLocale(locale) || preferred.origin !== SITE_URL) {
      return preferred.toString();
    }

    return localizeSeoUrl(preferred.toString(), locale);
  } catch {
    return preferredCanonical;
  }
}

export { SITE_URL };
