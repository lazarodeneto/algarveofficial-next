import { normalizePublicImageUrl, buildSupabaseImageUrl, buildSupabaseImageSrcSet, type SupabaseImageTransformOptions } from "@/lib/imageUrls";

export type { SupabaseImageTransformOptions };

export interface OptimizedImageOptions extends SupabaseImageTransformOptions {
  src?: string | null;
  alt?: string;
  fallbackSrc?: string;
  categoryImageUrl?: string | null;
}

const DEFAULT_QUALITY = 80;
const HIGH_QUALITY = 85;
const LOW_QUALITY = 60;

export interface ImageUrlResult {
  url: string | null;
  srcSet: string | undefined;
  width: number;
  height: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getOptimizedImageUrl(
  src: string | null | undefined,
  options: OptimizedImageOptions = {},
): string | null {
  if (!src) return null;
  const normalized = normalizePublicImageUrl(src);
  if (!normalized) return null;

  const quality = options.quality ?? DEFAULT_QUALITY;
  const resolved = buildSupabaseImageUrl(normalized, { ...options, quality: clamp(quality, 20, 100) });
  return resolved;
}

export function getOptimizedImageSrcSet(
  src: string | null | undefined,
  widths: readonly number[],
  options: Omit<SupabaseImageTransformOptions, "width"> = {},
): string | undefined {
  if (!src) return undefined;
  const normalized = normalizePublicImageUrl(src);
  if (!normalized) return undefined;
  const quality = options.quality ?? DEFAULT_QUALITY;
  return buildSupabaseImageSrcSet(normalized, widths, { ...options, quality: clamp(quality, 20, 100) });
}

export interface ResponsiveImageConfig {
  src?: string | null;
  widths?: readonly number[];
  sizes?: string;
  quality?: number;
  aspectRatio?: number;
  objectFit?: "cover" | "contain" | "fill";
}

export function buildResponsiveImage(config: ResponsiveImageConfig): ImageUrlResult {
  const {
    src,
    widths = [320, 640, 960, 1280, 1920],
    quality = DEFAULT_QUALITY,
    aspectRatio = 4 / 3,
  } = config;

  const url = getOptimizedImageUrl(src, { quality });
  const srcSet = getOptimizedImageSrcSet(src, widths, { quality });
  const baseWidth = widths[Math.floor(widths.length / 2)] ?? 800;
  const height = Math.round(baseWidth / aspectRatio);

  return { url, srcSet, width: baseWidth, height };
}

export function getHeroImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  const normalized = normalizePublicImageUrl(src);
  if (!normalized) return null;
  return buildSupabaseImageUrl(normalized, {
    width: 1920,
    quality: HIGH_QUALITY,
    format: "webp",
    resize: "cover",
  });
}

export function getHeroImageSrcSet(src: string | null | undefined): string | undefined {
  if (!src) return undefined;
  const normalized = normalizePublicImageUrl(src);
  if (!normalized) return undefined;
  return buildSupabaseImageSrcSet(normalized, [640, 960, 1280, 1600, 1920, 2560], {
    quality: HIGH_QUALITY,
    format: "webp",
    resize: "cover",
  });
}

export function getCardImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  const normalized = normalizePublicImageUrl(src);
  if (!normalized) return null;
  return buildSupabaseImageUrl(normalized, {
    width: 800,
    quality: DEFAULT_QUALITY,
    format: "webp",
    resize: "cover",
  });
}

export function getCardImageSrcSet(src: string | null | undefined): string | undefined {
  if (!src) return undefined;
  const normalized = normalizePublicImageUrl(src);
  if (!normalized) return undefined;
  return buildSupabaseImageSrcSet(normalized, [200, 400, 600, 800], {
    quality: DEFAULT_QUALITY,
    format: "webp",
    resize: "cover",
  });
}

export function getThumbnailImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  const normalized = normalizePublicImageUrl(src);
  if (!normalized) return null;
  return buildSupabaseImageUrl(normalized, {
    width: 256,
    height: 256,
    quality: LOW_QUALITY,
    format: "webp",
    resize: "cover",
  });
}

export function getOgImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  const normalized = normalizePublicImageUrl(src);
  if (!normalized) return null;
  return buildSupabaseImageUrl(normalized, {
    width: 1200,
    height: 630,
    quality: HIGH_QUALITY,
    format: "webp",
    resize: "cover",
  });
}

export const SIZES = {
  hero: "(max-width: 768px) 100vw, (max-width: 1536px) 100vw, 1920px",
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 33vw",
  cardLg: "(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw",
  thumbnail: "(max-width: 640px) 80px, (max-width: 1024px) 120px, 160px",
  banner: "(max-width: 768px) 100vw, (max-width: 1536px) 80vw, 1200px",
  background: "100vw",
  auto: "100vw",
} as const;

export function isSupabaseImageUrl(src: string): boolean {
  try {
    const url = new URL(src);
    return url.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}
