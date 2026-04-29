import { describe, expect, it } from "vitest";
import { getHomepageSignatureSelection } from "./getHomepageSignatureSelection";
import type { ListingWithRelations } from "@/hooks/useListings";

function listing(
  id: number,
  overrides: Partial<ListingWithRelations> = {},
): ListingWithRelations {
  return {
    id: `listing-${id}`,
    slug: `listing-${id}`,
    name: `Listing ${id}`,
    short_description: null,
    description: null,
    featured_image_url: id % 2 === 0 ? `https://images.example.com/${id}.jpg` : null,
    price_from: null,
    price_to: null,
    price_currency: "EUR",
    tier: "verified",
    is_curated: false,
    status: "published",
    city_id: "city-1",
    region_id: "region-1",
    category_id: `category-${id % 6}`,
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
    google_rating: 4 + (id % 10) / 10,
    google_review_count: id,
    tags: null,
    category_data: null,
    view_count: 0,
    published_at: null,
    created_at: new Date(2026, 0, id).toISOString(),
    updated_at: null,
    city: { id: "city-1", name: "Lagos", slug: "lagos", short_description: null, image_url: null, latitude: null, longitude: null },
    region: { id: "region-1", name: "Western Algarve", slug: "western-algarve", short_description: null, image_url: null },
    category: { id: `category-${id % 6}`, name: "Restaurants", slug: `category-${id % 6}`, icon: null, short_description: null, image_url: null },
    ...overrides,
  } as ListingWithRelations;
}

class QueryStub {
  constructor(private result: { data: ListingWithRelations[]; error: null }) {}

  select() {
    return this;
  }

  eq() {
    return this;
  }

  order() {
    return this;
  }

  limit() {
    return this;
  }

  then<TResult1 = { data: ListingWithRelations[]; error: null }, TResult2 = never>(
    onfulfilled?: ((value: { data: ListingWithRelations[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return Promise.resolve(this.result).then(onfulfilled, onrejected);
  }
}

function supabaseWithResults(...results: ListingWithRelations[][]) {
  let index = 0;
  return {
    from: () => new QueryStub({ data: results[index++] ?? [], error: null }),
  };
}

describe("getHomepageSignatureSelection", () => {
  it("uses Signature Collection mode when 24 signature listings exist", async () => {
    const signatures = Array.from({ length: 24 }, (_, index) =>
      listing(index + 1, { tier: "signature" }),
    );

    const result = await getHomepageSignatureSelection(supabaseWithResults(signatures));

    expect(result.isFallback).toBe(false);
    expect(result.listings).toHaveLength(24);
  });

  it("falls back to curated published listings when signature inventory is partial", async () => {
    const signatures = Array.from({ length: 4 }, (_, index) =>
      listing(index + 1, { tier: "signature" }),
    );
    const fallback = Array.from({ length: 30 }, (_, index) => listing(index + 1));

    const result = await getHomepageSignatureSelection(supabaseWithResults(signatures, fallback));

    expect(result.isFallback).toBe(true);
    expect(result.listings).toHaveLength(24);
    expect(new Set(result.listings.map((item) => item.category_id)).size).toBeGreaterThan(1);
  });

  it("returns an empty fallback safely when no published listings exist", async () => {
    const result = await getHomepageSignatureSelection(supabaseWithResults([], []));

    expect(result).toEqual({ listings: [], isFallback: true });
  });
});
