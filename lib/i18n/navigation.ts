import { SUPPORTED_LOCALES, type Locale } from "./config";

const LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

/** Routes that should NOT receive a locale prefix */
const UNLOCALIZED_PREFIXES = ["/api", "/auth", "/dashboard", "/admin", "/owner"];

/**
 * Creates a localized href by prepending the locale prefix.
 * - Skips external URLs, anchors, mailto:, tel:
 * - Skips paths that already have a locale prefix
 * - Skips dashboard/admin/auth paths (outside [locale] tree)
 */
export function createLocalizedHref(href: string, locale: Locale): string {
  // Skip non-path hrefs
  if (!href || /^(https?:\/\/|mailto:|tel:|#)/i.test(href)) {
    return href;
  }

  const normalized = href.startsWith("/") ? href : `/${href}`;

  // Skip unlocalized routes
  if (UNLOCALIZED_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return normalized;
  }

  // Skip if already has a locale prefix
  const firstSegment = normalized.split("/").filter(Boolean)[0]?.toLowerCase();
  if (firstSegment && LOCALE_SET.has(firstSegment)) {
    return normalized;
  }

  // Prepend locale
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

/**
 * Swaps the locale segment in a pathname while preserving the rest.
 * Used by LanguageSwitcher to change language.
 */
export function swapLocaleInPath(pathname: string, newLocale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  if (firstSegment && LOCALE_SET.has(firstSegment)) {
    segments[0] = newLocale;
    return `/${segments.join("/")}`;
  }

  // No locale prefix — add one
  return `/${newLocale}${pathname === "/" ? "" : pathname}`;
}
