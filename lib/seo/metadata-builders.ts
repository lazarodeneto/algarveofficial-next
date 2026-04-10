/**
 * Enhanced metadata builders for i18n pages
 * Builds complete Metadata objects with proper canonical, hreflang, OG tags, etc.
 */

import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import {
  buildHreflangs,
} from "@/lib/i18n/seo";
import { buildMetadata } from "@/lib/metadata";

const SITE_NAME = "AlgarveOfficial";
const DEFAULT_IMAGE = "/og-image.png";

export interface LocalizedMetadataParams {
  /** Current locale */
  locale: Locale;
  /** Page path without locale prefix (e.g., "/stay") */
  path: string;
  /** Page title (will be branded with site name) */
  title: string;
  /** Meta description */
  description?: string;
  /** OG image URL */
  image?: string;
  /** Page type: website, article, product, place */
  type?: "website" | "article" | "product" | "place";
  /** Additional keywords */
  keywords?: string[];
  /** Disable indexing */
  noIndex?: boolean;
  /** Override robots follow behavior */
  follow?: boolean;
  /** Article metadata */
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
}

export interface LocalizedAliasMetadataParams extends Omit<LocalizedMetadataParams, "path"> {
  /** Canonical destination used for aliases such as /visit -> /directory */
  canonicalPath: string;
}

/**
 * Ensure title is branded with site name
 */
function ensureBrandedTitle(title: string): string {
  const normalized = String(title || "").replace(/\s+/g, " ").trim();
  if (!normalized) return SITE_NAME;
  if (new RegExp(SITE_NAME, "i").test(normalized)) return normalized;
  return `${normalized} | ${SITE_NAME}`;
}

/**
 * Truncate description to SEO-friendly length (155 chars)
 */
function normalizeDescription(description?: string): string {
  const DEFAULT_DESCRIPTION =
    "Discover the Algarve's finest villas, restaurants and golf courses — curated by experts who know every corner of Portugal's most prestigious coast.";
  const normalized = String(description || DEFAULT_DESCRIPTION).replace(/\s+/g, " ").trim();
  if (normalized.length <= 155) return normalized;
  return `${normalized.slice(0, 154).trimEnd()}…`;
}

/**
 * Build complete Metadata object for a localized page
 *
 * @example
 * export async function generateMetadata({ params }: Props): Promise<Metadata> {
 *   const { locale } = await params;
 *   return buildLocalizedMetadata({
 *     locale,
 *     path: "/stay",
 *     title: "Directory",
 *     description: "Browse all listings",
 *   });
 * }
 */
export function buildLocalizedMetadata(params: LocalizedMetadataParams): Metadata {
  const {
    locale,
    path,
    title,
    description,
    image = DEFAULT_IMAGE,
    type = "website",
    keywords,
    noIndex = false,
    follow = !noIndex,
    publishedTime,
    modifiedTime,
    authorName,
  } = params;

  const normalizedType: "website" | "article" | "product" | "place" =
    type === "article" || type === "product" || type === "place"
      ? type
      : "website";

  return buildMetadata({
    title: ensureBrandedTitle(title),
    description: normalizeDescription(description),
    path,
    image,
    type: normalizedType,
    noIndex,
    noFollow: !follow,
    localeCode: locale,
    keywords:
      keywords || [
        "Algarve",
        "directory",
        "premium listings",
        "Portugal",
        "travel",
      ],
    authors: authorName ? [{ name: authorName }] : undefined,
    publishedTime,
    modifiedTime,
  });
}

/**
 * Build metadata for collection pages (directory, listing pages, etc.)
 * Includes ItemList schema in addition to standard metadata
 */
export function buildCollectionPageMetadata(
  params: LocalizedMetadataParams & {
    itemCount?: number;
  }
): Metadata {
  const { itemCount, ...otherParams } = params;
  return buildLocalizedMetadata(otherParams);
}

/**
 * Build metadata for static pages (about, contact, etc.)
 * Simple wrapper around buildLocalizedMetadata
 */
export function buildStaticPageMetadata(params: LocalizedMetadataParams): Metadata {
  return buildLocalizedMetadata(params);
}

/**
 * Build metadata for an alias route that should consolidate SEO signals onto
 * a different canonical localized path.
 */
export function buildLocalizedAliasMetadata(
  params: LocalizedAliasMetadataParams,
): Metadata {
  const { canonicalPath, ...metadata } = params;
  return buildLocalizedMetadata({
    ...metadata,
    path: canonicalPath,
  });
}

/**
 * Utility to generate hreflang links as HTML strings
 * Useful for debugging or custom implementations
 *
 * @example
 * const links = generateHreflangLinks("/stay");
 * // Returns:
 * // '<link rel="alternate" hreflang="en" href="..." />'
 * // '<link rel="alternate" hreflang="pt-PT" href="..." />'
 * // etc.
 */
export function generateHreflangLinks(path: string = ""): string {
  let html = "";

  for (const [hreflang, url] of Object.entries(buildHreflangs(path))) {
    html += `<link rel="alternate" hreflang="${hreflang}" href="${url}" />\n`;
  }

  return html;
}
