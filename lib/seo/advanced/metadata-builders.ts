import type { Metadata } from "next";
import { SITE_CONFIG, CATEGORY_META, LOCATION_META, DEFAULT_KEYWORDS } from "./seo-config";
import type { Locale } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/i18n/seo";
import type { LocalizedRouteInput } from "@/lib/i18n/localized-routing";
import {
  buildRelativeRoutePath,
  buildRouteMetadataAlternates,
} from "@/lib/i18n/localized-routing";

type PageType = "website" | "article" | "product" | "place" | "localbusiness" | "event";

function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${getSiteUrl()}${normalizePath(pathOrUrl)}`;
}

function formatLocationName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function formatCategoryName(category: string): string {
  const meta = CATEGORY_META[category.toLowerCase()];
  return meta?.title || category.split("-").map(formatLocationName).join(" ");
}

function truncate(str: string, maxLength: number): string {
  const trimmed = str.replace(/\s+/g, " ").trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength - 1).trimEnd() + "…";
}

interface PageMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: PageType;
  noIndex?: boolean;
  noFollow?: boolean;
  locale?: Locale;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  authors?: Array<{ name: string; url?: string }>;
  localizedPath?: string;
  localizedRoute?: LocalizedRouteInput;
  alternatesOverride?: Metadata["alternates"];
}

export function buildPageMetadata({
  title,
  description,
  keywords,
  image,
  type = "website",
  noIndex = false,
  noFollow = false,
  locale = "en",
  publishedTime,
  modifiedTime,
  section,
  authors,
  localizedPath,
  localizedRoute,
  alternatesOverride,
}: PageMetadata = {}): Metadata {
  const resolvedTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.name;
  const resolvedDescription = truncate(
    description || SITE_CONFIG.description,
    155
  );
  const resolvedImage = toAbsoluteUrl(image || SITE_CONFIG.ogImage);
  const normalizedType: "website" | "article" | "product" | "place" =
    type === "article" || type === "product" || type === "place"
      ? type
      : "website";

  const resolvedLocalizedPath =
    localizedPath ??
    (localizedRoute ? buildRelativeRoutePath(locale, localizedRoute) : undefined);
  const resolvedAlternatesOverride =
    alternatesOverride ??
    (localizedRoute ? buildRouteMetadataAlternates(localizedRoute, locale) : undefined);

  const metadata = buildMetadata({
    title: resolvedTitle,
    description: resolvedDescription,
    path: resolvedLocalizedPath ?? "/",
    image: resolvedImage,
    type: normalizedType,
    noIndex,
    noFollow,
    localeCode: resolvedLocalizedPath ? locale : undefined,
    keywords: keywords?.length ? keywords : DEFAULT_KEYWORDS,
    authors,
    publishedTime,
    modifiedTime,
    section,
  });

  if (!resolvedAlternatesOverride) {
    return metadata;
  }

  const siteUrl = getSiteUrl();
  const canonical =
    typeof resolvedAlternatesOverride.canonical === "string"
      ? resolvedAlternatesOverride.canonical
      : `${siteUrl}${resolvedLocalizedPath ?? "/"}`;

  return {
    ...metadata,
    alternates: resolvedAlternatesOverride,
    openGraph: {
      ...metadata.openGraph,
      url: canonical,
    },
  };
}

interface ListingMetadata {
  name: string;
  category: string;
  location?: string;
  description?: string;
  image?: string;
  priceRange?: string;
  rating?: number;
  reviewCount?: number;
  noIndex?: boolean;
  locale?: Locale;
  localizedPath?: string;
}

export function buildListingMetadata({
  name,
  category,
  location,
  description,
  image,
  priceRange,
  rating,
  reviewCount,
  noIndex = false,
  locale = "en",
  localizedPath,
}: ListingMetadata): Metadata {
  const categoryTitle = formatCategoryName(category);
  const locationTitle = location ? ` in ${formatLocationName(location)}` : "";
  
  const title = `${name} | ${categoryTitle}${locationTitle}`;
  const metaDescription = truncate(
    description ||
      `Discover ${name}, a premium ${categoryTitle.toLowerCase()} in the Algarve${locationTitle}. Book now for an unforgettable experience.`,
    155
  );
  
  const keywords = [
    name,
    categoryTitle.toLowerCase(),
    location ? formatLocationName(location) : "Algarve",
    SITE_CONFIG.name,
    ...(location ? LOCATION_META[location.toLowerCase()]?.keywords || [] : []),
    ...(CATEGORY_META[category.toLowerCase()]?.keywords || []),
  ];

  return buildPageMetadata({
    title,
    description: metaDescription,
    keywords,
    image,
    type: "localbusiness",
    noIndex,
    locale,
    localizedPath,
  });
}

interface CategoryMetadata {
  category: string;
  location?: string;
  count?: number;
  noIndex?: boolean;
  locale?: Locale;
  localizedPath?: string;
}

export function buildCategoryMetadata({
  category,
  location,
  count,
  noIndex = false,
  locale = "en",
  localizedPath,
}: CategoryMetadata): Metadata {
  const categoryTitle = formatCategoryName(category);
  const locationTitle = location ? ` in ${formatLocationName(location)}` : "";
  
  const title = `${categoryTitle}${locationTitle} | Premium Directory`;
  const description = truncate(
    CATEGORY_META[category.toLowerCase()]?.description ||
      `Discover the finest ${categoryTitle.toLowerCase()} in the Algarve${locationTitle}. Curated directory of premium establishments.`,
    155
  );
  
  const keywords = [
    categoryTitle,
    location ? formatLocationName(location) : "Algarve",
    SITE_CONFIG.name,
    ...(CATEGORY_META[category.toLowerCase()]?.keywords || []),
  ];

  return buildPageMetadata({
    title,
    description,
    keywords,
    type: "website",
    noIndex,
    locale,
    localizedPath,
  });
}

interface LocationMetadata {
  location: string;
  region?: string;
  noIndex?: boolean;
  locale?: Locale;
  localizedPath?: string;
}

export function buildLocationMetadata({
  location,
  region,
  noIndex = false,
  locale = "en",
  localizedPath,
}: LocationMetadata): Metadata {
  const locationTitle = formatLocationName(location);
  const regionSuffix = region && region.toLowerCase() !== location.toLowerCase() 
    ? `, ${formatLocationName(region)}` 
    : ", Algarve";
  
  const title = `${locationTitle}${regionSuffix} | Complete Travel Guide`;
  const locationMeta = LOCATION_META[location.toLowerCase()];
  const description = truncate(
    locationMeta?.description ||
      `Explore ${locationTitle}${regionSuffix} - beaches, restaurants, activities and more. Your complete guide to ${locationTitle}.`,
    155
  );
  
  const keywords = [
    locationTitle,
    `${locationTitle} beaches`,
    `${locationTitle} restaurants`,
    `${locationTitle} activities`,
    region || "Algarve",
    SITE_CONFIG.name,
    ...(locationMeta?.keywords || []),
  ];

  return buildPageMetadata({
    title,
    description,
    keywords,
    type: "place",
    noIndex,
    locale,
    localizedPath,
  });
}

interface BlogPostMetadata {
  title: string;
  description: string;
  image?: string;
  publishedTime: string;
  modifiedTime?: string;
  author?: string;
  category?: string;
  tags?: string[];
  noIndex?: boolean;
  locale?: Locale;
  localizedPath?: string;
}

export function buildBlogPostMetadata({
  title,
  description,
  image,
  publishedTime,
  modifiedTime,
  author = SITE_CONFIG.name,
  category,
  tags,
  noIndex = false,
  locale = "en",
  localizedPath,
}: BlogPostMetadata): Metadata {
  const keywords = [
    title,
    SITE_CONFIG.name,
    category || "Algarve travel",
    ...(tags || []),
    "travel guide",
    "Portugal",
  ];

  return buildPageMetadata({
    title,
    description,
    keywords,
    image,
    type: "article",
    noIndex,
    publishedTime,
    modifiedTime: modifiedTime ?? publishedTime,
    authors: [{ name: author }],
    section: category,
    locale,
    localizedPath,
  });
}

interface EventMetadata {
  name: string;
  description: string;
  image?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  city?: string;
  organizer?: string;
  noIndex?: boolean;
  locale?: Locale;
  localizedPath?: string;
}

export function buildEventMetadata({
  name,
  description,
  image,
  startDate,
  location,
  city,
  organizer = SITE_CONFIG.name,
  noIndex = false,
  locale = "en",
  localizedPath,
}: EventMetadata): Metadata {
  const locationText = city ? ` in ${formatLocationName(city)}` : "";
  
  const title = `${name} | Events${locationText}`;
  const metaDescription = truncate(
    description || `Join ${name} - an exclusive event${locationText}.`,
    155
  );
  
  const keywords = [
    name,
    "Algarve events",
    city ? formatLocationName(city) : "Algarve",
    SITE_CONFIG.name,
    "events",
    "entertainment",
  ];

  return buildPageMetadata({
    title,
    description: metaDescription,
    keywords,
    image,
    type: "event",
    noIndex,
    publishedTime: startDate,
    locale,
    localizedPath,
  });
}

export function buildSearchMetadata(query?: string, locale: Locale = "en", localizedPath?: string): Metadata {
  const title = query 
    ? `Search: ${query} | ${SITE_CONFIG.name}` 
    : `Search Directory | ${SITE_CONFIG.name}`;
  
  return buildPageMetadata({
    title,
    description: query
      ? `Browse premium ${query} listings in the Algarve. Discover the finest restaurants, villas, golf courses and more.`
      : "Search our comprehensive directory of premium Algarve establishments.",
    noIndex: true,
    locale,
    localizedPath,
  });
}
