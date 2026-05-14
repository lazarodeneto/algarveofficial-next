"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from "next/navigation";
import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getSessionId } from '@/lib/sessionId';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Tag,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Eye,
  Loader2,
  BookOpenText,
  Compass,
  Sparkles,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RouteMessageState } from '@/components/layout/RouteMessageState';
import {
  ArticleRelatedListingCards,
  BeachGuideMap,
  BeachGuideRelatedCards,
  type BeachGuideListing,
} from '@/components/blog/BeachGuideListings';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { type Locale } from '@/lib/i18n/config';
import { useCurrentLocale } from '@/hooks/useCurrentLocale';
import { useLocalePath } from '@/hooks/useLocalePath';
import {
  buildAbsoluteRouteUrl,
  buildStaticRouteData,
  type BlogPostRouteData,
} from '@/lib/i18n/localized-routing';
import {
  BEST_BEACHES_LINK_ALIASES,
  FAMILY_ATTRACTIONS_LINK_ALIASES,
  GOLF_LINK_ALIASES,
  isBestBeachesArticleSlug,
  shouldLinkFamilyAttractionsInArticle,
  shouldLinkBeachListingsInArticle,
  shouldLinkGolfListingsInArticle,
} from '@/lib/blog/best-beaches-guide';
import { linkArticleListingMentions } from '@/lib/blog/article-listing-links';
import { sanitizeHtmlString } from '@/lib/sanitizeHtml';
import { cn } from '@/lib/utils';
import { 
  usePublishedBlogPost, 
  useIncrementBlogViews,
  blogCategoryLabels,
  type BlogCategory,
  type BlogPostWithAuthor,
} from '@/hooks/useBlogPosts';

const BLOG_TRANSLATION_KEYS: Record<BlogCategory, string> = {
  lifestyle: "blog.blogCategories.lifestyle",
  "travel-guides": "blog.blogCategories.travelGuides",
  "food-wine": "blog.blogCategories.foodWine",
  golf: "blog.blogCategories.golf",
  "real-estate": "blog.blogCategories.realEstate",
  events: "blog.blogCategories.events",
  wellness: "blog.blogCategories.wellness",
  "insider-tips": "blog.blogCategories.insiderTips",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHtmlTags(value: string) {
  return value.replace(/<[^>]*>/g, " ");
}

function decodeCommonHtmlEntities(value: string) {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value
    .replace(/&([a-z]+);/gi, (match, entity) => namedEntities[entity.toLowerCase()] ?? match)
    .replace(/&#(\d+);/g, (_match, entity) => String.fromCodePoint(Number(entity)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, entity) => String.fromCodePoint(Number.parseInt(entity, 16)));
}

function normalizeArticleHeading(value: string) {
  return decodeCommonHtmlEntities(stripHtmlTags(value))
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();
}

function stripDuplicateArticleTitleHeading(html: string, title: string) {
  const normalizedTitle = normalizeArticleHeading(title);
  if (!normalizedTitle) return html;

  return html.replace(/^\s*<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>\s*/i, (match, heading) =>
    normalizeArticleHeading(heading) === normalizedTitle ? "" : match,
  );
}

function isMajorArticleHeading(line: string, title: string) {
  if (line === title) return true;
  return [
    /^contents$/i,
    /^top beaches/i,
    /^best (algarve )?beaches by category$/i,
    /^when to visit/i,
    /^practical tips/i,
    /^frequently asked questions$/i,
    /^plan your/i,
  ].some((pattern) => pattern.test(line));
}

function isQuestionHeading(line: string) {
  return /\?$/.test(line) && /^(what|which|where|when|how|qual|quais|quelle|quelles|wo|welche|waar|vilken|hvilken|hvilke)/i.test(line);
}

function formatArticleContent(content: string | null | undefined, title: string) {
  const rawContent = content?.trim() ?? "";
  if (!rawContent) return "";
  if (/<(h[1-6]|p|ul|ol|li|blockquote)\b/i.test(rawContent)) {
    return rawContent.replace(/<\/?h1(\s[^>]*)?>/gi, (match) =>
      match.startsWith("</") ? "</h2>" : match.replace(/^<h1/i, "<h2"),
    );
  }

  return rawContent
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const escaped = escapeHtml(line);
      if (isMajorArticleHeading(line, title)) return `<h2>${escaped}</h2>`;
      if (/^\d+\.\s+/.test(line) || isQuestionHeading(line)) return `<h3>${escaped}</h3>`;
      return `<p>${escaped}</p>`;
    })
    .join("");
}

interface BlogPostProps {
  localeSwitchPaths?: Partial<Record<Locale, string>>;
  localizedRoute?: BlogPostRouteData;
  initialPost?: BlogPostWithAuthor | null;
  beachListings?: BeachGuideListing[];
  golfListings?: BeachGuideListing[];
  familyListings?: BeachGuideListing[];
}

