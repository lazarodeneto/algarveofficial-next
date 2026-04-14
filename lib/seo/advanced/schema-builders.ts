import { SITE_CONFIG } from "./seo-config";
import { DEFAULT_LOCALE, LOCALE_CONFIGS, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? SITE_CONFIG.url;

interface ListingSchemaInput {
  id: string;
  slug: string;
  url?: string | null;
  name: string;
  description?: string | null;
  category_slug: string;
  category_name?: string | null;
  city?: string | null;
  region?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  telephone?: string | null;
  email?: string | null;
  website?: string | null;
  price_range?: string | null;
  image_url?: string | null;
  logo_url?: string | null;
  google_rating?: number | null;
  google_review_count?: number | null;
  tags?: string[] | null;
  published_at?: string | null;
  updated_at?: string | null;
}

interface BlogPostSchemaInput {
  id: string;
  slug: string;
  url?: string | null;
  title: string;
  excerpt?: string | null;
  featured_image?: string | null;
  author_name?: string | null;
  category?: string | null;
  tags?: string[] | null;
  published_at?: string | null;
  updated_at?: string | null;
  locale?: Locale;
}

interface EventSchemaInput {
  id: string;
  slug: string;
  url?: string | null;
  name: string;
  title?: string;
  description?: string | null;
  image_url?: string | null;
  locale?: Locale;
  venue_name?: string | null;
  city?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  ticket_url?: string | null;
}

interface RegionSchemaInput {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_CONFIG.name,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icons/icon-512x512.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/icons/icon-512x512.png`,
    email: SITE_CONFIG.email,
    description: SITE_CONFIG.description,
    sameAs: [
      "https://www.facebook.com/AlgarveOfficial",
      "https://www.instagram.com/algarveofficial",
      "https://twitter.com/AlgarveOfficial",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: SITE_CONFIG.email,
      availableLanguage: ["English", "Portuguese", "Spanish", "French", "German", "Dutch"],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Algarve",
      addressRegion: "Faro",
      addressCountry: "PT",
    },
    areaServed: {
      "@type": "Place",
      name: "Algarve, Portugal",
      geo: {
        "@type": "GeoCoordinates",
        latitude: SITE_CONFIG.geo.latitude,
        longitude: SITE_CONFIG.geo.longitude,
      },
    },
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${DEFAULT_LOCALE}/stay?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: SUPPORTED_LOCALES.map((l) => LOCALE_CONFIGS[l].hreflang),
  };
}

export function buildLocalBusinessSchema(listing: ListingSchemaInput) {
  const url = listing.url ?? `${SITE_URL}/listing/${listing.slug}`;
  
  const categoryTypes: Record<string, string[]> = {
    "places-to-stay": ["LodgingBusiness", "Hotel", "Resort"],
    "restaurants": ["Restaurant", "FoodEstablishment"],
    "golf": ["GolfCourse", "SportsActivityLocation"],
    "beaches": ["BeachResort", "TouristAttraction"],
    "things-to-do": ["TouristAttraction", "ActivityLocation"],
    "real-estate": ["RealEstateAgent", "ProfessionalService"],
    "events": ["EventVenue", "EntertainmentBusiness"],
  };

  const inferredTypes: string[] = [];
  
  if (listing.description) {
    const desc = listing.description.toLowerCase();
    if (/restaurant|dining|bistro|cafe|bar|grill/.test(desc)) {
      inferredTypes.push("Restaurant");
    }
    if (/hotel|resort|villa|apartment|accommodation|lodge/.test(desc)) {
      inferredTypes.push("LodgingBusiness");
    }
    if (/golf|green|course|club/.test(desc)) {
      inferredTypes.push("GolfCourse");
    }
    if (/beach|beachclub|beach bar/.test(desc)) {
      inferredTypes.push("BeachResort");
    }
  }

  const schemaTypes = [...new Set([
    "LocalBusiness",
    ...(categoryTypes[listing.category_slug] || []),
    ...inferredTypes,
  ])];

  const address = listing.address ? {
    "@type": "PostalAddress",
    streetAddress: listing.address,
    addressLocality: listing.city ?? "Algarve",
    addressRegion: listing.region ?? "Algarve",
    addressCountry: "PT",
  } : undefined;

  const geo = listing.latitude && listing.longitude ? {
    "@type": "GeoCoordinates",
    latitude: listing.latitude,
    longitude: listing.longitude,
  } : undefined;

  const aggregateRating = listing.google_rating && listing.google_review_count ? {
    "@type": "AggregateRating",
    ratingValue: listing.google_rating.toString(),
    reviewCount: listing.google_review_count.toString(),
    bestRating: "5",
    worstRating: "1",
  } : undefined;

  return {
    "@context": "https://schema.org",
    "@type": schemaTypes.length === 1 ? schemaTypes[0] : schemaTypes,
    "@id": `${url}/#business`,
    name: listing.name,
    url,
    description: listing.description ?? undefined,
    image: listing.image_url ?? undefined,
    logo: listing.logo_url ?? undefined,
    priceRange: listing.price_range ?? "€€€€",
    address,
    geo,
    telephone: listing.telephone ?? undefined,
    email: listing.email ?? undefined,
    aggregateRating,
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" },
    ],
    sameAs: listing.website ? [listing.website] : undefined,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    ...(listing.tags && listing.tags.length > 0 ? {
      keywords: listing.tags.join(", "),
    } : {}),
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function buildArticleSchema(post: BlogPostSchemaInput) {
  const url = post.url ?? `${SITE_URL}/blog/${post.slug}`;
  const schemaLocale = post.locale ? LOCALE_CONFIGS[post.locale]?.hreflang ?? "en-GB" : "en-GB";

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}/#article`,
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.featured_image ?? undefined,
    url,
    datePublished: post.published_at ?? undefined,
    dateModified: (post.updated_at || post.published_at) ?? undefined,
    author: {
      "@type": "Organization",
      name: post.author_name ?? SITE_CONFIG.name,
      url: SITE_URL,
    },
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    articleSection: post.category ?? undefined,
    keywords: post.tags?.join(", ") ?? undefined,
    inLanguage: schemaLocale,
  };
}

