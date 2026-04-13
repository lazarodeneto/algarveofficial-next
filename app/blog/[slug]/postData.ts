import { cache } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import type { Locale } from "@/lib/i18n/config";
import { buildUniformLocalizedSlugMap } from "@/lib/i18n/localized-routing";

export type BlogPostSeoRecord = Pick<
  Tables<"blog_posts">,
  | "slug"
  | "id"
  | "title"
  | "author_id"
  | "category"
  | "content"
  | "excerpt"
  | "featured_image"
  | "reading_time"
  | "seo_title"
  | "seo_description"
  | "published_at"
  | "created_at"
  | "related_listing_ids"
  | "scheduled_at"
  | "status"
  | "tags"
  | "updated_at"
  | "views"
> & {
  author?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  localizedSlugs: Record<Locale, string>;
};

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
    .select("id, slug, title, author_id, category, content, excerpt, featured_image, reading_time, seo_title, seo_description, published_at, created_at, related_listing_ids, scheduled_at, status, tags, updated_at, views")
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
  const { data: author } = await supabase
    .from("public_profiles")
    .select("id, full_name, avatar_url")
    .eq("id", data.author_id)
    .maybeSingle();

  return {
    ...data,
    title: finalTitle,
    seo_title: finalTitle,
    excerpt: finalDescription,
    seo_description: finalDescription,
    author: author ?? undefined,
    localizedSlugs: buildUniformLocalizedSlugMap(data.slug),
  } as BlogPostSeoRecord;
});
