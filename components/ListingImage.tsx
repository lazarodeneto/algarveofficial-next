"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { normalizePublicImageUrl } from "@/lib/imageUrls";
import { getOptimizedImageUrl, SIZES } from "@/lib/image";
import { canUseNextImage } from "@/lib/nextImageSafety";

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
}: ListingImageProps) {
  const [hasError, setHasError] = useState(false);

  const sourceCandidates = [
    hasError ? null : resolveListingImageUrl(src),
    hasError ? null : resolveCategoryImageUrl(categoryImageUrl),
    resolveListingImageUrl(fallbackSrc),
  ].filter((url): url is string => url !== null);

  const currentUrl = sourceCandidates[0] ?? "/placeholder.svg";
  const useNativeImg = !canUseNextImage(currentUrl);

  const handleError = () => {
    setHasError(true);
  };

  const resolvedAlt = typeof alt === "string" && alt.trim().length > 0 ? alt : "Algarve listing";

  if (fill) {
    if (useNativeImg) {
      return (
        <img
          src={currentUrl}
          alt={resolvedAlt}
          className={cn("absolute inset-0 h-full w-full object-cover", className)}
          loading={loading}
          fetchPriority={fetchPriority}
          onError={handleError}
          style={style}
        />
      );
    }

    return (
      <Image
        src={currentUrl}
        alt={resolvedAlt}
        fill
        quality={80}
        className={cn("object-cover", className)}
        sizes={sizes ?? SIZES.card}
        priority={priority}
        loading={loading}
        fetchPriority={fetchPriority}
        onError={handleError}
        style={style}
      />
    );
  }

  const aspectRatio = 4 / 3;
  const displayWidth = width ?? 800;
  const displayHeight = height ?? Math.round(displayWidth / aspectRatio);

  if (useNativeImg) {
    return (
      <img
        src={currentUrl}
        alt={resolvedAlt}
        width={displayWidth}
        height={displayHeight}
        className={cn("bg-muted", className)}
        loading={loading}
        fetchPriority={fetchPriority}
        onError={handleError}
        style={style}
      />
    );
  }

  return (
    <Image
      src={currentUrl}
      alt={resolvedAlt}
      width={displayWidth}
      height={displayHeight}
      quality={80}
      className={cn("bg-muted", className)}
      sizes={sizes ?? SIZES.card}
      priority={priority}
      loading={loading}
      fetchPriority={fetchPriority}
      onError={handleError}
      style={style}
    />
  );
}
