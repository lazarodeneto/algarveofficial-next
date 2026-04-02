"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Search, Clock, Loader2 } from "lucide-react";

import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BrandLogo } from "@/components/ui/brand-logo";
import { BlogFeaturedImage } from "@/components/blog/BlogFeaturedImage";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useHydrated } from "@/hooks/useHydrated";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { PageHeroImage } from "@/components/sections/PageHeroImage";
import { STANDARD_PUBLIC_HERO_WRAPPER_CLASS } from "@/components/sections/hero-layout";
import {
  CMS_GLOBAL_SETTING_KEYS,
  type CmsPageConfigMap,
  type CmsTextOverrideMap,
} from "@/lib/cms/pageBuilderRegistry";
import { blogCategoryLabels, type BlogCategory } from "@/hooks/useBlogPosts";

const BLOG_AUTHOR_NAME = "AlgarveOfficial";

export type BlogAuthor = Pick<Tables<"public_profiles">, "id" | "full_name" | "avatar_url">;
export type BlogGlobalSetting = Pick<Tables<"global_settings">, "key" | "value" | "category">;
export type BlogPostRow = Pick<
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

export type BlogPostWithAuthor = BlogPostRow & {
  author?: BlogAuthor | null;
};

export interface BlogClientProps {
  initialPosts: BlogPostRow[];
  initialAuthors: BlogAuthor[];
  initialGlobalSettings: BlogGlobalSetting[];
}

const BLOG_CMS_KEYS = [
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
  CMS_GLOBAL_SETTING_KEYS.designTokens,
  CMS_GLOBAL_SETTING_KEYS.customCss,
] as const;

const BLOG_TRANSLATION_KEYS: Record<BlogCategory, string> = {
  lifestyle: "blog.blogCategories.lifestyle",
  "travel-guides": "blog.blogCategories.travelGuides",
  "food-wine": "blog.blogCategories.foodWine",
  golf: "blog.blogCategories.golf",
  "real-estate": "categories.algarveServices",
  events: "blog.blogCategories.events",
  wellness: "blog.blogCategories.wellness",
  "insider-tips": "blog.blogCategories.insiderTips",
};

function normalizeBlogLocale(language: string | undefined): string {
  const normalized = String(language ?? "en").trim().toLowerCase();
  if (!normalized || normalized === "en") return "en";
  if (normalized === "pt" || normalized.startsWith("pt-pt")) return "pt-pt";
  return normalized;
}

function parseJsonSetting<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeTextOverrides(input: unknown): CmsTextOverrideMap {
  if (!isPlainRecord(input)) return {};

  const normalized: CmsTextOverrideMap = {};
  Object.entries(input).forEach(([key, value]) => {
    if (typeof value === "string") {
      normalized[key.trim()] = value;
    }
  });

  return normalized;
}

function normalizePageConfigs(input: unknown): CmsPageConfigMap {
  if (!isPlainRecord(input)) return {};

  const out: CmsPageConfigMap = {};

  Object.entries(input).forEach(([pageId, rawPage]) => {
    if (!isPlainRecord(rawPage)) return;

    const normalizedPage: CmsPageConfigMap[string] = {};

    if (isPlainRecord(rawPage.blocks)) {
      const blocks: NonNullable<CmsPageConfigMap[string]["blocks"]> = {};

      Object.entries(rawPage.blocks).forEach(([blockId, rawBlock]) => {
        if (!isPlainRecord(rawBlock)) return;

        const block: NonNullable<NonNullable<CmsPageConfigMap[string]["blocks"]>[string]> = {};
        if (typeof rawBlock.enabled === "boolean") block.enabled = rawBlock.enabled;
        if (typeof rawBlock.order === "number" && Number.isFinite(rawBlock.order)) block.order = rawBlock.order;
        if (typeof rawBlock.className === "string") block.className = rawBlock.className;

        if (isPlainRecord(rawBlock.style)) {
          const style: Record<string, string | number> = {};
          Object.entries(rawBlock.style).forEach(([styleKey, styleValue]) => {
            if (typeof styleValue === "string" || typeof styleValue === "number") {
              style[styleKey] = styleValue;
            }
          });
          block.style = style;
        }

        if (isPlainRecord(rawBlock.data)) {
          const data: Record<string, string | number | boolean | string[]> = {};
          Object.entries(rawBlock.data).forEach(([dataKey, dataValue]) => {
            if (typeof dataValue === "string" || typeof dataValue === "number" || typeof dataValue === "boolean" || Array.isArray(dataValue)) {
              data[dataKey] = dataValue as string | number | boolean | string[];
            }
          });
          block.data = data;
        }

        blocks[blockId] = block;
      });

      normalizedPage.blocks = blocks;
    }

    if (isPlainRecord(rawPage.text)) {
      const text: Record<string, string> = {};
      Object.entries(rawPage.text).forEach(([textKey, textValue]) => {
        if (typeof textValue === "string") {
          text[textKey] = textValue;
        }
      });
      normalizedPage.text = text;
    }

    if (isPlainRecord(rawPage.meta)) {
      const meta: { title?: string; description?: string } = {};
      if (typeof rawPage.meta.title === "string") meta.title = rawPage.meta.title;
      if (typeof rawPage.meta.description === "string") meta.description = rawPage.meta.description;
      normalizedPage.meta = meta;
    }

    out[pageId] = normalizedPage;
  });

  return out;
}

