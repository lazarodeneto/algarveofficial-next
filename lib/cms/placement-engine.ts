export const PLACEMENT_SELECTION_VALUES = ["manual", "tier-driven", "hybrid"] as const;

export type PlacementSelectionMode = (typeof PLACEMENT_SELECTION_VALUES)[number];
export type PlacementReason = PlacementSelectionMode;

const PLACEMENT_TIER_VALUES = ["unverified", "verified", "signature"] as const;

export type ListingTier = (typeof PLACEMENT_TIER_VALUES)[number];

export interface PlacementCity {
  id: string;
  name?: string | null;
}

export interface PlacementListing {
  id: string;
  city_id: string | null;
  category_id?: string | null;
  name?: string | null;
  slug?: string | null;
  is_curated?: boolean | null;
  google_rating?: number | null;
  google_review_count?: number | null;
  view_count?: number | null;
  tier: string | null;
  status?: string | null;
}

export type PlacementBreakdown = {
  signatureCount?: number;
  verifiedCount?: number;
  unverifiedCount?: number;
  listingScores?: number[];
  tier?: ListingTier;
  rating?: number;
  popularity?: number;
  completeness?: number;
};

export type PlacementResult<T> = {
  item: T;
  score: number;
  breakdown: PlacementBreakdown;
  reason: PlacementReason;
};

export type ResolveCityOrderParams<TCity extends PlacementCity> = {
  selection?: PlacementSelectionMode | string | null;
  cities: TCity[];
  listings: PlacementListing[];
  manualCityIds?: string[];
  debug?: boolean;
};

export type ResolveFeaturedCityParams<TCity extends PlacementCity> = {
  selection?: PlacementSelectionMode | string | null;
  cities: TCity[];
  listings: PlacementListing[];
  manualCityId?: string | null;
  debug?: boolean;
};

export type ValidateSponsorPlacementParams = {
  cityId: string;
  listing: PlacementListing;
};

export type ListingPlacementSelection = PlacementSelectionMode;

export type ResolveListingOrderArgs<TListing extends PlacementListing = PlacementListing> = {
  selection: ListingPlacementSelection;
  listings: TListing[];
  manualListingIds?: string[];
  cityId?: string;
  categoryId?: string;
  maxItems?: number;
  debug?: boolean;
};

export type ResolveFeaturedListingArgs<TListing extends PlacementListing = PlacementListing> = {
  selection: ListingPlacementSelection;
  listings: TListing[];
  manualListingId?: string;
  cityId?: string;
  categoryId?: string;
  debug?: boolean;
};

const TIER_SCORE: Record<ListingTier, number> = {
  signature: 100,
  verified: 10,
  unverified: 1,
};

const DEV = process.env.NODE_ENV !== "production";

function warnDev(message: string, context?: unknown) {
  if (!DEV) return;
  if (context === undefined) {
    console.warn(message);
    return;
  }
  console.warn(message, context);
}

function failFastDev(message: string, context?: unknown): never {
  if (DEV) {
    throw new Error(context ? `${message} ${JSON.stringify(context)}` : message);
  }
  throw new Error(message);
}

function normalizeId(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function toUniqueIds(ids: readonly string[] | undefined): string[] {
  if (!ids || ids.length === 0) return [];
  const out: string[] = [];
  const seen = new Set<string>();

  for (const rawId of ids) {
    const id = normalizeId(rawId);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }

  return out;
}

function getCityName(city: PlacementCity): string {
  if (typeof city.name === "string") {
    const trimmed = city.name.trim();
    if (trimmed) return trimmed;
  }
  return city.id;
}

function compareCitiesDeterministically(a: PlacementCity, b: PlacementCity): number {
  const byName = getCityName(a).localeCompare(getCityName(b), undefined, { sensitivity: "base" });
  if (byName !== 0) return byName;
  return a.id.localeCompare(b.id);
}

function getListingName(listing: PlacementListing): string {
  if (typeof listing.name === "string") {
    const trimmed = listing.name.trim();
    if (trimmed) return trimmed;
  }
  if (typeof listing.slug === "string") {
    const trimmedSlug = listing.slug.trim();
    if (trimmedSlug) return trimmedSlug;
  }
  return listing.id;
}

function compareListingsDeterministically(a: PlacementListing, b: PlacementListing): number {
  const byName = getListingName(a).localeCompare(getListingName(b), undefined, { sensitivity: "base" });
  if (byName !== 0) return byName;
  return a.id.localeCompare(b.id);
}

function isValidTier(value: unknown): value is ListingTier {
  return typeof value === "string" && (PLACEMENT_TIER_VALUES as readonly string[]).includes(value);
}

function isPublishedStatus(status: unknown): boolean {
  // Missing status is treated as eligible for backward compatibility.
  if (status === null || status === undefined || status === "") return true;
  return status === "published";
}

export function normalizePlacementSelection(value: unknown): PlacementSelectionMode {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if ((PLACEMENT_SELECTION_VALUES as readonly string[]).includes(normalized)) {
      return normalized as PlacementSelectionMode;
    }
  }
  return "manual";
}

