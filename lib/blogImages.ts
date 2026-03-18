import type { BlogCategory } from "@/hooks/useBlogPosts";

const BLOG_CATEGORY_IMAGES: Record<BlogCategory, string> = {
  lifestyle: "/images/blog/algarve-lifestyle.webp",
  "travel-guides": "/images/blog/algarve-travel-guide.webp",
  "food-wine": "/images/blog/algarve-food-wine.webp",
  golf: "/images/blog/algarve-golf.webp",
  "real-estate": "/images/blog/algarve-services.webp",
  events: "/images/blog/algarve-events.webp",
  wellness: "/images/blog/algarve-wellness.webp",
  "insider-tips": "/images/blog/algarve-insider-tips.webp",
};

const PLACEHOLDER_PATTERN = /placeholder\.svg|^data:|^\s*$/i;

export function getBlogCategoryFallbackImage(category?: BlogCategory | null): string {
  if (!category) return BLOG_CATEGORY_IMAGES["travel-guides"];
  return BLOG_CATEGORY_IMAGES[category] || BLOG_CATEGORY_IMAGES["travel-guides"];
}

export function resolveBlogFeaturedImage(
  featuredImage: string | null | undefined,
  category?: BlogCategory | null,
): string {
  if (!featuredImage || PLACEHOLDER_PATTERN.test(featuredImage)) {
    return getBlogCategoryFallbackImage(category);
  }

  return featuredImage;
}
