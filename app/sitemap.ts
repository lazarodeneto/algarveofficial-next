import type { MetadataRoute } from "next";
import { createPublicServerClient } from "@/lib/supabase/public-server";

const DEFAULT_SITE_URL = "https://algarveofficial.com";
const SITEMAP_FETCH_LIMIT = 5000;

export const revalidate = 3600;

function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured.replace(/\/+$/, "");
  }
  return DEFAULT_SITE_URL;
}

const STATIC_PUBLIC_PATHS = [
  "/",
  "/about-us",
  "/blog",
  "/contact",
  "/cookie-policy",
  "/destinations",
  "/directory",
  "/events",
  "/invest",
  "/live",
  "/map",
  "/partner",
  "/privacy-policy",
  "/real-estate",
  "/terms",
] as const;

function toValidDate(value: string | null | undefined, fallback: Date) {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function buildStaticEntries(siteUrl: string, now: Date): MetadataRoute.Sitemap {
  return STATIC_PUBLIC_PATHS.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const staticEntries = buildStaticEntries(siteUrl, now);

  try {
    const supabase = createPublicServerClient();

    const [listingsResponse, destinationsResponse, blogPostsResponse, eventsResponse] =
      await Promise.all([
        supabase
          .from("listings")
          .select("id, slug, updated_at, published_at")
          .eq("status", "published")
          .order("updated_at", { ascending: false })
          .limit(SITEMAP_FETCH_LIMIT),
        supabase
          .from("regions")
          .select("slug, updated_at")
          .or("is_active.eq.true,is_visible_destinations.eq.true")
          .order("updated_at", { ascending: false })
          .limit(SITEMAP_FETCH_LIMIT),
        supabase
          .from("blog_posts")
          .select("slug, updated_at, published_at")
          .eq("status", "published")
          .order("updated_at", { ascending: false })
          .limit(SITEMAP_FETCH_LIMIT),
        supabase
          .from("events")
          .select("slug, updated_at, start_date")
          .eq("status", "published")
          .order("start_date", { ascending: false, nullsFirst: false })
          .limit(SITEMAP_FETCH_LIMIT),
      ]);

    if (listingsResponse.error) throw listingsResponse.error;
    if (destinationsResponse.error) throw destinationsResponse.error;
    if (blogPostsResponse.error) throw blogPostsResponse.error;
    if (eventsResponse.error) throw eventsResponse.error;

    const listingEntries: MetadataRoute.Sitemap = (listingsResponse.data ?? [])
      .map((listing) => ({
        url: `${siteUrl}/listing/${listing.slug || listing.id}`,
        lastModified: toValidDate(listing.updated_at, toValidDate(listing.published_at, now)),
        changeFrequency: "weekly" as const,
        priority: 0.82,
      }));

    const destinationEntries: MetadataRoute.Sitemap = (destinationsResponse.data ?? [])
      .filter((region) => Boolean(region.slug))
      .map((region) => ({
        url: `${siteUrl}/destinations/${region.slug}`,
        lastModified: toValidDate(region.updated_at, now),
        changeFrequency: "weekly" as const,
        priority: 0.78,
      }));

    const blogEntries: MetadataRoute.Sitemap = (blogPostsResponse.data ?? [])
      .filter((post) => Boolean(post.slug))
      .filter((post) => {
        if (!post.published_at) return true;
        return Date.parse(post.published_at) <= Date.now();
      })
      .map((post) => ({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: toValidDate(post.updated_at, toValidDate(post.published_at, now)),
        changeFrequency: "monthly" as const,
        priority: 0.76,
      }));

    const eventEntries: MetadataRoute.Sitemap = (eventsResponse.data ?? [])
      .filter((event) => Boolean(event.slug))
      .map((event) => ({
        url: `${siteUrl}/events/${event.slug}`,
        lastModified: toValidDate(event.updated_at, toValidDate(event.start_date, now)),
        changeFrequency: "weekly" as const,
        priority: 0.74,
      }));

    const deduped = new Map<string, MetadataRoute.Sitemap[number]>();
    [...staticEntries, ...destinationEntries, ...blogEntries, ...eventEntries, ...listingEntries]
      .forEach((entry) => {
        deduped.set(entry.url, entry);
      });

    return Array.from(deduped.values());
  } catch (error) {
    console.error("[sitemap] Failed to fetch dynamic URLs, returning static sitemap", error);
    return staticEntries;
  }
}
