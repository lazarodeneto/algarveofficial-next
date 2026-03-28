import { Suspense } from "react";
import Blog from "@/legacy-pages/public/blog/Blog";

export const revalidate = 3600;

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Blog />
    </Suspense>
  );
}
