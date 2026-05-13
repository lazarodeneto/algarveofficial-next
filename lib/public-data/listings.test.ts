import { describe, expect, it } from "vitest";

import type { Tables } from "@/integrations/supabase/types";
import {
  buildPublicCategoryCityCountsFromRows,
  buildPublicCategoryCountsFromRows,
  normalizePublicListing,
  resolvePublicCategoryFilterIds,
  resolvePublicCategoryRouteFromRows,
} from "@/lib/public-data/listings";

function buildCategory(overrides: Partial<Tables<"categories">>): Tables<"categories"> {
  return {
    id: "category-1",
    name: "Category",
    slug: "category",
    description: null,
    short_description: null,
    icon: null,
    image_url: null,
    is_active: true,
    is_featured: false,
    display_order: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function buildListingRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "listing-1",
    slug: "praia-da-marinha-lagoa",
    name: "Praia da Marinha",
    short_description: "Scenic beach",
    description: "A public beach listing.",
    featured_image_url: "https://example.com/image.jpg",
    price_from: null,
    price_to: null,
    price_currency: null,
    tier: "unverified",
    is_curated: false,
    status: "published",
    city_id: "city-1",
    region_id: "region-1",
    category_id: "category-1",
    owner_id: "private-owner-id",
    latitude: 37.0901,
    longitude: -8.4123,
    address: "Lagoa, Algarve",
    contact_phone: "+351 000 000 000",
    contact_email: "hello@example.com",
    website_url: "https://example.com",
    facebook_url: "https://facebook.com/private",
    instagram_url: "https://instagram.com/private",
    google_business_url: "https://google.com/business",
    google_rating: 4.8,
    google_review_count: 100,
    tags: ["beaches"],
    category_data: { public_note: "visible through categoryData" },
    claim_status: "unclaimed",
    view_count: 999,
    published_at: "2026-01-01T00:00:00Z",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
    city: {
      id: "city-1",
      name: "Lagoa",
      slug: "lagoa",
      latitude: 37.1366,
      longitude: -8.4542,
    },
    region: {
      id: "region-1",
      name: "Algarve",
      slug: "algarve",
    },
    category: {
      id: "category-1",
      name: "Beaches",
      slug: "beaches",
      icon: "Umbrella",
      image_url: null,
      is_active: true,
    },
    ...overrides,
  } as never;
}

describe("resolvePublicCategoryFilterIds", () => {
  it("returns database category ids for listing queries, not the incoming slug", () => {
    const ids = resolvePublicCategoryFilterIds(
      [
        buildCategory({ id: "restaurants-id", name: "Restaurants", slug: "restaurants" }),
        buildCategory({ id: "fine-dining-id", name: "Fine Dining", slug: "fine-dining" }),
      ],
      "restaurants",
    );

    expect(ids).toEqual(["restaurants-id", "fine-dining-id"]);
    expect(ids).not.toContain("restaurants");
  });

  it("expands canonical category listing filters to merged member category ids", () => {
    const ids = resolvePublicCategoryFilterIds(
      [
        buildCategory({ id: "real-estate-id", name: "Real Estate", slug: "real-estate" }),
        buildCategory({ id: "prime-id", name: "Prime Real Estate", slug: "prime-real-estate" }),
        buildCategory({ id: "beaches-id", name: "Beaches", slug: "beaches" }),
      ],
      "real-estate",
    );

    expect(ids).toEqual(["real-estate-id", "prime-id"]);
  });

  it("does not expose hidden events categories through category listing filters", () => {
    expect(
      resolvePublicCategoryFilterIds(
        [
          buildCategory({ id: "events-id", name: "Events", slug: "events" }),
          buildCategory({ id: "markets-id", name: "Markets", slug: "markets" }),
        ],
        "events",
      ),
    ).toEqual([]);
  });

  it("returns an empty filter for unknown category slugs", () => {
    expect(resolvePublicCategoryFilterIds([], "missing-category")).toEqual([]);
  });
});

