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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://algarveofficial.com";

/**
 * Get the URL prefix for a locale.
 * Always includes locale in URL for consistency:
 * - "en" → "/en"
 * - "pt-pt" → "/pt-pt"
 * - etc.
 */
export function getLocaleUrlPrefix(locale: Locale): string {
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
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const pathWithoutTrailingSlash = cleanPath === "/" ? "" : cleanPath.replace(/\/+$/, "");
  return `${SITE_URL}${getLocaleUrlPrefix(locale)}${pathWithoutTrailingSlash}`;
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

  // Add all supported locales
  for (const locale of SUPPORTED_LOCALES) {
    const hreflang = LOCALE_CONFIGS[locale].hreflang;
    const canonicalUrl = buildCanonicalUrl(locale, path);
    hreflangs[hreflang] = canonicalUrl;
  }

  // Add x-default (points to English version)
  hreflangs["x-default"] = buildCanonicalUrl(DEFAULT_LOCALE, path);

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
  const canonical = buildCanonicalUrl(locale, path);
  const hreflangs = buildHreflangs(path);

  return {
    canonical,
    languages: hreflangs,
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