export function validateListingTier(listing: Pick<PlacementListing, "id" | "tier">): ListingTier {
  if (isValidTier(listing.tier)) {
    return listing.tier;
  }

  warnDev("[placement-engine] Invalid listing tier. Falling back to unverified.", {
    listingId: listing.id,
    tier: listing.tier,
  });
  return "unverified";
}

export function getListingScore(listing: Pick<PlacementListing, "id" | "tier" | "status">): number {
  if (!isPublishedStatus(listing.status)) return 0;
  const tier = validateListingTier({ id: listing.id, tier: listing.tier });
  return TIER_SCORE[tier];
}

function isPublishedListing(listing: PlacementListing): boolean {
  if (!normalizeId(listing.id)) return false;
  if (!normalizeId(listing.city_id)) return false;
  if (!isPublishedStatus(listing.status)) return false;
  return true;
}

function isEligibleListingRecord(listing: PlacementListing): boolean {
  if (!normalizeId(listing.id)) return false;
  if (!isPublishedStatus(listing.status)) return false;
  return true;
}

function dedupeListingsById<TListing extends PlacementListing>(listings: TListing[]): TListing[] {
  const out: TListing[] = [];
  const seen = new Set<string>();

  for (const listing of listings) {
    const listingId = normalizeId(listing.id);
    if (!listingId || seen.has(listingId)) continue;
    seen.add(listingId);
    out.push(listing);
  }

  return out;
}

function getCityListings(cityId: string, listings: PlacementListing[]): PlacementListing[] {
  return listings.filter((listing) => isPublishedListing(listing) && listing.city_id === cityId);
}

export function getCityScore(cityId: string, listings: PlacementListing[]): number {
  const cityListings = getCityListings(cityId, listings);
  return cityListings.reduce((sum, listing) => sum + getListingScore(listing), 0);
}

function getCityBreakdown(cityId: string, listings: PlacementListing[]): PlacementBreakdown {
  const cityListings = getCityListings(cityId, listings);
  const breakdown: PlacementBreakdown = {
    signatureCount: 0,
    verifiedCount: 0,
    unverifiedCount: 0,
    listingScores: [],
  };

  for (const listing of cityListings) {
    const tier = validateListingTier(listing);
    if (tier === "signature") breakdown.signatureCount = (breakdown.signatureCount ?? 0) + 1;
    if (tier === "verified") breakdown.verifiedCount = (breakdown.verifiedCount ?? 0) + 1;
    if (tier === "unverified") breakdown.unverifiedCount = (breakdown.unverifiedCount ?? 0) + 1;
    breakdown.listingScores?.push(TIER_SCORE[tier]);
  }

  return breakdown;
}

export function validateSponsorPlacement({ cityId, listing }: ValidateSponsorPlacementParams): boolean {
  const normalizedCityId = normalizeId(cityId);
  if (!normalizedCityId) {
    failFastDev("[placement-engine] Sponsor placement validation requires a cityId.");
  }

  const listingCityId = normalizeId(listing.city_id);
  if (!listingCityId || listingCityId !== normalizedCityId) {
    if (DEV) {
      failFastDev("[placement-engine] Sponsor listing does not belong to target city.", {
        cityId: normalizedCityId,
        listingId: listing.id,
        listingCityId,
      });
    }
    return false;
  }

  if (!isPublishedListing(listing)) {
    if (DEV) {
      failFastDev("[placement-engine] Sponsor listing must be published.", {
        cityId: normalizedCityId,
        listingId: listing.id,
        status: listing.status,
      });
    }
    return false;
  }

  const tier = validateListingTier(listing);
  if (tier !== "verified" && tier !== "signature") {
    if (DEV) {
      failFastDev("[placement-engine] Sponsor listing must be verified or signature.", {
        cityId: normalizedCityId,
        listingId: listing.id,
        tier,
      });
    }
    return false;
  }

  return true;
}