describe("resolvePublicCategoryRouteFromRows", () => {
  const routeCategories = [
    buildCategory({ id: "restaurants-id", name: "Restaurants", slug: "restaurants" }),
    buildCategory({ id: "fine-dining-id", name: "Fine Dining", slug: "fine-dining" }),
    buildCategory({ id: "real-estate-id", name: "Real Estate", slug: "real-estate" }),
    buildCategory({ id: "prime-id", name: "Prime Real Estate", slug: "prime-real-estate" }),
    buildCategory({ id: "markets-id", name: "Markets", slug: "markets" }),
  ];

  it("resolves a valid canonical category slug to its canonical category record", () => {
    expect(resolvePublicCategoryRouteFromRows(routeCategories, "restaurants", "en")).toMatchObject({
      ok: true,
      category: {
        id: "restaurants-id",
        canonicalSlug: "restaurants",
        canonicalUrlSlug: "restaurants",
        memberIds: ["restaurants-id", "fine-dining-id"],
      },
    });
  });

  it("accepts a canonical localized category slug", () => {
    expect(resolvePublicCategoryRouteFromRows(routeCategories, "restaurantes", "pt-pt")).toMatchObject({
      ok: true,
      category: {
        id: "restaurants-id",
        canonicalSlug: "restaurants",
        canonicalUrlSlug: "restaurantes",
        memberIds: ["restaurants-id", "fine-dining-id"],
      },
    });
  });

  it("redirects a valid canonical slug to the locale-specific category URL", () => {
    expect(resolvePublicCategoryRouteFromRows(routeCategories, "restaurants", "pt-pt")).toEqual({
      ok: false,
      reason: "redirect_required",
      redirectTo: "/pt-pt/category/restaurantes",
    });
  });

  it("redirects legacy or member category slugs to their canonical category URL", () => {
    expect(resolvePublicCategoryRouteFromRows(routeCategories, "prime-real-estate", "en")).toEqual({
      ok: false,
      reason: "redirect_required",
      redirectTo: "/category/real-estate",
    });
  });

  it("redirects an alias slug instead of rendering a duplicate category page", () => {
    expect(resolvePublicCategoryRouteFromRows(routeCategories, "gastronomy", "en")).toEqual({
      ok: false,
      reason: "redirect_required",
      redirectTo: "/category/restaurants",
    });
  });

  it("supports active database categories that are not in the programmatic slug registry", () => {
    expect(resolvePublicCategoryRouteFromRows(routeCategories, "markets", "en")).toMatchObject({
      ok: true,
      category: {
        id: "markets-id",
        canonicalSlug: "markets",
        canonicalUrlSlug: "markets",
        memberIds: ["markets-id"],
      },
    });
  });

  it("rejects unknown category route slugs", () => {
    expect(resolvePublicCategoryRouteFromRows(routeCategories, "not-a-real-category", "en")).toEqual({
      ok: false,
      reason: "not_found",
    });
  });
});

describe("buildPublicCategoryCountsFromRows", () => {
  it("keeps canonical counts aligned with id-based category filtering", () => {
    const categories = [
      buildCategory({ id: "restaurants-id", name: "Restaurants", slug: "restaurants" }),
      buildCategory({ id: "fine-dining-id", name: "Fine Dining", slug: "fine-dining" }),
      buildCategory({ id: "beaches-id", name: "Beaches", slug: "beaches" }),
    ];
    const listings = [
      { category_id: "restaurants-id", status: "published" },
      { category_id: "fine-dining-id", status: "published" },
      { category_id: "beaches-id", status: "published" },
      { category_id: "restaurants-id", status: "draft" },
    ] as const;
    const filterIds = resolvePublicCategoryFilterIds(categories, "restaurants");
    const filteredPublishedListings = listings.filter(
      (listing) => listing.status === "published" && filterIds.includes(listing.category_id),
    );
    const counts = buildPublicCategoryCountsFromRows(categories, listings);

    expect(counts.byCanonicalCategorySlug.restaurants).toBe(filteredPublishedListings.length);
    expect(counts.byCanonicalCategoryId["restaurants-id"]).toBe(filteredPublishedListings.length);
  });

  it("counts only published listings in visible categories and exposes canonical category totals", () => {
    const counts = buildPublicCategoryCountsFromRows(
      [
        buildCategory({ id: "restaurants-id", name: "Restaurants", slug: "restaurants" }),
        buildCategory({ id: "fine-dining-id", name: "Fine Dining", slug: "fine-dining" }),
        buildCategory({ id: "events-id", name: "Events", slug: "events" }),
        buildCategory({ id: "shopping-id", name: "Shopping", slug: "shopping", is_active: false }),
      ],
      [
        { category_id: "restaurants-id", status: "published" },
        { category_id: "fine-dining-id", status: "published" },
        { category_id: "restaurants-id", status: "draft" },
        { category_id: "events-id", status: "published" },
        { category_id: "shopping-id", status: "published" },
        { category_id: null, status: "published" },
      ],
    );

    expect(counts.byCanonicalCategoryId["restaurants-id"]).toBe(2);
    expect(counts.byCanonicalCategorySlug.restaurants).toBe(2);
    expect(counts.byCategoryId["restaurants-id"]).toBe(2);
    expect(counts.byMemberCategoryId["restaurants-id"]).toBe(1);
    expect(counts.byMemberCategoryId["fine-dining-id"]).toBe(1);
    expect(counts.byCategorySlug.events).toBeUndefined();
    expect(counts.byCategoryId["shopping-id"]).toBeUndefined();
  });
});

