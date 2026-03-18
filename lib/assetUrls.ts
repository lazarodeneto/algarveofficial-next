/**
 * Supabase Storage URLs for large assets
 * These are hosted on Supabase Storage CDN to reduce build size
 */

const SUPABASE_STORAGE_URL = "https://niylxpvafywjonrphddp.supabase.co/storage/v1/object/public/media";

// Hero assets
export const heroAssets = {
  video: `${SUPABASE_STORAGE_URL}/homepage/hero-video-1771233595369.mp4`,
  poster: `${SUPABASE_STORAGE_URL}/homepage/hero-poster-1770628156832.webp`,
};

// Region images - full size, 800w, and 400w variants
export const regionAssets = {
  "golden-triangle": {
    full: `${SUPABASE_STORAGE_URL}/regions/golden-triangle.webp`,
    w800: `${SUPABASE_STORAGE_URL}/regions/golden-triangle-800w.webp`,
    w400: `${SUPABASE_STORAGE_URL}/regions/golden-triangle-400w.webp`,
  },
  "vilamoura-prestige": {
    full: `${SUPABASE_STORAGE_URL}/regions/vilamoura.webp`,
    w800: `${SUPABASE_STORAGE_URL}/regions/vilamoura-800w.webp`,
    w400: `${SUPABASE_STORAGE_URL}/regions/vilamoura-400w.webp`,
  },
  "carvoeiro-cliffs": {
    full: `${SUPABASE_STORAGE_URL}/regions/carvoeiro.webp`,
    w800: `${SUPABASE_STORAGE_URL}/regions/carvoeiro-800w.webp`,
    w400: `${SUPABASE_STORAGE_URL}/regions/carvoeiro-400w.webp`,
  },
  "lagos-signature": {
    full: `${SUPABASE_STORAGE_URL}/regions/lagos.webp`,
    w800: `${SUPABASE_STORAGE_URL}/regions/lagos-800w.webp`,
    w400: `${SUPABASE_STORAGE_URL}/regions/lagos-400w.webp`,
  },
  "tavira-heritage": {
    full: `${SUPABASE_STORAGE_URL}/regions/tavira.webp`,
    w800: `${SUPABASE_STORAGE_URL}/regions/tavira-800w.webp`,
    w400: `${SUPABASE_STORAGE_URL}/regions/tavira-400w.webp`,
  },
  "sagres-atlantic": {
    full: `${SUPABASE_STORAGE_URL}/regions/sagres.webp`,
    w800: `${SUPABASE_STORAGE_URL}/regions/sagres-800w.webp`,
    w400: `${SUPABASE_STORAGE_URL}/regions/sagres-400w.webp`,
  },
} as const;

export type RegionSlug = keyof typeof regionAssets;