function useBlogCmsHelpers(globalSettings: BlogGlobalSetting[]) {
  return useMemo(() => {
    const settingMap = globalSettings.reduce<Record<string, string>>((acc, setting) => {
      acc[setting.key] = setting.value ?? "";
      return acc;
    }, {});

    const textOverrides = normalizeTextOverrides(
      parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.textOverrides], {}),
    );
    const pageConfigs = normalizePageConfigs(
      parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.pageConfigs], {}),
    );
    const pageConfig = pageConfigs.blog ?? {};
    const blocks = pageConfig.blocks ?? {};
    const pageText = pageConfig.text ?? {};

    const isBlockEnabled = (blockId: string, fallback = true) => {
      const configured = blocks[blockId]?.enabled;
      return typeof configured === "boolean" ? configured : fallback;
    };

    const getBlockClassName = (blockId: string) => {
      const className = blocks[blockId]?.className;
      return typeof className === "string" ? className : "";
    };

    const getBlockStyle = (blockId: string): CSSProperties => {
      const style = blocks[blockId]?.style;
      if (!style || typeof style !== "object") return {};
      return style as CSSProperties;
    };

    const getText = (textKey: string, fallback: string) =>
      pageText[textKey] ??
      textOverrides[`blog.${textKey}`] ??
      textOverrides[textKey] ??
      fallback;

    const getMetaTitle = (fallback: string) =>
      pageConfig.meta?.title ?? getText("meta.title", getText("seo.title", fallback));

    const getMetaDescription = (fallback: string) =>
      pageConfig.meta?.description ?? getText("meta.description", getText("seo.description", fallback));

    return {
      getText,
      getMetaTitle,
      getMetaDescription,
      isBlockEnabled,
      getBlockClassName,
      getBlockStyle,
    };
  }, [globalSettings]);
}

function BlogCmsBlock({
  blockId,
  children,
  className,
  style,
  as: Component = "div",
  defaultEnabled = true,
  cms,
}: {
  blockId: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  defaultEnabled?: boolean;
  cms: ReturnType<typeof useBlogCmsHelpers>;
}) {
  if (!cms.isBlockEnabled(blockId, defaultEnabled)) {
    return null;
  }

  return (
    <Component
      data-cms-page="blog"
      data-cms-block={blockId}
      className={[className, cms.getBlockClassName(blockId)].filter(Boolean).join(" ")}
      style={{ ...style, ...cms.getBlockStyle(blockId) }}
    >
      {children}
    </Component>
  );
}

function mergePostsWithAuthors(posts: BlogPostRow[], authors: BlogAuthor[]): BlogPostWithAuthor[] {
  const authorsMap = new Map(authors.map((author) => [author.id, author]));
  return posts.map((post) => ({
    ...post,
    author: post.author_id ? authorsMap.get(post.author_id) ?? null : null,
  }));
}

interface BlogPostTranslationRow {
  post_id: string;
  locale: string;
  title: string;
  excerpt: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

async function fetchBlogPosts(locale: string, category?: BlogCategory): Promise<BlogPostWithAuthor[]> {
  let query = supabase
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, featured_image, category, reading_time, tags, author_id, published_at, seo_title, seo_description, created_at, updated_at",
    )
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(24);

  if (category) {
    query = query.eq("category", category);
  }

  const { data: posts, error } = await query;
  if (error) throw error;

  let localizedPosts = (posts ?? []) as BlogPostRow[];

