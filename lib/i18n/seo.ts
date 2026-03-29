/**
 * Centralized SEO helpers for i18n
 * Single source of truth for:
 * - Canonical URLs
 * - hreflang alternates
 * - x-default handling
 * - Locale URL patterns
 */

import {
  SUPPORTED_LOCALES,
  LOCALE_CONFIGS,
  DEFAULT_LOCALE,
  type Locale,
} from "./config";

const DEFAULT_SITE_URL = "https://algarveofficial.com";
const DEFAULT_LOCALE_USES_PREFIX = true;

function normalizeSeoPath(path: string = ""): string {
  if (!path || path === "/") {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured.replace(/\/+$/, "");
  }

  return DEFAULT_SITE_URL;
}

export function toAbsoluteSiteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return `${getSiteUrl()}${normalizeSeoPath(pathOrUrl)}`;
}

/**
 * Get the URL prefix for a locale.
 * The current routing system canonicalizes every locale with a prefix,
 * including the default English locale, because unlocalized public routes
 * redirect to `/${DEFAULT_LOCALE}/...`.
 */
export function getLocaleUrlPrefix(locale: Locale): string {
  if (locale === DEFAULT_LOCALE && !DEFAULT_LOCALE_USES_PREFIX) {
    return "";
  }

  return `/${locale}`;
}

/**
 * Build a canonical URL with locale prefix.
 *
 * @param locale - The locale
 * @param path - The path (without locale prefix, e.g., "/directory")
 * @returns Full canonical URL (e.g., "https://algarveofficial.com/en/directory")
 */
export function buildCanonicalUrl(locale: Locale, path: string = ""): string {
  const cleanPath = normalizeSeoPath(path);
  const pathWithoutTrailingSlash = cleanPath === "/" ? "" : cleanPath.replace(/\/+$/, "");
  return toAbsoluteSiteUrl(`${getLocaleUrlPrefix(locale)}${pathWithoutTrailingSlash}`);
}

/**
 * Build hreflang alternates for all locales.
 * Returns object suitable for Metadata.alternates.languages
 *
 * @param path - The path without locale (e.g., "/directory")
 * @returns Record of hreflang → URL for all locales + x-default
 *
 * @example
 * buildHreflangs("/directory")
 * // Returns:
 * {
 *   "en": "https://algarveofficial.com/en/directory",
 *   "pt-PT": "https://algarveofficial.com/pt-pt/directory",
 *   "fr-FR": "https://algarveofficial.com/fr/directory",
 *   ...
 *   "x-default": "https://algarveofficial.com/en/directory"
 * }
 */
export function buildHreflangs(path: string = ""): Record<string, string> {
  const hreflangs: Record<string, string> = {};
  const normalizedPath = normalizeSeoPath(path);

  for (const locale of SUPPORTED_LOCALES) {
    const hreflang = LOCALE_CONFIGS[locale].hreflang;
    const canonicalUrl = buildCanonicalUrl(locale, normalizedPath);
    hreflangs[hreflang] = canonicalUrl;
  }

  hreflangs["x-default"] = buildCanonicalUrl(DEFAULT_LOCALE, normalizedPath);

  return hreflangs;
}

/**
 * Build canonical URL string for Metadata.alternates.canonical
 *
 * @param locale - The locale
 * @param path - The path without locale
 * @returns Canonical URL string
 */
export function buildCanonicalUrlString(locale: Locale, path: string = ""): string {
  return buildCanonicalUrl(locale, path);
}

/**
 * Build complete alternates object for Metadata
 * Includes both canonical and all hreflang alternates
 *
 * @param locale - Current locale
 * @param path - The path without locale
 * @returns Object suitable for Metadata.alternates
 *
 * @example
 * export async function generateMetadata({ params }: Props): Promise<Metadata> {
 *   const { locale } = await params;
 *   return {
 *     alternates: buildMetadataAlternates(locale, "/directory"),
 *     ...
 *   };
 * }
 */
export function buildMetadataAlternates(locale: Locale, path: string = "") {
  const normalizedPath = normalizeSeoPath(path);
  const canonical = buildCanonicalUrl(locale, normalizedPath);
  const hreflangs = buildHreflangs(normalizedPath);

  return {
    canonical,
    languages: hreflangs,
  };
}

export function buildUnlocalizedAlternates(path: string = "") {
  const normalizedPath = normalizeSeoPath(path);
  return {
    canonical: toAbsoluteSiteUrl(normalizedPath),
    languages: buildHreflangs(normalizedPath),
  };
}

export function buildLocalizedPathAlternates(
  locale: Locale,
  localizedPaths: Partial<Record<Locale, string>>,
  options?: { xDefaultLocale?: Locale },
) {
  const languages: Record<string, string> = {};

  for (const supportedLocale of SUPPORTED_LOCALES) {
    const path = localizedPaths[supportedLocale];
    if (!path) {
      continue;
    }

    languages[LOCALE_CONFIGS[supportedLocale].hreflang] = toAbsoluteSiteUrl(path);
  }

  const xDefaultLocale = options?.xDefaultLocale ?? DEFAULT_LOCALE;
  const canonicalPath =
    localizedPaths[locale] ??
    localizedPaths[xDefaultLocale] ??
    `/${locale}`;
  const xDefaultPath =
    localizedPaths[xDefaultLocale] ??
    canonicalPath;

  languages["x-default"] = toAbsoluteSiteUrl(xDefaultPath);

  return {
    canonical: toAbsoluteSiteUrl(canonicalPath),
    languages,
  };
}

/**
 * Check if a locale is the default (English)
 */
export function isDefaultLocale(locale: Locale | string): boolean {
  return (locale as string) === DEFAULT_LOCALE;
}

/**
 * Get hreflang value for a locale
 */
export function getHreflangForLocale(locale: Locale): string {
  return LOCALE_CONFIGS[locale].hreflang;
}

/**
 * Convert locale to HTML lang attribute value
 * @example "pt-pt" → "pt-PT"
 */
export function toHtmlLang(locale: Locale): string {
  return LOCALE_CONFIGS[locale].hreflang;
}

/**
 * Get OpenGraph locale for Metadata
 * @example "pt-pt" → "pt_PT"
 */
export function toOpenGraphLocale(locale: Locale): string {
  const config = LOCALE_CONFIGS[locale];
  return config.dateLocale.replace(/-/g, "_");
}