export default function BlogPost({
  localeSwitchPaths,
  localizedRoute,
  initialPost,
  beachListings = [],
  golfListings = [],
  familyListings = [],
}: BlogPostProps = {}) {
  const { slug: rawSlug } = useParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const router = useRouter();
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const l = useLocalePath();
  const isBrowser = typeof window !== "undefined";
  const [activeBeachListingId, setActiveBeachListingId] = useState<string | null>(beachListings[0]?.id ?? null);
  const [activeFamilyListingId, setActiveFamilyListingId] = useState<string | null>(familyListings[0]?.id ?? null);

  const { data: post, isLoading, error } = usePublishedBlogPost(slug, initialPost);
  const { mutate: incrementViews } = useIncrementBlogViews();

  // Increment views on mount with session deduplication
  useEffect(() => {
    if (post?.id) {
      const sessionId = getSessionId();
      incrementViews({ postId: post.id, sessionId });
    }
  }, [post?.id, incrementViews]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (platform === 'copy') {
      void navigator.clipboard
        .writeText(url)
        .then(() => toast.success(t("blog.linkCopied")))
        .catch(() => toast.error(t("blog.copyFailed")));
      return;
    }

    window.open(urls[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  if (isLoading || (!isBrowser && !post && !error)) {
    return (
      <div className="min-h-screen bg-background">
        <Header localeSwitchPaths={localeSwitchPaths} />
        <main className="pt-32 pb-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Header localeSwitchPaths={localeSwitchPaths} />
        <main className="pt-32 pb-16">
          <div className="container max-w-4xl mx-auto px-4">
            <RouteMessageState
              eyebrow={t('blog.label')}
              title={t("blog.notFoundTitle")}
              description={t("blog.notFoundDescription")}
              actions={(
                <Button onClick={() => router.push(l('/blog'))}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("blog.backToBlog")}
                </Button>
              )}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isBeachGuideArticle = isBestBeachesArticleSlug(post.slug);
  const shouldLinkBeachMentions = shouldLinkBeachListingsInArticle(post.slug);
  const shouldLinkGolfMentions = shouldLinkGolfListingsInArticle(post.slug);
  const shouldLinkFamilyMentions = shouldLinkFamilyAttractionsInArticle(post.slug);
  const categoryLabel = t(BLOG_TRANSLATION_KEYS[post.category], blogCategoryLabels[post.category]);
  const primaryTopic = post.tags?.[0] ?? categoryLabel;
  const articleHtml = stripDuplicateArticleTitleHeading(
    formatArticleContent(post.content, post.title),
    post.title,
  );
  const articleWithBeachLinks = shouldLinkBeachMentions
    ? linkArticleListingMentions(articleHtml, beachListings, BEST_BEACHES_LINK_ALIASES, l)
    : articleHtml;
  const articleWithListingLinks = shouldLinkGolfMentions
    ? linkArticleListingMentions(articleWithBeachLinks, golfListings, GOLF_LINK_ALIASES, l)
    : articleWithBeachLinks;
  const articleWithFamilyLinks = shouldLinkFamilyMentions
    ? linkArticleListingMentions(articleWithListingLinks, familyListings, FAMILY_ATTRACTIONS_LINK_ALIASES, l)
    : articleWithListingLinks;
  const formattedContent = sanitizeHtmlString(
    articleWithFamilyLinks,
  );

  return (
    <div className={cn("min-h-screen bg-background", isBeachGuideArticle && "bg-[#f7fbfa]")}>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: buildAbsoluteRouteUrl(locale, buildStaticRouteData("home")) },
          { name: "Blog", url: buildAbsoluteRouteUrl(locale, buildStaticRouteData("blog")) },
          {
            name: post.title,
            url: localizedRoute
              ? buildAbsoluteRouteUrl(locale, localizedRoute)
              : buildAbsoluteRouteUrl(locale, `/blog/${post.slug}`),
          },
        ]}
        locale={locale}
      />
      <Header localeSwitchPaths={localeSwitchPaths} />
      
      <main className="pt-20">
        {/* Hero Image */}
        <div className={cn(
          "relative h-[40vh] overflow-hidden md:h-[50vh]",
          isBeachGuideArticle && "h-[62vh] min-h-[520px] md:h-[68vh]",
        )}>
          <img
            src={post.featured_image || '/placeholder.svg'}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent",
            isBeachGuideArticle &&
              "bg-[linear-gradient(180deg,rgba(5,20,24,0.18)_0%,rgba(5,20,24,0.42)_42%,#f7fbfa_100%)]",
          )} />
        </div>

        {/* Article Content */}
        <article className={cn(
          "container relative z-10 mx-auto -mt-32 max-w-5xl px-4",
          isBeachGuideArticle && "-mt-56 max-w-7xl",
        )}>
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Back Link */}
            <Button variant="ghost" size="sm" asChild className="mb-6">
              <Link href={l("/blog")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("blog.backToBlog")}
              </Link>
            </Button>

            {/* Article Header */}
            <Card className={cn(
              "mb-8 border-border bg-card",
              isBeachGuideArticle && "overflow-hidden border-white/70 bg-white/95 shadow-[0_34px_100px_-68px_rgba(7,43,39,0.75)] backdrop-blur",
            )}>
              <CardContent className="p-6 md:p-10">
                <Badge
                  variant="secondary"
                  className={cn(
                    "mb-4",
                    isBeachGuideArticle && "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50",
                  )}
                >
                  {categoryLabel}
                </Badge>
                
                <h1 className={cn(
                  "mb-6 font-serif text-4xl font-medium leading-tight md:text-6xl lg:text-7xl",
                  isBeachGuideArticle && "max-w-5xl text-slate-950",
                )}>
                  {post.title}
                </h1>

                <div className="mb-8 grid gap-3 md:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-md border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                    <BookOpenText className="h-5 w-5 shrink-0 text-primary" />
                    <span className="font-medium text-foreground">{post.reading_time} {t('blog.readTime')}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-md border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                    <Compass className="h-5 w-5 shrink-0 text-primary" />
                    <span className="font-medium text-foreground">{categoryLabel}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-md border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                    <Sparkles className="h-5 w-5 shrink-0 text-primary" />
                    <span className="line-clamp-1 font-medium text-foreground">{primaryTopic}</span>
                  </div>
                </div>

                <p className={cn(
                  "mb-8 text-xl text-muted-foreground",
                  isBeachGuideArticle && "max-w-3xl leading-8 text-slate-600",
                )}>
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className={cn(
                  "flex flex-wrap items-center gap-4 text-sm text-muted-foreground",
                  isBeachGuideArticle && "text-slate-600",
                )}>
                  <div className="flex items-center gap-2">
                    {post.author?.avatar_url ? (
                      <img
                        src={post.author.avatar_url}
                        alt={post.author.full_name || 'Author'}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{post.author?.full_name || 'AlgarveOfficial'}</p>
                      <p className="text-xs">{t('blog.by')} AlgarveOfficial</p>
                    </div>
                  </div>
                  <span className="hidden sm:block">•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.reading_time} {t('blog.readTime')}</span>
                  </div>
                  <span className="hidden sm:block">•</span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.views.toLocaleString()} {t("blog.views")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Article Body */}
            <Card className={cn(
              "mb-8 border-border bg-card",
              isBeachGuideArticle && "border-white/80 bg-white shadow-[0_28px_80px_-68px_rgba(7,43,39,0.7)]",
            )}>
              <CardContent className="p-6 md:p-10">
                <div 
                  className={cn(
                    "ao-blog-article-prose max-w-none",
                    isBeachGuideArticle
                      ? "ao-beach-article-prose ao-blog-article-prose--light"
                      : "ao-blog-article-prose--default",
                  )}
                  dangerouslySetInnerHTML={{ 
                    __html: formattedContent
                  }}
                />
              </CardContent>
            </Card>

            {isBeachGuideArticle ? (
              <BeachGuideMap
                listings={beachListings}
                activeListingId={activeBeachListingId}
                onListingSelect={setActiveBeachListingId}
              />
            ) : null}

            <Card className={cn(
              "mb-8 border-border bg-card",
              isBeachGuideArticle && "border-white/80 bg-white shadow-[0_24px_70px_-62px_rgba(7,43,39,0.62)]",
            )}>
              <CardContent className="p-6 md:p-10">
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <>
                    <Separator className="my-8" />
                    <div className="flex flex-wrap items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs transition hover:border-primary/60 hover:text-primary">
                          <Link href={l(`/blog?tag=${encodeURIComponent(tag)}`)} className="underline-offset-4 hover:underline">
                            {tag}
                          </Link>
                        </Badge>
                      ))}
                    </div>
                  </>
                )}

                {/* Share */}
                <Separator className="my-8" />
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    {t('blog.shareArticle')}:
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleShare('facebook')}>
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleShare('twitter')}>
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleShare('linkedin')}>
                      <Linkedin className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleShare('copy')}>
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isBeachGuideArticle ? (
              <BeachGuideRelatedCards
                listings={beachListings}
                activeListingId={activeBeachListingId}
                onListingSelect={setActiveBeachListingId}
              />
            ) : null}

            {shouldLinkFamilyMentions ? (
              <ArticleRelatedListingCards
                listings={familyListings}
                activeListingId={activeFamilyListingId}
                onListingSelect={setActiveFamilyListingId}
                anchorId="family-attraction-listing-cards"
                badgeLabel={`${familyListings.length} published listing${familyListings.length === 1 ? "" : "s"}`}
                detailsLabel="View attraction details"
                eyebrow="Related family listings"
                title="Family attractions mentioned in this article"
              />
            ) : null}
          </m.div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
