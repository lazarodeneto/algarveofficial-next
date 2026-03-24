import type { MetadataRoute } from "next";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { SUPPORTED_LOCALES, LOCALE_CONFIGS, DEFAULT_LOCALE } from "@/lib/i18n/config";
import {
  getAllCategoryCityCombinations,
} from "@/lib/seo/programmatic/category-city-data";
import {
  getCategoryUrlSlug,
  ALL_CANONICAL_SLUGS,
  type CanonicalCategorySlug,
} from "@/lib/seo/programmatic/category-slugs";

const DEFAULT_SITE_URL = "https://algarveofficial.com";
const LISTING_LIMIT = 10000;
const BLOG_LIMIT = 2000;
const EVENT_LIMIT = 2000;
const CITY_LIMIT = 2000;
const REGION_LIMIT = 500;
const CATEGORY_LIMIT = 100;

export const revalidate = 3600;

function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured.replace(/\/+$/, "");
  }
  return DEFAULT_SITE_URL;
}

function toValidDate(value: string | null | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function buildHreflangAlternates(basePath: string): MetadataRoute.Sitemap[number]["alternates"] {
  const siteUrl = getSiteUrl();
  const languages: Record<string, string> = {};

  for (const locale of SUPPORTED_LOCALES) {
    const hreflang = LOCALE_CONFIGS[locale].hreflang;
    const localePath = locale === DEFAULT_LOCALE ? basePath : `/${locale}${basePath}`;
    languages[hreflang] = `${siteUrl}${localePath}`;
  }
  languages["x-default"] = `${siteUrl}${basePath}`;

  return { languages };
}

function makeEntry(
  path: string,
  lastModified: Date,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
  imageUrl?: string | null,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${getSiteUrl()}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: buildHreflangAlternates(path),
    images: imageUrl ? [imageUrl] : undefined,
  };
}

const STATIC_PATHS = [
  { path: "/", priority: 1.0, changefreq: "daily" as const },
  { path: "/directory", priority: 0.9, changefreq: "daily" as const },
  { path: "/destinations", priority: 0.9, changefreq: "weekly" as const },
  { path: "/events", priority: 0.85, changefreq: "daily" as const },
  { path: "/blog", priority: 0.85, changefreq: "weekly" as const },
  { path: "/real-estate", priority: 0.85, changefreq: "weekly" as const },
  { path: "/about-us", priority: 0.7, changefreq: "monthly" as const },
  { path: "/contact", priority: 0.7, changefreq: "monthly" as const },
  { path: "/partner", priority: 0.7, changefreq: "monthly" as const },
  { path: "/pricing", priority: 0.7, changefreq: "monthly" as const },
  { path: "/invest", priority: 0.7, changefreq: "monthly" as const },
  { path: "/map", priority: 0.6, changefreq: "weekly" as const },
  { path: "/live", priority: 0.6, changefreq: "weekly" as const },
  { path: "/privacy-policy", priority: 0.3, changefreq: "yearly" as const },
  { path: "/terms", priority: 0.3, changefreq: "yearly" as const },
  { path: "/cookie-policy", priority: 0.3, changefreq: "yearly" as const },
];

