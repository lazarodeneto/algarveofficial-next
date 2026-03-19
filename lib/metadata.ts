import type { Metadata } from "next";

const SITE_NAME = "AlgarveOfficial";
const DEFAULT_SITE_URL = "https://algarveofficial.com";
const DEFAULT_DESCRIPTION =
  "Discover the Algarve's finest villas, restaurants and golf courses — curated by experts who know every corner of Portugal's most prestigious coast.";
const DEFAULT_IMAGE = "/og-image.png";
const DEFAULT_LOCALE = "en_GB";
const TWITTER_SITE = "@AlgarveOfficial";

export interface MetadataParams {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "product" | "place";
  noIndex?: boolean;
  noFollow?: boolean;
  locale?: string;
  keywords?: string[] | string;
  authors?: Array<{ name: string; url?: string }>;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
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

export function buildAlternates(path: string) {
  const siteUrl = getSiteUrl();
  const normalizedPath = normalizePath(path);

  return {
    canonical: toAbsoluteUrl(siteUrl, normalizedPath),
    languages: {
      en: toAbsoluteUrl(siteUrl, normalizedPath),
      "x-default": toAbsoluteUrl(siteUrl, normalizedPath),
    },
  };
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
  keywords,
  authors,
  publishedTime,
  modifiedTime,
  section,
}: MetadataParams): Metadata {
  const siteUrl = getSiteUrl();
  const normalizedPath = normalizePath(path);
  const canonical = toAbsoluteUrl(siteUrl, normalizedPath);
  const resolvedImage = toAbsoluteUrl(siteUrl, image);
  const resolvedTitle = ensureBrandedTitle(title);
  const resolvedDescription = normalizeDescription(description);
  const openGraphType = type === "article" ? "article" : "website";

  const metadata: Metadata = {
    title: resolvedTitle,
    description: resolvedDescription,
    metadataBase: new URL(siteUrl),
    keywords,
    authors,
    alternates: buildAlternates(normalizedPath),
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
      locale,
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