  if (locale !== "en" && localizedPosts.length > 0) {
    const { data: translations, error: translationError } = await supabase
      .from("blog_post_translations" as never)
      .select("post_id, locale, title, excerpt, seo_title, seo_description")
      .eq("locale", locale)
      .in(
        "post_id",
        localizedPosts.map((post) => post.id),
      );

    if (!translationError) {
      const translationMap = new Map(
        ((translations ?? []) as BlogPostTranslationRow[]).map((translation) => [
          translation.post_id,
          translation,
        ]),
      );

      localizedPosts = localizedPosts.map((post) => {
        const translation = translationMap.get(post.id);
        return {
          ...post,
          title: translation?.title?.trim() || post.title,
          excerpt: translation?.excerpt ?? post.excerpt,
          seo_title: translation?.seo_title ?? post.seo_title,
          seo_description: translation?.seo_description ?? post.seo_description,
        };
      });
    }
  }

  const authorIds = Array.from(
    new Set(localizedPosts.map((post) => post.author_id).filter(Boolean)),
  ) as string[];

  if (!authorIds.length) {
    return localizedPosts;
  }

  const { data: authors, error: authorError } = await supabase
    .from("public_profiles")
    .select("id, full_name, avatar_url")
    .in("id", authorIds);

  if (authorError) throw authorError;

  return mergePostsWithAuthors(localizedPosts, (authors ?? []) as BlogAuthor[]);
}

async function fetchGlobalSettings() {
  const { data, error } = await supabase
    .from("global_settings")
    .select("key, value, category")
    .in("key", [...BLOG_CMS_KEYS])
    .order("key", { ascending: true });

  if (error) throw error;
  return (data ?? []) as BlogGlobalSetting[];
}

