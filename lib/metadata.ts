import type { Metadata } from "next";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import {
  buildMetadataAlternates,
  buildUnlocalizedAlternates,
  toOpenGraphLocale,
} from "@/lib/i18n/seo";

const SITE_NAME = "AlgarveOfficial";
const DEFAULT_SITE_URL = "https://algarveofficial.com";
const DEFAULT_DESCRIPTION =
  "Discover the Algarve's finest villas, restaurants and golf courses — curated by experts who know every corner of Portugal's most prestigious coast.";
const DEFAULT_IMAGE = "/og-image.png";
const DEFAULT_LOCALE = "en_GB";
const TWITTER_SITE = "@AlgarveOfficial";
const DEFAULT_KEYWORDS = [
  "Algarve",
  "Algarve directory",
  "premium listings",
  "Portugal travel",
  "Algarve villas",
  "Algarve restaurants",
  "Algarve golf",
  "Algarve events",
  "real estate Algarve",
  "Algarve concierge",
];

export interface MetadataParams {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "product" | "place";
  noIndex?: boolean;
  noFollow?: boolean;
  locale?: string; // OpenGraph locale (e.g., "en_GB", "pt_PT")
  localeCode?: string; // URL locale prefix (e.g., "en", "pt-pt")
  keywords?: string[] | string;
  authors?: Array<{ name: string; url?: string }>;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
}

function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured.replace(/\/+$/, "");
  }

  return DEFAULT_SITE_URL;
}

function normalizePath(path: string) {
  if (!path || path === "/") {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function toAbsoluteUrl(siteUrl: string, value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${siteUrl}${normalizePath(value)}`;
}

export function buildAlternates(path: string, localeCode?: string) {
  const normalizedPath = normalizePath(path);
  if (localeCode && isValidLocale(localeCode)) {
    return buildMetadataAlternates(localeCode as Locale, normalizedPath);
  }

  return buildUnlocalizedAlternates(normalizedPath);
}

function normalizeKeywords(
  keywords?: string[] | string,
): string[] {
  if (Array.isArray(keywords)) {
    const normalized = keywords
      .map((value) => String(value).trim())
      .filter(Boolean);
    return normalized.length > 0 ? Array.from(new Set(normalized)) : DEFAULT_KEYWORDS;
  }

  if (typeof keywords === "string") {
    const normalized = keywords
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    return normalized.length > 0 ? Array.from(new Set(normalized)) : DEFAULT_KEYWORDS;
  }

  return DEFAULT_KEYWORDS;
}

function ensureBrandedTitle(title: string) {
  const normalized = String(title || "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return SITE_NAME;
  }

  if (/algarveofficial/i.test(normalized)) {
    return normalized;
  }

  return `${normalized} | ${SITE_NAME}`;
}

function normalizeDescription(description?: string) {
  const normalized = String(description || DEFAULT_DESCRIPTION).replace(/\s+/g, " ").trim();
  if (normalized.length <= 155) {
    return normalized;
  }

  return `${normalized.slice(0, 154).trimEnd()}…`;
}

export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  noIndex = false,
  noFollow = false,
  locale = DEFAULT_LOCALE,
  localeCode,
  keywords,
  authors,
  publishedTime,
  modifiedTime,
  section,
}: MetadataParams): Metadata {
  const siteUrl = getSiteUrl();
  const normalizedPath = normalizePath(path);
  const localePrefix = localeCode ? `/${localeCode}` : "";
  const canonical = toAbsoluteUrl(siteUrl, `${localePrefix}${normalizedPath}`);
  const resolvedImage = toAbsoluteUrl(siteUrl, image);
  const resolvedTitle = ensureBrandedTitle(title);
  const resolvedDescription = normalizeDescription(description);
  const openGraphType = type === "article" ? "article" : "website";
  const resolvedOpenGraphLocale =
    localeCode && isValidLocale(localeCode)
      ? toOpenGraphLocale(localeCode as Locale)
      : locale;

  const metadata: Metadata = {
    title: resolvedTitle,
    description: resolvedDescription,
    applicationName: SITE_NAME,
    creator: SITE_NAME,
    publisher: SITE_NAME,
    referrer: "origin-when-cross-origin",
    metadataBase: new URL(siteUrl),
    keywords: normalizeKeywords(keywords),
    authors,
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: "/icons/apple-touch-icon.png" }],
      shortcut: [{ url: "/favicon.ico" }],
    },
    alternates: buildAlternates(normalizedPath, localeCode),
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      siteName: SITE_NAME,
      locale: resolvedOpenGraphLocale,
      type: openGraphType,
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
        },
      ],
      ...(openGraphType === "article"
        ? {
            publishedTime,
            modifiedTime,
            authors: authors?.map((author) => author.name),
            section,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: [resolvedImage],
      site: TWITTER_SITE,
      creator: TWITTER_SITE,
    },
    other: {
      "format-detection": "telephone=no",
      "geo.region": "PT-08",
      "geo.placename": "Algarve, Portugal",
      "geo.position": "37.0179;-7.9304",
      ICBM: "37.0179, -7.9304",
      ...(type === "place" || type === "product" ? { "og:type": type } : {}),
    },
  };

  return metadata;
}
