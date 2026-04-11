import type { Locale } from "@/lib/i18n/config";
import {
  getCanonicalFromUrlSlug,
  getCategoryUrlSlug,
} from "@/lib/seo/programmatic/category-slugs";
import { isValidCitySlug } from "@/lib/seo/programmatic/category-city-data";

const RESERVED_TOP_LEVEL_SEGMENTS = new Set([
  "about-us",
  "admin",
  "auth",
  "blog",
  "contact",
  "cookie-policy",
  "dashboard",
  "destinations",
  "directory",
  "events",
  "invest",
  "listing",
  "live",
  "login",
  "map",
  "owner",
  "partner",
  "pricing",
  "privacy-policy",
  "properties",
  "real-estate",
  "residence",
  "signup",
  "stay",
  "terms",
  "trips",
  "visit",
]);

export interface LegacyCategoryCityRouteMatch {
  categorySlug: string;
  citySlug: string;
  canonicalPath: string;
}

export function resolveLegacyCategoryCityRoute(
  locale: Locale,
  legacyCategorySegment: string,
  legacyCitySegment: string,
): LegacyCategoryCityRouteMatch | null {
  const categorySegment = legacyCategorySegment.trim().toLowerCase();
  const citySegment = legacyCitySegment.trim().toLowerCase();

  if (
    !categorySegment ||
    !citySegment ||
    RESERVED_TOP_LEVEL_SEGMENTS.has(categorySegment) ||
    !isValidCitySlug(citySegment)
  ) {
    return null;
  }

  const canonicalCategory = getCanonicalFromUrlSlug(categorySegment, locale);
  if (!canonicalCategory) {
    return null;
  }

  const localizedCategorySlug = getCategoryUrlSlug(canonicalCategory, locale);

  return {
    categorySlug: localizedCategorySlug,
    citySlug: citySegment,
    canonicalPath: `/visit/${citySegment}/${localizedCategorySlug}`,
  };
}
