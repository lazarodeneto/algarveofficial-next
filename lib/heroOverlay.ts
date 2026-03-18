export const HERO_OVERLAY_INTENSITY_SETTING_KEY = "hero_overlay_intensity";
export const HERO_SETTINGS_CATEGORY = "homepage";

export function normalizeHeroOverlayIntensity(value: unknown, fallback = 50): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, parsed));
}
