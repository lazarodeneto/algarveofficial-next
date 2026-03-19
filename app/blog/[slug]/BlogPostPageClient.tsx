"use client";

import { Suspense } from "react";

import BlogPost from "@/legacy-pages/public/blog/BlogPost";

export function BlogPostPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <BlogPost />
    </Suspense>
  );
}
