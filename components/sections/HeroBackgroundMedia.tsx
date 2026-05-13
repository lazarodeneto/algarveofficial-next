import type { ReactNode } from "react";
import Image from "next/image";

import {
  getHeroMediaRenderState,
  normalizeHeroMediaConfig,
  type HeroMediaType,
} from "@/lib/cms/hero-media";
import { addImageVersion, type ImageVersion } from "@/lib/imageUrls";
import { cn } from "@/lib/utils";

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
  timestamp?: ImageVersion;
}

function hasExplicitMediaType(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized === "none" || normalized === "image" || normalized === "video" || normalized === "youtube" || normalized === "poster";
}

export function HeroBackgroundMedia({
  mediaType,
  imageUrl,
  videoUrl,
  youtubeUrl,
  posterUrl,
  alt,
  fallback,
  className,
  priority = true,
  timestamp,
}: HeroBackgroundMediaProps) {
  const normalizedMedia = normalizeHeroMediaConfig({
    mediaType: mediaType as HeroMediaType | string | undefined,
    imageUrl,
    videoUrl,
    youtubeUrl,
    posterUrl,
  });
  const renderState = getHeroMediaRenderState(normalizedMedia);
  const explicitMediaType = hasExplicitMediaType(mediaType);

  if (renderState.kind === "video") {
    const versionedVideoUrl = addImageVersion(renderState.videoUrl, timestamp) ?? renderState.videoUrl;
    const versionedPosterUrl = addImageVersion(renderState.posterUrl, timestamp) ?? renderState.posterUrl ?? undefined;
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
        poster={versionedPosterUrl}
        tabIndex={-1}
        aria-hidden="true"
        className={cn("pointer-events-none h-full w-full object-cover", className)}
      >
        <source src={versionedVideoUrl} type="video/mp4" />
      </video>
    );
  }

  if (renderState.kind === "image") {
    const versionedImageUrl = addImageVersion(renderState.imageUrl, timestamp) ?? renderState.imageUrl;
    return (
      <Image
        src={versionedImageUrl}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        className={cn("h-full w-full object-cover", className)}
        unoptimized
      />
    );
  }

  if (!explicitMediaType && fallback) {
    return <>{fallback}</>;
  }

  return <div className={cn("h-full w-full bg-black", className)} />;
}
