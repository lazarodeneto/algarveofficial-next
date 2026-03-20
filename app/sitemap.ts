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

const STATIC_PATHS: Record<string, { priority: number; changefreq: MetadataRoute.Sitemap[number]["changeFrequency"] }> = {
  "/": { priority: 1.0, changefreq: "daily" },
  "/directory": { priority: 0.9, changefreq: "daily" },
  "/destinations": { priority: 0.9, changefreq: "weekly" },
  "/events": { priority: 0.85, changefreq: "daily" },
  "/blog": { priority: 0.85, changefreq: "weekly" },
  "/real-estate": { priority: 0.85, changefreq: "weekly" },
  "/about-us": { priority: 0.7, changefreq: "monthly" },
  "/contact": { priority: 0.7, changefreq: "monthly" },
  "/partner": { priority: 0.7, changefreq: "monthly" },
  "/invest": { priority: 0.7, changefreq: "monthly" },
  "/map": { priority: 0.6, changefreq: "weekly" },
  "/live": { priority: 0.6, changefreq: "weekly" },
  "/privacy-policy": { priority: 0.3, changefreq: "yearly" },
  "/terms": { priority: 0.3, changefreq: "yearly" },
  "/cookie-policy": { priority: 0.3, changefreq: "yearly" },
};

const CATEGORY_PATHS: Record<string, { priority: number; changefreq: MetadataRoute.Sitemap[number]["changeFrequency"] }> = {
  "/directory/restaurants": { priority: 0.9, changefreq: "daily" },
  "/directory/places-to-stay": { priority: 0.9, changefreq: "daily" },
  "/directory/golf": { priority: 0.85, changefreq: "weekly" },
  "/directory/beaches": { priority: 0.85, changefreq: "weekly" },
  "/directory/things-to-do": { priority: 0.85, changefreq: "weekly" },
  "/directory/real-estate": { priority: 0.85, changefreq: "weekly" },
  "/directory/wellness": { priority: 0.8, changefreq: "weekly" },
  "/directory/events": { priority: 0.8, changefreq: "daily" },
};

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

  return { languages };
}

function buildStaticEntries(siteUrl: string, now: Date): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const [path, config] of Object.entries(STATIC_PATHS)) {
    entries.push({
      url: `${siteUrl}/en${path === "/" ? "" : path}`,
      lastModified: now,
      changeFrequency: config.changefreq,
      priority: config.priority,
      alternates: buildAlternates(path),
    });
  }

  for (const [path, config] of Object.entries(CATEGORY_PATHS)) {
    entries.push({
      url: `${siteUrl}/en${path}`,
      lastModified: now,
      changeFrequency: config.changefreq,
      priority: config.priority,
      alternates: buildAlternates(path),
    });
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
      .map((listing) => {
        const path = `/listing/${listing.slug}`;
        return {
          url: `${siteUrl}/en${path}`,
          lastModified: toValidDate(listing.updated_at, toValidDate(listing.published_at, now)),
          changeFrequency: "weekly" as const,
          priority: 0.82,
          alternates: buildAlternates(path),
          images: listing.image_url ? [listing.image_url] : undefined,
        };
      });

    const regionEntries: MetadataRoute.Sitemap = (regionsResponse.data ?? [])
      .filter((region) => Boolean(region.slug))
      .map((region) => {
        const path = `/destinations/${region.slug}`;
        return {
          url: `${siteUrl}/en${path}`,
          lastModified: toValidDate(region.updated_at, now),
          changeFrequency: "weekly" as const,
          priority: 0.78,
          alternates: buildAlternates(path),
          images: region.image_url ? [region.image_url] : undefined,
        };
      });

    const cityEntries: MetadataRoute.Sitemap = (citiesResponse.data ?? [])
      .filter((city) => Boolean(city.slug))
      .map((city) => {
        const path = `/destinations/${city.slug}`;
        return {
          url: `${siteUrl}/en${path}`,
          lastModified: toValidDate(city.updated_at, now),
          changeFrequency: "weekly" as const,
          priority: 0.75,
          alternates: buildAlternates(path),
          images: city.image_url ? [city.image_url] : undefined,
        };
      });

    const categoryEntries: MetadataRoute.Sitemap = (categoriesResponse.data ?? [])
      .filter((cat) => Boolean(cat.slug))
      .map((cat) => {
        const path = `/directory/${cat.slug}`;
        return {
          url: `${siteUrl}/en${path}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
          alternates: buildAlternates(path),
          images: cat.image_url ? [cat.image_url] : undefined,
        };
      });

    const blogEntries: MetadataRoute.Sitemap = (blogPostsResponse.data ?? [])
      .filter((post) => Boolean(post.slug))
      .filter((post) => {
        if (!post.published_at) return true;
        return Date.parse(post.published_at) <= Date.now();
      })
      .map((post) => {
        const path = `/blog/${post.slug}`;
        return {
          url: `${siteUrl}/en${path}`,
          lastModified: toValidDate(post.updated_at, toValidDate(post.published_at, now)),
          changeFrequency: "monthly" as const,
          priority: 0.76,
          alternates: buildAlternates(path),
          images: post.featured_image ? [post.featured_image] : undefined,
        };
      });

    const eventEntries: MetadataRoute.Sitemap = (eventsResponse.data ?? [])
      .filter((event) => Boolean(event.slug))
      .map((event) => {
        const path = `/events/${event.slug}`;
        return {
          url: `${siteUrl}/en${path}`,
          lastModified: toValidDate(event.updated_at, toValidDate(event.start_date, now)),
          changeFrequency: event.start_date && new Date(event.start_date) > now ? "weekly" : "monthly",
          priority: 0.74,
          alternates: buildAlternates(path),
          images: event.image_url ? [event.image_url] : undefined,
        };
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
