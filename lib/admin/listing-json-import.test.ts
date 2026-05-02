import { describe, expect, it } from "vitest";

import { normalizeImportCategory, normalizeImportListing } from "./listing-json-import";

describe("listing JSON import normalization", () => {
  it("detects the final golf schema from a top-level golf object", () => {
    const listing = normalizeImportListing(
      {
        Nome: "The Els Club Vilamoura",
        City: "Vilamoura",
        Region: "Vilamoura Prestige",
        location: { address: "Vilamoura, Loule", latitude: 37.095, longitude: -8.118 },
        golf: {
          course_type: "championship",
          holes: 18,
          par: 72,
          slope: { white: 138, yellow: 134, red: 130 },
          course_rating: { white: 74.5, yellow: 72.8, red: 70.2 },
          length_meters: { white: 6651, yellow: 6200, red: 5400 },
          designer: "Ernie Els",
          year_opened: 2004,
          last_renovation: 2024,
          layout_type: "parkland",
          difficulty: "high",
          is_tournament_course: "yes",
          is_signature: true,
        },
        facilities: { driving_range: true, buggy: 1, caddie: "no" },
        access: { type: "private", allows_visitors: "true", membership_required: false },
        positioning: { target: "luxury", price_range: "high" },
        media: { featured_image: "https://example.com/els.webp", gallery: ["https://example.com/1.webp"] },
        seo: { meta_title: "The Els Club", meta_description: "Championship golf course." },
        scorecard: [{ hole: 1, par: 4, hcp: 9, white: 380, yellow: 360, red: 310 }],
      },
      0,
    );

    expect(listing.normalizedCategory).toBe("golf");
    expect(listing.vertical).toBe("golf");
    expect(listing.slug).toBe("the-els-club-vilamoura");
    expect(listing.base.country).toBe("Portugal");
    expect(listing.base.address).toBe("Vilamoura, Loule");
    expect(listing.base.latitude).toBe(37.095);
    expect(listing.base.featuredImageUrl).toBe("https://example.com/els.webp");
    expect(listing.base.metaTitle).toBe("The Els Club");
    expect(listing.base.tier).toBe("signature");
    expect(listing.categoryDataPatch.golf).toMatchObject({
      course_type: "championship",
      holes: 18,
      par: 72,
      slope: { white: 138, yellow: 134, red: 130 },
      course_rating: { white: 74.5, yellow: 72.8, red: 70.2 },
      length_meters: { white: 6651, yellow: 6200, red: 5400 },
      designer: "Ernie Els",
      year_opened: 2004,
      is_signature: true,
    });
    expect(listing.categoryDataPatch.facilities).toMatchObject({ driving_range: true, buggy: true, caddie: false });
    expect(listing.categoryDataPatch.access).toMatchObject({ type: "private", allows_visitors: true, membership_required: false });
    expect(listing.golfHoles).toHaveLength(1);
    expect(listing.warnings).toContain("Golf schema detected from top-level golf object.");
    expect(listing.warnings).toContain("URL_slug missing; slug will be generated from Nome.");
    expect(listing.warnings).toContain("Country missing; defaulting to Portugal.");
    expect(listing.warnings).toContain("Scorecard has 1 row but golf.holes is 18.");
    expect(listing.warnings).toContain("golf.is_signature=true; tier will default to signature on create.");
    expect(listing.errors).toHaveLength(0);
  });

  it("maps golf flat aliases into golf metadata", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Alias Golf",
        URL_slug: "alias-golf",
        City: "Lagos",
        Category: "golf",
        Holes: 9,
        Par: 33,
        Designer: "Martin Hawtree",
        Booking_URL: "https://example.com/book",
      },
      0,
    );

    expect(listing.categoryDataPatch.golf).toMatchObject({
      holes: 9,
      par: 33,
      designer: "Martin Hawtree",
    });
  });

  it("returns field-level validation errors for invalid final golf numeric fields", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Bad Golf",
        City: "Lagos",
        golf: {
          holes: "eighteen",
          par: 72,
          slope: { white: "hard" },
          course_rating: { yellow: "medium" },
          length_meters: { red: "long" },
        },
      },
      0,
    );

    expect(listing.errors).toContain("golf.holes must be a positive number.");
    expect(listing.errors).toContain("golf.slope.white must be numeric if present.");
    expect(listing.errors).toContain("golf.course_rating.yellow must be numeric if present.");
    expect(listing.errors).toContain("golf.length_meters.red must be numeric if present.");
  });

  it.each([
    ["omitted", undefined, null],
    ["null", null, null],
    ["empty string", "", null],
    ["numeric string", "2020", 2020],
    ["number", 2020, 2020],
  ])("accepts optional golf last_renovation when %s", (_label, value, expected) => {
    const golf: Record<string, unknown> = { holes: 18, par: 72 };
    if (value !== undefined) golf.last_renovation = value;

    const listing = normalizeImportListing(
      {
        Nome: "Nullable Renovation Golf",
        City: "Lagos",
        golf,
      },
      0,
    );

    expect(listing.errors).toHaveLength(0);
    expect(listing.categoryDataPatch.golf).toMatchObject({
      last_renovation: expected,
    });
  });

  it.each(["N/A", "recent", "unknown", true, {}, []])(
    "rejects invalid optional golf last_renovation value %j",
    (value) => {
      const listing = normalizeImportListing(
        {
          Nome: "Bad Renovation Golf",
          City: "Lagos",
          golf: { holes: 18, par: 72, last_renovation: value },
        },
        0,
      );

      expect(listing.errors).toContain("golf.last_renovation must be numeric if present.");
    },
  );

  it("accepts null optional golf slope, course_rating, and length_meters values", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Nullable Metrics Golf",
        City: "Lagos",
        golf: {
          holes: 18,
          par: 72,
          slope: null,
          course_rating: null,
          length_meters: null,
        },
      },
      0,
    );

    expect(listing.errors).toHaveLength(0);
    expect(listing.categoryDataPatch.golf).toMatchObject({
      slope: null,
      course_rating: null,
      length_meters: null,
    });
  });

  it("accepts the Els Club sample with null optional golf metrics", () => {
    const listing = normalizeImportListing(
      {
        Nome: "The Els Club Vilamoura",
        URL_slug: "the-els-club-vilamoura",
        City: "Vilamoura",
        Region: "Vilamoura Prestige",
        Country: "Portugal",
        category: "golf",
        golf: {
          course_type: "championship",
          holes: 18,
          par: 72,
          slope: null,
          course_rating: null,
          length_meters: null,
          designer: "Ernie Els",
          year_opened: 2004,
          last_renovation: null,
          layout_type: null,
          difficulty: null,
          is_tournament_course: true,
          is_signature: true,
        },
      },
      0,
    );

    expect(listing.errors).toHaveLength(0);
    expect(listing.warnings).toContain("Golf schema detected from top-level golf object.");
    expect(listing.categoryDataPatch.golf).toMatchObject({
      slope: null,
      course_rating: null,
      length_meters: null,
      year_opened: 2004,
      last_renovation: null,
    });
  });

  it("rejects null required golf holes and par values", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Missing Required Golf",
        City: "Lagos",
        golf: { holes: null, par: null },
      },
      0,
    );

    expect(listing.errors).toContain("golf.holes must be a positive number.");
    expect(listing.errors).toContain("golf.par must be a reasonable golf course par.");
  });

  it("returns a validation error for duplicate scorecard holes", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Duplicate Scorecard",
        City: "Lagos",
        golf: { holes: 18, par: 72 },
        scorecard: [
          { hole: 1, par: 4, hcp: 9, white: 380 },
          { hole: 1, par: 5, hcp: 10, white: 500 },
        ],
      },
      0,
    );

    expect(listing.errors).toContain("scorecard has duplicate hole number 1.");
  });

  it("normalizes property aliases, booleans, types, and listing price fields", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Luxury Villa in Vale do Lobo",
        URL_slug: "luxury-villa-vale-do-lobo",
        City: "Vale do Lobo",
        category: "properties",
        Property_Type: "Villa",
        Transaction_Type: "Sale",
        Price: "2450000",
        Bedrooms: "5",
        Bathrooms: 6,
        Pool: "yes",
        Sea_View: 0,
      },
      0,
    );

    expect(listing.normalizedCategory).toBe("real-estate");
    expect(listing.vertical).toBe("property");
    expect(listing.categoryDataPatch.property).toMatchObject({
      property_type: "villa",
      transaction_type: "sale",
      price: 2450000,
      bedrooms: 5,
      bathrooms: 6,
      pool: true,
      sea_view: false,
      currency: "EUR",
    });
    expect(listing.listingPrice).toEqual({ priceFrom: 2450000, currency: "EUR" });
    expect(listing.errors).toHaveLength(0);
  });

  it("detects concierge-services as structured service data without classifying golf-shop text as golf", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Nevada Bob’s Golf Quinta do Lago",
        URL_slug: "nevada-bobs-golf-quinta-do-lago",
        City: "Almancil",
        Region: "Golden Triangle",
        Country: "Portugal",
        category: "concierge-services",
        listing: {
          type: "service",
          subcategory: "golf-shop",
        },
        details: {
          title: "Golf Retail & Equipment",
          description: "Specialist golf shop in Quinta do Lago offering premium equipment, apparel, and custom fitting services.",
          target: "golfers",
          price_range: "high",
        },
        features: [
          "club fitting",
          "equipment sales",
          "golf apparel",
          "accessories",
          "premium brands",
        ],
        location: {
          city: "Almancil",
          region: "Golden Triangle",
        },
        relations: {
          nearby_courses: [
            "quinta-do-lago-south-course",
            "quinta-do-lago-north-course",
            "laranjal-course",
          ],
        },
        media: {
          featured_image: "https://example.com/nevada-bobs.webp",
        },
        seo: {
          meta_title: "Nevada Bob’s Golf Shop Quinta do Lago",
          meta_description: "Premium golf shop in Quinta do Lago offering equipment, apparel, and expert club fitting services.",
        },
      },
      0,
    );

    expect(listing.normalizedCategory).toBe("concierge-services");
    expect(listing.vertical).toBe("service");
    expect(listing.subcategory).toBe("golf-shop");
    expect(listing.base.featuredImageUrl).toBe("https://example.com/nevada-bobs.webp");
    expect(listing.base.metaTitle).toBe("Nevada Bob’s Golf Shop Quinta do Lago");
    expect(listing.categoryDataPatch.service).toMatchObject({
      listing: { type: "service", subcategory: "golf-shop" },
      details: {
        title: "Golf Retail & Equipment",
        target: "golfers",
        price_range: "high",
      },
      features: ["club fitting", "equipment sales", "golf apparel", "accessories", "premium brands"],
      relations: {
        nearby_courses: [
          "quinta-do-lago-south-course",
          "quinta-do-lago-north-course",
          "laranjal-course",
        ],
      },
    });
    expect(listing.categoryDataPatch).not.toHaveProperty("golf");
    expect(listing.errors).toHaveLength(0);
    expect(listing.warnings).toContain("Concierge Services structured data detected.");
  });

  it("validates service features and nearby course relations as arrays", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Bad Service",
        City: "Almancil",
        category: "services",
        listing: { type: "service" },
        features: "club fitting",
        relations: { nearby_courses: "quinta-do-lago-south-course" },
      },
      0,
    );

    expect(listing.normalizedCategory).toBe("concierge-services");
    expect(listing.vertical).toBe("service");
    expect(listing.errors).toContain("features must be an array.");
    expect(listing.errors).toContain("relations.nearby_courses must be an array.");
  });

  it("returns a validation error for invalid numeric property price", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Bad Price Property",
        URL_slug: "bad-price-property",
        City: "Lagos",
        category: "real estate",
        property: { price: "price on request", transaction_type: "sale" },
      },
      0,
    );

    expect(listing.errors).toContain("Property price must be numeric if present.");
  });

  it("preserves partial property updates by only returning supplied fields", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Partial Property",
        URL_slug: "partial-property",
        City: "Lagos",
        category: "properties",
        property: { bedrooms: 3 },
      },
      0,
    );

    expect(listing.categoryDataPatch.property).toMatchObject({ bedrooms: 3, property_type: "other", currency: "EUR" });
    expect(listing.categoryDataPatch.property).not.toHaveProperty("bathrooms");
  });

  it("normalizes category aliases", () => {
    expect(normalizeImportCategory("golf-course")).toBe("golf");
    expect(normalizeImportCategory("luxury properties")).toBe("real-estate");
    expect(normalizeImportCategory("beach clubs")).toBe("beach-clubs");
    expect(normalizeImportCategory("concierge services")).toBe("concierge-services");
    expect(normalizeImportCategory("services")).toBe("concierge-services");
  });
});
