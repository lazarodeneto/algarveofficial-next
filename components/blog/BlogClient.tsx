"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { m } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Search, Clock } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { BlogFeaturedImage } from "@/components/blog/BlogFeaturedImage";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useHydrated } from "@/hooks/useHydrated";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { PageHeroImage } from "@/components/sections/PageHeroImage";
import { STANDARD_PUBLIC_HERO_WRAPPER_CLASS } from "@/components/sections/hero-layout";
import { resolveHero } from "@/lib/cms/resolve-hero";
import { getKnownBlogCategoryLabel } from "@/lib/blog/localization";
import { type CmsPageConfig } from "@/lib/cms/pageBuilderRegistry";
import { blogCategoryLabels, type BlogCategory } from "@/hooks/useBlogPosts";
import { hideServerShell } from "@/lib/dom/server-shell";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import type {
  PublicBlogAuthorDTO,
  PublicBlogGlobalSettingDTO,
  PublicBlogPostDTO,
} from "@/lib/public-data/blog";

const BLOG_HERO_SURFACE_CLASS =
  "h-auto min-h-[calc(100svh-4.5rem)] max-h-none py-7 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:h-[620px] sm:min-h-[620px] sm:py-0 sm:pb-0 lg:h-[680px] lg:max-h-[760px]";
const BLOG_HERO_CONTENT_CLASS =
  "w-full max-w-[42rem] space-y-3 px-4 sm:max-w-4xl sm:space-y-6";

export type BlogAuthor = PublicBlogAuthorDTO;
export type BlogGlobalSetting = PublicBlogGlobalSettingDTO;
export type BlogPostRow = PublicBlogPostDTO;

export type BlogPostWithAuthor = BlogPostRow & {
  author?: BlogAuthor | null;
};

export interface BlogClientProps {
  initialPosts: BlogPostRow[];
  initialAuthors: BlogAuthor[];
  initialGlobalSettings: BlogGlobalSetting[];
  pageConfig?: CmsPageConfig | null;
}

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

type BlogCmsHelpers = Pick<
  ReturnType<typeof useCmsPageBuilder>,
  "getText" | "isBlockEnabled" | "getBlockClassName" | "getBlockStyle"
>;

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
  cms: BlogCmsHelpers;
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

