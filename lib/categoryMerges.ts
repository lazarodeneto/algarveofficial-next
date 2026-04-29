import type { Tables } from "@/integrations/supabase/types";

type CategoryRow = Tables<"categories">;

export type CanonicalCategorySlug =
  | "accommodation"
  | "restaurants"
  | "beach-clubs"
  | "experiences"
  | "golf"
  | "events"
  | "family-attractions"
  | "wellness-spas"
  | "beaches"
  | "shopping"
  | "real-estate"
  | "concierge-services"
  | "transportation"
  | "security-services"
  | "architecture-design";

export interface MergedCategoryOption {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  short_description: string | null;
  image_url: string | null;
  display_order: number | null;
  is_featured: boolean;
  isVirtual: boolean;
  memberIds: string[];
  memberSlugs: string[];
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VIRTUAL_CANONICAL_CATEGORY_LABELS: Record<string, string> = {
  accommodation: "Accommodation",
  restaurants: "Restaurants",
  "beach-clubs": "Beach Clubs",
  experiences: "Experiences",
  golf: "Golf",
  events: "Events",
  "family-attractions": "Family Attractions",
  "wellness-spas": "Wellness & Spas",
  beaches: "Beaches",
  shopping: "Shopping",
  "real-estate": "Real Estate",
  "concierge-services": "Concierge Services",
  transportation: "Transportation",
  "security-services": "Security Services",
  "architecture-design": "Architecture & Design",
};

const VIRTUAL_CANONICAL_CATEGORY_ICONS: Record<string, string> = {
  accommodation: "Hotel",
  restaurants: "UtensilsCrossed",
  "beach-clubs": "Palmtree",
  experiences: "Binoculars",
  golf: "Trophy",
  events: "CalendarHeart",
  "family-attractions": "Baby",
  "wellness-spas": "Sparkles",
  beaches: "Umbrella",
  shopping: "ShoppingBag",
  "real-estate": "Building2",
  "concierge-services": "ConciergeBell",
  transportation: "Car",
  "security-services": "Shield",
  "architecture-design": "Palette",
};

const CANONICAL_SLUG_BY_LEGACY_SLUG: Record<string, CanonicalCategorySlug> = {
  "premium-accommodation": "accommodation",
  "premium-hotels": "accommodation",
  "premium-hotels-resorts": "accommodation",
  "places-to-stay": "accommodation",
  "fine-dining": "restaurants",
  "fine-dining-algarve": "restaurants",
  "private-chefs": "restaurants",
  "restaurants-algarve": "restaurants",
  "premium-experiences": "experiences",
  "experiences-algarve": "experiences",
  "family-fun": "experiences",
  "things-do-do": "experiences",
  "algarve-experience": "experiences",
  "premier-events": "events",
  "events-in-algarve": "events",
  "algarve-events": "events",
  events: "events",
  "golf-tournaments": "golf",
  "beaches-clubs": "beach-clubs",
  "wellness-spas": "wellness-spas",
  "shopping-boutiques": "shopping",
  "vip-concierge": "concierge-services",
  "algarve-concierge-services": "concierge-services",
  "prime-real-estate": "real-estate",
  "algarve-real-estate": "real-estate",
  "vip-transportation": "transportation",
  "architecture-decoration": "architecture-design",
  "protection-services": "security-services",
};

const ROUTE_ALIAS_SLUGS: Record<string, CanonicalCategorySlug> = {
  accommodation: "accommodation",
  "premium-accommodation": "accommodation",
  "premium-hotels": "accommodation",
  "algarve-accommodation": "accommodation",
  "places-to-stay": "accommodation",
  "place-to-stay": "accommodation",
  "places-to-stay-algarve": "accommodation",
  gastronomy: "restaurants",
  "fine-dining": "restaurants",
  "fine-dining-algarve": "restaurants",
  "restaurants": "restaurants",
  "restaurants-algarve": "restaurants",
  "beach-clubs": "beach-clubs",
  "beach-club": "beach-clubs",
  "algarve-experience": "experiences",
  "algarve-experiences": "experiences",
  "algarve-things-to-do": "experiences",
  "things-to-do-algarve": "experiences",
  "things-to-do": "experiences",
  "thing-to-do": "experiences",
  "things-do-do": "experiences",
  "experiences": "experiences",
  golf: "golf",
  "golf-tournaments": "golf",
  "whats-on": "events",
  whatson: "events",
  "what-s-on": "events",
  "algarve-events": "events",
  "events-in-algarve": "events",
  "events": "events",
  "family-attractions": "family-attractions",
  "family-fun": "family-attractions",
  "wellness-spas": "wellness-spas",
  wellness: "wellness-spas",
  beaches: "beaches",
  "beaches-clubs": "beaches",
  shopping: "shopping",
  "shopping-boutiques": "shopping",
  "real-estate": "real-estate",
  "concierge-services": "concierge-services",
  "vip-concierge": "concierge-services",
  transportation: "transportation",
  "vip-transportation": "transportation",
  "security-services": "security-services",
  "protection-services": "security-services",
  "architecture-design": "architecture-design",
  "architecture-decoration": "architecture-design",
};

const SEARCH_ALIAS_TO_CANONICAL: Record<string, CanonicalCategorySlug> = {
  accommodation: "accommodation",
  "places to stay": "accommodation",
  "place to stay": "accommodation",
  "premium accommodation": "accommodation",
  "premium hotels": "accommodation",
  "algarve hotels": "accommodation",
  hotels: "accommodation",
  resorts: "accommodation",
  villas: "accommodation",
  gastronomy: "restaurants",
  "fine dining": "restaurants",
  restaurant: "restaurants",
  "restaurants": "restaurants",
  dining: "restaurants",
  "best restaurants algarve": "restaurants",
  "private dining": "restaurants",
  "beach club": "beach-clubs",
  "beach clubs": "beach-clubs",
  "algarve experience": "experiences",
  "things do do": "experiences",
  "family attractions": "family-attractions",
  "things to do": "experiences",
  activities: "experiences",
  "things to do algarve": "experiences",
  golf: "golf",
  "golf courses": "golf",
  "golf tournaments": "golf",
  events: "events",
  "algarve events": "events",
  "whats on": "events",
  "family fun": "family-attractions",
  "kids activities": "family-attractions",
  "wellness spa": "wellness-spas",
  "wellness spas": "wellness-spas",
  spa: "wellness-spas",
  beaches: "beaches",
  "algarve beaches": "beaches",
  shopping: "shopping",
  "algarve shopping": "shopping",
  boutiques: "shopping",
  "real estate": "real-estate",
  "property": "real-estate",
  properties: "real-estate",
  "algarve real estate": "real-estate",
  "concierge services": "concierge-services",
  concierge: "concierge-services",
  transportation: "transportation",
  "private transfer": "transportation",
  "airport transfer": "transportation",
  "security services": "security-services",
  security: "security-services",
  "architecture design": "architecture-design",
  "interior design": "architecture-design",
  architects: "architecture-design",
};

const MERGED_MEMBERS_BY_CANONICAL: Record<string, string[]> = {
  accommodation: ["accommodation", "places-to-stay", "premium-accommodation"],
  restaurants: ["restaurants", "fine-dining", "private-chefs"],
  "beach-clubs": ["beach-clubs", "beaches-clubs"],
  experiences: ["experiences", "things-to-do", "premium-experiences", "family-fun"],
  golf: ["golf", "golf-tournaments"],
  events: ["events", "whats-on", "premier-events"],
  "family-attractions": ["family-attractions", "family-fun"],
  "wellness-spas": ["wellness-spas"],
  beaches: ["beaches", "beaches-clubs"],
  shopping: ["shopping", "shopping-boutiques"],
  "real-estate": ["real-estate", "prime-real-estate"],
  "concierge-services": ["concierge-services", "vip-concierge"],
  transportation: ["transportation", "vip-transportation"],
  "security-services": ["security-services", "protection-services"],
  "architecture-design": ["architecture-design", "architecture-decoration"],
};

function normalizeSlug(slug?: string | null): string | null {
  if (!slug) return null;
  const normalized = slug.toLowerCase().trim();
  return normalized.length > 0 ? normalized : null;
}

export function isUuid(value?: string | null): boolean {
  if (!value) return false;
  return UUID_RE.test(value);
}

export function getCanonicalCategorySlug(slug?: string | null): CanonicalCategorySlug | null {
  const normalized = normalizeSlug(slug);
  if (!normalized) return null;

  if (ROUTE_ALIAS_SLUGS[normalized]) {
    return ROUTE_ALIAS_SLUGS[normalized];
  }

  if (CANONICAL_SLUG_BY_LEGACY_SLUG[normalized]) {
    return CANONICAL_SLUG_BY_LEGACY_SLUG[normalized];
  }

  return normalized as CanonicalCategorySlug;
}

export function getMergedMemberSlugs(slug?: string | null): string[] {
  const canonical = getCanonicalCategorySlug(slug);
  if (!canonical) return [];
  return MERGED_MEMBERS_BY_CANONICAL[canonical] ?? [canonical];
}

export function getDeprecatedCategorySlugs(): string[] {
  return Object.keys(CANONICAL_SLUG_BY_LEGACY_SLUG);
}

export function inferCategorySlugsFromSearch(search?: string | null): string[] {
  if (!search) return [];
  const normalized = search.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (!normalized) return [];

  const matchedCanonical = new Set<string>();
  for (const [alias, canonical] of Object.entries(SEARCH_ALIAS_TO_CANONICAL)) {
    if (normalized.includes(alias)) {
      matchedCanonical.add(canonical);
    }
  }

  const resolvedSlugs = new Set<string>();
  for (const canonical of matchedCanonical) {
    getMergedMemberSlugs(canonical).forEach((slug) => resolvedSlugs.add(slug));
  }

  return Array.from(resolvedSlugs);
}

export function buildMergedCategoryOptions(categories: CategoryRow[]): MergedCategoryOption[] {
  const categoriesBySlug = new Map<string, CategoryRow>();
  categories.forEach((category) => {
    const normalized = normalizeSlug(category.slug);
    if (!normalized) return;
    categoriesBySlug.set(normalized, category);
  });

  const canonicalSlugs = new Set<string>();
  for (const category of categoriesBySlug.values()) {
    const canonical = getCanonicalCategorySlug(category.slug);
    if (canonical) canonicalSlugs.add(canonical);
  }

  for (const [canonical, memberSlugs] of Object.entries(MERGED_MEMBERS_BY_CANONICAL)) {
    if (memberSlugs.some((slug) => categoriesBySlug.has(slug))) {
      canonicalSlugs.add(canonical);
    }
  }

  const merged: MergedCategoryOption[] = [];

  for (const canonicalSlug of canonicalSlugs) {
    const desiredMembers = getMergedMemberSlugs(canonicalSlug);
    const resolvedMembers = desiredMembers.filter((slug) => categoriesBySlug.has(slug));
    const fallbackMembers = resolvedMembers.length > 0 ? resolvedMembers : categoriesBySlug.has(canonicalSlug) ? [canonicalSlug] : [];

    if (fallbackMembers.length === 0) continue;

    const canonicalCategory = categoriesBySlug.get(canonicalSlug) ?? null;
    const memberCategories = fallbackMembers
      .map((slug) => categoriesBySlug.get(slug))
      .filter((category): category is CategoryRow => Boolean(category));

    const lowestDisplayOrder =
      memberCategories
        .map((category) => category.display_order)
        .filter((value): value is number => typeof value === "number")
        .sort((a, b) => a - b)[0] ?? null;

    const representative = canonicalCategory ?? memberCategories[0];
    const isVirtual = !canonicalCategory;

    const name = canonicalCategory?.name ?? VIRTUAL_CANONICAL_CATEGORY_LABELS[canonicalSlug] ?? representative.name;
    const icon = canonicalCategory?.icon ?? representative.icon ?? VIRTUAL_CANONICAL_CATEGORY_ICONS[canonicalSlug] ?? null;
    const shortDescription = canonicalCategory?.short_description ?? representative.short_description;
    const imageUrl = canonicalCategory?.image_url ?? representative.image_url;

    merged.push({
      id: canonicalCategory?.id ?? representative.id,
      slug: canonicalSlug,
      name,
      icon,
      short_description: shortDescription,
      image_url: imageUrl,
      display_order: canonicalCategory?.display_order ?? lowestDisplayOrder,
      is_featured: Boolean(canonicalCategory?.is_featured ?? memberCategories.some((category) => Boolean(category.is_featured))),
      isVirtual,
      memberIds: memberCategories.map((category) => category.id),
      memberSlugs: memberCategories.map((category) => normalizeSlug(category.slug) || category.slug).filter(Boolean) as string[],
    });
  }

  return merged.sort((a, b) => {
    const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });
}

export function resolveCategoryFilterSlug(
  rawValue: string | null | undefined,
  categories: CategoryRow[],
  mergedCategories: MergedCategoryOption[],
): string {
  if (!rawValue) return "all";
  const value = rawValue.trim();
  if (!value) return "all";
  if (value === "all") return "all";

  if (isUuid(value)) {
    const matchedById = categories.find((category) => category.id === value);
    if (!matchedById) return "all";
    const canonicalSlug = getCanonicalCategorySlug(matchedById.slug);
    if (!canonicalSlug) return "all";
    return mergedCategories.some((item) => item.slug === canonicalSlug) ? canonicalSlug : "all";
  }

  const canonicalSlug = getCanonicalCategorySlug(value);
  if (!canonicalSlug) return "all";
  return mergedCategories.some((item) => item.slug === canonicalSlug) ? canonicalSlug : "all";
}

export function getMergedCategoryBySlug(
  slug: string,
  mergedCategories: MergedCategoryOption[],
): MergedCategoryOption | undefined {
  return mergedCategories.find((category) => category.slug === slug);
}

export function getMergedCategoryIds(
  selectedSlug: string | null | undefined,
  mergedCategories: MergedCategoryOption[],
): string[] {
  if (!selectedSlug || selectedSlug === "all") return [];
  const mergedCategory = getMergedCategoryBySlug(selectedSlug, mergedCategories);
  return mergedCategory?.memberIds ?? [];
}

export const ALL_CANONICAL_SLUGS: CanonicalCategorySlug[] = [
  "accommodation",
  "restaurants",
  "beach-clubs",
  "experiences",
  "golf",
  "events",
  "family-attractions",
  "wellness-spas",
  "beaches",
  "shopping",
  "real-estate",
  "concierge-services",
  "transportation",
  "security-services",
  "architecture-design",
];

export function getCanonicalFromRouteSlug(slug: string): CanonicalCategorySlug | null {
  const normalized = slug.toLowerCase().trim();
  return ROUTE_ALIAS_SLUGS[normalized] ?? getCanonicalCategorySlug(normalized);
}

export function normalizeCategoryForSearch(value: string): CanonicalCategorySlug | null {
  const normalized = value.toLowerCase().trim();
  const directMatch = SEARCH_ALIAS_TO_CANONICAL[normalized];
  if (directMatch) return directMatch;
  return getCanonicalCategorySlug(normalized);
}

export function matchCategoryByIdOrSlug(
  value: string,
  categories: CategoryRow[],
): CanonicalCategorySlug | null {
  const categoriesById = new Map<string, CategoryRow>();
  const categoriesBySlug = new Map<string, CategoryRow>();
  for (const category of categories) {
    if (category.is_active) {
      categoriesById.set(category.id, category);
      categoriesBySlug.set(category.slug, category);
    }
  }
  const matchedById = categoriesById.get(value);
  if (matchedById) {
    const canonicalSlug = getCanonicalCategorySlug(matchedById.slug);
    return canonicalSlug;
  }
  const matchedBySlug = categoriesBySlug.get(value);
  if (matchedBySlug) {
    const canonicalSlug = getCanonicalCategorySlug(matchedBySlug.slug);
    return canonicalSlug;
  }
  return normalizeCategoryForSearch(value);
}

export function getCategorySlugFromValue(value: string): string | null {
  const normalized = value.toLowerCase().trim();
  const canonical = getCanonicalFromRouteSlug(normalized);
  return canonical;
}
