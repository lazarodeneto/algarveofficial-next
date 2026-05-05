import type { ListingWithRelations } from "@/hooks/useListings";

export const HOMEPAGE_EDITORS_LIMIT = 8;
export const HOMEPAGE_PREMIUM_LIMIT = 15;
export const HOMEPAGE_LISTING_LIMIT = HOMEPAGE_EDITORS_LIMIT + HOMEPAGE_PREMIUM_LIMIT;

const LISBON_TIME_ZONE = "Europe/Lisbon";

function getLisbonDateFormatter() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: LISBON_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function getLisbonDateSeed(date: Date = new Date()): string {
  const parts = getLisbonDateFormatter().formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function getCategoryKey(listing: ListingWithRelations): string {
  return listing.category_id ?? listing.category?.id ?? listing.category?.slug ?? "uncategorized";
}

function getShuffleKey(listing: ListingWithRelations, seed: string): number {
  return hashString([
    seed,
    listing.id,
    listing.tier ?? "",
    getCategoryKey(listing),
  ].join(":"));
}

export function deterministicDailyShuffle<T extends ListingWithRelations>(
  listings: readonly T[],
  seed: string,
): T[] {
  return [...listings].sort((a, b) => {
    const hashDiff = getShuffleKey(a, seed) - getShuffleKey(b, seed);
    if (hashDiff !== 0) return hashDiff;
    return a.id.localeCompare(b.id);
  });
}

function isPublished(listing: ListingWithRelations): boolean {
  return listing.status === "published";
}

function isSignature(listing: ListingWithRelations): boolean {
  return listing.tier === "signature";
}

function isVerified(listing: ListingWithRelations): boolean {
  return listing.tier === "verified";
}

function hasGoogleRating(listing: ListingWithRelations): boolean {
  return listing.google_rating !== null && listing.google_rating !== undefined;
}

function sortGoogleFallback(
  listings: readonly ListingWithRelations[],
): ListingWithRelations[] {
  return [...listings].sort((a, b) => {
    const ratingDiff = Number(b.google_rating ?? 0) - Number(a.google_rating ?? 0);
    if (ratingDiff !== 0) return ratingDiff;

    const reviewDiff = Number(b.google_review_count ?? 0) - Number(a.google_review_count ?? 0);
    if (reviewDiff !== 0) return reviewDiff;

    return a.id.localeCompare(b.id);
  });
}

function balanceFallbackByCategory(
  listings: readonly ListingWithRelations[],
): ListingWithRelations[] {
  const selected: ListingWithRelations[] = [];
  const groupedListings = new Map<string, ListingWithRelations[]>();

  for (const listing of listings) {
    const categoryKey = getCategoryKey(listing);
    const group = groupedListings.get(categoryKey);
    if (group) {
      group.push(listing);
    } else {
      groupedListings.set(categoryKey, [listing]);
    }
  }

  const categoryGroups = [...groupedListings.values()];
  let hasRemainingListings = true;

  while (hasRemainingListings) {
    hasRemainingListings = false;

    for (const categoryGroup of categoryGroups) {
      const listing = categoryGroup.shift();
      if (!listing) continue;

      selected.push(listing);
      hasRemainingListings = true;
    }
  }

  return selected;
}

export function buildHomepageListingPool(
  listings: readonly ListingWithRelations[],
  seed: string = getLisbonDateSeed(),
): ListingWithRelations[] {
  const selected: ListingWithRelations[] = [];
  const selectedIds = new Set<string>();

  function addListings(candidates: readonly ListingWithRelations[]) {
    for (const listing of candidates) {
      if (selected.length >= HOMEPAGE_LISTING_LIMIT) return;
      if (selectedIds.has(listing.id)) continue;

      selected.push(listing);
      selectedIds.add(listing.id);
    }
  }

  const publishedListings = listings.filter(isPublished);
  const signatureListings = deterministicDailyShuffle(
    publishedListings.filter(isSignature),
    `signature:${seed}`,
  );
  const verifiedListings = deterministicDailyShuffle(
    publishedListings.filter(isVerified),
    `verified:${seed}`,
  );
  const googleFallbackListings = balanceFallbackByCategory(
    sortGoogleFallback(
      publishedListings.filter(
        (listing) => !isSignature(listing) && !isVerified(listing) && hasGoogleRating(listing),
      ),
    ),
  );

  addListings(signatureListings);
  addListings(verifiedListings);
  addListings(googleFallbackListings);

  return selected;
}

export function splitHomepageListings(listings: readonly ListingWithRelations[]) {
  const cappedListings = listings.slice(0, HOMEPAGE_LISTING_LIMIT);

  return {
    editorsSelection: cappedListings.slice(0, HOMEPAGE_EDITORS_LIMIT),
    premiumListings: cappedListings.slice(
      HOMEPAGE_EDITORS_LIMIT,
      HOMEPAGE_EDITORS_LIMIT + HOMEPAGE_PREMIUM_LIMIT,
    ),
  };
}
