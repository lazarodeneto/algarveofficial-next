import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "@/lib/i18n/config";

export function extractLocaleFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0]?.toLowerCase();

  if (maybeLocale && SUPPORTED_LOCALES.includes(maybeLocale as typeof SUPPORTED_LOCALES[number])) {
    return maybeLocale;
  }

  return DEFAULT_LOCALE;
}

export function localizeHref(
  pathname: string,
  href: string
): string {
  if (!href) return `/${DEFAULT_LOCALE}`;

  if (/^(https?:\/\/|mailto:|tel:|#)/i.test(href)) {
    return href;
  }

  const locale = extractLocaleFromPath(pathname);
  const normalized = href.startsWith("/") ? href : `/${href}`;

  const segments = normalized.split("/").filter(Boolean);
  const maybeLocale = segments[0]?.toLowerCase();

  if (maybeLocale && SUPPORTED_LOCALES.includes(maybeLocale as typeof SUPPORTED_LOCALES[number])) {
    return normalized;
  }

  if (
    normalized.startsWith("/api") ||
    normalized.startsWith("/dashboard") ||
    normalized.startsWith("/auth")
  ) {
    return normalized;
  }

  if (normalized === "/") {
    return `/${locale}`;
  }

  return `/${locale}${normalized}`;
}
