import type { MetadataRoute } from "next";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { SUPPORTED_LOCALES, LOCALE_CONFIGS, addLocaleToPathname } from "@/lib/i18n/config";

const DEFAULT_SITE_URL = "https://algarveofficial.com";
const SITEMAP_FETCH_LIMIT = 50000;

export const revalidate = 3600;

function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured.replace(/\/+$/, "");
  }
  return DEFAULT_SITE_URL;
}

const STATIC_PATHS: Array<{ path: string; priority: number; changefreq: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/", priority: 1.0, changefreq: "daily" },
  { path: "/directory", priority: 0.9, changefreq: "daily" },
  { path: "/destinations", priority: 0.9, changefreq: "weekly" },
  { path: "/events", priority: 0.85, changefreq: "daily" },
  { path: "/blog", priority: 0.85, changefreq: "weekly" },
  { path: "/real-estate", priority: 0.85, changefreq: "weekly" },
  { path: "/about-us", priority: 0.7, changefreq: "monthly" },
  { path: "/contact", priority: 0.7, changefreq: "monthly" },
  { path: "/partner", priority: 0.7, changefreq: "monthly" },
  { path: "/invest", priority: 0.7, changefreq: "monthly" },
  { path: "/map", priority: 0.6, changefreq: "weekly" },
  { path: "/live", priority: 0.6, changefreq: "weekly" },
  { path: "/privacy-policy", priority: 0.3, changefreq: "yearly" },
  { path: "/terms", priority: 0.3, changefreq: "yearly" },
  { path: "/cookie-policy", priority: 0.3, changefreq: "yearly" },
];

const CATEGORY_PATHS: Array<{ path: string; priority: number; changefreq: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/directory/restaurants", priority: 0.9, changefreq: "daily" },
  { path: "/directory/places-to-stay", priority: 0.9, changefreq: "daily" },
  { path: "/directory/golf", priority: 0.85, changefreq: "weekly" },
  { path: "/directory/beaches", priority: 0.85, changefreq: "weekly" },
  { path: "/directory/things-to-do", priority: 0.85, changefreq: "weekly" },
  { path: "/directory/real-estate", priority: 0.85, changefreq: "weekly" },
  { path: "/directory/wellness", priority: 0.8, changefreq: "weekly" },
  { path: "/directory/events", priority: 0.8, changefreq: "daily" },
];

function toValidDate(value: string | null | undefined, fallback: Date) {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : fallback;
}

function buildAlternates(localizedPath: string): MetadataRoute.Sitemap[number]["alternates"] {
  const siteUrl = getSiteUrl();
  const languages: Record<string, string> = {};

  for (const locale of SUPPORTED_LOCALES) {
    const hreflang = LOCALE_CONFIGS[locale].hreflang;
    languages[hreflang] = `${siteUrl}${addLocaleToPathname(localizedPath, locale)}`;
  }
  languages["x-default"] = `${siteUrl}/en${localizedPath}`;

  return { languages };
}

