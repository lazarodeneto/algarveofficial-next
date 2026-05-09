import { normalizeSlug, slugifyEntityName } from "@/lib/slugify";

export type ListingSlugSuggestionInput = {
  name: string | null | undefined;
  cityName?: string | null;
  citySlug?: string | null;
  categorySlug?: string | null;
};

export type ListingUrlInput = {
  slug: string | null | undefined;
  categorySlug?: string | null;
};

const GOLF_CATEGORY_SLUGS = new Set(["golf", "golf-course", "golf-courses", "golf-tournaments"]);

function normalizeCategorySlug(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase().replace(/[_\s]+/g, "-");
}

export function isGolfListingCategorySlug(value: string | null | undefined) {
  return GOLF_CATEGORY_SLUGS.has(normalizeCategorySlug(value));
}

export function suggestListingCanonicalSlug(input: ListingSlugSuggestionInput) {
  const nameSlug = slugifyEntityName(input.name, { entityType: "listing" });
  if (!nameSlug) return "";

  if (isGolfListingCategorySlug(input.categorySlug)) {
    return nameSlug;
  }

  // Current project convention generates listing slugs from the listing name.
  // Keep this centralized so a future name-city convention can be changed in one place.
  return nameSlug;
}

export function normalizeListingCanonicalSlug(value: string | null | undefined) {
  return normalizeSlug(value, { entityType: "listing" });
}

export function buildListingCanonicalPath(input: ListingUrlInput) {
  const slug = normalizeListingCanonicalSlug(input.slug);
  if (!slug) return "";

  return isGolfListingCategorySlug(input.categorySlug)
    ? `/golf/courses/${slug}`
    : `/listing/${slug}`;
}
