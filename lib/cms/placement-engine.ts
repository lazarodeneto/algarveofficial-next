export type PlacementSelectionMode = "manual" | "tier-driven" | "hybrid";
export type ListingTier = "signature" | "verified" | "unverified";

export interface PlacementListing {
  id: string;
  city_id: string | null;
  tier: string | null;
  status?: string | null;
}

export interface PlacementCity {
  id: string;
  name?: string | null;
}

export interface CityTierBreakdown {
  signature: number;
  verified: number;
  unverified: number;
  total: number;
}

function normalizeSelection(input: unknown): PlacementSelectionMode {
  if (input === "tier-driven") return "tier-driven";
  if (input === "hybrid") return "hybrid";
  return "manual";
}

export function normalizePlacementSelection(input: unknown): PlacementSelectionMode {
  return normalizeSelection(input);
}

export function normalizeListingTier(input: unknown): ListingTier {
  if (input === "signature") return "signature";
  if (input === "verified") return "verified";
  return "unverified";
}

export function getListingScore(listing: Pick<PlacementListing, "tier">): number {
  const tier = normalizeListingTier(listing.tier);
  if (tier === "signature") return 100;
  if (tier === "verified") return 10;
  return 1;
}

export function buildCityTierBreakdown(
  listings: PlacementListing[],
): Record<string, CityTierBreakdown> {
  const byCity: Record<string, CityTierBreakdown> = {};

  listings.forEach((listing) => {
    if (!listing.city_id) return;
    if (listing.status && listing.status !== "published") return;
    const cityId = listing.city_id;
    const tier = normalizeListingTier(listing.tier);

    byCity[cityId] = byCity[cityId] ?? {
      signature: 0,
      verified: 0,
      unverified: 0,
      total: 0,
    };

    byCity[cityId][tier] += 1;
    byCity[cityId].total += 1;
  });

  return byCity;
}

export function getCityScore(
  city: Pick<PlacementCity, "id">,
  listings: PlacementListing[],
): number {
  return listings.reduce((score, listing) => {
    if (!listing.city_id || listing.city_id !== city.id) return score;
    if (listing.status && listing.status !== "published") return score;
    return score + getListingScore(listing);
  }, 0);
}

function sortCitiesByTierScore<TCity extends PlacementCity>(
  cities: TCity[],
  listings: PlacementListing[],
): TCity[] {
  return [...cities].sort((a, b) => {
    const scoreDiff = getCityScore(b, listings) - getCityScore(a, listings);
    if (scoreDiff !== 0) return scoreDiff;

    const aName = (a.name ?? "").toString().toLowerCase();
    const bName = (b.name ?? "").toString().toLowerCase();
    const byName = aName.localeCompare(bName);
    if (byName !== 0) return byName;

    return a.id.localeCompare(b.id);
  });
}

interface ResolveCityOrderArgs<TCity extends PlacementCity> {
  selection: unknown;
  cities: TCity[];
  listings: PlacementListing[];
  manualCityIds?: string[];
}

export function resolveCityOrder<TCity extends PlacementCity>({
  selection,
  cities,
  listings,
  manualCityIds = [],
}: ResolveCityOrderArgs<TCity>): TCity[] {
  const mode = normalizeSelection(selection);
  const cityById = new Map(cities.map((city) => [city.id, city]));
  const manualOrdered = manualCityIds
    .map((cityId) => cityById.get(cityId))
    .filter((city): city is TCity => Boolean(city));
  const tierOrdered = sortCitiesByTierScore(cities, listings);

  if (mode === "tier-driven") {
    return tierOrdered.length > 0 ? tierOrdered : cities;
  }

  if (mode === "hybrid") {
    const pool = manualOrdered.length > 0 ? manualOrdered : cities;
    const hybridTierRanked = sortCitiesByTierScore(pool, listings);
    return hybridTierRanked.length > 0 ? hybridTierRanked : cities;
  }

  return manualOrdered.length > 0 ? manualOrdered : cities;
}

interface ResolveFeaturedCityArgs<TCity extends PlacementCity> {
  selection: unknown;
  cities: TCity[];
  listings: PlacementListing[];
  manualCityId?: string | null;
}

export function resolveFeaturedCity<TCity extends PlacementCity>({
  selection,
  cities,
  listings,
  manualCityId,
}: ResolveFeaturedCityArgs<TCity>): TCity | null {
  if (!cities.length) return null;
  const mode = normalizeSelection(selection);

  const manual = manualCityId
    ? cities.find((city) => city.id === manualCityId) ?? null
    : null;

  if (mode === "manual" && manual) {
    return manual;
  }

  if (mode === "hybrid") {
    const pool = manual ? [manual, ...cities.filter((city) => city.id !== manual.id)] : cities;
    const hybridTierRanked = sortCitiesByTierScore(pool, listings);
    if (hybridTierRanked.length > 0) {
      return hybridTierRanked[0];
    }
  }

  const tierOrdered = sortCitiesByTierScore(cities, listings);
  if (tierOrdered.length > 0) {
    return tierOrdered[0];
  }

  return manual ?? cities[0] ?? null;
}
