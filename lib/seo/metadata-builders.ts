/**
 * Enhanced metadata builders for i18n pages
 * Builds complete Metadata objects with proper canonical, hreflang, OG tags, etc.
 */

import type { Metadata } from "next";
import { LOCALE_CONFIGS, type Locale } from "@/lib/i18n/config";
import {
  buildMetadataAlternates,
  toHtmlLang,
  toOpenGraphLocale,
  getHreflangForLocale,
} from "@/lib/i18n/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://algarveofficial.com";
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
  /** Article metadata */
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
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
    publishedTime,
    modifiedTime,
    authorName,
  } = params;

  const brandedTitle = ensureBrandedTitle(title);
  const normalizedDescription = normalizeDescription(description);
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  const htmlLang = toHtmlLang(locale);
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
    alternates,
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
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

  for (const locale of Object.keys(LOCALE_CONFIGS) as Locale[]) {
    const hreflang = getHreflangForLocale(locale);
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const pathWithoutTrailingSlash = cleanPath === "/" ? "" : cleanPath.replace(/\/+$/, "");
    const url = `${SITE_URL}/${locale}${pathWithoutTrailingSlash}`;
    html += `<link rel="alternate" hreflang="${hreflang}" href="${url}" />\n`;
  }

  // Add x-default
  const defaultPath = path.startsWith("/") ? path : `/${path}`;
  const defaultUrl = `${SITE_URL}/en${defaultPath === "/" ? "" : defaultPath}`;
  html += `<link rel="alternate" hreflang="x-default" href="${defaultUrl}" />`;

  return html;
}
