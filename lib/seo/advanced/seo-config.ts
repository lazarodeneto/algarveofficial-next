import { SUPPORTED_LOCALES, LOCALE_CONFIGS, DEFAULT_LOCALE } from "@/lib/i18n/config";

export const SITE_CONFIG = {
  name: "AlgarveOfficial",
  tagline: "Luxury Villas, Golf & Restaurants",
  description:
    "Discover the Algarve's finest villas, restaurants and golf courses — curated by experts who know every corner of Portugal's most prestigious coast.",
  url: "https://algarveofficial.com",
  ogImage: "/og-image.png",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  locale: "en_GB",
  defaultLocale: DEFAULT_LOCALE,
  supportedLocales: SUPPORTED_LOCALES,
  twitterSite: "@AlgarveOfficial",
  twitterCreator: "@AlgarveOfficial",
  geo: {
    region: "PT-08",
    placename: "Algarve, Portugal",
    latitude: 37.0179,
    longitude: -7.9304,
  },
  email: "concierge@algarveofficial.com",
} as const;

export const CATEGORY_META: Record<string, { title: string; description: string; keywords: string[] }> = {
  "places-to-stay": {
    title: "Luxury Accommodations",
    description: "Discover the finest villas, resorts, and exclusive retreats in the Algarve.",
    keywords: ["luxury villas", "Algarve accommodation", "5-star hotels", "boutique hotels", "private pools"],
  },
  restaurants: {
    title: "Fine Dining & Restaurants",
    description: "Experience culinary excellence at the Algarve's best restaurants and beach clubs.",
    keywords: ["Algarve restaurants", "Michelin star", "fine dining", "seafood", "Portuguese cuisine"],
  },
  golf: {
    title: "Premier Golf Courses",
    description: "Play on world-class golf courses with stunning Atlantic views.",
    keywords: ["Algarve golf", "golf courses", "golf packages", "greens fees", "golf holidays"],
  },
  "things-to-do": {
    title: "Experiences & Activities",
    description: "From yacht charters to private tours, discover unforgettable experiences.",
    keywords: ["Algarve activities", "boat trips", "wine tours", "water sports", "day trips"],
  },
  beaches: {
    title: "Beaches & Beach Clubs",
    description: "Explore the Algarve's famous golden beaches and exclusive beach clubs.",
    keywords: ["Algarve beaches", "beach clubs", "beach bars", "sunbed rental", "watersports"],
  },
  wellness: {
    title: "Spas & Wellness",
    description: "Rejuvenate at world-class spas and wellness retreats.",
    keywords: ["Algarve spa", "wellness retreats", "thalassotherapy", "massage", "yoga"],
  },
  "real-estate": {
    title: "Real Estate & Property",
    description: "Find your dream property in Portugal's most prestigious region.",
    keywords: ["Algarve property", "villas for sale", "real estate", "investment", "residency"],
  },
  events: {
    title: "Events & Entertainment",
    description: "Discover exclusive events, festivals, and entertainment in the Algarve.",
    keywords: ["Algarve events", "festivals", "concerts", "nightlife", "entertainment"],
  },
};

export const LOCATION_META: Record<string, { title: string; description: string; keywords: string[] }> = {
  "albufeira": {
    title: "Albufeira",
    description: "The heart of Algarve tourism - beaches, nightlife, and world-class dining.",
    keywords: ["Albufeira beach", "Albufeira nightlife", "Albufeira restaurants", "Praia dos Olhos"],
  },
  "vilamoura": {
    title: "Vilamoura",
    description: "Luxury marina, championship golf, and exclusive beach life.",
    keywords: ["Vilamoura marina", "Vilamoura golf", "Vilamoura beach", "casino"],
  },
  "portimao": {
    title: "Portimão",
    description: "Historic fishing port with stunning beaches and vibrant culture.",
    keywords: ["Portimão beaches", "Praia da Rocha", "Portimão restaurants", "Alvor"],
  },
  Lagos: {
    title: "Lagos",
    description: "Picturesque old town, dramatic cliffs, and golden beaches.",
    keywords: ["Lagos beach", "Ponta da Piedade", "old town Lagos", "boat trips"],
  },
  "sagres": {
    title: "Sagres",
    description: "Dramatic cliffs, surfing paradise, and the southwestern tip of Europe.",
    keywords: ["Sagres lighthouse", "surfing", "Cape St. Vincent", "cliffs"],
  },
  "tavira": {
    title: "Tavira",
    description: "Historic castle town with beautiful islands and traditional charm.",
    keywords: ["Tavira castle", "Praia de Tavira", "Ria Formosa", "island beaches"],
  },
  "faro": {
    title: "Faro",
    description: "Gateway to the Algarve with historic old town and lagoon islands.",
    keywords: ["Faro old town", "Ria Formosa", "Faro beach", "Ilha Deserta"],
  },
  "quarteira": {
    title: "Quarteira",
    description: "Long sandy beaches and traditional Portuguese atmosphere.",
    keywords: ["Quarteira beach", "fish market", "promenade", "water sports"],
  },
  "armacao-de-pera": {
    title: "Armação de Pêra",
    description: "Charming fishing village with stunning beaches and rock formations.",
    keywords: ["Armação de Pêra", "beach caves", "Fisherman's Beach", "porphyrio"],
  },
  "carvoeiro": {
    title: "Carvoeiro",
    description: "Colorful cliffside village with spectacular beaches and caves.",
    keywords: ["Carvoeiro beach", "Benagil caves", "Algar Seco", "gramacho"],
  },
};

export const DEFAULT_KEYWORDS = [
  "Algarve",
  "Portugal travel",
  "Algarve directory",
  "premium listings",
  "luxury villas",
  "Algarve restaurants",
  "Algarve golf",
  "Algarve events",
  "real estate Algarve",
  "Algarve concierge",
  " Algarve beaches",
  "Algarve hotels",
  "Portugal vacation",
  "Algarve tourism",
  "Algarve guide",
];
