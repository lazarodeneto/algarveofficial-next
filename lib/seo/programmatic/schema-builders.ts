import type { Locale } from "@/lib/i18n/config";
import type { ProgrammaticListing } from "./category-city-data";
import type { CanonicalCategorySlug } from "./category-slugs";
import { getCategoryDisplayName } from "./category-slugs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://algarveofficial.com";

/**
 * Builds a locale-aware path.
 * English has no prefix: /city/category
 * Other locales prefix:  /pt-pt/city/category
 */
function localePath(locale: Locale, path: string): string {
  return locale === "en" ? path : `/${locale}${path}`;
}

// ─── ItemList schema ───────────────────────────────────────────────────────────

/**
 * Generates an ItemList JSON-LD schema for a programmatic city+category page.
 * This directly contributes to rich results in Google Search.
 * URL STRUCTURE: /[city]/[category] (en) | /[locale]/[city]/[category] (others)
 */
export function buildItemListSchema(
  locale: Locale,
  canonical: CanonicalCategorySlug,
  cityName: string,
  citySlug: string,
  categoryUrlSlug: string,
  listings: ProgrammaticListing[],
) {
  const categoryName = getCategoryDisplayName(canonical, locale);
  const pageUrl = `${SITE_URL}${localePath(locale, `/${citySlug}/${categoryUrlSlug}`)}`;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${categoryName} in ${cityName}, Algarve`,
    description: `Curated list of the best ${categoryName.toLowerCase()} in ${cityName}, Algarve — verified by AlgarveOfficial.`,
    url: pageUrl,
    numberOfItems: listings.length,
    itemListElement: listings.slice(0, 20).map((listing, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "LocalBusiness",
        name: listing.name,
        url: `${SITE_URL}${localePath(locale, `/listing/${listing.slug}`)}`,
        ...(listing.featured_image_url && {
          image: listing.featured_image_url,
        }),
        ...(listing.short_description && {
          description: listing.short_description,
        }),
        ...(listing.google_rating !== null && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: listing.google_rating,
            reviewCount: listing.google_review_count ?? 1,
            bestRating: 5,
            worstRating: 1,
          },
        }),
        address: {
          "@type": "PostalAddress",
          addressLocality: cityName,
          addressRegion: "Algarve",
          addressCountry: "PT",
        },
      },
    })),
  };
}

// ─── BreadcrumbList schema ─────────────────────────────────────────────────────
/**
 * URL STRUCTURE: /[city]/[category] (en) | /[locale]/[city]/[category] (others)
 * Breadcrumb: Home > City > Category
 */
export function buildBreadcrumbSchema(
  locale: Locale,
  canonical: CanonicalCategorySlug,
  cityName: string,
  citySlug: string,
  categoryUrlSlug: string,
) {
  const categoryName = getCategoryDisplayName(canonical, locale);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}${localePath(locale, "/")}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: cityName,
        item: `${SITE_URL}${localePath(locale, `/${citySlug}`)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryName,
        item: `${SITE_URL}${localePath(locale, `/${citySlug}/${categoryUrlSlug}`)}`,
      },
    ],
  };
}

// ─── CollectionPage schema ────────────────────────────────────────────────────
/**
 * URL STRUCTURE: /[city]/[category] (en) | /[locale]/[city]/[category] (others)
 */
export function buildCollectionPageSchema(
  locale: Locale,
  canonical: CanonicalCategorySlug,
  cityName: string,
  citySlug: string,
  categoryUrlSlug: string,
  count: number,
) {
  const categoryName = getCategoryDisplayName(canonical, locale);
  const pageUrl = `${SITE_URL}${localePath(locale, `/${citySlug}/${categoryUrlSlug}`)}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${categoryName} in ${cityName}, Algarve`,
    url: pageUrl,
    description: `Discover ${count} premium ${categoryName.toLowerCase()} in ${cityName}, Algarve.`,
    about: {
      "@type": "Place",
      name: `${cityName}, Algarve`,
      address: {
        "@type": "PostalAddress",
        addressLocality: cityName,
        addressRegion: "Algarve",
        addressCountry: "PT",
      },
    },
    publisher: {
      "@type": "Organization",
      name: "AlgarveOfficial",
      url: SITE_URL,
    },
  };
}
