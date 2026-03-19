import { useEffect, useState } from "react";
import Image from "next/image";
import type { BlogCategory } from "@/hooks/useBlogPosts";
import { getBlogCategoryFallbackImage, resolveBlogFeaturedImage } from "@/lib/blogImages";

interface BlogFeaturedImageProps {
  src?: string | null;
  category?: BlogCategory | null;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
}

export function BlogFeaturedImage({
  src,
  category,
  alt,
  className,
  loading = "lazy",
}: BlogFeaturedImageProps) {
  const fallbackSrc = getBlogCategoryFallbackImage(category);
  const resolvedSrc = resolveBlogFeaturedImage(src, category);
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);

  useEffect(() => {
    setCurrentSrc(resolvedSrc);
  }, [resolvedSrc]);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={1600}
      height={900}
      unoptimized
      sizes="100vw"
      className={className}
      loading={loading}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}

export default BlogFeaturedImage;
