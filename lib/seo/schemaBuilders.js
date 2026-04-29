import { DEFAULT_LOCALE, addLocaleToPathname } from "@/lib/i18n/config";
import { DEFAULT_SEO, DEFAULT_SITE_URL, SITE_NAME } from "./sharedSeo.js";

const LOCAL_BUSINESS_FALLBACK = "LocalBusiness";

function uniqueTypes(types) {
  return Array.from(new Set((types || []).filter(Boolean)));
}

function normalizeCategorySlug(category) {
  const normalized = String(category || "").toLowerCase().trim();
  if (!normalized) return "";

  const aliases = {
    "premium-accommodation": "places-to-stay",
    "fine-dining": "restaurants",
    "private-chefs": "restaurants",
    "premium-experiences": "things-to-do",
    "family-fun": "things-to-do",
    "premier-events": "whats-on",
    events: "whats-on",
  };

  return aliases[normalized] || normalized;
}

function categorySchemaTypes(category) {
  const mapping = {
    "places-to-stay": ["Hotel"],
    restaurants: ["Restaurant"],
    golf: ["GolfCourse"],
    "beaches-clubs": ["BeachResort"],
    beaches: ["BeachResort"],
    "wellness-spas": ["HealthAndBeautyBusiness"],
    "private-chefs": ["FoodService"],
    "vip-concierge": ["TravelAgency"],
    "things-to-do": ["TouristAttraction"],
    "premium-experiences": ["TouristAttraction"],
    "family-fun": ["AmusementPark"],
    "vip-transportation": ["TaxiService"],
    "real-estate": ["RealEstateAgent"],
    "whats-on": ["EventVenue"],
    "premier-events": ["EventVenue"],
    events: ["EventVenue"],
    "architecture-decoration": ["HomeAndConstructionBusiness"],
    "protection-services": ["SecurityService"],
    "shopping-boutiques": ["Store"],
    "algarve-services": ["ProfessionalService"],
  };

  const normalized = normalizeCategorySlug(category);
  return mapping[normalized] || [];
}

function inferListingSchemaTypes({ category, name, description, tags, categoryData }) {
  const inferredByCategory = categorySchemaTypes(category);
  const textBlob = [
    category,
    name,
    description,
    Array.isArray(tags) ? tags.join(" ") : "",
    categoryData ? JSON.stringify(categoryData) : "",
  ]
    .join(" ")
    .toLowerCase();

  const inferredByContent = [];

  if (/(boat|yacht|charter|sail|sailing|catamaran|cruise|marine|nautic)/.test(textBlob)) {
    inferredByContent.push("SportsActivityLocation");
  }

  if (/(restaurant|dining|bistro|steakhouse|gastro|michelin)/.test(textBlob)) {
    inferredByContent.push("Restaurant");
  }

  if (
    normalizeCategorySlug(category) === "places-to-stay" ||
    /(hotel|resort|suite|lodging|accommodation)/.test(textBlob)
  ) {
    inferredByContent.push("Hotel");
  }

  return uniqueTypes([LOCAL_BUSINESS_FALLBACK, ...inferredByCategory, ...inferredByContent]);
}

export function buildOrganizationSchema(siteUrl = DEFAULT_SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl,
    logo: `${siteUrl}/icons/icon-512x512.png`,
    email: "info@algarveofficial.com",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "info@algarveofficial.com",
      availableLanguage: ["English", "Portuguese", "Spanish", "French", "German"],
    },
    areaServed: {
      "@type": "Place",
      name: "Algarve, Portugal",
      geo: {
        "@type": "GeoCoordinates",
        latitude: 37.0179,
        longitude: -7.9304,
      },
    },
  };
}

export function buildWebsiteSchema(siteUrl = DEFAULT_SITE_URL) {
  const searchPath = addLocaleToPathname("/stay", DEFAULT_LOCALE);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    description: DEFAULT_SEO.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}${searchPath}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: ["en", "pt", "fr", "de", "es", "it", "nl", "sv", "no", "da"],
  };
}

export function buildBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: (items || []).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildItemListSchema({ name, url, description, items }) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url,
    description,
    numberOfItems: (items || []).length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: (items || []).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Thing",
        name: item.name,
        url: item.url,
        description: item.description,
        image: item.image,
      },
    })),
  };
}

