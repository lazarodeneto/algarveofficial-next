import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { buildCanonicalUrl, buildHreflangs } from "@/lib/i18n/seo";
import { sanitizeSitemapImageUrl } from "@/lib/seo/sitemap-utils";
import { getPublicEvents } from "@/lib/public-data/events";

const SITEMAP_FETCH_LIMIT = 5000;
export const revalidate = 3600;

function toValidDate(value: string | null | undefined, fallback: Date) {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const events = await getPublicEvents({ timeFilter: "upcoming", limit: SITEMAP_FETCH_LIMIT });

  return events.map((event) => {
    const basePath = `/events/${event.slug}`;
    const imageUrl = sanitizeSitemapImageUrl(event.image);

    return {
      url: buildCanonicalUrl(DEFAULT_LOCALE, basePath),
      lastModified: toValidDate(event.updated_at, toValidDate(event.start_date, now)),
      changeFrequency: event.start_date && new Date(event.start_date) > now ? "weekly" : "monthly",
      priority: 0.74,
      alternates: {
        languages: buildHreflangs(basePath),
      },
      images: imageUrl ? [imageUrl] : undefined,
    };
  });
}