function sortByScoreThenStable<TCity extends PlacementCity>(
  items: PlacementResult<TCity>[],
): PlacementResult<TCity>[] {
  return items.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return compareCitiesDeterministically(a.item, b.item);
  });
}

function selectManualPool<TCity extends PlacementCity>(
  allCities: TCity[],
  manualCityIds: string[],
): TCity[] {
  if (manualCityIds.length === 0) return [];

  const cityById = new Map(allCities.map((city) => [normalizeId(city.id), city]));
  const pool: TCity[] = [];

  for (const cityId of manualCityIds) {
    const city = cityById.get(cityId);
    if (city) pool.push(city);
  }

  return pool;
}

function ensureEligiblePool<TCity extends PlacementCity>(
  cities: TCity[],
  manualCityIds: string[],
): TCity[] {
  const manualPool = selectManualPool(cities, manualCityIds);
  // Empty curated/manual pools are safely promoted to full dataset.
  return manualPool.length > 0 ? manualPool : cities;
}

function toPlacementResult<TCity extends PlacementCity>(
  city: TCity,
  listings: PlacementListing[],
  reason: PlacementReason,
): PlacementResult<TCity> {
  const cityId = normalizeId(city.id);
  return {
    item: city,
    score: getCityScore(cityId, listings),
    breakdown: getCityBreakdown(cityId, listings),
    reason,
  };
}

function logCityDebugTable<TCity extends PlacementCity>(
  rows: PlacementResult<TCity>[],
  selection: PlacementSelectionMode,
) {
  if (!DEV || rows.length === 0) return;

  console.table(
    rows.map((row) => ({
      city: getCityName(row.item),
      score: row.score,
      signature: row.breakdown.signatureCount ?? 0,
      verified: row.breakdown.verifiedCount ?? 0,
      unverified: row.breakdown.unverifiedCount ?? 0,
      reason: row.reason,
      selection,
    })),
  );
}

export function resolveCityOrderDetailed<TCity extends PlacementCity>(
  params: ResolveCityOrderParams<TCity>,
): PlacementResult<TCity>[] {
  const selection = normalizePlacementSelection(params.selection);
  const allCities = [...params.cities].filter((city): city is TCity => Boolean(normalizeId(city.id)));

  if (allCities.length === 0) return [];

  const manualCityIds = toUniqueIds(params.manualCityIds);

  let pool: TCity[];
  let reason: PlacementReason;

  if (selection === "manual") {
    const manualPool = selectManualPool(allCities, manualCityIds);
    // Deterministic fallback when manual selection is empty/invalid.
    pool = manualPool.length > 0 ? manualPool : [...allCities].sort(compareCitiesDeterministically);
    reason = "manual";
  } else if (selection === "tier-driven") {
    pool = allCities;
    reason = "tier-driven";
  } else {
    // Hybrid: use eligible editor-defined pool (if present), then rank by tier score.
    pool = ensureEligiblePool(allCities, manualCityIds);
    reason = "hybrid";
  }

  const results = pool.map((city) => toPlacementResult(city, params.listings, reason));

  const ranked =
    selection === "manual"
      ? results
      : sortByScoreThenStable(results);

  if (params.debug) {
    logCityDebugTable(ranked, selection);
  }

  return ranked;
}

export function resolveCityOrder<TCity extends PlacementCity>(
  params: ResolveCityOrderParams<TCity>,
): TCity[] {
  return resolveCityOrderDetailed(params).map((result) => result.item);
}

