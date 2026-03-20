import type { MetadataRoute } from "next";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { SUPPORTED_LOCALES, LOCALE_CONFIGS, addLocaleToPathname } from "@/lib/i18n/config";

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

function toValidDate(value: string | null | undefined, fallback: Date) {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : fallback;
}

function buildAlternates(localizedPath: string): MetadataRoute.Sitemap[number]["alternates"] {
  const siteUrl = getSiteUrl();
  const languages: Record<string, string> = {};
  for (const locale of SUPPORTED_LOCALES) {
    languages[LOCALE_CONFIGS[locale].hreflang] = `${siteUrl}${addLocaleToPathname(localizedPath, locale)}`;
  }
  languages["x-default"] = `${siteUrl}/en${localizedPath}`;
  return { languages };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const supabase = createPublicServerClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("slug, updated_at, start_date, image_url")
    .eq("status", "published")
    .order("start_date", { ascending: false, nullsFirst: false })
    .limit(SITEMAP_FETCH_LIMIT);

  if (error || !events) return [];

  return events.flatMap((event) => {
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
}