function BlogClientInner({ initialPosts, initialAuthors, pageConfig }: BlogClientProps) {
  const { t } = useTranslation();
  const l = useLocalePath();
  const locale = normalizeBlogLocale(useCurrentLocale());
  const searchParams = useSearchParams();
  const searchParamQuery = searchParams.get("tag") ?? searchParams.get("q") ?? "";
  const [searchQuery, setSearchQuery] = useState(searchParamQuery);
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | "all">("all");

  useEffect(() => {
    setSearchQuery(searchParamQuery);
  }, [searchParamQuery]);

  const mergedInitialPosts = useMemo(
    () => mergePostsWithAuthors(initialPosts, initialAuthors),
    [initialAuthors, initialPosts],
  );

  const posts = useMemo(
    () =>
      selectedCategory === "all"
        ? mergedInitialPosts
        : mergedInitialPosts.filter((post) => post.category === selectedCategory),
    [mergedInitialPosts, selectedCategory],
  );

  const cms = useCmsPageBuilder("blog");
  const activePageConfig = Object.keys(cms.pageConfig).length > 0 ? cms.pageConfig : pageConfig ?? {};
  const serverHero = resolveHero(activePageConfig as Parameters<typeof resolveHero>[0] ?? null);
  const categories = Object.entries(blogCategoryLabels) as [BlogCategory, string][];

  const getCategoryLabel = (category: BlogCategory, post?: BlogPostRow) =>
    (post ? getKnownBlogCategoryLabel(post, locale) : null) ??
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

  const showHero = cms.isBlockEnabled("hero", true);
  const showSearch = cms.isBlockEnabled("search", true);
  const showFeaturedPost = cms.isBlockEnabled("featured-post", false);
  const featuredPost = showFeaturedPost ? filteredPosts[0] ?? null : null;
  const gridPosts = featuredPost ? filteredPosts.slice(1) : filteredPosts;
  const showPostsGrid = cms.isBlockEnabled("posts-grid", true);
  const shouldRenderPostsGrid = showPostsGrid && (filteredPosts.length === 0 || gridPosts.length > 0);

  return (
    <div className="min-h-screen bg-background" data-cms-page="blog">
      <Header />
      {!showHero && <div className="h-[4.5rem] sm:h-20" aria-hidden="true" />}

      <main>
        {showHero ? (
          <BlogCmsBlock
            blockId="hero"
            as="section"
            cms={cms}
            className={STANDARD_PUBLIC_HERO_WRAPPER_CLASS}
          >
            <LiveStyleHero
              badge={cms.getText("hero.badge", t("blog.label"))}
              title={cms.getText("hero.title", t("blog.title"))}
              subtitle={cms.getText("hero.subtitle", t("blog.subtitle"))}
              className={BLOG_HERO_SURFACE_CLASS}
              contentClassName={BLOG_HERO_CONTENT_CLASS}
              subtitleClassName="text-base leading-7 sm:text-base md:text-xl"
              media={
                <HeroBackgroundMedia
                  mediaType={cms.getText("hero.mediaType", serverHero.mediaType ?? "image")}
                  imageUrl={cms.getText("hero.imageUrl", serverHero.imageUrl ?? "") || undefined}
                  videoUrl={cms.getText("hero.videoUrl", serverHero.videoUrl ?? "") || undefined}
                  youtubeUrl={cms.getText("hero.youtubeUrl", serverHero.youtubeUrl ?? "") || undefined}
                  posterUrl={cms.getText("hero.posterUrl", serverHero.posterUrl ?? "") || undefined}
                  alt={cms.getText("hero.alt", t("blog.hero.alt"))}
                  fallback={<PageHeroImage page="blog" alt={cms.getText("hero.alt", t("blog.hero.alt"))} />}
                />
              }
              ctas={
                <>
                  <Link href={l("/stay")}>
                    <Button variant="gold" size="lg" className="min-h-11 text-sm sm:min-h-12 sm:text-base">
                      {cms.getText("hero.cta.primary", t("blog.hero.ctaPrimary"))}
                    </Button>
                  </Link>
                  <Link href={l("/contact")}>
                    <Button variant="heroOutline" size="lg" className="min-h-11 text-sm sm:min-h-12 sm:text-base">
                      {cms.getText("hero.cta.secondary", t("blog.hero.ctaSecondary"))}
                    </Button>
                  </Link>
                </>
              }
            />
          </BlogCmsBlock>
        ) : null}

        {showSearch ? (
          <BlogCmsBlock
            blockId="search"
            as="section"
            cms={cms}
            className={`${showHero ? "-mt-16 pb-4" : "pt-6 pb-4"} relative z-10 app-container content-max`}
          >
            <div className="rounded-md border border-border/70 bg-card/95 p-4 shadow-sm backdrop-blur sm:p-5">
              <div className="relative mx-auto max-w-xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={cms.getText("search.placeholder", t("blog.searchPlaceholder"))}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-11 border-border bg-background pl-12 text-base text-foreground sm:h-12 sm:text-lg"
                />
              </div>

              <div className="-mx-4 mt-4 flex max-w-none justify-start gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-auto sm:max-w-3xl sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className="shrink-0"
                >
                  {cms.getText("search.allPosts", t("blog.allPosts"))}
                </Button>
                {categories.map(([key]) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                    className="shrink-0"
                  >
                    {getCategoryLabel(key)}
                  </Button>
                ))}
              </div>
            </div>
          </BlogCmsBlock>
        ) : null}

        {featuredPost ? (
          <BlogCmsBlock
            blockId="featured-post"
            as="section"
            cms={cms}
            defaultEnabled={false}
            className="app-container content-max py-8"
          >
            <Link href={l(`/blog/${featuredPost.slug}`)} className="group block">
              <article className="grid overflow-hidden rounded-md border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C7A35A]/50 hover:shadow-lg lg:grid-cols-[1.08fr_0.92fr]">
                <div className="relative min-h-[17rem] overflow-hidden">
                  <BlogFeaturedImage
                    src={featuredPost.featured_image ?? "/placeholder.svg"}
                    category={featuredPost.category}
                    alt={featuredPost.title}
                    className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-95"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <Badge variant="outline" className="mb-4 w-fit border-[#C7A35A]/40 bg-[#C7A35A]/5 text-xs tracking-wide text-[#C7A35A]">
                    {getCategoryLabel(featuredPost.category, featuredPost)}
                  </Badge>
                  <h2 className="font-serif text-2xl font-light leading-tight text-foreground transition-colors duration-300 group-hover:text-[#C7A35A] sm:text-3xl">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {featuredPost.excerpt}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t border-border/30 pt-4 text-xs text-muted-foreground/70">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#C7A35A]/60" />
                      <span>{featuredPost.reading_time} {cms.getText("posts.readTime", t("blog.readTime"))}</span>
                    </div>
                    <span className="font-medium tracking-wide text-[#C7A35A] transition-transform duration-200 group-hover:translate-x-0.5">
                      {cms.getText("posts.readMore", t("blog.readMore"))}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          </BlogCmsBlock>
        ) : null}

        {shouldRenderPostsGrid ? (
          <BlogCmsBlock blockId="posts-grid" as="section" cms={cms} className="py-12 app-container content-max">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <h2 className="text-2xl font-serif font-medium text-foreground mb-4">
                  {cms.getText("posts.emptyTitle", t("blog.noPostsTitle"))}
                </h2>
                <p className="text-muted-foreground text-lg mb-2">
                  {cms.getText("posts.emptyDescription", t("blog.noPostsFound"))}
                </p>
                <p className="text-muted-foreground">
                  {t(
                    "blog.noPostsSubtext",
                  )}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {gridPosts.map((post, index) => (
                  <m.div
                    key={post.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 1), duration: 0.5, ease: "easeOut" }}
                    className="group h-full"
                  >
                    <Link href={l(`/blog/${post.slug}`)} className="block h-full">
                      <article className="relative overflow-hidden rounded-md bg-card border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ease-out h-full flex flex-col">
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <BlogFeaturedImage
                            src={post.featured_image ?? "/placeholder.svg"}
                            category={post.category}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 group-hover:brightness-95 transition-all duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="p-6 flex flex-col flex-1 bg-card">
                          <Badge variant="outline" className="w-fit mb-4 text-xs tracking-wide border-[#C7A35A]/40 text-[#C7A35A] bg-[#C7A35A]/5">
                            {getCategoryLabel(post.category, post)}
                          </Badge>
                          <h3 className="text-lg font-serif font-light leading-snug mb-3 line-clamp-2 min-h-[3.1rem] group-hover:text-[#C7A35A] transition-colors duration-300 text-foreground">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-2 min-h-[2.75rem] flex-1">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground/70 pt-4 border-t border-border/30">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-[#C7A35A]/60" />
                              <span>{post.reading_time} {cms.getText("posts.readTime", t("blog.readTime"))}</span>
                            </div>
                            <span className="text-[#C7A35A] font-medium tracking-wide group-hover:translate-x-0.5 transition-transform duration-200">
                              {cms.getText("posts.readMore", t("blog.readMore"))}
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </m.div>
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
    return hideServerShell("blog-server-shell");
  }, []);

  if (!mounted) {
    return null;
  }

  return <BlogClientInner {...props} />;
}

export default BlogClient;
