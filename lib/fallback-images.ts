"use client";

export const FALLBACK_IMAGE_BASE = "https://niylxpvafywjonrphddp.supabase.co/storage/v1/object/public/media/fallback";

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  "accommodation": `${FALLBACK_IMAGE_BASE}/accommodation.webp`,
  "restaurants": `${FALLBACK_IMAGE_BASE}/restaurant.webp`,
  "golf": `${FALLBACK_IMAGE_BASE}/golf.webp`,
  "beach-clubs": `${FALLBACK_IMAGE_BASE}/beach.webp`,
  "experiences": `${FALLBACK_IMAGE_BASE}/experiences.webp`,
  "wellness-spas": `${FALLBACK_IMAGE_BASE}/wellness.webp`,
  "concierge-services": `${FALLBACK_IMAGE_BASE}/concierge.webp`,
  "transportation": `${FALLBACK_IMAGE_BASE}/transportation.webp`,
  "real-estate": `${FALLBACK_IMAGE_BASE}/realestate.webp`,
  "events": `${FALLBACK_IMAGE_BASE}/events.webp`,
  "family-attractions": `${FALLBACK_IMAGE_BASE}/family.webp`,
  "architecture-design": `${FALLBACK_IMAGE_BASE}/architecture.webp`,
  "shopping": `${FALLBACK_IMAGE_BASE}/shopping.webp`,
  "beaches": `${FALLBACK_IMAGE_BASE}/beach.webp`,
};

export function getCategoryFallbackImageUrl(categorySlug: string | undefined | null): string | null {
  if (!categorySlug) return null;
  
  const normalizedSlug = categorySlug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  
  return CATEGORY_FALLBACK_IMAGES[normalizedSlug] ?? null;
}

export function normalizeFallbackImageUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  
  if (url.includes("cdn.yoursite.com") || url.includes("yoursite.com")) {
    return null;
  }
  
  return url;
}