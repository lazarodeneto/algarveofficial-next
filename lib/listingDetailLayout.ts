import { getCanonicalCategorySlug, type CanonicalCategorySlug } from "@/lib/categoryMerges";

export type ListingDetailLayoutKey =
  | "accommodation"
  | "restaurants"
  | "golf"
  | "beaches"
  | "wellness-spas"
  | "shopping"
  | "private-chefs"
  | "concierge-services"
  | "experiences"
  | "family-attractions"
  | "transportation"
  | "real-estate"
  | "events"
  | "architecture-design"
  | "security-services"
  | null;

const SPECIALIZED_LEGACY_LAYOUTS: Record<string, ListingDetailLayoutKey> = {
  "private-chefs": "private-chefs",
  "family-fun": "family-attractions",
};

const LAYOUT_BY_CANONICAL_CATEGORY: Record<CanonicalCategorySlug, ListingDetailLayoutKey> = {
  accommodation: "accommodation",
  restaurants: "restaurants",
  "beach-clubs": "beaches",
  experiences: "experiences",
  golf: "golf",
  events: "events",
  "family-attractions": "family-attractions",
  "wellness-spas": "wellness-spas",
  beaches: "beaches",
  shopping: "shopping",
  "real-estate": "real-estate",
  "concierge-services": "concierge-services",
  transportation: "transportation",
  "security-services": "security-services",
  "architecture-design": "architecture-design",
};

export function resolveListingDetailLayoutKey(
  categorySlug: string | null | undefined,
): ListingDetailLayoutKey {
  const normalizedSlug = categorySlug?.trim().toLowerCase();
  if (!normalizedSlug) return null;

  const specializedLegacyLayout = SPECIALIZED_LEGACY_LAYOUTS[normalizedSlug];
  if (specializedLegacyLayout) return specializedLegacyLayout;

  const canonicalSlug = getCanonicalCategorySlug(normalizedSlug);
  return canonicalSlug ? (LAYOUT_BY_CANONICAL_CATEGORY[canonicalSlug] ?? null) : null;
}
