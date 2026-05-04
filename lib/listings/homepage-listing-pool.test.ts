import { describe, expect, it } from "vitest";
import type { ListingWithRelations } from "@/hooks/useListings";
import {
  buildHomepageListingPool,
  deterministicDailyShuffle,
  getLisbonDateSeed,
  splitHomepageListings,
} from "./homepage-listing-pool";

function listing(
  id: string,
  overrides: Partial<ListingWithRelations> = {},
): ListingWithRelations {
  const categoryId = overrides.category_id ?? `category-${id}`;

  return {
    id,
    slug: id,
    name: `Listing ${id}`,
    short_description: null,
    description: null,
    featured_image_url: null,
    price_from: null,
    price_to: null,
    price_currency: "EUR",
    tier: "unverified",
    is_curated: false,
    status: "published",
    city_id: "city-1",
    region_id: "region-1",
    category_id: categoryId,
    owner_id: null,
    latitude: null,
    longitude: null,
    address: null,
    website_url: null,
    facebook_url: null,
    instagram_url: null,
    twitter_url: null,
    linkedin_url: null,
    youtube_url: null,
    tiktok_url: null,
    telegram_url: null,
    google_business_url: null,
    google_rating: null,
    google_review_count: null,
    tags: null,
    category_data: null,
    view_count: 0,
    published_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: null,
    city: { id: "city-1", name: "Lagos", slug: "lagos", short_description: null, image_url: null, latitude: null, longitude: null },
    region: { id: "region-1", name: "Western Algarve", slug: "western-algarve", short_description: null, image_url: null },
    category: { id: categoryId, name: categoryId, slug: categoryId, icon: null, short_description: null, image_url: null },
    ...overrides,
  } as ListingWithRelations;
}

function ids(listings: ListingWithRelations[]) {
  return listings.map((item) => item.id);
}

