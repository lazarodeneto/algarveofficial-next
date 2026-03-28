import { cache } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import type { Locale } from "@/lib/i18n/config";

export type BlogPostSeoRecord = Pick<
  Tables<"blog_posts">,
  | "slug"
  | "title"
  | "excerpt"
  | "featured_image"
  | "seo_title"
  | "seo_description"
  | "published_at"
  | "created_at"
  | "updated_at"
>;

export type LocalizedBlogPost = BlogPostSeoRecord & {
  locale_title: string;
  locale_description: string;
};

function dbLocale(locale: Locale): string {
  return locale === "en" ? "en" : locale;
}

export const getPublishedBlogPostBySlug = cache(async (slug: string, locale: Locale = "en"): Promise<BlogPostSeoRecord | null> => {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) return null;

  const supabase = createPublicServerClient();
  const localeCode = dbLocale(locale);

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, featured_image, seo_title, seo_description, published_at, created_at, updated_at, status")
    .eq("slug", normalizedSlug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  if (data.published_at && Date.parse(data.published_at) > Date.now()) return null;

  const { data: translation } = locale !== "en"
    ? await supabase
        .from("blog_post_translations")
        .select("title, description, seo_title, seo_description")
        .eq("blog_post_id", data.id)
        .eq("language_code", localeCode)
        .maybeSingle()
    : { data: null };

  const finalTitle = translation?.seo_title?.trim() || translation?.title?.trim() || data.seo_title || data.title;
  const finalDescription = translation?.seo_description?.trim() || translation?.description?.trim() || data.seo_description || data.excerpt;

  return {
    ...data,
    title: finalTitle,
    seo_title: finalTitle,
    excerpt: finalDescription,
    seo_description: finalDescription,
  } as BlogPostSeoRecord;
});
