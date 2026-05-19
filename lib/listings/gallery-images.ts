import { normalizePublicImageUrl } from "@/lib/imageUrls";

export type ListingGalleryImageSource = "featured" | "gallery" | "fallback" | "external" | "storage";

export type ListingGalleryImageInput = {
  id?: string | null;
  url?: string | null;
  image_url?: string | null;
  alt?: string | null;
  alt_text?: string | null;
  caption?: string | null;
  display_order?: number | null;
  is_featured?: boolean | null;
  source?: ListingGalleryImageSource | null;
};

export type ListingGalleryImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  caption?: string | null;
  display_order: number | null;
  is_featured: boolean;
  source: ListingGalleryImageSource;
  visual_key?: string | null;
};

export type ListingGalleryTier = "unverified" | "verified" | "signature";
export type ListingGalleryLayout = "single" | "standard" | "featured-grid";

export type ListingGalleryPolicy = {
  tier: ListingGalleryTier;
  maxImages: number;
  layout: ListingGalleryLayout;
  canOpenGalleryModal: boolean;
};

export type TieredListingGalleryImages = {
  images: ListingGalleryImage[];
  policy: ListingGalleryPolicy;
};

export type ListingGalleryThumbnail = {
  image: ListingGalleryImage;
  index: number;
};

type BuildListingGalleryImagesOptions = {
  featuredImageUrl?: string | null;
  galleryImages?: ListingGalleryImageInput[] | null;
  fallbackImageUrl?: string | null;
  listingName?: string | null;
  maxImages?: number | null;
};

type BuildTieredListingGalleryImagesOptions = Omit<BuildListingGalleryImagesOptions, "maxImages"> & {
  tier?: unknown;
};

const TRANSFORM_QUERY_PARAMS = new Set([
  "auto",
  "blur",
  "cache",
  "crop",
  "dpr",
  "fit",
  "fm",
  "format",
  "h",
  "height",
  "ixlib",
  "q",
  "quality",
  "resize",
  "t",
  "updated",
  "v",
  "w",
  "width",
]);

const SUPABASE_PUBLIC_OBJECT_SEGMENT = "/storage/v1/object/public/";
const SUPABASE_PUBLIC_RENDER_SEGMENT = "/storage/v1/render/image/public/";

export function normalizeListingImageUrl(value?: string | null): string | null {
  const normalized = normalizePublicImageUrl(value);
  if (!normalized) return null;

  return normalized;
}

export function getCanonicalImageKey(value: string): string {
  const normalized = normalizeListingImageUrl(value);
  if (!normalized) return "";

  try {
    const isLocalPath = normalized.startsWith("/") && !normalized.startsWith("//");
    const url = new URL(normalized, "https://algarveofficial.local");
    const protocol = url.protocol.toLowerCase();
    const host = url.host.toLowerCase();
    const pathname = normalizeImagePathname(url.pathname);
    const searchParams = getCanonicalSearchParams(url.searchParams);
    const search = searchParams ? `?${searchParams}` : "";

    if (isLocalPath) return `local:${pathname}${search}`;

    return `${protocol}//${host}${pathname}${search}`;
  } catch {
    return normalized.trim().replace(/\/+$/, "");
  }
}

