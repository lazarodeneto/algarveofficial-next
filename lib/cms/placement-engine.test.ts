import { describe, expect, it } from "vitest";

import {
  filterEligibleListings,
  getListingScore,
  resolveFeaturedListing,
  resolveFeaturedListingWithExplanation,
  resolveListingOrder,
  resolveListingOrderWithExplanation,
  validateListingTier,
  type PlacementListing,
} from "@/lib/cms/placement-engine";

const baseListings: PlacementListing[] = [
  {
    id: "l-signature",
    name: "Signature One",
    city_id: "city-a",
    category_id: "cat-food",
    tier: "signature",
    status: "published",
  },
  {
    id: "l-verified",
    name: "Verified One",
    city_id: "city-a",
    category_id: "cat-food",
    tier: "verified",
    status: "published",
  },
  {
    id: "l-unverified",
    name: "Unverified One",
    city_id: "city-b",
    category_id: "cat-stay",
    tier: "unverified",
    status: "published",
  },
  {
    id: "l-draft",
    name: "Draft",
    city_id: "city-a",
    category_id: "cat-food",
    tier: "signature",
    status: "draft",
  },
];

describe("placement engine listing-level", () => {
  it("enforces tier validation fallback", () => {
    expect(validateListingTier({ id: "bad", tier: "unknown" })).toBe("unverified");
    expect(getListingScore({ id: "bad", tier: "unknown", status: "published" })).toBe(1);
  });

  it("filters by published + city + category and deduplicates", () => {
    const duplicated = [...baseListings, baseListings[0]];
    const eligible = filterEligibleListings({
      listings: duplicated,
      cityId: "city-a",
      categoryId: "cat-food",
    });

    expect(eligible.map((listing) => listing.id)).toEqual(["l-signature", "l-verified"]);
  });

  it("manual mode preserves manual ID order and drops invalid IDs", () => {
    const ordered = resolveListingOrder({
      selection: "manual",
      listings: baseListings,
      manualListingIds: ["l-verified", "missing", "l-signature"],
    });

    expect(ordered.map((listing) => listing.id)).toEqual(["l-verified", "l-signature"]);
  });

  it("tier-driven mode ranks signature > verified > unverified", () => {
    const ordered = resolveListingOrder({
      selection: "tier-driven",
      listings: baseListings,
    });

    expect(ordered.map((listing) => listing.id)).toEqual([
      "l-signature",
      "l-verified",
      "l-unverified",
    ]);
  });

  it("hybrid ranks within manual pool and falls back when pool is empty", () => {
    const hybridPoolRanked = resolveListingOrder({
      selection: "hybrid",
      listings: baseListings,
      manualListingIds: ["l-verified", "l-signature"],
    });
    expect(hybridPoolRanked.map((listing) => listing.id)).toEqual(["l-signature", "l-verified"]);

    const hybridFallback = resolveListingOrder({
      selection: "hybrid",
      listings: baseListings,
      manualListingIds: ["missing"],
    });
    expect(hybridFallback.map((listing) => listing.id)).toEqual([
      "l-signature",
      "l-verified",
      "l-unverified",
    ]);
  });

  it("supports maxItems and explanation output", () => {
    const results = resolveListingOrderWithExplanation({
      selection: "tier-driven",
      listings: baseListings,
      maxItems: 2,
    });

    expect(results).toHaveLength(2);
    expect(results[0].item.id).toBe("l-signature");
    expect(results[0].reason).toBe("tier-driven");
    expect(results[0].breakdown.tier).toBe("signature");
    expect(results[1].item.id).toBe("l-verified");
  });

  it("resolves featured listing with manual + fallback strategy", () => {
    const manualFeatured = resolveFeaturedListing({
      selection: "manual",
      listings: baseListings,
      manualListingId: "l-verified",
    });
    expect(manualFeatured?.id).toBe("l-verified");

    const tierFallback = resolveFeaturedListingWithExplanation({
      selection: "manual",
      listings: baseListings,
      manualListingId: "missing",
    });
    expect(tierFallback?.item.id).toBe("l-signature");
    expect(tierFallback?.reason).toBe("manual");
  });
});
