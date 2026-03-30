import type { Locale } from "@/lib/i18n/config";
import type { ProgrammaticListing } from "./category-city-data";
import type { CanonicalCategorySlug } from "./category-slugs";
import { getCategoryDisplayName, getCategoryUrlSlug } from "./category-slugs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://algarveofficial.com";

/**
 * Builds a locale-aware path for the App Router locale-prefixed structure.
 */
function localePath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalized === "/" ? "" : normalized}`;
}

// ─── ItemList schema ───────────────────────────────────────────────────────────

/**
 * Generates an ItemList JSON-LD schema for a programmatic /visit/city/category page.
 * This directly contributes to rich results in Google Search.
 */
export function buildItemListSchema(
  locale: Locale,
  canonical: CanonicalCategorySlug,
  cityName: string,
  citySlug: string,
  categoryUrlSlug: string,
  listings: ProgrammaticListing[],
) {
  if (listings.length === 0) {
    return null;
  }

  const categoryName = getCategoryDisplayName(canonical, locale);
  const pageUrl = `${SITE_URL}${localePath(locale, `/visit/${citySlug}/${categoryUrlSlug}`)}`;

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
 * Breadcrumb: Home > Visit > City > Category
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
        name: "Visit",
        item: `${SITE_URL}${localePath(locale, "/visit")}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cityName,
        item: `${SITE_URL}${localePath(locale, `/visit/${citySlug}`)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: categoryName,
        item: `${SITE_URL}${localePath(locale, `/visit/${citySlug}/${categoryUrlSlug}`)}`,
      },
    ],
  };
}

// ─── CollectionPage schema ────────────────────────────────────────────────────
export function buildCollectionPageSchema(
  locale: Locale,
  canonical: CanonicalCategorySlug,
  cityName: string,
  citySlug: string,
  categoryUrlSlug: string,
  count: number,
) {
  const categoryName = getCategoryDisplayName(canonical, locale);
  const pageUrl = `${SITE_URL}${localePath(locale, `/visit/${citySlug}/${categoryUrlSlug}`)}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${categoryName} in ${cityName}, Algarve`,
    url: pageUrl,
    description:
      count > 0
        ? `Discover ${count} premium ${categoryName.toLowerCase()} in ${cityName}, Algarve.`
        : `Explore ${categoryName.toLowerCase()} in ${cityName}, Algarve. New listings are being added.`,
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

export function buildVisitCityItemListSchema(
  locale: Locale,
  cityName: string,
  citySlug: string,
  listings: ProgrammaticListing[],
) {
  if (listings.length === 0) {
    return null;
  }

  const pageUrl = `${SITE_URL}${localePath(locale, `/visit/${citySlug}`)}`;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best things to do in ${cityName}, Algarve`,
    description: `Curated list of premium places to stay, restaurants, and experiences in ${cityName}, Algarve.`,
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

export function buildVisitCityBreadcrumbSchema(
  locale: Locale,
  cityName: string,
  citySlug: string,
) {
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
        name: "Visit",
        item: `${SITE_URL}${localePath(locale, "/visit")}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cityName,
        item: `${SITE_URL}${localePath(locale, `/visit/${citySlug}`)}`,
      },
    ],
  };
}

export function buildVisitCityCollectionPageSchema(
  locale: Locale,
  cityName: string,
  citySlug: string,
  count: number,
) {
  const pageUrl = `${SITE_URL}${localePath(locale, `/visit/${citySlug}`)}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Best things to do in ${cityName}, Algarve`,
    url: pageUrl,
    description:
      count > 0
        ? `Discover ${count} premium listings in ${cityName}, Algarve.`
        : `Explore ${cityName}, Algarve. New listings are being added.`,
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

export function buildVisitCityCategoryItemListSchema(
  locale: Locale,
  cityName: string,
  citySlug: string,
  categories: Array<{ slug: CanonicalCategorySlug; name: string; count: number }>,
) {
  if (categories.length === 0) {
    return null;
  }

  const pageUrl = `${SITE_URL}${localePath(locale, `/visit/${citySlug}`)}`;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Explore categories in ${cityName}, Algarve`,
    description: `Browse the main premium categories available in ${cityName}, Algarve, with current listing counts for each category.`,
    url: pageUrl,
    numberOfItems: categories.length,
    itemListElement: categories.map((category, index) => {
      const categoryName = getCategoryDisplayName(category.slug, locale);
      const categoryUrl = `${SITE_URL}${localePath(
        locale,
        `/visit/${citySlug}/${getCategoryUrlSlug(category.slug, locale)}`,
      )}`;

      return {
        "@type": "ListItem",
        position: index + 1,
        name: categoryName,
        url: categoryUrl,
        item: {
          "@type": "CollectionPage",
          name: categoryName,
          url: categoryUrl,
          description: `${category.count} listings in ${cityName} for ${categoryName}.`,
        },
      };
    }),
  };
}

export function buildVisitIndexBreadcrumbSchema(locale: Locale) {
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
        name: "Visit",
        item: `${SITE_URL}${localePath(locale, "/visit")}`,
      },
    ],
  };
}

export function buildVisitIndexCityItemListSchema(
  locale: Locale,
  cities: Array<{ slug: string; name: string; count: number }>,
) {
  if (cities.length === 0) {
    return null;
  }

  const pageUrl = `${SITE_URL}${localePath(locale, "/visit")}`;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Algarve city hubs",
    description: "Browse Algarve city hubs with current listing totals and local category landing pages.",
    url: pageUrl,
    numberOfItems: cities.length,
    itemListElement: cities.map((city, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: city.name,
      url: `${SITE_URL}${localePath(locale, `/visit/${city.slug}`)}`,
      item: {
        "@type": "CollectionPage",
        name: city.name,
        url: `${SITE_URL}${localePath(locale, `/visit/${city.slug}`)}`,
        description: `${city.count} listings in ${city.name}, Algarve.`,
      },
    })),
  };
}
