import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { buildMetadata } from "@/lib/metadata";
import { getPublishedBlogPostBySlug } from "./postData";

interface BlogPostLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const title = post.seo_title?.trim() || post.title;
  const description =
    post.seo_description?.trim() ||
    post.excerpt ||
    "Explore the latest AlgarveOfficial editorial guides and destination insights from across the Algarve.";

  return buildMetadata({
    title,
    description,
    path: `/blog/${slug}`,
    type: "article",
    publishedTime: post.published_at ?? post.created_at,
    modifiedTime: post.updated_at ?? post.published_at ?? post.created_at,
    section: "Blog",
  });
}

export default function BlogPostLayout({ children }: { children: ReactNode }) {
  return children;
}
