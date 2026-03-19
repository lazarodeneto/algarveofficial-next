"use client";

import { Suspense } from "react";
import BlogPost from "@/legacy-pages/public/blog/BlogPost";

export default function BlogPostPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <BlogPost />
    </Suspense>
  );
}
