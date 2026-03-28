/**
 * Enhanced metadata builders for i18n pages
 * Builds complete Metadata objects with proper canonical, hreflang, OG tags, etc.
 */

import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import {
  buildHreflangs,
  buildMetadataAlternates,
  toOpenGraphLocale,
  getSiteUrl,
} from "@/lib/i18n/seo";

const SITE_URL = getSiteUrl();
const SITE_NAME = "AlgarveOfficial";
const DEFAULT_IMAGE = "/og-image.png";

export interface LocalizedMetadataParams {
  /** Current locale */
  locale: Locale;
  /** Page path without locale prefix (e.g., "/directory") */
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
 *     path: "/directory",
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

  const brandedTitle = ensureBrandedTitle(title);
  const normalizedDescription = normalizeDescription(description);
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  const ogLocale = toOpenGraphLocale(locale);
  const alternates = buildMetadataAlternates(locale, path);

  return {
    title: brandedTitle,
    description: normalizedDescription,
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    creator: SITE_NAME,
    publisher: SITE_NAME,
    keywords: keywords || [
      "Algarve",
      "directory",
      "premium listings",
      "Portugal",
      "travel",
    ],
    alternates: alternates as any,
    robots: {
      index: !noIndex,
      follow,
      googleBot: {
        index: !noIndex,
        follow,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: brandedTitle,
      description: normalizedDescription,
      url: alternates.canonical,
      siteName: SITE_NAME,
      locale: ogLocale,
      type: type === "article" ? "article" : "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: brandedTitle,
        },
      ],
      ...(type === "article"
        ? {
            publishedTime,
            modifiedTime,
            authors: authorName ? [authorName] : undefined,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description: normalizedDescription,
      images: [imageUrl],
      site: "@AlgarveOfficial",
      creator: "@AlgarveOfficial",
    },
  };
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
 * const links = generateHreflangLinks("/directory");
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