describe("buildPublicCategoryCityCountsFromRows", () => {
  it("counts all public category rows by city and applies localized city names", () => {
    const rows = [
      {
        city: { id: "lagoa-id", name: "Lagoa", slug: "lagoa", latitude: null, longitude: null },
      },
      {
        city: { id: "lagoa-id", name: "Lagoa", slug: "lagoa", latitude: null, longitude: null },
      },
      {
        city: { id: "lagos-id", name: "Lagos", slug: "lagos", latitude: null, longitude: null },
      },
      { city: null },
    ];

    expect(
      buildPublicCategoryCityCountsFromRows(
        rows,
        [{ city_id: "lagoa-id", name: "Lagoa PT" }],
        2,
      ),
    ).toEqual([
      { id: "lagoa-id", slug: "lagoa", name: "Lagoa PT", count: 2 },
      { id: "lagos-id", slug: "lagos", name: "Lagos", count: 1 },
    ]);
  });
});

describe("normalizePublicListing", () => {
  it("returns a public DTO and strips private/admin-only listing fields", () => {
    const listing = normalizePublicListing(buildListingRow());

    expect(listing).toMatchObject({
      id: "listing-1",
      slug: "praia-da-marinha-lagoa",
      name: "Praia da Marinha",
      status: "published",
      address: "Lagoa, Algarve",
      contactPhone: null,
      contactEmail: null,
      websiteUrl: null,
      city: {
        id: "city-1",
        name: "Lagoa",
        slug: "lagoa",
      },
      category: {
        id: "category-1",
        name: "Beaches",
        slug: "beaches",
      },
      location: {
        city: "Lagoa",
        region: "Algarve",
        latitude: 37.0901,
        longitude: -8.4123,
      },
    });
    expect(listing).not.toHaveProperty("owner_id");
    expect(listing).not.toHaveProperty("ownerId");
    expect(listing).not.toHaveProperty("view_count");
    expect(listing).not.toHaveProperty("facebook_url");
    expect(listing).not.toHaveProperty("instagram_url");
  });

  it("exposes public contact fields only for trusted listing tiers", () => {
    expect(normalizePublicListing(buildListingRow({ tier: "unverified" }))).toMatchObject({
      contactPhone: null,
      contactEmail: null,
      websiteUrl: null,
      googleBusinessUrl: null,
    });

    expect(normalizePublicListing(buildListingRow({ tier: "verified" }))).toMatchObject({
      contactPhone: "+351 000 000 000",
      contactEmail: "hello@example.com",
      websiteUrl: "https://example.com",
      googleBusinessUrl: "https://google.com/business",
    });

    expect(normalizePublicListing(buildListingRow({ tier: "signature" }))).toMatchObject({
      contactPhone: "+351 000 000 000",
      contactEmail: "hello@example.com",
      websiteUrl: "https://example.com",
      googleBusinessUrl: "https://google.com/business",
    });
  });

  it("does not use city coordinates for map output unless explicitly allowed", () => {
    expect(
      normalizePublicListing(
        buildListingRow({
          latitude: null,
          longitude: null,
        }),
      ).location,
    ).toMatchObject({
      latitude: null,
      longitude: null,
    });

    expect(
      normalizePublicListing(
        buildListingRow({
          latitude: null,
          longitude: null,
        }),
        undefined,
        { allowCityCoordinateFallback: true },
      ).location,
    ).toMatchObject({
      latitude: 37.1366,
      longitude: -8.4542,
    });
  });
});