export function resolveFeaturedCityDetailed<TCity extends PlacementCity>(
  params: ResolveFeaturedCityParams<TCity>,
): PlacementResult<TCity> | null {
  const selection = normalizePlacementSelection(params.selection);
  const allCities = [...params.cities].filter((city): city is TCity => Boolean(normalizeId(city.id)));

  if (allCities.length === 0) return null;

  const manualCityId = normalizeId(params.manualCityId ?? "");
  const cityById = new Map(allCities.map((city) => [normalizeId(city.id), city]));

  if (selection === "manual" && manualCityId) {
    const city = cityById.get(manualCityId);
    if (city) {
      return toPlacementResult(city, params.listings, "manual");
    }
  }

  if (selection === "hybrid" && manualCityId) {
    const city = cityById.get(manualCityId);
    if (city) {
      return toPlacementResult(city, params.listings, "hybrid");
    }
  }

  const fallbackRanked = resolveCityOrderDetailed({
    selection: "tier-driven",
    cities: allCities,
    listings: params.listings,
    debug: params.debug,
  });

  const winner = fallbackRanked[0];
  if (!winner) return null;

  if (selection === "manual") {
    return { ...winner, reason: "manual" };
  }
  if (selection === "hybrid") {
    return { ...winner, reason: "hybrid" };
  }
  return winner;
}

export function resolveFeaturedCity<TCity extends PlacementCity>(
  params: ResolveFeaturedCityParams<TCity>,
): TCity | null {
  const result = resolveFeaturedCityDetailed(params);
  return result?.item ?? null;
}

export function filterEligibleListings<TListing extends PlacementListing>(
  args: Pick<ResolveListingOrderArgs<TListing>, "listings" | "cityId" | "categoryId">,
): TListing[] {
  const cityId = normalizeId(args.cityId ?? "");
  const categoryId = normalizeId(args.categoryId ?? "");

  const filtered = args.listings.filter((listing) => {
    if (!isEligibleListingRecord(listing)) return false;

    if (cityId) {
      const listingCityId = normalizeId(listing.city_id);
      if (!listingCityId || listingCityId !== cityId) return false;
    }

    if (categoryId) {
      const listingCategoryId = normalizeId(listing.category_id);
      if (!listingCategoryId || listingCategoryId !== categoryId) return false;
    }

    return true;
  });

  return dedupeListingsById(filtered);
}

function buildListingPlacementResult<TListing extends PlacementListing>(
  listing: TListing,
  reason: PlacementReason,
): PlacementResult<TListing> {
  const tier = validateListingTier(listing);
  return {
    item: listing,
    score: getListingScore(listing),
    reason,
    breakdown: {
      tier,
      rating: typeof listing.google_rating === "number" ? listing.google_rating : undefined,
      popularity:
        typeof listing.google_review_count === "number"
          ? listing.google_review_count
          : typeof listing.view_count === "number"
            ? listing.view_count
            : undefined,
    },
  };
}

function sortListingPlacementResults<TListing extends PlacementListing>(
  results: PlacementResult<TListing>[],
): PlacementResult<TListing>[] {
  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return compareListingsDeterministically(a.item, b.item);
  });
}

function normalizeMaxItems(value: number | undefined): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const normalized = Math.max(1, Math.floor(value));
  return normalized;
}

function logListingDebugTable<TListing extends PlacementListing>(
  rows: PlacementResult<TListing>[],
  selection: ListingPlacementSelection,
  scope: Pick<ResolveListingOrderArgs<TListing>, "cityId" | "categoryId" | "maxItems">,
) {
  if (!DEV || rows.length === 0) return;

  console.table(
    rows.map((row) => ({
      listing: getListingName(row.item),
      listingId: row.item.id,
      score: row.score,
      tier: row.breakdown.tier ?? "unverified",
      cityId: row.item.city_id ?? "",
      categoryId: row.item.category_id ?? "",
      reason: row.reason,
      selection,
      filterCityId: scope.cityId ?? "",
      filterCategoryId: scope.categoryId ?? "",
      maxItems: scope.maxItems ?? "",
    })),
  );
}

