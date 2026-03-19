"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { NavigationType, Router, createPath, type To } from "react-router";
import { LegacyLink as Link } from "@/components/router/LegacyRouterBridge";
import { usePathname, useRouter, useSearchParams as useNextSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Facebook, Linkedin, Link as LinkIcon, Share2, Twitter } from "lucide-react";
import { toast } from "sonner";

import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { buildLangPath, useLangPrefix } from "@/hooks/useLangPrefix";
import { useHydrated } from "@/hooks/useHydrated";
import { getSessionId } from "@/lib/sessionId";

type HomegrownNavigator = {
  createHref: (to: To) => string;
  go: (delta: number) => void;
  push: (to: To) => void;
  replace: (to: To) => void;
};

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

type BlogPostTranslationRow = {
  post_id: string;
  locale: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

export type BlogPostWithAuthor = BlogPostRecord & {
  author?: BlogPostAuthor | null;
};

export interface BlogPostClientProps {
  initialPost: BlogPostRecord;
  initialAuthor: BlogPostAuthor | null;
}

function resolveToPath(to: To) {
  return typeof to === "string" ? to : createPath(to);
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
      const translated = translation as BlogPostTranslationRow;
      localizedPost = {
        ...localizedPost,
        title: translated.title || localizedPost.title,
        excerpt: translated.excerpt ?? localizedPost.excerpt,
        content: translated.content ?? localizedPost.content,
        seo_title: translated.seo_title ?? localizedPost.seo_title,
        seo_description: translated.seo_description ?? localizedPost.seo_description,
      };
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
  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const locale = normalizeBlogLocale(i18n.language);
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

  useEffect(() => {
    const sessionId = getSessionId();
    void fetch(`/api/blog/${initialPost.slug}/view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
    }).catch(() => {
      // View tracking should never block article interaction.
    });
  }, [initialPost.slug]);

  const handleShare = (platform: "facebook" | "twitter" | "linkedin" | "copy") => {
    const url = window.location.href;
    const title = post?.title || initialPost.title;

    if (platform === "copy") {
      void navigator.clipboard.writeText(url);
      toast.success(t("blog.linkCopied", "Link copied to clipboard"));
      return;
    }

    const urls: Record<Exclude<typeof platform, "copy">, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="rounded-full">
          <Link to={buildLangPath(langPrefix, "/blog")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("blog.backToBlog", "Back to Blog")}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Share2 className="h-4 w-4" />
          {t("blog.shareArticle", "Share this article")}
        </span>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleShare("facebook")}
            aria-label={t("blog.shareFacebook", "Share on Facebook")}
          >
            <Facebook className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleShare("twitter")}
            aria-label={t("blog.shareTwitter", "Share on X")}
          >
            <Twitter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleShare("linkedin")}
            aria-label={t("blog.shareLinkedIn", "Share on LinkedIn")}
          >
            <Linkedin className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleShare("copy")}
            aria-label={t("blog.copyLink", "Copy article link")}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function BlogPostClient(props: BlogPostClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useNextSearchParams();
  const mounted = useHydrated();

  const search = nextSearchParams?.toString() ?? "";
  const location = useMemo(
    () => ({
      pathname,
      search: search ? `?${search}` : "",
      hash: "",
      state: null,
      key: `${pathname}${search ? `?${search}` : ""}`,
    }),
    [pathname, search],
  );

  const navigator = useMemo<HomegrownNavigator>(
    () => ({
      createHref: (to) => resolveToPath(to),
      go: (delta) => {
        window.history.go(delta);
      },
      push: (to) => {
        router.push(resolveToPath(to));
      },
      replace: (to) => {
        router.replace(resolveToPath(to));
      },
    }),
    [router],
  );

  if (!mounted) {
    return null;
  }

  return (
    <Router location={location as never} navigator={navigator as never} navigationType={NavigationType.Pop}>
      <BlogPostInteractiveInner {...props} />
    </Router>
  );
}

export default BlogPostClient;
