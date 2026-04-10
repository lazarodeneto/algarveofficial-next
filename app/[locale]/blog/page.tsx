import { Suspense } from "react";
import Blog from "@/legacy-pages/public/blog/Blog";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";

export default function BlogPage() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <Blog />
    </Suspense>
  );
}
