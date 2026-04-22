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
  if (normalized === "youtube") return "youtube";
  if (normalized === "poster") return "poster";
  return "image";
}

function extractYouTubeVideoId(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();

    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (host.endsWith("youtube.com")) {
      if (url.pathname === "/watch") {
        return url.searchParams.get("v");
      }

      const segments = url.pathname.split("/").filter(Boolean);
      const embedIndex = segments.findIndex((segment) => segment === "embed" || segment === "shorts" || segment === "live");
      if (embedIndex >= 0) {
        return segments[embedIndex + 1] ?? null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function getYouTubeEmbedUrl(rawUrl: string): string | null {
  const videoId = extractYouTubeVideoId(rawUrl);
  if (!videoId) return null;

  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    controls: "0",
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
    playlist: videoId,
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
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
  const resolvedMediaType = normalizeMediaType(mediaType);
  const trimmedImageUrl = addCacheBust(imageUrl?.trim() ?? "", timestamp);
  const trimmedVideoUrl = videoUrl?.trim() ?? "";
  const trimmedYoutubeUrl = youtubeUrl?.trim() ?? "";
  const trimmedPosterUrl = addCacheBust(posterUrl?.trim() ?? "", timestamp);
  const hasImage = trimmedImageUrl.length > 0;
  const hasVideo = trimmedVideoUrl.length > 0;
  const hasPoster = trimmedPosterUrl.length > 0;
  const youtubeEmbedUrl = trimmedYoutubeUrl ? getYouTubeEmbedUrl(trimmedYoutubeUrl) : null;

  const resolvedPosterUrl = hasPoster ? trimmedPosterUrl : hasImage ? trimmedImageUrl : undefined;

  if (resolvedMediaType === "video" && hasVideo) {
    return (
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={resolvedPosterUrl}
        className={cn("h-full w-full object-cover", className)}
      >
        <source src={trimmedVideoUrl} type="video/mp4" />
      </video>
    );
  }

  if (resolvedMediaType === "youtube" && youtubeEmbedUrl) {
    return (
      <iframe
        src={youtubeEmbedUrl}
        title={alt}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className={cn("h-full w-full border-0 object-cover", className)}
      />
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
