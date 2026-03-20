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

  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("slug, updated_at, published_at, featured_image")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(SITEMAP_FETCH_LIMIT);

  if (error || !posts) return [];

  const validPosts = posts.filter((post) => {
    if (!post.published_at) return true;
    return Date.parse(post.published_at) <= Date.now();
  });

  return validPosts.flatMap((post) => {
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
}
