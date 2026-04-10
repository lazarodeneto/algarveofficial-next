export const SITE_NAME = "AlgarveOfficial";
export const DEFAULT_SITE_URL = "https://algarveofficial.com";
export const DEFAULT_OG_IMAGE_PATH = "/og-image.png";

export const DEFAULT_SEO = {
  title: "Luxury Algarve Guide | AlgarveOfficial",
  description:
    "Discover the Algarve's finest villas, restaurants, golf, events, and local expertise across Portugal's most prestigious coast.",
  ogImage: DEFAULT_OG_IMAGE_PATH,
};

export const STATIC_PAGE_SEO = {
  "/": {
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
    ogType: "website",
  },
  "/stay": {
    title: "Stay in the Algarve",
    description:
      "Find the perfect places to stay across the Algarve — from boutique hotels to luxury resorts.",
    ogType: "website",
  },
  "/residence": {
    title: "Residence in the Algarve, Portugal | Relocation Guide",
    description:
      "Relocate to the Algarve with practical guidance on residency, neighborhoods, healthcare, schooling, and trusted local services in Portugal.",
    ogType: "website",
  },
  "/invest": {
    title: "Invest in Algarve Real Estate | Portugal Market Insights",
    description:
      "Explore Algarve investment opportunities with market insights on prime real estate, rental demand, relocation strategy, and long-term positioning.",
    ogType: "website",
  },
  "/blog": {
    title: "Algarve Blog: Travel Guides, Lifestyle & Luxury Insights",
    description:
      "Read Algarve travel guides, lifestyle tips, restaurant recommendations, golf insights, and premium local experiences in Portugal.",
    ogType: "website",
  },
  "/events": {
    title: "Algarve Events Calendar | Festivals, Markets & Golf Tournaments",
    description:
      "Browse festivals, golf tournaments, gastronomy events, and seasonal highlights across the Algarve with regularly updated event listings.",
    ogType: "website",
  },
  "/destinations": {
    title: "Premium Destinations in the Algarve",
    description:
      "Discover the Algarve's most prestigious destinations, from the Golden Triangle to Sagres, with curated insights for premium travel and lifestyle.",
    ogType: "website",
  },
  "/real-estate": {
    title: "Prime Real Estate in the Algarve",
    description:
      "Browse prime Algarve real estate opportunities with curated properties, market signals, and trusted local expertise for buyers and investors.",
    ogType: "website",
  },
  "/map": {
    title: "Algarve Listings Map | Properties, Experiences & Events",
    description:
      "Explore an interactive Algarve map with luxury properties, experiences, dining, and events using live filters and clustered category markers.",
    ogType: "website",
  },
  "/partner": {
    title: "Partner With AlgarveOfficial | Add or Claim Your Listing",
    description:
      "Add your Algarve business listing or claim an existing profile to reach qualified luxury travelers, residents, and investors.",
    ogType: "website",
  },
  "/contact": {
    title: "Contact AlgarveOfficial | Concierge & Local Support",
    description:
      "Contact AlgarveOfficial for concierge support, partnership inquiries, and local expertise across luxury travel, property, and services in the Algarve.",
    ogType: "website",
  },
  "/trips": {
    title: "Trip Planner Algarve | Build and Organize Your Itinerary",
    description:
      "Create, edit, and manage your Algarve itinerary with day-by-day planning for stays, dining, activities, and events.",
    ogType: "website",
  },
  "/privacy-policy": {
    title: "Privacy Policy | AlgarveOfficial",
    description:
      "Read how AlgarveOfficial collects, stores, and protects personal data under GDPR, including your rights and how to withdraw consent.",
    ogType: "website",
  },
  "/terms": {
    title: "Terms of Service | AlgarveOfficial",
    description:
      "Review AlgarveOfficial terms covering account use, listing rules, subscriptions, payments, intellectual property, and platform responsibilities.",
    ogType: "website",
  },
  "/cookie-policy": {
    title: "Cookie Policy | AlgarveOfficial",
    description:
      "Understand which essential, functional, analytics, and marketing technologies AlgarveOfficial uses and how to manage consent preferences.",
    ogType: "website",
  },
  "/about-us": {
    title: "About AlgarveOfficial | Luxury Algarve Platform",
    description:
      "Learn how AlgarveOfficial curates trusted local listings, premium experiences, and destination insights across the Algarve, Portugal.",
    ogType: "website",
  },
};

export function getStaticPageSeo(path) {
  return STATIC_PAGE_SEO[path] || null;
}

export function ensureBrandedTitle(title) {
  const normalized = String(title || "").replace(/\s+/g, " ").trim();
  if (!normalized) return DEFAULT_SEO.title;
  if (/algarveofficial/i.test(normalized)) return normalized;
  return `${normalized} | ${SITE_NAME}`;
}

export function normalizeSeoDescription(value, fallback = DEFAULT_SEO.description, maxLength = 155) {
  const normalized = String(value || fallback).replace(/\s+/g, " ").trim();
  if (!normalized) return fallback;
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function toAbsoluteSeoImageUrl(imageUrl, siteUrl = DEFAULT_SITE_URL) {
  const raw = String(imageUrl || "").trim();
  if (!raw) return `${siteUrl}${DEFAULT_OG_IMAGE_PATH}`;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${siteUrl}${raw.startsWith("/") ? raw : `/${raw}`}`;
}
