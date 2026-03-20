import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { BlogPostPageClient } from "@/app/blog/[slug]/BlogPostPageClient";
import { getPublishedBlogPostBySlug } from "@/app/blog/[slug]/postData";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";

interface LocaleBlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: LocaleBlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return buildPageMetadata({
      title: "Blog Post Not Found",
      description: "This blog post could not be found.",
      localizedPath: `/blog/${slug}`,
      noIndex: true,
      noFollow: true,
    });
  }

  return buildPageMetadata({
    title: post.seo_title || post.title,
    description: (post.seo_description || post.excerpt) ?? undefined,
    localizedPath: `/blog/${slug}`,
    image: post.featured_image ?? undefined,
    type: "article",
    locale: resolvedLocale,
    publishedTime: post.published_at ?? undefined,
    modifiedTime: post.updated_at ?? undefined,
  });
}

export default async function LocaleBlogPostPage({ params }: LocaleBlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) notFound();

  return <BlogPostPageClient />;
}