function buildStaticEntries(siteUrl: string, now: Date): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const allStaticPaths = [...STATIC_PATHS, ...CATEGORY_PATHS];

  for (const { path, priority, changefreq } of allStaticPaths) {
    for (const locale of SUPPORTED_LOCALES) {
      entries.push({
        url: `${siteUrl}${addLocaleToPathname(path, locale)}`,
        lastModified: now,
        changeFrequency: changefreq,
        priority,
        alternates: buildAlternates(path),
      });
    }
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const staticEntries = buildStaticEntries(siteUrl, now);

  try {
    const supabase = createPublicServerClient();

    const [
      listingsResponse,
      regionsResponse,
      citiesResponse,
      categoriesResponse,
      blogPostsResponse,
      eventsResponse,
    ] = await Promise.all([
      supabase
        .from("listings")
        .select("slug, updated_at, published_at, category_slug, image_url")
        .eq("status", "published")
        .order("updated_at", { ascending: false })
        .limit(SITEMAP_FETCH_LIMIT),
      supabase
        .from("regions")
        .select("slug, updated_at, image_url")
        .eq("is_visible_destinations", true)
        .limit(1000),
      supabase
        .from("cities")
        .select("slug, updated_at, image_url")
        .limit(5000),
      supabase
        .from("categories")
        .select("slug, image_url")
        .limit(100),
      supabase
        .from("blog_posts")
        .select("slug, updated_at, published_at, featured_image")
        .eq("status", "published")
        .order("updated_at", { ascending: false })
        .limit(5000),
      supabase
        .from("events")
        .select("slug, updated_at, start_date, image_url")
        .eq("status", "published")
        .order("start_date", { ascending: false, nullsFirst: false })
        .limit(5000),
    ]);

    const listingEntries: MetadataRoute.Sitemap = (listingsResponse.data ?? [])
      .filter((listing) => Boolean(listing.slug))
      .flatMap((listing) => {
        const basePath = `/listing/${listing.slug}`;
        return SUPPORTED_LOCALES.map((locale) => ({
          url: `${siteUrl}${addLocaleToPathname(basePath, locale)}`,
          lastModified: toValidDate(listing.updated_at, toValidDate(listing.published_at, now)),
          changeFrequency: "weekly" as const,
          priority: 0.82,
          alternates: buildAlternates(basePath),
          images: listing.image_url ? [listing.image_url] : undefined,
        }));
      });

    const regionEntries: MetadataRoute.Sitemap = (regionsResponse.data ?? [])
      .filter((region) => Boolean(region.slug))
      .flatMap((region) => {
        const basePath = `/destinations/${region.slug}`;
        return SUPPORTED_LOCALES.map((locale) => ({
          url: `${siteUrl}${addLocaleToPathname(basePath, locale)}`,
          lastModified: toValidDate(region.updated_at, now),
          changeFrequency: "weekly" as const,
          priority: 0.78,
          alternates: buildAlternates(basePath),
          images: region.image_url ? [region.image_url] : undefined,
        }));
      });

    const cityEntries: MetadataRoute.Sitemap = (citiesResponse.data ?? [])
      .filter((city) => Boolean(city.slug))
      .flatMap((city) => {
        const basePath = `/destinations/${city.slug}`;
        return SUPPORTED_LOCALES.map((locale) => ({
          url: `${siteUrl}${addLocaleToPathname(basePath, locale)}`,
          lastModified: toValidDate(city.updated_at, now),
          changeFrequency: "weekly" as const,
          priority: 0.75,
          alternates: buildAlternates(basePath),
          images: city.image_url ? [city.image_url] : undefined,
        }));
      });

    const categoryEntries: MetadataRoute.Sitemap = (categoriesResponse.data ?? [])
      .filter((cat) => Boolean(cat.slug))
      .flatMap((cat) => {
        const basePath = `/directory/${cat.slug}`;
        return SUPPORTED_LOCALES.map((locale) => ({
          url: `${siteUrl}${addLocaleToPathname(basePath, locale)}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
          alternates: buildAlternates(basePath),
          images: cat.image_url ? [cat.image_url] : undefined,
        }));
      });

    const blogEntries: MetadataRoute.Sitemap = (blogPostsResponse.data ?? [])
      .filter((post) => Boolean(post.slug))
      .filter((post) => {
        if (!post.published_at) return true;
        return Date.parse(post.published_at) <= Date.now();
      })
      .flatMap((post) => {
        const basePath = `/blog/${post.slug}`;
        return SUPPORTED_LOCALES.map((locale) => ({
          url: `${siteUrl}${addLocaleToPathname(basePath, locale)}`,
          lastModified: toValidDate(post.updated_at, toValidDate(post.published_at, now)),
          changeFrequency: "monthly" as const,
          priority: 0.76,
          alternates: buildAlternates(basePath),
          images: post.featured_image ? [post.featured_image] : undefined,
        }));
      });

    const eventEntries: MetadataRoute.Sitemap = (eventsResponse.data ?? [])
      .filter((event) => Boolean(event.slug))
      .flatMap((event) => {
        const basePath = `/events/${event.slug}`;
        return SUPPORTED_LOCALES.map((locale) => ({
          url: `${siteUrl}${addLocaleToPathname(basePath, locale)}`,
          lastModified: toValidDate(event.updated_at, toValidDate(event.start_date, now)),
          changeFrequency: event.start_date && new Date(event.start_date) > now ? "weekly" : "monthly",
          priority: 0.74,
          alternates: buildAlternates(basePath),
          images: event.image_url ? [event.image_url] : undefined,
        }));
      });

    const deduped = new Map<string, MetadataRoute.Sitemap[number]>();
    [
      ...staticEntries,
      ...regionEntries,
      ...cityEntries,
      ...categoryEntries,
      ...blogEntries,
      ...eventEntries,
      ...listingEntries,
    ].forEach((entry) => {
      deduped.set(entry.url, entry);
    });

    return Array.from(deduped.values());
  } catch (error) {
    console.error("[sitemap] Failed to fetch dynamic URLs, returning static sitemap", error);
    return staticEntries;
  }
}
