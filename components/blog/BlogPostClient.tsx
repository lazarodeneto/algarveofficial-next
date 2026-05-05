"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { m } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Facebook, Linkedin, Link as LinkIcon, Share2, Twitter } from "lucide-react";
import { toast } from "sonner";

import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/Button";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useLocalePath } from "@/hooks/useLocalePath";
import { applyBlogTranslation, type BlogTranslationRow } from "@/lib/blog/localization";

export type BlogPostAuthor = Pick<Tables<"public_profiles">, "id" | "full_name" | "avatar_url">;
export type BlogPostRecord = Pick<
  Tables<"blog_posts">,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "content"
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
  | "views"
>;

export type BlogPostWithAuthor = BlogPostRecord & {
  author?: BlogPostAuthor | null;
};

export interface BlogPostClientProps {
  initialPost: BlogPostRecord;
  initialAuthor: BlogPostAuthor | null;
}

function normalizeBlogLocale(language: string | undefined): string {
  const normalized = String(language ?? "en").trim().toLowerCase();
  if (!normalized || normalized === "en") return "en";
  if (normalized === "pt" || normalized.startsWith("pt-pt")) return "pt-pt";
  return normalized;
}

function mergePostWithAuthor(post: BlogPostRecord, author: BlogPostAuthor | null): BlogPostWithAuthor {
  return {
    ...post,
    author,
  };
}

async function fetchBlogPost(slug: string, locale: string): Promise<BlogPostWithAuthor> {
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) throw error;

  let localizedPost = post as BlogPostRecord;

  if (locale !== "en") {
    const { data: translation, error: translationError } = await supabase
      .from("blog_post_translations" as never)
      .select("post_id, locale, title, excerpt, content, seo_title, seo_description")
      .eq("post_id", post.id)
      .eq("locale", locale)
      .maybeSingle();

    if (!translationError && translation) {
      localizedPost = applyBlogTranslation(localizedPost, translation as BlogTranslationRow, locale);
    } else {
      localizedPost = applyBlogTranslation(localizedPost, null, locale);
    }
  }

  const { data: author } = await supabase
    .from("public_profiles")
    .select("id, full_name, avatar_url")
    .eq("id", localizedPost.author_id)
    .single();

  return mergePostWithAuthor(localizedPost, (author as BlogPostAuthor | null) ?? null);
}

function BlogPostInteractiveInner({ initialPost, initialAuthor }: BlogPostClientProps) {
  const { t } = useTranslation();
  const l = useLocalePath();
  const locale = normalizeBlogLocale(useCurrentLocale());
  const seededPost = useMemo(
    () => mergePostWithAuthor(initialPost, initialAuthor),
    [initialAuthor, initialPost],
  );

  const { data: post = seededPost } = useQuery({
    queryKey: ["blog-post", "slug", initialPost.slug, locale],
    queryFn: () => fetchBlogPost(initialPost.slug, locale),
    initialData: locale === "en" ? seededPost : undefined,
    staleTime: 1000 * 60 * 10,
  });

  const handleShare = (platform: "facebook" | "twitter" | "linkedin" | "copy") => {
    const url = window.location.href;
    const title = post?.title ?? initialPost.title;

    if (platform === "copy") {
      void navigator.clipboard
        .writeText(url)
        .then(() => toast.success(t("blog.linkCopied")))
        .catch(() => toast.error(t("blog.copyFailed", "Clipboard permission denied")));
      return;
    }

    const urls: Record<Exclude<typeof platform, "copy">, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    window.open(urls[platform], "_blank", "noopener,noreferrer,width=600,height=400");
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="rounded-full">
          <Link href={l("/blog")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("blog.backToBlog")}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-sm border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Share2 className="h-4 w-4" />
          {t("blog.shareArticle")}
        </span>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleShare("facebook")}
            aria-label={t("blog.shareFacebook")}
          >
            <Facebook className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleShare("twitter")}
            aria-label={t("blog.shareTwitter")}
          >
            <Twitter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleShare("linkedin")}
            aria-label={t("blog.shareLinkedIn")}
          >
            <Linkedin className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleShare("copy")}
            aria-label={t("blog.copyLink")}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </m.div>
  );
}

export function BlogPostClient(props: BlogPostClientProps) {
  return <BlogPostInteractiveInner {...props} />;
}

export default BlogPostClient;
