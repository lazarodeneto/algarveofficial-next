import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { normalizePublicImageUrl } from "@/lib/imageUrls";
import { buildMetadata } from "@/lib/metadata";
import { getPublishedBlogPostBySlug } from "./postData";

interface BlogPostLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: BlogPostLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return buildMetadata({
    title: "Redirecting to Blog Post",
    description: "Redirecting to the canonical localized blog post.",
    path: `/blog/${post.slug}`,
    image: normalizePublicImageUrl(post.featured_image) || "/og-image.png",
    type: "article",
    noIndex: true,
    noFollow: true,
    localeCode: DEFAULT_LOCALE,
    publishedTime: post.published_at ?? post.created_at,
    modifiedTime: post.updated_at ?? post.published_at ?? post.created_at,
    section: "Blog",
  });
}

export default function BlogPostLayout({ children }: { children: ReactNode }) {
  return children;
}