// NOTE: /directory/[slug] paths are intentionally excluded from the sitemap.
// The directory page uses query params (?category=...) for filtering — there are
// no real pages at /directory/restaurants etc., only the programmatic
// /[city]/[category] pages which are added further below with proper hreflang.

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const { path, priority, changefreq } of STATIC_PATHS) {
    entries.push(makeEntry(path, now, changefreq, priority));
  }

  try {
    const supabase = createPublicServerClient();

    const [listingsResponse, regionsResponse, citiesResponse, categoriesResponse, blogPostsResponse, eventsResponse] =
      await Promise.all([
        supabase
          .from("listings")
          .select("slug, updated_at, published_at, image_url")
          .eq("status", "published")
          .not("slug", "is", null)
          .order("updated_at", { ascending: false })
          .limit(LISTING_LIMIT),
        supabase
          .from("regions")
          .select("slug, updated_at, image_url")
          .eq("is_visible_destinations", true)
          .not("slug", "is", null)
          .limit(REGION_LIMIT),
        supabase
          .from("cities")
          .select("slug, updated_at, image_url")
          .not("slug", "is", null)
          .limit(CITY_LIMIT),
        supabase
          .from("categories")
          .select("slug, image_url")
          .not("slug", "is", null)
          .limit(CATEGORY_LIMIT),
        supabase
          .from("blog_posts")
          .select("slug, updated_at, published_at, featured_image")
          .eq("status", "published")
          .not("slug", "is", null)
          .limit(BLOG_LIMIT),
        supabase
          .from("events")
          .select("slug, updated_at, start_date, image_url")
          .eq("status", "published")
          .not("slug", "is", null)
          .limit(EVENT_LIMIT),
      ]);

    // Listings — one entry per slug, /en canonical
    for (const listing of listingsResponse.data ?? []) {
      if (!listing.slug) continue;
      const path = `/listing/${listing.slug}`;
      const lastMod = toValidDate(listing.updated_at, toValidDate(listing.published_at, now));
      entries.push(makeEntry(path, lastMod, "weekly", 0.82, listing.image_url ?? undefined));
    }

    // Regions
    for (const region of regionsResponse.data ?? []) {
      if (!region.slug) continue;
      const path = `/destinations/${region.slug}`;
      entries.push(makeEntry(path, toValidDate(region.updated_at, now), "weekly", 0.78, region.image_url ?? undefined));
    }

    // Cities
    for (const city of citiesResponse.data ?? []) {
      if (!city.slug) continue;
      const path = `/destinations/${city.slug}`;
      entries.push(makeEntry(path, toValidDate(city.updated_at, now), "weekly", 0.75, city.image_url ?? undefined));
    }

    // NOTE: Category entries intentionally omitted from the sitemap.
    // The categories query above is fetched for potential future use, but
    // /directory/[slug] pages do not exist — the directory page uses query
    // params (?category=...) for filtering. The programmatic /[city]/[category]
    // pages below already provide full coverage with correct hreflang alternates.
    void categoriesResponse; // suppress unused variable warning

    // Blog posts
    for (const post of blogPostsResponse.data ?? []) {
      if (!post.slug) continue;
      const path = `/blog/${post.slug}`;
      const lastMod = toValidDate(post.updated_at, toValidDate(post.published_at, now));
      entries.push(makeEntry(path, lastMod, "monthly", 0.76, post.featured_image ?? undefined));
    }

    // Events
    for (const event of eventsResponse.data ?? []) {
      if (!event.slug) continue;
      const path = `/events/${event.slug}`;
      const lastMod = toValidDate(event.updated_at, toValidDate(event.start_date, now));
      const changeFreq: MetadataRoute.Sitemap[number]["changeFrequency"] =
        event.start_date && new Date(event.start_date) > now ? "weekly" : "monthly";
      entries.push(makeEntry(path, lastMod, changeFreq, 0.74, event.image_url ?? undefined));
    }

    // ── Programmatic SEO pages: /[city]/[category] (en) | /[locale]/[city]/[category] ──
    // One canonical entry per city+category combination (English URL, no /en/ prefix).
    // Each entry includes hreflang alternates with per-locale translated category slugs.
    try {
      const programmaticCombinations = await getAllCategoryCityCombinations();

      for (const { categorySlug, citySlug } of programmaticCombinations) {
        if (!ALL_CANONICAL_SLUGS.includes(categorySlug as CanonicalCategorySlug)) continue;

        const canonical = categorySlug as CanonicalCategorySlug;
        // Canonical URL uses English slug - NO /en/ prefix (default locale)
        const enCatSlug = getCategoryUrlSlug(canonical, "en");
        const path = `/${citySlug}/${enCatSlug}`; // No /en prefix
        const siteUrl = getSiteUrl();

        // Build full hreflang map with per-locale translated category slugs
        const hreflangLanguages: Record<string, string> = {};
        for (const loc of SUPPORTED_LOCALES) {
          const locCatSlug = getCategoryUrlSlug(canonical, loc);
          const localePath =
            loc === "en"
              ? `/${citySlug}/${locCatSlug}`
              : `/${loc}/${citySlug}/${locCatSlug}`;
          hreflangLanguages[LOCALE_CONFIGS[loc].hreflang] = `${siteUrl}${localePath}`;
        }
        hreflangLanguages["x-default"] = `${siteUrl}${path}`;

        entries.push({
          url: `${siteUrl}${path}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.85,
          alternates: { languages: hreflangLanguages },
        });
      }
    } catch (err) {
      console.error("[sitemap] Failed to fetch programmatic page combos", err);
    }

    return entries;
  } catch (error) {
    console.error("[sitemap] Failed to fetch dynamic URLs, returning static sitemap only", error);
    return entries;
  }
}