export function buildWebPageSchema({
  name,
  url,
  description,
  image,
  type = "WebPage",
  siteUrl = DEFAULT_SITE_URL,
}) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    name,
    description,
    url,
    image,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
    },
  };
}

export function buildContactPageSchema({
  name,
  url,
  description,
  image,
  email,
  telephone,
  areaServed,
  siteUrl = DEFAULT_SITE_URL,
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name,
    description,
    url,
    image,
    mainEntity: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
      email: email ?? undefined,
      telephone: telephone ?? undefined,
      areaServed: areaServed
        ? {
            "@type": "Place",
            name: areaServed,
          }
        : undefined,
    },
  };
}

export function buildLocalBusinessSchema({
  name,
  description,
  image,
  url,
  address,
  city,
  telephone,
  email,
  priceRange,
  rating,
  reviewCount,
  latitude,
  longitude,
  category,
  tags,
  categoryData,
  openingHours,
  userReviews,
}) {
  const schemaTypes = inferListingSchemaTypes({
    category,
    name,
    description,
    tags,
    categoryData,
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": schemaTypes.length === 1 ? schemaTypes[0] : schemaTypes,
    name,
    "@id": `${url}#business`,
    url,
    description,
    image,
    priceRange: priceRange ?? "€€€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: city,
      addressRegion: "Algarve",
      addressCountry: "PT",
    },
    telephone: telephone ?? undefined,
    email: email ?? undefined,
    openingHoursSpecification: openingHours,
    geo:
      latitude && longitude
        ? {
            "@type": "GeoCoordinates",
            latitude,
            longitude,
          }
        : undefined,
    aggregateRating:
      rating && reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue: rating,
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review:
      userReviews && userReviews.length > 0
        ? userReviews.slice(0, 5).map((review) => ({
            "@type": "Review",
            author: { "@type": "Person", name: review.author },
            reviewRating: {
              "@type": "Rating",
              ratingValue: review.rating,
              bestRating: 5,
              worstRating: 1,
            },
            datePublished: review.datePublished,
            reviewBody: review.comment ?? undefined,
          }))
        : undefined,
  };

  return schema;
}

export function buildEventSchema({
  name,
  description,
  image,
  url,
  startDate,
  endDate,
  location,
  city,
  venue,
  ticketUrl,
  siteUrl = DEFAULT_SITE_URL,
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    description,
    image,
    url,
    startDate,
    endDate: endDate ?? startDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: venue ?? location,
      address: {
        "@type": "PostalAddress",
        addressLocality: city,
        addressRegion: "Algarve",
        addressCountry: "PT",
      },
    },
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
    },
    offers: ticketUrl
      ? {
          "@type": "Offer",
          url: ticketUrl,
          availability: "https://schema.org/InStock",
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "EUR",
          },
        }
      : undefined,
  };
}

export function buildArticleSchema({
  headline,
  description,
  image,
  url,
  datePublished,
  dateModified,
  authorName = SITE_NAME,
  authorUrl = DEFAULT_SITE_URL,
  siteUrl = DEFAULT_SITE_URL,
}) {
  const isOrganizationAuthor = authorName.trim().toLowerCase() === SITE_NAME.toLowerCase();

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    image,
    url,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: isOrganizationAuthor
      ? {
          "@type": "Organization",
          name: authorName,
          url: siteUrl,
        }
      : {
          "@type": "Person",
          name: authorName,
          url: authorUrl,
        },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icons/icon-512x512.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

export function buildFaqSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (items || []).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildTouristDestinationSchema({
  name,
  description,
  image,
  url,
  latitude,
  longitude,
  containedInPlace,
  touristType,
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name,
    description,
    url,
    "@id": `${url}#destination`,
    image,
    touristType: touristType ?? ["Premium Traveler", "Cultural Tourist", "Golf Enthusiast", "Beach Lover"],
    includesAttraction: {
      "@type": "TouristAttraction",
      name: `Things to do in ${name}`,
      url,
    },
    containsPlace: {
      "@type": "Place",
      name,
      address: {
        "@type": "PostalAddress",
        addressLocality: containedInPlace ?? "Algarve",
        addressRegion: "Algarve",
        addressCountry: "PT",
      },
    },
    geo:
      latitude && longitude
        ? {
            "@type": "GeoCoordinates",
            latitude,
            longitude,
          }
        : undefined,
  };
}
