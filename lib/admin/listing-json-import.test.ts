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

  it("preserves valid URL_slug values for normal listings and marks known slugs as updates", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Boavista Restaurant",
        URL_slug: "boavista-restaurant-lagos",
        City: "Lagos",
        category: "restaurants",
      },
      0,
      { existingSlugs: new Set(["boavista-restaurant-lagos"]) },
    );

    expect(listing.slug).toBe("boavista-restaurant-lagos");
    expect(listing.estimatedAction).toBe("update");
    expect(listing.errors).toHaveLength(0);
    expect(listing.warnings).not.toEqual(
      expect.arrayContaining([expect.stringContaining("URL_slug normalized")]),
    );
  });

  it("uses the canonical course-name slug for golf even when source URL_slug has a city suffix", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Ombria Golf Course",
        URL_slug: "ombria-golf-course-algarve",
        City: "Almancil",
        category: "golf",
        golf: { holes: 18, par: 71 },
      },
      0,
      { existingSlugs: new Set(["ombria-golf-course"]) },
    );

    expect(listing.slug).toBe("ombria-golf-course");
    expect(listing.estimatedAction).toBe("update");
    expect(listing.warnings).toContain(
      'Golf URL_slug "ombria-golf-course-algarve" will use canonical course-name slug "ombria-golf-course".',
    );
    expect(listing.errors).toHaveLength(0);
  });

  it("generates a slug from the name when URL_slug is missing", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Quinta do Lago South Course",
        City: "Almancil",
        category: "golf",
        golf: { holes: 18, par: 72 },
      },
      0,
    );

    expect(listing.slug).toBe("quinta-do-lago-south-course");
    expect(listing.estimatedAction).toBe("create");
    expect(listing.warnings).toContain("URL_slug missing; slug will be generated from Nome.");
    expect(listing.errors).toHaveLength(0);
  });

  it("normalizes non-canonical URL_slug punctuation without inventing random suffixes", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Boavista Restaurant",
        URL_slug: " Boavista Restaurant Lagos ",
        City: "Lagos",
        category: "restaurants",
      },
      0,
    );

    expect(listing.slug).toBe("boavista-restaurant-lagos");
    expect(listing.warnings).toContain(
      'URL_slug normalized from "Boavista Restaurant Lagos" to "boavista-restaurant-lagos".',
    );
    expect(listing.errors).toHaveLength(0);
  });

  it("rejects full URL and locale-prefixed URL_slug values", () => {
    const fullUrlListing = normalizeImportListing(
      {
        Nome: "Bad URL Golf",
        URL_slug: "https://example.com/golf/bad-url-golf",
        City: "Lagos",
        category: "golf",
        golf: { holes: 18, par: 72 },
      },
      0,
    );
    const localizedListing = normalizeImportListing(
      {
        Nome: "Localized Slug Golf",
        URL_slug: "pt-pt/localized-slug-golf",
        City: "Lagos",
        category: "golf",
        golf: { holes: 18, par: 72 },
      },
      1,
    );

    expect(fullUrlListing.estimatedAction).toBe("invalid");
    expect(fullUrlListing.errors).toContain("URL_slug is invalid: Slug must not be a full URL.");
    expect(localizedListing.estimatedAction).toBe("invalid");
    expect(localizedListing.errors).toContain("URL_slug is invalid: Slug must not include a locale prefix.");
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

  it("keeps rich golf listing metadata and maps distance-array scorecards", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Ombria Golf Course",
        URL_slug: "ombria-golf-course-algarve",
        City: "Almancil",
        category: "golf",
        contact: {
          phone: "+351 937 370 945",
          email: "golfombria@ombria.com",
          website: "https://www.ombria.com/en/golf/golf-course/",
        },
        socials: {
          instagram: "https://www.instagram.com/ombriaalgarve/",
          facebook: "https://www.facebook.com/ombriaalgarve/",
          linkedin: "https://www.linkedin.com/company/ombria-algarve/",
          youtube: "https://www.youtube.com/@ombriaalgarve",
          x_twitter: "https://x.com/ombriaresort",
        },
        business_details: {
          google_business_url: "https://maps.example/ombria",
          services: ["tee time booking"],
          amenities: ["putting green"],
        },
        content: {
          short_description: "Short Ombria copy.",
          full_description: "Full Ombria copy.",
        },
        category_data: {
          vertical: "golf",
          holes_count: 18,
          par: 71,
          slope_rating: 132,
          booking_url: "https://ombria.golfmanager.com/",
          scorecard_url: "https://example.com/scorecard.pdf",
          course_map_url: "https://example.com/course-map",
          official_sources: ["https://www.ombria.com/en/golf/golf-course/"],
        },
        golf: {
          holes: 18,
          par: 71,
          length_meters: 5802,
          designer: "Jorge Santana da Silva",
          year_opened: 2023,
        },
        scorecard: [
          { hole: 1, par: 5, hcp: 5, distances_meters: [428, 418, 406, 321] },
          { hole: 2, par: 4, hcp_10_27: 6, distances_meters: [345, 314, 291, 275] },
        ],
      },
      0,
    );

    expect(listing.slug).toBe("ombria-golf-course");
    expect(listing.base.phone).toBe("+351 937 370 945");
    expect(listing.base.websiteUrl).toBe("https://www.ombria.com/en/golf/golf-course/");
    expect(listing.base.instagramUrl).toBe("https://www.instagram.com/ombriaalgarve/");
    expect(listing.base.googleBusinessUrl).toBe("https://maps.example/ombria");
    expect(listing.base.shortDescription).toBe("Short Ombria copy.");
    expect(listing.base.description).toBe("Full Ombria copy.");
    expect(listing.categoryDataPatch.business_details).toMatchObject({
      services: ["tee time booking"],
      amenities: ["putting green"],
    });
    expect(listing.categoryDataPatch.booking_url).toBe("https://ombria.golfmanager.com/");
    expect(listing.categoryDataPatch.scorecard_pdf_url).toBe("https://example.com/scorecard.pdf");
    expect(listing.categoryDataPatch.official_sources).toEqual([
      "https://www.ombria.com/en/golf/golf-course/",
    ]);
    expect(listing.golfHoles[0]).toMatchObject({
      hole_number: 1,
      par: 5,
      stroke_index: 5,
      distance_white: 428,
      distance_yellow: 418,
      distance_red: 321,
    });
    expect(listing.golfHoles[1]).toMatchObject({
      hole_number: 2,
      par: 4,
      stroke_index: 6,
      distance_white: 345,
      distance_yellow: 314,
      distance_red: 275,
    });
  });

  it("preserves explicit null social and Google fields so imports can clear stale values", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Vale da Pinta Golf Course",
        URL_slug: "vale-da-pinta-golf-course",
        City: "Carvoeiro",
        category: "golf",
        socials: {
          instagram: null,
          facebook: "https://www.facebook.com/PestanaGolf",
          linkedin: null,
          x_twitter: null,
        },
        business_details: {
          google_business_url: null,
          google_rating: null,
          google_review_count: null,
        },
        location: {
          latitude: null,
          longitude: null,
        },
        golf: { holes: 18, par: 71 },
      },
      0,
    );

    expect(listing.base.instagramUrl).toBeNull();
    expect(listing.base.facebookUrl).toBe("https://www.facebook.com/PestanaGolf");
    expect(listing.base.linkedinUrl).toBeNull();
    expect(listing.base.twitterUrl).toBeNull();
    expect(listing.base.googleBusinessUrl).toBeNull();
    expect(listing.base.googleRating).toBeNull();
    expect(listing.base.googleReviewCount).toBeNull();
    expect(listing.base.latitude).toBeNull();
    expect(listing.base.longitude).toBeNull();
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
    expect(normalizeImportCategory("accommodation")).toBe("accommodation");
    expect(normalizeImportCategory("places-to-stay")).toBe("accommodation");
    expect(normalizeImportCategory("stay")).toBe("accommodation");
    expect(normalizeImportCategory("stays")).toBe("accommodation");
    expect(normalizeImportCategory("hotels")).toBe("accommodation");
    expect(normalizeImportCategory("villa")).toBe("accommodation");
    expect(normalizeImportCategory("apartments")).toBe("accommodation");
    expect(normalizeImportCategory("golf-course")).toBe("golf");
    expect(normalizeImportCategory("luxury properties")).toBe("real-estate");
    expect(normalizeImportCategory("beach")).toBe("beaches");
    expect(normalizeImportCategory("beaches")).toBe("beaches");
    expect(normalizeImportCategory("beach clubs")).toBe("beach-clubs");
    expect(normalizeImportCategory("concierge services")).toBe("concierge-services");
    expect(normalizeImportCategory("services")).toBe("concierge-services");
  });

  it("preserves rich beach category data for standard listing imports", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Praia Example",
        City: "Lagos",
        category: "beaches",
        category_data: {
          highlights: ["Calm swimming", "Boardwalk access"],
          testimonials: [{ name: "Angelica", rating: 5, text: "Beautiful beach." }],
          seo_link_groups: [{ title: "Experiences in Lagos", links: [{ label: "Lagos snorkeling" }] }],
        },
        beach_details: {
          meeting_point: "Meet by the main boardwalk.",
          what_to_bring: ["Sunscreen", "Water"],
        },
      },
      0,
    );

    expect(listing.normalizedCategory).toBe("beaches");
    expect(listing.vertical).toBe("none");
    expect(listing.categoryDataPatch.highlights).toEqual(["Calm swimming", "Boardwalk access"]);
    expect(listing.categoryDataPatch.meeting_point).toBe("Meet by the main boardwalk.");
    expect(listing.categoryDataPatch.what_to_bring).toEqual(["Sunscreen", "Water"]);
    expect(listing.categoryDataPatch.testimonials).toEqual([
      { name: "Angelica", rating: 5, text: "Beautiful beach." },
    ]);
    expect(listing.categoryDataPatch.seo_link_groups).toEqual([
      { title: "Experiences in Lagos", links: [{ label: "Lagos snorkeling" }] },
    ]);
  });

  it("uses top-level category before category_slug fallback", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Current Category Wins",
        City: "Lagos",
        category: "accommodation",
        category_slug: "places-to-stay",
      },
      0,
    );

    expect(listing.normalizedCategory).toBe("accommodation");
    expect(JSON.stringify(listing)).not.toContain("places-to-stay");
  });

  it("uses category_slug only when category is missing", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Legacy Category Slug",
        City: "Lagos",
        category_slug: "places-to-stay",
      },
      0,
    );

    expect(listing.normalizedCategory).toBe("accommodation");
    expect(listing.base.categorySlug).toBe("accommodation");
  });

  it("accepts category_data.vertical accommodation when category fields are missing", () => {
    const listing = normalizeImportListing(
      {
        Nome: "Category Data Accommodation",
        City: "Lagos",
        category_data: {
          vertical: "accommodation",
        },
      },
      0,
    );

    expect(listing.normalizedCategory).toBe("accommodation");
    expect(listing.base.categorySlug).toBe("accommodation");
    expect(JSON.stringify(listing)).not.toContain("places-to-stay");
  });
});
