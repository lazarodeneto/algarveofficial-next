import type { Tables } from "@/integrations/supabase/types";

type CategoryRow = Tables<"categories">;

export type CanonicalCategorySlug =
  | "places-to-stay"
  | "restaurants"
  | "things-to-do"
  | "whats-on"
  | "algarve-services"
  | string;

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
  "places-to-stay": "Places to Stay",
  restaurants: "Restaurants",
  "things-to-do": "Things to Do",
  "whats-on": "What's On",
  "algarve-services": "Algarve Services",
};

const VIRTUAL_CANONICAL_CATEGORY_ICONS: Record<string, string> = {
  "places-to-stay": "Hotel",
  restaurants: "UtensilsCrossed",
  "things-to-do": "Binoculars",
  "whats-on": "CalendarHeart",
  "algarve-services": "ConciergeBell",
};

const CANONICAL_SLUG_BY_LEGACY_SLUG: Record<string, CanonicalCategorySlug> = {
  "luxury-accommodation": "places-to-stay",
  "luxury-hotels": "places-to-stay",
  "luxury-hotels-resorts": "places-to-stay",
  "fine-dining": "restaurants",
  "fine-dining-algarve": "restaurants",
  "private-chefs": "restaurants",
  "restaurants-algarve": "restaurants",
  "luxury-experiences": "things-to-do",
  "experiences-algarve": "things-to-do",
  "family-fun": "things-to-do",
  "things-do-do": "things-to-do",
  "premier-events": "whats-on",
  "events-in-algarve": "whats-on",
  "algarve-events": "whats-on",
  events: "whats-on",
  "vip-concierge": "algarve-services",
  "concierge-services": "algarve-services",
  "algarve-concierge-services": "algarve-services",
  "real-estate": "algarve-services",
  "algarve-real-estate": "algarve-services",
  "vip-transportation": "algarve-services",
  "architecture-decoration": "algarve-services",
  "protection-services": "algarve-services",
};

const ROUTE_ALIAS_SLUGS: Record<string, CanonicalCategorySlug> = {
  accommodation: "places-to-stay",
  "luxury-accommodation": "places-to-stay",
  "luxury-hotels": "places-to-stay",
  "algarve-accommodation": "places-to-stay",
  "places-to-stay": "places-to-stay",
  "place-to-stay": "places-to-stay",
  "places-to-stay-algarve": "places-to-stay",
  gastronomy: "restaurants",
  "fine-dining": "restaurants",
  "fine-dining-algarve": "restaurants",
  "restaurants": "restaurants",
  "restaurants-algarve": "restaurants",
  "algarve-experience": "things-to-do",
  "algarve-experiences": "things-to-do",
  "algarve-things-to-do": "things-to-do",
  "things-to-do-algarve": "things-to-do",
  "things-to-do": "things-to-do",
  "thing-to-do": "things-to-do",
  "things-do-do": "things-to-do",
  "whats-on": "whats-on",
  whatson: "whats-on",
  "what-s-on": "whats-on",
  "events": "whats-on",
  "algarve-events": "whats-on",
  "events-in-algarve": "whats-on",
  "algarve-services": "algarve-services",
  "algarve-service": "algarve-services",
  "concierge-services": "algarve-services",
  services: "algarve-services",
};

const SEARCH_ALIAS_TO_CANONICAL: Record<string, CanonicalCategorySlug> = {
  accommodation: "places-to-stay",
  "places to stay": "places-to-stay",
  "place to stay": "places-to-stay",
  "luxury accommodation": "places-to-stay",
  "luxury hotels": "places-to-stay",
  "algarve hotels": "places-to-stay",
  gastronomy: "restaurants",
  "fine dining": "restaurants",
  restaurant: "restaurants",
  "restaurants": "restaurants",
  dining: "restaurants",
  "best restaurants algarve": "restaurants",
  "private dining": "restaurants",
  "algarve experience": "things-to-do",
  "things do do": "things-to-do",
  "family attractions": "things-to-do",
  "things to do": "things-to-do",
  "things to do algarve": "things-to-do",
  "algarve activities": "things-to-do",
  activities: "things-to-do",
  "whats on": "whats-on",
  "what s on": "whats-on",
  "events in algarve": "whats-on",
  "algarve events": "whats-on",
  events: "whats-on",
  "algarve services": "algarve-services",
  "concierge services": "algarve-services",
  "algarve concierge": "algarve-services",
  "prime real estate": "algarve-services",
  "real estate algarve": "algarve-services",
  "vip transportation": "algarve-services",
  "architecture decoration": "algarve-services",
  "protection services": "algarve-services",
};

const MERGED_MEMBERS_BY_CANONICAL: Record<string, string[]> = {
  "places-to-stay": ["places-to-stay", "luxury-accommodation"],
  "restaurants": ["restaurants", "fine-dining", "private-chefs"],
  "things-to-do": ["things-to-do", "luxury-experiences", "family-fun"],
  "whats-on": ["whats-on", "premier-events", "events"],
  "algarve-services": [
    "vip-concierge",
    "real-estate",
    "vip-transportation",
    "architecture-decoration",
    "protection-services",
  ],
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

  return normalized;
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