describe("homepage listing pool", () => {
  it("uses only Signature listings when at least 24 published Signature listings exist", () => {
    const listings = [
      ...Array.from({ length: 30 }, (_, index) => listing(`signature-${index}`, { tier: "signature" })),
      ...Array.from({ length: 10 }, (_, index) => listing(`verified-${index}`, { tier: "verified" })),
      listing("fallback", { google_rating: 5 }),
    ];

    const result = buildHomepageListingPool(listings, "2026-05-04");

    expect(result).toHaveLength(23);
    expect(result.every((item) => item.tier === "signature")).toBe(true);
  });

  it("fills the gap with Verified listings before using fallback listings", () => {
    const listings = [
      ...Array.from({ length: 10 }, (_, index) => listing(`signature-${index}`, { tier: "signature" })),
      ...Array.from({ length: 20 }, (_, index) => listing(`verified-${index}`, { tier: "verified" })),
      listing("fallback", { google_rating: 5 }),
    ];

    const result = buildHomepageListingPool(listings, "2026-05-04");

    expect(result).toHaveLength(23);
    expect(result.filter((item) => item.tier === "signature")).toHaveLength(10);
    expect(result.filter((item) => item.tier === "verified")).toHaveLength(13);
    expect(result.some((item) => item.id === "fallback")).toBe(false);
  });

  it("fills with Google-rated fallback listings sorted by rating then review count", () => {
    const paidListings = [
      ...Array.from({ length: 8 }, (_, index) => listing(`signature-${index}`, { tier: "signature" })),
      ...Array.from({ length: 11 }, (_, index) => listing(`verified-${index}`, { tier: "verified" })),
    ];
    const fallbackListings = [
      listing("fallback-4", { category_id: "fallback-4", google_rating: 4.8, google_review_count: 500 }),
      listing("fallback-1", { category_id: "fallback-1", google_rating: 5, google_review_count: 20 }),
      listing("fallback-3", { category_id: "fallback-3", google_rating: 4.9, google_review_count: 900 }),
      listing("fallback-2", { category_id: "fallback-2", google_rating: 5, google_review_count: 10 }),
    ];

    const result = buildHomepageListingPool([...paidListings, ...fallbackListings], "2026-05-04");

    expect(result).toHaveLength(23);
    expect(ids(result.slice(19))).toEqual(["fallback-1", "fallback-2", "fallback-3", "fallback-4"]);
  });

  it("uses maximum one Google-rated fallback per category before final published fill", () => {
    const result = buildHomepageListingPool([
      listing("fallback-a", { category_id: "restaurants", google_rating: 5, google_review_count: 50 }),
      listing("fallback-b", { category_id: "restaurants", google_rating: 4.9, google_review_count: 1000 }),
      listing("fallback-c", { category_id: "shopping", google_rating: 4.8, google_review_count: 30 }),
    ], "2026-05-04");

    expect(ids(result).slice(0, 2)).toEqual(["fallback-a", "fallback-c"]);
    expect(ids(result)).toContain("fallback-b");
  });

  it("fills remaining homepage slots from published unpaid listings after strict fallback balancing", () => {
    const listings = [
      ...Array.from({ length: 8 }, (_, index) => listing(`signature-${index}`, { tier: "signature" })),
      ...Array.from({ length: 6 }, (_, index) => listing(`verified-${index}`, { tier: "verified" })),
      ...Array.from({ length: 20 }, (_, index) =>
        listing(`unpaid-${index}`, {
          category_id: "same-category",
          google_rating: index === 0 ? 5 : null,
          google_review_count: index === 0 ? 100 : null,
        }),
      ),
    ];

    const result = buildHomepageListingPool(listings, "2026-05-04");

    expect(result).toHaveLength(23);
    expect(result.slice(0, 8).every((item) => item.tier === "signature")).toBe(true);
    expect(result.slice(8, 14).every((item) => item.tier === "verified")).toBe(true);
  });

  it("keeps daily ordering deterministic and changes on a different seed", () => {
    const listings = Array.from({ length: 30 }, (_, index) =>
      listing(`signature-${index}`, { tier: "signature" }),
    );

    const firstRun = ids(buildHomepageListingPool(listings, "2026-05-04"));
    const secondRun = ids(buildHomepageListingPool(listings, "2026-05-04"));
    const nextDay = ids(buildHomepageListingPool(listings, "2026-05-05"));

    expect(secondRun).toEqual(firstRun);
    expect(nextDay).not.toEqual(firstRun);
  });

  it("does not change selected listing IDs when localized content changes", () => {
    const listings = Array.from({ length: 30 }, (_, index) =>
      listing(`signature-${index}`, { tier: "signature", name: `English ${index}` }),
    );
    const localizedListings = listings.map((item, index) => ({
      ...item,
      name: `Português ${index}`,
      short_description: `Descrição ${index}`,
    }));

    expect(ids(buildHomepageListingPool(localizedListings, "2026-05-04"))).toEqual(
      ids(buildHomepageListingPool(listings, "2026-05-04")),
    );
  });

  it("splits the final homepage list into 8 editor and 15 premium listings", () => {
    const pool = buildHomepageListingPool(
      Array.from({ length: 30 }, (_, index) => listing(`signature-${index}`, { tier: "signature" })),
      "2026-05-04",
    );
    const split = splitHomepageListings(pool);

    expect(split.editorsSelection).toHaveLength(8);
    expect(split.premiumListings).toHaveLength(15);
    expect(split.editorsSelection.length + split.premiumListings.length).toBe(23);
  });

  it("never selects unpublished or duplicate listings and returns fewer than 24 when inventory is limited", () => {
    const shared = listing("shared", { tier: "signature" });
    const result = buildHomepageListingPool([
      shared,
      shared,
      listing("draft-signature", { tier: "signature", status: "draft" }),
      listing("verified", { tier: "verified" }),
      listing("fallback", { google_rating: 5 }),
      listing("unrated", { google_rating: null }),
    ], "2026-05-04");

    expect(ids(result)).toEqual(["shared", "verified", "fallback", "unrated"]);
    expect(new Set(ids(result)).size).toBe(result.length);
  });

  it("uses Portugal local midnight for the Lisbon date seed", () => {
    expect(getLisbonDateSeed(new Date("2026-05-04T22:30:00.000Z"))).toBe("2026-05-04");
    expect(getLisbonDateSeed(new Date("2026-05-04T23:30:00.000Z"))).toBe("2026-05-05");
  });

  it("provides a deterministic pure daily shuffle", () => {
    const listings = Array.from({ length: 10 }, (_, index) =>
      listing(`listing-${index}`, { tier: "verified" }),
    );

    expect(ids(deterministicDailyShuffle(listings, "2026-05-04"))).toEqual(
      ids(deterministicDailyShuffle(listings, "2026-05-04")),
    );
    expect(ids(deterministicDailyShuffle(listings, "2026-05-05"))).not.toEqual(
      ids(deterministicDailyShuffle(listings, "2026-05-04")),
    );
  });
});
