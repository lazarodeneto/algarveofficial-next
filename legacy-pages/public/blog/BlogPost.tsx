"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from "next/navigation";
import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getSessionId } from '@/lib/sessionId';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Calendar,
  Tag,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Eye,
  Loader2
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RouteMessageState } from '@/components/layout/RouteMessageState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { sanitizeHtmlString } from '@/lib/sanitizeHtml';
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

function formatPublishedDate(value: string | null | undefined, locale: string) {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
    return rawContent;
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
}

export default function BlogPost({
  localeSwitchPaths,
  localizedRoute,
  initialPost,
}: BlogPostProps = {}) {
  const { slug: rawSlug } = useParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const router = useRouter();
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const l = useLocalePath();
  const isBrowser = typeof window !== "undefined";

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

  return (
    <div className="min-h-screen bg-background">
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
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img
            src={post.featured_image || '/placeholder.svg'}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Article Content */}
        <article className="container max-w-5xl mx-auto px-4 -mt-32 relative z-10">
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
            <Card className="bg-card border-border mb-8">
              <CardContent className="p-6 md:p-10">
                <Badge variant="secondary" className="mb-4">
                  {t(BLOG_TRANSLATION_KEYS[post.category], blogCategoryLabels[post.category])}
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-tight mb-6">
                  {post.title}
                </h1>

                <p className="text-xl text-muted-foreground mb-8">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                    <Calendar className="h-4 w-4" />
                    <span>{formatPublishedDate(post.published_at || post.created_at, locale)}</span>
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
            <Card className="bg-card border-border mb-8">
              <CardContent className="p-6 md:p-10">
                <div 
                  className="prose prose-xl prose-invert max-w-none
                    prose-headings:font-serif prose-headings:font-semibold prose-headings:tracking-normal
                    prose-h1:text-4xl prose-h1:md:text-5xl
                    prose-h2:mt-16 prose-h2:text-4xl prose-h2:md:text-5xl
                    prose-h3:mt-10 prose-h3:text-2xl prose-h3:md:text-3xl
                    prose-p:text-muted-foreground prose-p:leading-8
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-foreground
                    prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                    prose-li:marker:text-primary"
                  dangerouslySetInnerHTML={{ 
                    __html: sanitizeHtmlString(formatArticleContent(post.content, post.title))
                  }}
                />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <>
                    <Separator className="my-8" />
                    <div className="flex flex-wrap items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
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
          </m.div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