// Selection rules:
// - manual: preserve manual ID order exactly; invalid IDs are dropped.
// - tier-driven: ignore manual IDs and rank every eligible listing by score.
// - hybrid: use the eligible manual pool (if any), then rank by score; fallback to full eligible pool when manual pool is empty.
export function resolveListingOrderWithExplanation<TListing extends PlacementListing>(
  args: ResolveListingOrderArgs<TListing>,
): PlacementResult<TListing>[] {
  const selection = normalizePlacementSelection(args.selection);
  const eligibleListings = filterEligibleListings({
    listings: args.listings,
    cityId: args.cityId,
    categoryId: args.categoryId,
  });

  if (eligibleListings.length === 0) return [];

  const manualListingIds = toUniqueIds(args.manualListingIds);
  const listingById = new Map(
    eligibleListings.map((listing) => [normalizeId(listing.id), listing]),
  );
  const manualPool = manualListingIds
    .map((listingId) => listingById.get(listingId))
    .filter((listing): listing is TListing => Boolean(listing));

  let results: PlacementResult<TListing>[];
  if (selection === "manual") {
    const orderedPool =
      manualPool.length > 0 ? manualPool : [...eligibleListings].sort(compareListingsDeterministically);
    results = orderedPool.map((listing) => buildListingPlacementResult(listing, "manual"));
  } else if (selection === "tier-driven") {
    results = sortListingPlacementResults(
      eligibleListings.map((listing) => buildListingPlacementResult(listing, "tier-driven")),
    );
  } else {
    const hybridPool = manualPool.length > 0 ? manualPool : eligibleListings;
    results = sortListingPlacementResults(
      hybridPool.map((listing) => buildListingPlacementResult(listing, "hybrid")),
    );
  }

  const maxItems = normalizeMaxItems(args.maxItems);
  const limited = typeof maxItems === "number" ? results.slice(0, maxItems) : results;

  if (args.debug) {
    logListingDebugTable(limited, selection, {
      cityId: args.cityId,
      categoryId: args.categoryId,
      maxItems,
    });
  }

  return limited;
}

export function resolveListingOrder<TListing extends PlacementListing>(
  args: ResolveListingOrderArgs<TListing>,
): TListing[] {
  return resolveListingOrderWithExplanation(args).map((result) => result.item);
}

export function resolveFeaturedListingWithExplanation<TListing extends PlacementListing>(
  args: ResolveFeaturedListingArgs<TListing>,
): PlacementResult<TListing> | null {
  const selection = normalizePlacementSelection(args.selection);
  const eligibleListings = filterEligibleListings({
    listings: args.listings,
    cityId: args.cityId,
    categoryId: args.categoryId,
  });

  if (eligibleListings.length === 0) return null;

  const manualListingId = normalizeId(args.manualListingId ?? "");
  const listingById = new Map(
    eligibleListings.map((listing) => [normalizeId(listing.id), listing]),
  );
  const manualListing = manualListingId ? listingById.get(manualListingId) : undefined;

  if (selection === "manual" && manualListing) {
    return buildListingPlacementResult(manualListing, "manual");
  }
  if (selection === "hybrid" && manualListing) {
    return buildListingPlacementResult(manualListing, "hybrid");
  }

  const ranked = resolveListingOrderWithExplanation({
    selection: "tier-driven",
    listings: eligibleListings,
    cityId: args.cityId,
    categoryId: args.categoryId,
    maxItems: 1,
    debug: args.debug,
  });
  const winner = ranked[0];
  if (!winner) return null;

  if (selection === "manual") return { ...winner, reason: "manual" };
  if (selection === "hybrid") return { ...winner, reason: "hybrid" };
  return winner;
}

export function resolveFeaturedListing<TListing extends PlacementListing>(
  args: ResolveFeaturedListingArgs<TListing>,
): TListing | null {
  const result = resolveFeaturedListingWithExplanation(args);
  return result?.item ?? null;
}

export function getTopPlacementExplanation<TCity extends PlacementCity>(
  result: PlacementResult<TCity> | null,
): string | null {
  if (!result) return null;

  const city = getCityName(result.item);
  const signature = result.breakdown.signatureCount ?? 0;
  const verified = result.breakdown.verifiedCount ?? 0;
  const unverified = result.breakdown.unverifiedCount ?? 0;

  return `${city} ranks highest due to ${signature} Signature listings, ${verified} Verified listings, and ${unverified} Unverified listings.`;
}
