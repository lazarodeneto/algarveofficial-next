import { getCanonicalCategorySlug } from "@/lib/categoryMerges";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/localized-routing";
import type { CategoryRouteData } from "@/lib/i18n/localized-routing.types";
import {
  ALL_CANONICAL_SLUGS,
  getCategoryUrlSlug,
  type CanonicalCategorySlug,
} from "@/lib/seo/programmatic/category-slugs";

const ROUTABLE_CATEGORY_SLUGS = new Set<string>(
  ALL_CANONICAL_SLUGS.filter((slug) => slug !== "events"),
);

export function buildListingHref({
  slug,
  id,
}: {
  slug?: string | null;
  id?: string | null;
}) {
  const listingSlug = slug?.trim() || id?.trim();
  return listingSlug ? `/listing/${listingSlug}` : "/stay";
}

export function resolveCanonicalCategoryHrefSlug(
  categorySlug?: string | null,
): CanonicalCategorySlug | null {
  const canonical = getCanonicalCategorySlug(categorySlug);
  if (!canonical || !ALL_CANONICAL_SLUGS.includes(canonical as CanonicalCategorySlug)) {
    return null;
  }

  return canonical as CanonicalCategorySlug;
}

export function buildCategoryRouteData(categorySlug?: string | null): CategoryRouteData | null {
  const canonical = resolveCanonicalCategoryHrefSlug(categorySlug);
  if (!canonical || !ROUTABLE_CATEGORY_SLUGS.has(canonical)) return null;

  return {
    routeType: "category",
    slugs: Object.fromEntries(
      SUPPORTED_LOCALES.map((locale) => [locale, getCategoryUrlSlug(canonical, locale)]),
    ) as CategoryRouteData["slugs"],
  };
}

export function buildCategoryHref(categorySlug: string, locale: Locale = DEFAULT_LOCALE) {
  const canonical = resolveCanonicalCategoryHrefSlug(categorySlug);
  if (canonical === "events") {
    return buildLocalizedPath(locale, "events");
  }

  const routeData = buildCategoryRouteData(canonical);
  return routeData ? buildLocalizedPath(locale, routeData) : buildLocalizedPath(locale, "stay");
}

export function buildCityHref(citySlug: string) {
  const slug = citySlug.trim();
  return slug ? `/visit/${slug}` : "/stay";
}
