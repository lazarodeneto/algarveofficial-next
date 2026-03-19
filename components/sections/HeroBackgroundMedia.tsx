import type { ReactNode } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type HeroMediaType = "image" | "video";

interface HeroBackgroundMediaProps {
  mediaType?: string;
  imageUrl?: string;
  videoUrl?: string;
  alt: string;
  fallback?: ReactNode;
  className?: string;
  priority?: boolean;
}

function normalizeMediaType(value: string | undefined): HeroMediaType {
  const normalized = value?.trim().toLowerCase();
  return normalized === "video" ? "video" : "image";
}

export function HeroBackgroundMedia({
  mediaType,
  imageUrl,
  videoUrl,
  alt,
  fallback,
  className,
  priority = true,
}: HeroBackgroundMediaProps) {
  const resolvedMediaType = normalizeMediaType(mediaType);
  const trimmedImageUrl = imageUrl?.trim() ?? "";
  const trimmedVideoUrl = videoUrl?.trim() ?? "";
  const hasImage = trimmedImageUrl.length > 0;
  const hasVideo = trimmedVideoUrl.length > 0;

  if (resolvedMediaType === "video" && hasVideo) {
    return (
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={hasImage ? trimmedImageUrl : undefined}
        className={cn("h-full w-full object-cover", className)}
      >
        <source src={trimmedVideoUrl} type="video/mp4" />
      </video>
    );
  }

  if (hasImage) {
    return (
      <Image
        src={trimmedImageUrl}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        className={cn("h-full w-full object-cover", className)}
        unoptimized
      />
    );
  }

  return fallback ? <>{fallback}</> : <div className={cn("h-full w-full bg-black", className)} />;
}