export function buildListingGalleryImages({
  featuredImageUrl,
  galleryImages,
  fallbackImageUrl,
  listingName,
  maxImages,
}: BuildListingGalleryImagesOptions): ListingGalleryImage[] {
  const candidates: ListingGalleryImage[] = [];
  const featuredUrl = normalizeListingImageUrl(featuredImageUrl);

  if (featuredUrl) {
    candidates.push({
      id: "featured",
      image_url: featuredUrl,
      alt_text: listingName ?? null,
      display_order: 0,
      is_featured: true,
      source: "featured",
    });
  }

  getSortedGalleryInputs(galleryImages).forEach((image, index) => {
    const imageUrl = normalizeListingImageUrl(image.image_url ?? image.url);
    if (!imageUrl) return;
    const providedAltText = image.alt_text ?? image.alt ?? null;

    candidates.push({
      id: image.id?.trim() || `gallery-${index}`,
      image_url: imageUrl,
      alt_text: providedAltText ?? listingName ?? null,
      caption: image.caption ?? null,
      display_order: image.display_order ?? index + 1,
      is_featured: Boolean(image.is_featured),
      source: image.source ?? "gallery",
      visual_key: getAssetAltVisualKey(providedAltText),
    });
  });

  const uniqueImages = dedupeListingGalleryImages(candidates);
  const limitedImages = limitGalleryImages(uniqueImages, maxImages);

  if (limitedImages.length > 0) {
    return limitedImages;
  }

  const fallbackUrl = normalizeListingImageUrl(fallbackImageUrl);
  if (!fallbackUrl) return [];

  return [
    {
      id: "fallback",
      image_url: fallbackUrl,
      alt_text: listingName ?? null,
      display_order: 0,
      is_featured: false,
      source: "fallback",
    },
  ];
}

export function dedupeListingGalleryImages(images: ListingGalleryImage[]): ListingGalleryImage[] {
  const seenUrls = new Set<string>();
  const seenVisualKeys = new Set<string>();
  const uniqueImages: ListingGalleryImage[] = [];

  images.forEach((image) => {
    const imageUrl = normalizeListingImageUrl(image.image_url);
    if (!imageUrl) return;

    const canonicalKey = getCanonicalImageKey(imageUrl);
    const visualKey = image.visual_key ?? null;
    if (!canonicalKey || seenUrls.has(canonicalKey) || (visualKey && seenVisualKeys.has(visualKey))) {
      return;
    }

    seenUrls.add(canonicalKey);
    if (visualKey) seenVisualKeys.add(visualKey);
    uniqueImages.push({
      ...image,
      image_url: imageUrl,
    });
  });

  return uniqueImages;
}

export function getListingGalleryThumbnails(
  images: ListingGalleryImage[],
  currentIndex = 0,
  limit = 4,
): ListingGalleryThumbnail[] {
  if (images.length <= 1 || limit <= 0) return [];

  const safeCurrentIndex = images[currentIndex] ? currentIndex : 0;

  return images
    .map((image, index) => ({ image, index }))
    .filter(({ index }) => index !== safeCurrentIndex)
    .slice(0, limit);
}

function getSortedGalleryInputs(images?: ListingGalleryImageInput[] | null): ListingGalleryImageInput[] {
  return [...(images ?? [])].sort((first, second) => {
    if (Boolean(first.is_featured) !== Boolean(second.is_featured)) {
      return first.is_featured ? -1 : 1;
    }

    const firstOrder = first.display_order ?? Number.MAX_SAFE_INTEGER;
    const secondOrder = second.display_order ?? Number.MAX_SAFE_INTEGER;
    return firstOrder - secondOrder;
  });
}

function normalizeImagePathname(pathname: string): string {
  const normalizedStoragePath = pathname.replace(SUPABASE_PUBLIC_RENDER_SEGMENT, SUPABASE_PUBLIC_OBJECT_SEGMENT);
  const withoutTrailingSlash = normalizedStoragePath.replace(/\/+$/, "");
  return withoutTrailingSlash || "/";
}

function getCanonicalSearchParams(searchParams: URLSearchParams): string {
  const preservedParams = new URLSearchParams();

  searchParams.forEach((paramValue, paramKey) => {
    if (TRANSFORM_QUERY_PARAMS.has(paramKey.toLowerCase())) return;
    preservedParams.append(paramKey, paramValue);
  });

  preservedParams.sort();
  return preservedParams.toString();
}

