"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { normalizePublicImageUrl } from "@/lib/imageUrls";
import { getOptimizedImageUrl, SIZES } from "@/lib/image";
import { canUseNextImage } from "@/lib/nextImageSafety";
import { getCategoryFallbackImageUrl, normalizeFallbackImageUrl } from "@/lib/fallback-images";

export interface ListingImageProps {
  src?: string | null;
  category?: string | null;
  categoryImageUrl?: string | null;
  listingId?: string;
  fallbackSrc?: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "auto" | "high" | "low";
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
  style?: React.CSSProperties;
  isRepresentative?: boolean;
}

function normalizeUrl(value: string | null | undefined): string | null {
  return normalizePublicImageUrl(value);
}

function resolveListingImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  const url = normalizeUrl(src);
  if (!url) return null;
  return getOptimizedImageUrl(url, {
    width: 800,
    quality: 80,
    format: "webp",
    resize: "cover",
  });
}

function resolveCategoryImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  const url = normalizeUrl(src);
  if (!url) return null;
  return getOptimizedImageUrl(url, {
    width: 800,
    quality: 80,
    format: "webp",
    resize: "cover",
  });
}

export default function ListingImage({
  src,
  category,
  categoryImageUrl,
  fallbackSrc = "/placeholder.svg",
  alt,
  className,
  loading = "lazy",
  fetchPriority = "auto",
  sizes,
  width,
  height,
  priority = false,
  fill = false,
  style,
  isRepresentative = false,
}: ListingImageProps) {
  const [hasError, setHasError] = useState(false);

  const categorySlug = category;

  const sourceCandidates = [
    hasError ? null : resolveListingImageUrl(src),
    hasError ? null : resolveCategoryImageUrl(categoryImageUrl),
    resolveListingImageUrl(fallbackSrc),
    getCategoryFallbackImageUrl(categorySlug),
  ].filter((url): url is string => url !== null);

  const currentUrl = sourceCandidates[0] ?? "/placeholder.svg";
  const useNativeImg = !canUseNextImage(currentUrl);

  const handleError = () => {
    setHasError(true);
  };

  const resolvedAlt = typeof alt === "string" && alt.trim().length > 0 ? alt : "Algarve listing";
  
  const isUsingFallback = !src || hasError;
  const showRepresentativeBadge = isRepresentative && isUsingFallback;
  const useFillLayout = fill;

  if (useFillLayout) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden bg-muted", className)} style={style}>
        {useNativeImg ? (
          <img
            src={currentUrl}
            alt={showRepresentativeBadge ? `Representative image of ${alt}` : resolvedAlt}
            className="absolute inset-0 h-full w-full object-cover"
            sizes={sizes ?? SIZES.card}
            loading={loading}
            fetchPriority={fetchPriority}
            onError={handleError}
          />
        ) : (
          <Image
            src={currentUrl}
            alt={showRepresentativeBadge ? `Representative image of ${alt}` : resolvedAlt}
            fill
            quality={80}
            className="object-cover"
            sizes={sizes ?? SIZES.card}
            priority={priority}
            loading={priority ? undefined : loading}
            fetchPriority={priority ? "high" : fetchPriority}
            onError={handleError}
          />
        )}
        {showRepresentativeBadge && (
          <div className="absolute top-2 left-2">
            <span className="bg-[#0B1F3A]/70 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-md border border-[#C7A35A]/50">
              Representative
            </span>
          </div>
        )}
      </div>
    );
  }

  const aspectRatio = 4 / 3;
  const displayWidth = width ?? 800;
  const displayHeight = height ?? Math.round(displayWidth / aspectRatio);

  if (useNativeImg) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)} style={style}>
        <img
          src={currentUrl}
          alt={showRepresentativeBadge ? `Representative image of ${alt}` : resolvedAlt}
          width={displayWidth}
          height={displayHeight}
          className="w-full h-auto"
          sizes={sizes ?? SIZES.card}
          loading={loading}
          fetchPriority={fetchPriority}
          onError={handleError}
        />
        {showRepresentativeBadge && (
          <div className="absolute top-2 left-2">
            <span className="bg-[#0B1F3A]/70 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-md border border-[#C7A35A]/50">
              Representative
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)} style={style}>
      <Image
        src={currentUrl}
        alt={showRepresentativeBadge ? `Representative image of ${alt}` : resolvedAlt}
        width={displayWidth}
        height={displayHeight}
        quality={80}
        className="w-full h-auto"
        sizes={sizes ?? SIZES.card}
        priority={priority}
        loading={priority ? undefined : loading}
        fetchPriority={priority ? "high" : fetchPriority}
        onError={handleError}
      />
      {showRepresentativeBadge && (
        <div className="absolute top-2 left-2">
          <span className="bg-[#0B1F3A]/70 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-md border border-[#C7A35A]/50">
            Representative
          </span>
        </div>
      )}
    </div>
  );
}