export function buildEventSchema(event: EventSchemaInput) {
  const url = event.url ?? `${SITE_URL}/events/${event.slug}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${url}/#event`,
    name: event.name ?? event.title,
    description: event.description ?? undefined,
    image: event.image_url ?? undefined,
    url,
    startDate: event.start_date ?? undefined,
    endDate: (event.end_date || event.start_date) ?? undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: (event.venue_name || event.city) ?? "Algarve",
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city ?? "Algarve",
        addressRegion: "Algarve",
        addressCountry: "PT",
      },
    },
    organizer: {
      "@id": `${SITE_URL}/#organization`,
    },
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    ...(event.ticket_url ? {
      offers: {
        "@type": "Offer",
        url: event.ticket_url,
        availability: "https://schema.org/InStock",
        priceCurrency: "EUR",
      },
    } : {}),
  };
}

export function buildPlaceSchema(region: RegionSchemaInput) {
  const url = `${SITE_URL}/destinations/${region.slug}`;
  
  return {
    "@context": "https://schema.org",
    "@type": ["Place", "TouristDestination"],
    "@id": `${url}/#destination`,
    name: region.name,
    description: region.description ?? undefined,
    image: region.image_url ?? undefined,
    url,
    geo: region.latitude && region.longitude ? {
      "@type": "GeoCoordinates",
      latitude: region.latitude,
      longitude: region.longitude,
    } : undefined,
    containedInPlace: {
      "@type": "Place",
      name: "Algarve",
      containedInPlace: {
        "@type": "Country",
        name: "Portugal",
      },
    },
    touristType: ["Luxury Traveler", "Beach Lover", "Golf Enthusiast", "Cultural Tourist"],
  };
}

export function buildItemListSchema(
  name: string,
  items: Array<{ name: string; url: string; description?: string; image?: string }>,
  url: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description: `Browse our curated selection of ${name.toLowerCase()}`,
    url: `${SITE_URL}${url}`,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 10).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Thing",
        name: item.name,
        url: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
        description: item.description ?? undefined,
        image: item.image ?? undefined,
      },
    })),
  };
}

export function buildFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildNavigationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: SITE_CONFIG.name,
    url: SITE_URL,
  };
}