function BlogClientInner({ initialPosts, initialAuthors, initialGlobalSettings }: BlogClientProps) {
  const { t, i18n } = useTranslation();
  const l = useLocalePath();
  const locale = normalizeBlogLocale(i18n.language);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | "all">("all");

  const mergedInitialPosts = useMemo(
    () => mergePostsWithAuthors(initialPosts, initialAuthors),
    [initialAuthors, initialPosts],
  );

  const { data: globalSettings = initialGlobalSettings } = useQuery({
    queryKey: ["global-settings", [...BLOG_CMS_KEYS].sort()],
    queryFn: fetchGlobalSettings,
    initialData: initialGlobalSettings,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: posts = locale === "en" && selectedCategory === "all" ? mergedInitialPosts : [],
    isLoading,
  } = useQuery({
    queryKey: ["blog-posts", "published", selectedCategory !== "all" ? selectedCategory : undefined, locale],
    queryFn: () =>
      fetchBlogPosts(locale, selectedCategory !== "all" ? selectedCategory : undefined),
    initialData:
      locale === "en" && selectedCategory === "all" ? mergedInitialPosts : undefined,
    staleTime: 1000 * 60 * 5,
  });

  const cms = useBlogCmsHelpers(globalSettings);
  const categories = Object.entries(blogCategoryLabels) as [BlogCategory, string][];

  const getCategoryLabel = (category: BlogCategory) =>
    t(BLOG_TRANSLATION_KEYS[category] || category, blogCategoryLabels[category]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;

    const query = searchQuery.toLowerCase();
    return posts.filter((post) =>
      post.title?.toLowerCase().includes(query) ||
      post.excerpt?.toLowerCase().includes(query) ||
      post.tags?.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [posts, searchQuery]);

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-background" data-cms-page="blog">
      <Header />

      <main>
        {cms.isBlockEnabled("hero", true) ? (
          <BlogCmsBlock
            blockId="hero"
            as="section"
            cms={cms}
            className={STANDARD_PUBLIC_HERO_WRAPPER_CLASS}
          >
            <LiveStyleHero
              badge={t("blog.label", "Stories & Guides")}
              title={t("blog.title", "Blog & Insights")}
              subtitle={t("blog.subtitle", "Discover the Algarve lifestyle, travel guides, and insider tips")}
              media={
                <HeroBackgroundMedia
                  mediaType={cms.getText("hero.mediaType", "image")}
                  imageUrl={cms.getText("hero.imageUrl", "")}
                  videoUrl={cms.getText("hero.videoUrl", "")}
                  youtubeUrl={cms.getText("hero.youtubeUrl", "")}
                  posterUrl={cms.getText("hero.posterUrl", "")}
                  alt={t("blog.hero.alt", "Editorial Algarve townscape")}
                  fallback={<PageHeroImage page="blog" alt={t("blog.hero.alt", "Editorial Algarve townscape")} />}
                />
              }
              ctas={
                <>
                  <Link href={l("/directory")}>
                    <Button variant="gold" size="lg">
                      {t("blog.hero.ctaPrimary", "Explore Directory")}
                    </Button>
                  </Link>
                  <Link href={l("/contact")}>
                    <Button variant="heroOutline" size="lg">
                      {t("blog.hero.ctaSecondary", "Get Local Advice")}
                    </Button>
                  </Link>
                </>
              }
            >
              <div className="relative max-w-xl mx-auto mt-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("blog.searchPlaceholder", "Search articles...")}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-12 h-12 text-lg bg-card border-border text-foreground"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-3xl mx-auto">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  {t("blog.allPosts", "All Posts")}
                </Button>
                {categories.map(([key]) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                  >
                    {getCategoryLabel(key)}
                  </Button>
                ))}
              </div>
            </LiveStyleHero>
          </BlogCmsBlock>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : null}

        {!isLoading && featuredPost && cms.isBlockEnabled("featured-post", true) ? (
          <BlogCmsBlock blockId="featured-post" as="section" cms={cms} className="py-8 app-container content-max">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href={l(`/blog/${featuredPost.slug}`)}>
                <Card className="overflow-hidden bg-card border-border hover:border-primary/30 transition-all group">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="aspect-video md:aspect-auto md:h-full overflow-hidden">
                      <BlogFeaturedImage
                        src={featuredPost.featured_image || "/placeholder.svg"}
                        category={featuredPost.category}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="p-6 md:p-10 flex flex-col justify-center">
                      <Badge variant="secondary" className="w-fit mb-4">
                        {getCategoryLabel(featuredPost.category)}
                      </Badge>
                      <h2 className="text-2xl md:text-3xl font-serif font-medium mb-4 group-hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-muted-foreground mb-6 line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <BrandLogo
                              size="sm"
                              showIcon
                              showText={false}
                              asLink={false}
                              iconClassName="h-4 w-4"
                            />
                          </div>
                          <span>{t("blog.by", "By")} {BLOG_AUTHOR_NAME}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{featuredPost.reading_time} {t("blog.readTime", "min read")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            </motion.div>
          </BlogCmsBlock>
        ) : null}

        {!isLoading && cms.isBlockEnabled("posts-grid", true) ? (
          <BlogCmsBlock blockId="posts-grid" as="section" cms={cms} className="py-12 app-container content-max">
            {remainingPosts.length === 0 && !featuredPost ? (
              <div className="text-center py-16">
                <h2 className="text-2xl font-serif font-medium text-foreground mb-4">
                  {t("blog.noPostsTitle", "No Articles Yet")}
                </h2>
                <p className="text-muted-foreground text-lg mb-2">
                  {t("blog.noPostsFound", "No posts found matching your criteria.")}
                </p>
                <p className="text-muted-foreground">
                  {t(
                    "blog.noPostsSubtext",
                    "Check back soon for travel guides, lifestyle tips, and insider stories from across the Algarve.",
                  )}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {remainingPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 1), duration: 0.5, ease: "easeOut" }}
                    className="group"
                  >
                    <Link href={l(`/blog/${post.slug}`)}>
                      <article className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ease-out h-full flex flex-col">
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <BlogFeaturedImage
                            src={post.featured_image || "/placeholder.svg"}
                            category={post.category}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 group-hover:brightness-95 transition-all duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="p-6 flex flex-col flex-1 bg-card">
                          <Badge variant="outline" className="w-fit mb-4 text-xs tracking-wide border-[#C7A35A]/40 text-[#C7A35A] bg-[#C7A35A]/5">
                            {getCategoryLabel(post.category)}
                          </Badge>
                          <h3 className="text-lg font-serif font-light leading-snug mb-3 line-clamp-2 group-hover:text-[#C7A35A] transition-colors duration-300 text-foreground">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-2 flex-1">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground/70 pt-4 border-t border-border/30">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-[#C7A35A]/60" />
                              <span>{post.reading_time} min read</span>
                            </div>
                            <span className="text-[#C7A35A] font-medium tracking-wide group-hover:translate-x-0.5 transition-transform duration-200">Read more</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </BlogCmsBlock>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}

export function BlogClient(props: BlogClientProps) {
  const mounted = useHydrated();

  useEffect(() => {
    const serverShell = document.getElementById("blog-server-shell");
    if (serverShell) {
      serverShell.style.display = "none";
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return <BlogClientInner {...props} />;
}

export default BlogClient;
