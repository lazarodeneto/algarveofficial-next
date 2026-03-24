/**
 * REFACTORED [city]/[category] Page Pattern
 *
 * This shows how to refactor the current page to use centralized SEO helpers
 * and avoid hardcoded "en" logic.
 *
 * Key changes:
 * ✅ Use buildLocalizedMetadata() instead of inline metadata
 * ✅ Use buildCanonicalUrl() for consistent canonical URLs
 * ✅ Use buildHreflangs() instead of manual hreflang generation
 * ✅ Remove hardcoded: locale === "en" ? ... : ... logic
 * ✅ Consistent locale prefix everywhere
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";

import {
  SUPPORTED_LOCALES,
  LOCALE_CONFIGS,
  isValidLocale,
  type Locale,
} from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import {
  buildCanonicalUrl,
  buildHreflangs,
} from "@/lib/i18n/seo";
import {
  getCanonicalFromUrlSlug,
  getCategoryUrlSlug,
  getCategoryDisplayName,
  ALL_CANONICAL_SLUGS,
  type CanonicalCategorySlug,
} from "@/lib/seo/programmatic/category-slugs";
import {
  getAllCategoryCityCombinations,
  getCategoryCityPageData,
  isValidCitySlug,
} from "@/lib/seo/programmatic/category-city-data";

interface PageParams {
  locale: string;
  city: string;
  category: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export const revalidate = 3600;

export async function generateStaticParams(): Promise<PageParams[]> {
  const combinations = await getAllCategoryCityCombinations();
  const params: PageParams[] = [];

  for (const { categorySlug, citySlug } of combinations) {
    if (!ALL_CANONICAL_SLUGS.includes(categorySlug as CanonicalCategorySlug)) continue;

    for (const locale of SUPPORTED_LOCALES) {
      params.push({
        locale,
        city: citySlug,
        category: getCategoryUrlSlug(categorySlug as CanonicalCategorySlug, locale),
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, city: citySlug, category: categoryUrlSlug } = await params;

  if (!isValidLocale(rawLocale)) return {};
  const locale = rawLocale as Locale;

  if (!isValidCitySlug(citySlug)) return {};

  const canonical = getCanonicalFromUrlSlug(categoryUrlSlug, locale);
  if (!canonical) return {};

  const data = await getCategoryCityPageData(canonical, citySlug);
  if (!data) return {};

  // Build the page path (without locale prefix)
  const pagePath = `/${citySlug}/${categoryUrlSlug}`;

  // Get category display name for the title
  const categoryName = getCategoryDisplayName(canonical, locale);
  const title = `${categoryName} in ${data.city.name}`;
  const description = `${categoryName} in ${data.city.name}, Algarve. Browse ${data.totalCount} curated listings.`;

  /**
   * BEFORE (hardcoded logic):
   * const canonical_url = locale === "en"
   *   ? `${siteUrl}/${citySlug}/${categoryUrlSlug}`
   *   : `${siteUrl}/${locale}/${citySlug}/${categoryUrlSlug}`;
   *
   * AFTER (uses helper):
   */
  return buildLocalizedMetadata({
    locale,
    path: pagePath,
    title,
    description,
    image: data.city.image_url || undefined,
    type: "website",
    keywords: [
      categoryName.toLowerCase(),
      data.city.name.toLowerCase(),
      "Algarve",
      "Portugal",
    ],
  });
}

export default async function CityCategoryPage({ params }: PageProps) {
  const { locale: rawLocale, city: citySlug, category: categoryUrlSlug } = await params;

  if (!isValidLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;

  if (!isValidCitySlug(citySlug)) notFound();

  const canonical = getCanonicalFromUrlSlug(categoryUrlSlug, locale);
  if (!canonical) notFound();

  const data = await getCategoryCityPageData(canonical, citySlug);
  if (!data) notFound();

  // Build hreflang links for the sr-only section
  const pagePath = `/${citySlug}/${categoryUrlSlug}`;
  const hreflangs = buildHreflangs(pagePath);

  return (
    <>
      {/* Schema markup scripts */}
      {/* ... */}

      <main>
        {/* Hreflang links for screen readers and search engines */}
        <div className="sr-only" aria-hidden="true">
          {Object.entries(hreflangs).map(([hreflang, url]) => (
            <Link
              key={hreflang}
              href={url}
              hrefLang={hreflang}
              data-hreflang={hreflang}
            >
              {getCategoryDisplayName(canonical, locale as Locale)} in {data.city.name}
            </Link>
          ))}
        </div>

        {/* Page content */}
        {/* ... */}
      </main>
    </>
  );
}

/**
 * KEY IMPROVEMENTS:
 *
 * 1. Canonical URLs:
 *    - Before: locale === "en" ? ... : ... (hardcoded logic)
 *    - After: buildCanonicalUrl() handles all locales consistently
 *
 * 2. hreflang Generation:
 *    - Before: Manual loop with hardcoded conditions
 *    - After: buildHreflangs() returns complete object
 *
 * 3. URL Pattern:
 *    - Before: /path for en, /locale/path for others
 *    - After: /locale/path for ALL locales (consistent)
 *
 * 4. Maintainability:
 *    - Before: Logic spread across multiple files
 *    - After: Centralized in lib/i18n/seo.ts
 *
 * 5. Scalability:
 *    - Before: Adding new locale requires code changes
 *    - After: Works automatically with SUPPORTED_LOCALES
 */
