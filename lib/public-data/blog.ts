import { cache } from "react";

import type { Tables } from "@/integrations/supabase/types";
import { applyBlogTranslation, type BlogTranslationRow } from "@/lib/blog/localization";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";
import { createPublicServerClient } from "@/lib/supabase/public-server";

export type PublicBlogAuthorDTO = Pick<Tables<"public_profiles">, "id" | "full_name" | "avatar_url">;
export type PublicBlogGlobalSettingDTO = Pick<Tables<"global_settings">, "key" | "value" | "category">;
export type PublicBlogPostDTO = Pick<
  Tables<"blog_posts">,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "featured_image"
  | "category"
  | "reading_time"
  | "tags"
  | "author_id"
  | "published_at"
  | "seo_title"
  | "seo_description"
  | "created_at"
  | "updated_at"
>;

export type PublicBlogPostsOptions = {
  locale?: string | null;
  category?: Tables<"blog_posts">["category"] | null;
  limit?: number;
};

const BLOG_CMS_KEYS = [
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
  CMS_GLOBAL_SETTING_KEYS.designTokens,
  CMS_GLOBAL_SETTING_KEYS.customCss,
] as const;

function normalizeBlogLocale(language?: string | null): string {
  const normalized = String(language ?? "en").trim().toLowerCase();
  if (!normalized || normalized === "en") return "en";
  if (normalized === "pt" || normalized.startsWith("pt-pt")) return "pt-pt";
  return normalized;
}

async function localizeBlogPosts(posts: PublicBlogPostDTO[], locale: string): Promise<PublicBlogPostDTO[]> {
  if (locale === "en" || posts.length === 0) return posts;

  const supabase = createPublicServerClient();
  const { data: translations, error } = await supabase
    .from("blog_post_translations" as never)
    .select("post_id, locale, title, excerpt, seo_title, seo_description")
    .eq("locale", locale)
    .in(
      "post_id",
      posts.map((post) => post.id),
    );

  if (error) {
    return posts.map((post) => applyBlogTranslation(post, null, locale));
  }

  const translationMap = new Map(
    ((translations ?? []) as unknown as BlogTranslationRow[]).map((translation) => [
      translation.post_id,
      translation,
    ]),
  );

  return posts.map((post) => applyBlogTranslation(post, translationMap.get(post.id), locale));
}

export const getPublicBlogPosts = cache(
  async ({ locale: rawLocale, category, limit = 50 }: PublicBlogPostsOptions = {}): Promise<PublicBlogPostDTO[]> => {
    const locale = normalizeBlogLocale(rawLocale);
    const supabase = createPublicServerClient();
    let query = supabase
      .from("blog_posts")
      .select(
        "id, slug, title, excerpt, featured_image, category, reading_time, tags, author_id, published_at, seo_title, seo_description, created_at, updated_at",
      )
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 100));

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) throw error;

    return localizeBlogPosts((data ?? []) as PublicBlogPostDTO[], locale);
  },
);

export const getPublicBlogAuthors = cache(
  async (authorIds?: readonly string[]): Promise<PublicBlogAuthorDTO[]> => {
    const supabase = createPublicServerClient();
    let query = supabase.from("public_profiles").select("id, full_name, avatar_url").limit(100);
    const ids = Array.from(new Set((authorIds ?? []).filter(Boolean)));
    if (ids.length > 0) {
      query = query.in("id", ids);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).filter((author): author is PublicBlogAuthorDTO => Boolean(author.id));
  },
);

export const getPublicBlogGlobalSettings = cache(async (): Promise<PublicBlogGlobalSettingDTO[]> => {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("global_settings")
    .select("key, value, category")
    .in("key", [...BLOG_CMS_KEYS])
    .order("key", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PublicBlogGlobalSettingDTO[];
});
