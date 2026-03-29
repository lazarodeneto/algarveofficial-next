import type { MetadataRoute } from "next";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { buildCanonicalUrl, buildHreflangs } from "@/lib/i18n/seo";

const SITEMAP_FETCH_LIMIT = 5000;
export const revalidate = 3600;

function toValidDate(value: string | null | undefined, fallback: Date) {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const supabase = createPublicServerClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("slug, updated_at, start_date, image_url")
    .eq("status", "published")
    .order("start_date", { ascending: false, nullsFirst: false })
    .limit(SITEMAP_FETCH_LIMIT);

  if (error || !events) return [];

  return events.map((event) => {
    const basePath = `/events/${event.slug}`;
    return {
      url: buildCanonicalUrl(DEFAULT_LOCALE, basePath),
      lastModified: toValidDate(event.updated_at, toValidDate(event.start_date, now)),
      changeFrequency: event.start_date && new Date(event.start_date) > now ? "weekly" : "monthly",
      priority: 0.74,
      alternates: {
        languages: buildHreflangs(basePath),
      },
      images: event.image_url ? [event.image_url] : undefined,
    };
  });
}