function getAssetAltVisualKey(value?: string | null): string | null {
  const rawValue = value?.trim();
  if (!rawValue) return null;

  const copyNormalizedValue = rawValue
    .replace(/\s*\(\d+\)\s*$/g, "")
    .replace(/[-_\s]+copy(?:[-_\s]*\d+)?$/i, "");
  const lowerValue = copyNormalizedValue.toLowerCase();
  const normalizedValue = lowerValue
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  if (!normalizedValue || !/\d/.test(normalizedValue)) return null;

  const looksLikeAssetName =
    /[-_]/.test(copyNormalizedValue) ||
    /\b(img|image|photo|gallery|dsc|algarveofficial)\b/i.test(copyNormalizedValue) ||
    lowerValue.includes("algarveofficial");

  return looksLikeAssetName ? `asset-alt:${normalizedValue}` : null;
}

function limitGalleryImages(images: ListingGalleryImage[], maxImages?: number | null): ListingGalleryImage[] {
  if (typeof maxImages !== "number" || !Number.isFinite(maxImages) || maxImages <= 0) {
    return images;
  }

  return images.slice(0, Math.floor(maxImages));
}

export function normalizeListingGalleryTier(value: unknown): ListingGalleryTier {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (["signature", "signature_partner", "signature_partners", "curated"].includes(normalized)) {
    return "signature";
  }

  if (["verified", "verified_business", "verified_partner"].includes(normalized)) {
    return "verified";
  }

  return "unverified";
}

export function getListingGalleryPolicy(
  tier: unknown,
  uniqueImageCount: number,
): ListingGalleryPolicy {
  const resolvedTier = normalizeListingGalleryTier(tier);
  const maxImages = resolvedTier === "signature" ? 20 : resolvedTier === "verified" ? 10 : 1;
  const allowedImageCount = Math.min(Math.max(uniqueImageCount, 0), maxImages);
  const isPremiumTier = resolvedTier === "verified" || resolvedTier === "signature";

  return {
    tier: resolvedTier,
    maxImages,
    layout: !isPremiumTier || allowedImageCount <= 1
      ? "single"
      : allowedImageCount > 5
        ? "featured-grid"
        : "standard",
    canOpenGalleryModal: isPremiumTier && allowedImageCount > 1,
  };
}

export function applyListingGalleryPolicy(
  images: ListingGalleryImage[],
  tier: unknown,
): TieredListingGalleryImages {
  const policy = getListingGalleryPolicy(tier, images.length);
  return {
    images: images.slice(0, policy.maxImages),
    policy,
  };
}

export function buildTieredListingGalleryImages({
  tier,
  ...options
}: BuildTieredListingGalleryImagesOptions): TieredListingGalleryImages {
  return applyListingGalleryPolicy(buildListingGalleryImages(options), tier);
}

export function getAllowedListingGalleryImageInputs<T extends ListingGalleryImageInput>({
  featuredImageUrl,
  galleryImages,
  fallbackImageUrl,
  listingName,
  tier,
}: BuildTieredListingGalleryImagesOptions & { galleryImages?: T[] | null }): T[] {
  const { images } = buildTieredListingGalleryImages({
    featuredImageUrl,
    galleryImages,
    fallbackImageUrl,
    listingName,
    tier,
  });
  const allowedGalleryKeys = new Set(
    images
      .filter((image) => image.source !== "featured" && image.source !== "fallback")
      .map((image) => getCanonicalImageKey(image.image_url)),
  );
  if (allowedGalleryKeys.size === 0) return [];

  const seenGalleryKeys = new Set<string>();
  return getSortedGalleryInputs(galleryImages)
    .filter((image) => {
      const imageUrl = normalizeListingImageUrl(image.image_url ?? image.url);
      if (!imageUrl) return false;
      const canonicalKey = getCanonicalImageKey(imageUrl);
      if (!allowedGalleryKeys.has(canonicalKey) || seenGalleryKeys.has(canonicalKey)) {
        return false;
      }

      seenGalleryKeys.add(canonicalKey);
      return true;
    }) as T[];
}
