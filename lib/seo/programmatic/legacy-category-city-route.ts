import type { Locale } from "@/lib/i18n/config";
import {
  ALL_CANONICAL_SLUGS,
  getCanonicalFromUrlSlug,
  getCategoryUrlSlug,
  type CanonicalCategorySlug,
} from "@/lib/seo/programmatic/category-slugs";
import { isValidCitySlug } from "@/lib/seo/programmatic/category-city-data";
import { getCanonicalCategorySlug as getCanonicalListingCategorySlug } from "@/lib/categoryMerges";

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

const LEGACY_CATEGORY_ALIASES: Record<string, string> = {
  activities: "experiences",
};

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

  const canonicalCategory = getCanonicalFromUrlSlug(
    LEGACY_CATEGORY_ALIASES[categorySegment] ?? categorySegment,
    locale,
  ) ??
    (() => {
      const alias = getCanonicalListingCategorySlug(
        LEGACY_CATEGORY_ALIASES[categorySegment] ?? categorySegment,
      );
      return alias && ALL_CANONICAL_SLUGS.includes(alias as CanonicalCategorySlug)
        ? (alias as CanonicalCategorySlug)
        : null;
    })();
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
