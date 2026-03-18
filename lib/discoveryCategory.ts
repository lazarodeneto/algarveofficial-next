import { getCanonicalCategorySlug } from "@/lib/categoryMerges";

export type DiscoveryCategory = "hotels" | "restaurants" | "experiences" | "real-estate";

export const DISCOVERY_FILTERS: readonly { key: DiscoveryCategory; label: string }[] = [
  { key: "hotels", label: "Hotels" },
  { key: "restaurants", label: "Restaurants" },
  { key: "experiences", label: "Experiences" },
  { key: "real-estate", label: "Real estate" },
] as const;

type DiscoveryListingLike = {
  category?: {
    slug?: string | null;
    name?: string | null;
  } | null;
  tags?: string[] | null;
  category_data?: unknown;
};

const CATEGORY_KEYWORDS: Record<DiscoveryCategory, string[]> = {
  hotels: [
    "hotel",
    "hotels",
    "resort",
    "resorts",
    "boutique hotel",
    "aparthotel",
    "guesthouse",
    "accommodation",
    "places to stay",
    "place to stay",
    "villa stay",
    "holiday rental",
  ],
  restaurants: [
    "restaurant",
    "restaurants",
    "fine dining",
    "dining",
    "cafe",
    "café",
    "beach club dining",
    "rooftop dining",
    "food",
    "gastronomy",
    "private chef",
    "private chefs",
  ],
  experiences: [
    "experiences",
    "experience",
    "tours",
    "tour",
    "activities",
    "activity",
    "boat trips",
    "boat trip",
    "golf",
    "spa",
    "wellness",
    "attractions",
    "attraction",
    "things to do",
    "events",
    "event",
    "concierge",
    "services",
    "algarve services",
  ],
  "real-estate": [
    "real estate",
    "property",
    "properties",
    "villa for sale",
    "apartment for sale",
    "investment",
    "new developments",
    "new development",
    "realty",
  ],
};

function normalizeValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function coerceCategoryData(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // Best effort: ignore invalid JSON payloads.
    }
  }

  return {};
}

function hasRealEstateShape(categoryData: Record<string, unknown>): boolean {
  const realEstateKeys = [
    "bedrooms",
    "bathrooms",
    "property_size_m2",
    "plot_size_m2",
    "property_type",
    "transaction_type",
    "price",
  ];

  return realEstateKeys.some((key) => key in categoryData);
}

function matchesCategoryKeyword(tokens: readonly string[], category: DiscoveryCategory): boolean {
  return CATEGORY_KEYWORDS[category].some((keyword) => {
    const normalizedKeyword = normalizeValue(keyword);
    return tokens.some((token) => token === normalizedKeyword || token.includes(normalizedKeyword));
  });
}

function collectTokens(listing: DiscoveryListingLike): string[] {
  const tokens = new Set<string>();
  const categorySlug = listing.category?.slug || "";
  const categoryName = listing.category?.name || "";
  const canonicalSlug = getCanonicalCategorySlug(categorySlug);
  const normalizedCanonical = canonicalSlug ? normalizeValue(canonicalSlug) : "";
  const categoryData = coerceCategoryData(listing.category_data);

  const addToken = (value?: string | null) => {
    if (!value) return;
    const normalized = normalizeValue(value);
    if (normalized.length > 0) tokens.add(normalized);
  };

  addToken(categorySlug);
  addToken(categoryName);
  addToken(canonicalSlug ?? undefined);

  for (const tag of listing.tags ?? []) {
    addToken(tag);
  }

  for (const [key, value] of Object.entries(categoryData)) {
    addToken(key);
    if (typeof value === "string") addToken(value);
  }

  if (normalizedCanonical === "places to stay") {
    addToken("places to stay");
    addToken("accommodation");
  } else if (normalizedCanonical === "restaurants") {
    addToken("restaurants");
    addToken("dining");
  } else if (normalizedCanonical === "things to do" || normalizedCanonical === "whats on") {
    addToken("experiences");
    addToken("things to do");
  } else if (normalizedCanonical === "real estate") {
    addToken("real estate");
    addToken("property");
  } else if (normalizedCanonical === "algarve services") {
    addToken("services");
  }

  return Array.from(tokens);
}

export function mapListingToDiscoveryCategory(listing: DiscoveryListingLike): DiscoveryCategory[] {
  const tokens = collectTokens(listing);
  const categoryData = coerceCategoryData(listing.category_data);
  const categories = new Set<DiscoveryCategory>();

  if (matchesCategoryKeyword(tokens, "hotels")) categories.add("hotels");
  if (matchesCategoryKeyword(tokens, "restaurants")) categories.add("restaurants");
  if (matchesCategoryKeyword(tokens, "experiences")) categories.add("experiences");
  if (matchesCategoryKeyword(tokens, "real-estate") || hasRealEstateShape(categoryData)) {
    categories.add("real-estate");
  }

  // Keep unknown categories discoverable instead of silently excluding them.
  if (categories.size === 0) {
    categories.add("experiences");
  }

  return Array.from(categories);
}

