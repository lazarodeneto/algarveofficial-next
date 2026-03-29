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

  return validPosts.map((post) => {
    const basePath = `/blog/${post.slug}`;
    return {
      url: buildCanonicalUrl(DEFAULT_LOCALE, basePath),
      lastModified: toValidDate(post.updated_at, toValidDate(post.published_at, now)),
      changeFrequency: "monthly" as const,
      priority: 0.76,
      alternates: {
        languages: buildHreflangs(basePath),
      },
      images: post.featured_image ? [post.featured_image] : undefined,
    };
  });
}
