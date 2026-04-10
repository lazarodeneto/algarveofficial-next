import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import BlogPost from "@/legacy-pages/public/blog/BlogPost";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";
import { getPublishedBlogPostBySlug } from "@/app/blog/[slug]/postData";
import {
  buildAbsoluteRouteUrl,
  buildLocaleSwitchPathsForEntity,
  type BlogPostRouteData,
} from "@/lib/i18n/localized-routing";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { buildArticleSchema } from "@/lib/seo/advanced/schema-builders";

interface LocaleBlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 3600;

function buildBlogPostRouteData(post: NonNullable<Awaited<ReturnType<typeof getPublishedBlogPostBySlug>>>): BlogPostRouteData {
  return {
    routeType: "blog-post",
    id: post.id,
    slugs: post.localizedSlugs,
  };
}

export async function generateMetadata({ params }: LocaleBlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const post = await getPublishedBlogPostBySlug(slug, resolvedLocale);

  if (!post) {
    return buildPageMetadata({
      title: "Blog Post Not Found",
      description: "This blog post could not be found.",
      localizedPath: `/blog/${slug}`,
      locale: resolvedLocale,
      noIndex: true,
      noFollow: true,
    });
  }

  return buildPageMetadata({
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
    localizedRoute: buildBlogPostRouteData(post),
    image: post.featured_image ?? "/og-image.png",
    type: "article",
    locale: resolvedLocale,
    publishedTime: post.published_at ?? undefined,
    modifiedTime: post.updated_at ?? undefined,
  });
}

export default async function LocaleBlogPostPage({ params }: LocaleBlogPostPageProps) {
  const { locale, slug } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const post = await getPublishedBlogPostBySlug(slug, resolvedLocale);

  if (!post) notFound();

  const routeData = buildBlogPostRouteData(post);
  const localeSwitchPaths = buildLocaleSwitchPathsForEntity(routeData, SUPPORTED_LOCALES);

  const articleSchema = buildArticleSchema({
    id: post.id,
    slug: post.slug,
    url: buildAbsoluteRouteUrl(resolvedLocale, routeData),
    title: post.seo_title || post.title,
    excerpt: post.seo_description || post.excerpt || undefined,
    featured_image: post.featured_image || undefined,
    published_at: post.published_at || undefined,
    updated_at: post.updated_at || undefined,
    locale: resolvedLocale,
  });

  return (
    <>
      <Script
        id="schema-blog-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Suspense fallback={<RouteLoadingState />}>
        <BlogPost localeSwitchPaths={localeSwitchPaths} localizedRoute={routeData} />
      </Suspense>
    </>
  );
}
