import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import BlogPost from "@/legacy-pages/public/blog/BlogPost";
import type { BeachGuideListing } from "@/components/blog/BeachGuideListings";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";
import { getPublishedBlogPostBySlug } from "@/app/blog/[slug]/postData";
import {
  buildAbsoluteRouteUrl,
  buildLocaleSwitchPathsForEntity,
  type BlogPostRouteData,
} from "@/lib/i18n/localized-routing";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { buildArticleSchema } from "@/lib/seo/advanced/schema-builders";
import { getPublicListings, resolvePublicCategoryRoute } from "@/lib/public-data";
import type { PublicListingDTO } from "@/lib/public-data/types";
import {
  BEST_BEACHES_RELATED_LISTING_SLUGS,
  FAMILY_ATTRACTIONS_RELATED_LISTING_SLUGS,
  GOLF_RELATED_LISTING_SLUGS,
  getFamilyAttractionsMentionedListingSlugs,
  getFamilyAttractionsRelatedOrder,
  getBestBeachesMentionedListingSlugs,
  getBestBeachesRelatedOrder,
  getGolfMentionedListingSlugs,
  getGolfRelatedOrder,
  shouldLinkBeachListingsInArticle,
  shouldLinkFamilyAttractionsInArticle,
  shouldLinkGolfListingsInArticle,
} from "@/lib/blog/best-beaches-guide";

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

function toBeachGuideListing(listing: PublicListingDTO): BeachGuideListing {
  return {
    id: listing.id,
    slug: listing.slug,
    name: listing.name,
    shortDescription: listing.shortDescription,
    imageUrl: listing.imageUrl,
    tier: listing.tier,
    isCurated: listing.isCurated,
    categorySlug: listing.category?.slug ?? "beaches",
    categoryName: listing.category?.name ?? "Beaches",
    categoryImageUrl: listing.category?.imageUrl ?? null,
    cityName: listing.city?.name ?? null,
    regionName: listing.region?.name ?? null,
    latitude: listing.location.latitude,
    longitude: listing.location.longitude,
    googleRating: listing.reviews.googleRating,
    googleReviewCount: listing.reviews.googleReviewCount,
    updatedAt: listing.updatedAt,
  };
}

async function getBeachGuideListings(
  locale: Locale,
  post: NonNullable<Awaited<ReturnType<typeof getPublishedBlogPostBySlug>>>,
): Promise<BeachGuideListing[]> {
  return getArticleMentionedListings({
    locale,
    categorySlug: "beaches",
    articleMentionedSlugs: getBestBeachesMentionedListingSlugs([
      post.title,
      post.excerpt,
      post.content,
      post.seo_title,
      post.seo_description,
    ]),
    relatedListingSlugs: BEST_BEACHES_RELATED_LISTING_SLUGS,
    getRelatedOrder: getBestBeachesRelatedOrder,
  });
}

async function getGolfArticleListings(
  locale: Locale,
  post: NonNullable<Awaited<ReturnType<typeof getPublishedBlogPostBySlug>>>,
): Promise<BeachGuideListing[]> {
  return getArticleMentionedListings({
    locale,
    categorySlug: "golf",
    articleMentionedSlugs: getGolfMentionedListingSlugs([
      post.title,
      post.excerpt,
      post.content,
      post.seo_title,
      post.seo_description,
    ]),
    relatedListingSlugs: GOLF_RELATED_LISTING_SLUGS,
    getRelatedOrder: getGolfRelatedOrder,
  });
}

async function getFamilyArticleListings(
  locale: Locale,
  post: NonNullable<Awaited<ReturnType<typeof getPublishedBlogPostBySlug>>>,
): Promise<BeachGuideListing[]> {
  return getArticleMentionedListings({
    locale,
    categorySlug: "family-attractions",
    articleMentionedSlugs: getFamilyAttractionsMentionedListingSlugs([
      post.title,
      post.excerpt,
      post.content,
      post.seo_title,
      post.seo_description,
    ]),
    relatedListingSlugs: FAMILY_ATTRACTIONS_RELATED_LISTING_SLUGS,
    getRelatedOrder: getFamilyAttractionsRelatedOrder,
  });
}

async function getArticleMentionedListings({
  locale,
  categorySlug,
  articleMentionedSlugs,
  relatedListingSlugs,
  getRelatedOrder,
}: {
  locale: Locale;
  categorySlug: string;
  articleMentionedSlugs: string[];
  relatedListingSlugs: readonly string[];
  getRelatedOrder: (slug: string) => number;
}): Promise<BeachGuideListing[]> {
  const resolution = await resolvePublicCategoryRoute(categorySlug, locale);
  if (!resolution.ok || resolution.category.memberIds.length === 0) return [];

  if (articleMentionedSlugs.length === 0) return [];

  const listings = await getPublicListings({
    categoryIds: resolution.category.memberIds,
    locale,
    limit: 1000,
    includeReviewsSummary: false,
  });

  const matchedListingSlugs = new Set<string>(
    articleMentionedSlugs.filter((slug) =>
      relatedListingSlugs.includes(slug),
    ),
  );

  return listings
    .filter((listing) => matchedListingSlugs.has(listing.slug))
    .sort((left, right) => {
      const leftMentionIndex = articleMentionedSlugs.indexOf(left.slug);
      const rightMentionIndex = articleMentionedSlugs.indexOf(right.slug);

      if (leftMentionIndex !== -1 && rightMentionIndex !== -1) {
        return leftMentionIndex - rightMentionIndex;
      }

      return getRelatedOrder(left.slug) - getRelatedOrder(right.slug);
    })
    .map(toBeachGuideListing);
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
    title: post.seo_title ?? post.title,
    description: (post.seo_description || post.excerpt) ?? undefined,
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

  const beachListings =
    shouldLinkBeachListingsInArticle(post.slug)
      ? await getBeachGuideListings(resolvedLocale, post)
      : [];
  const golfListings =
    shouldLinkGolfListingsInArticle(post.slug)
      ? await getGolfArticleListings(resolvedLocale, post)
      : [];
  const familyListings =
    shouldLinkFamilyAttractionsInArticle(post.slug)
      ? await getFamilyArticleListings(resolvedLocale, post)
      : [];

  const routeData = buildBlogPostRouteData(post);
  const localeSwitchPaths = buildLocaleSwitchPathsForEntity(routeData, SUPPORTED_LOCALES);

  const articleSchema = buildArticleSchema({
    id: post.id,
    slug: post.slug,
    url: buildAbsoluteRouteUrl(resolvedLocale, routeData),
    title: post.seo_title ?? post.title,
    excerpt: (post.seo_description || post.excerpt) ?? undefined,
    featured_image: post.featured_image ?? undefined,
    published_at: post.published_at ?? undefined,
    updated_at: post.updated_at ?? undefined,
    locale: resolvedLocale,
  });

  return (
    <>
      <script
        id="schema-blog-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Suspense fallback={<RouteLoadingState />}>
        <BlogPost
          localeSwitchPaths={localeSwitchPaths}
          localizedRoute={routeData}
          initialPost={post}
          beachListings={beachListings}
          golfListings={golfListings}
          familyListings={familyListings}
        />
      </Suspense>
    </>
  );
}
