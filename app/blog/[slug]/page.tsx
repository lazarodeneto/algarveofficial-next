import { notFound } from "next/navigation";

import { BlogPostPageClient } from "./BlogPostPageClient";
import { getPublishedBlogPostBySlug } from "./postData";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostPageClient />;
}
