import { cache } from "react";

import type { Tables } from "@/integrations/supabase/types";
import { createClient } from "@/lib/supabase/server";

export type BlogPostSeoRecord = Pick<
  Tables<"blog_posts">,
  "slug" | "title" | "excerpt" | "seo_title" | "seo_description" | "published_at" | "created_at" | "updated_at"
>;

export const getPublishedBlogPostBySlug = cache(async (slug: string): Promise<BlogPostSeoRecord | null> => {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, seo_title, seo_description, published_at, created_at, updated_at, status")
    .eq("slug", normalizedSlug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  if (data.published_at && Date.parse(data.published_at) > Date.now()) {
    return null;
  }

  return data as BlogPostSeoRecord;
});
