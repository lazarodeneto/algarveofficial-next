import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  getOptimizedImageUrl,
  getOptimizedImageSrcSet,
  SIZES,
  type OptimizedImageOptions,
} from "@/lib/image";

export interface OptimizedImageProps {
  src?: string | null;
  alt?: string;
  quality?: number;
  className?: string;
  fill?: boolean;
  fallbackSrc?: string;
  categoryImageUrl?: string | null;
  imageOptions?: Omit<OptimizedImageOptions, "src">;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  loading?: "lazy" | "eager";
  placeholderSrc?: string;
  blurDataURL?: string;
  style?: React.CSSProperties;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  onError?: React.ReactEventHandler<HTMLImageElement>;
}

function resolveImageChain(
  primarySrc: string | null | undefined,
  categoryImageUrl: string | null | undefined,
  fallbackSrc: string | undefined,
  options: OptimizedImageOptions,
): { url: string; srcSet?: string } | null {
  const candidates = [
    primarySrc,
    categoryImageUrl,
    fallbackSrc ?? "/placeholder.svg",
  ];

  for (const src of candidates) {
    if (!src) continue;
    const url = getOptimizedImageUrl(src, options);
    if (url) {
      const srcSet = getOptimizedImageSrcSet(src, [320, 640, 960, 1280], options);
      return { url, srcSet };
    }
  }

  return null;
}

export function OptimizedImage({
  src,
  alt = "",
  quality,
  className,
  fill = false,
  fallbackSrc,
  categoryImageUrl,
  imageOptions = {},
  sizes,
  width,
  height,
  priority = false,
  loading,
  placeholderSrc,
  style,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  const resolvedOptions: OptimizedImageOptions = {
    ...imageOptions,
    quality: quality ?? 80,
  };

  const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    setHasError(true);
    onError?.(e);
  };

  const handleLoad: React.ReactEventHandler<HTMLImageElement> = (e) => {
    onLoad?.(e);
  };

  const resolveUrl = (imgSrc: string | null | undefined) => {
    if (!imgSrc) return null;
    return getOptimizedImageUrl(imgSrc, resolvedOptions);
  };

  const chainResult = hasError
    ? resolveImageChain(fallbackSrc ?? "/placeholder.svg", undefined, undefined, resolvedOptions)
    : resolveImageChain(src, categoryImageUrl, fallbackSrc, resolvedOptions);

  const resolvedUrl = chainResult?.url ?? "/placeholder.svg";

  if (fill) {
    return (
      <Image
        src={resolvedUrl}
        alt={alt ?? "Image"}
        fill
        quality={quality ?? resolvedOptions.quality}
        className={cn("object-cover", className)}
        sizes={sizes ?? SIZES.auto}
        priority={priority}
        loading={loading ?? (priority ? "eager" : "lazy")}
        onError={handleError}
        onLoad={handleLoad}
        style={style}
      />
    );
  }

  const aspectRatio = height && width ? width / height : 4 / 3;
  const displayWidth = width ?? 800;
  const displayHeight = height ?? Math.round(displayWidth / aspectRatio);

  return (
    <Image
      src={resolvedUrl}
      alt={alt ?? "Image"}
      width={displayWidth}
      height={displayHeight}
      quality={quality ?? resolvedOptions.quality}
      className={cn("bg-muted", className)}
      sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
      priority={priority}
      loading={loading ?? (priority ? "eager" : "lazy")}
      onError={handleError}
      onLoad={handleLoad}
      style={style}
    />
  );
}

export interface HeroOptimizedImageProps {
  src?: string | null;
  className?: string;
  quality?: number;
  alt?: string;
  priority?: true;
  sizes?: string;
}

export function HeroOptimizedImage({
  src,
  className,
  quality,
  alt = "Hero image",
  sizes,
}: HeroOptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <div className={cn("bg-black", className)} />;
  }

  const resolvedUrl = getOptimizedImageUrl(src, {
    width: 1920,
    quality: quality ?? 85,
    format: "webp",
    resize: "cover",
  });

  return (
    <Image
      src={resolvedUrl ?? src}
      alt={alt}
      fill
      quality={quality ?? 85}
      sizes={sizes ?? SIZES.hero}
      priority
      loading="eager"
      fetchPriority="high"
      className={cn("object-cover", className)}
      onError={() => setHasError(true)}
    />
  );
}

export interface CardOptimizedImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  quality?: number;
  aspectRatio?: number;
  fallbackSrc?: string;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  loading?: "lazy" | "eager";
  style?: React.CSSProperties;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  onError?: React.ReactEventHandler<HTMLImageElement>;
}

export function CardOptimizedImage({
  src,
  alt = "",
  className,
  quality,
  aspectRatio = 4 / 3,
  fallbackSrc,
  sizes,
  width,
  height,
  priority = false,
  loading,
  style,
  onLoad,
  onError,
}: CardOptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  const resolvedOptions: OptimizedImageOptions = {
    quality: quality ?? 80,
    format: "webp",
    resize: "cover",
  };

  const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    setHasError(true);
    onError?.(e);
  };

  const chainResult = hasError
    ? resolveImageChain(fallbackSrc ?? "/placeholder.svg", undefined, undefined, resolvedOptions)
    : resolveImageChain(src, undefined, fallbackSrc, resolvedOptions);

  const resolvedUrl = chainResult?.url ?? "/placeholder.svg";

  const displayWidth = width ?? 800;
  const displayHeight = height ?? Math.round(displayWidth / aspectRatio);

  return (
    <Image
      src={resolvedUrl}
      alt={alt ?? "Card image"}
      width={displayWidth}
      height={displayHeight}
      quality={quality ?? 80}
      className={cn("bg-muted", className)}
      sizes={sizes ?? SIZES.card}
      priority={priority}
      loading={loading ?? (priority ? "eager" : "lazy")}
      decoding="async"
      onError={handleError}
      onLoad={onLoad}
      style={style}
    />
  );
}
