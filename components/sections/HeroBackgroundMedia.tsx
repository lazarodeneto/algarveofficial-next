import type { ReactNode } from "react";
import Image from "next/image";
import { useRef } from "react";

import { cn } from "@/lib/utils";

function addCacheBust(url: string, timestamp?: number): string {
  if (!url || url.startsWith("data:") || url.startsWith("//") || url.startsWith("/")) return url;
  const separator = url.includes("?") ? "&" : "?";
  const t = timestamp ?? 0;
  return t > 0 ? `${url}${separator}_t=${t}` : url;
}

export type HeroMediaType = "image" | "video" | "youtube" | "poster";

interface HeroBackgroundMediaProps {
  mediaType?: string;
  imageUrl?: string;
  videoUrl?: string;
  youtubeUrl?: string;
  posterUrl?: string;
  alt: string;
  fallback?: ReactNode;
  className?: string;
  priority?: boolean;
  timestamp?: number;
}

function normalizeMediaType(value: string | undefined): HeroMediaType {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "video") return "video";
  if (normalized === "youtube") return "poster";
  if (normalized === "poster") return "poster";
  return "image";
}

export function HeroBackgroundMedia({
  mediaType,
  imageUrl,
  videoUrl,
  posterUrl,
  alt,
  fallback,
  className,
  priority = true,
  timestamp,
}: HeroBackgroundMediaProps) {
  const resolvedMediaType = normalizeMediaType(mediaType);
  const trimmedImageUrl = addCacheBust(imageUrl?.trim() ?? "", timestamp);
  const trimmedVideoUrl = videoUrl?.trim() ?? "";
  const trimmedPosterUrl = addCacheBust(posterUrl?.trim() ?? "", timestamp);
  const hasImage = trimmedImageUrl.length > 0;
  const hasVideo = trimmedVideoUrl.length > 0;
  const hasPoster = trimmedPosterUrl.length > 0;

  const resolvedPosterUrl = hasPoster ? trimmedPosterUrl : hasImage ? trimmedImageUrl : undefined;

  if (resolvedMediaType === "video" && hasVideo) {
    return (
      <video
        autoPlay
        controls={false}
        controlsList="nodownload nofullscreen noplaybackrate noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        loop
        muted
        playsInline
        preload="metadata"
        poster={resolvedPosterUrl}
        tabIndex={-1}
        aria-hidden="true"
        className={cn("pointer-events-none h-full w-full object-cover", className)}
      >
        <source src={trimmedVideoUrl} type="video/mp4" />
      </video>
    );
  }

  if ((resolvedMediaType === "poster" && hasPoster) || hasImage) {
    return (
      <Image
        src={resolvedMediaType === "poster" && hasPoster ? trimmedPosterUrl : trimmedImageUrl}
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
