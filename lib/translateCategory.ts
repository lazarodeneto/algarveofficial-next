import { TFunction } from "i18next";
import { getCanonicalCategorySlug } from "@/lib/categoryMerges";

const LEGACY_CATEGORY_RENAMES: Record<string, string> = {
  "Premium Accommodation": "Places to Stay",
  Accommodation: "Places to Stay",
  "Places to Stay": "Places to Stay",
  "Place to Stay": "Places to Stay",
  "Restaurants & Michelin": "Restaurants",
  "Private Dining": "Restaurants",
  "Concierge Services": "Algarve Services",
  "Prime Real Estate": "Algarve Services",
  "VIP Transportation": "Algarve Services",
  "Architecture & Decoration": "Algarve Services",
  "Protection Services": "Algarve Services",
  "Premium Experience": "Things to Do",
  "Premium Experiences": "Things to Do",
  "Algarve Experience": "Things to Do",
  "Family Attractions": "Things to Do",
  "Things to Do": "Things to Do",
  "Premier Events": "What's On",
  "What's On": "What's On",
};

/**
 * Returns the translated category name using its slug,
 * falling back to the raw DB name if no translation key exists.
 */
export function translateCategoryName(
  t: TFunction,
  slug?: string | null,
  fallbackName?: string | null
): string {
  const canonicalSlug = getCanonicalCategorySlug(slug);
  if (!canonicalSlug) return fallbackName || "";

  const key = `categoryNames.${canonicalSlug}`;
  const translated = t(key);
  if (translated !== key) return translated;

  if (fallbackName && LEGACY_CATEGORY_RENAMES[fallbackName]) {
    return LEGACY_CATEGORY_RENAMES[fallbackName];
  }

  return fallbackName || canonicalSlug;
}
