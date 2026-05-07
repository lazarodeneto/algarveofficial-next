import { describe, expect, it } from "vitest";

import { buildGolfCoursePersistencePayload, importListing, type ImporterSupabaseClient } from "./importListing";

const baseGolf = {
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
};

const categoryDataGolf = {
  Nome: "Category Data Golf",
  URL_slug: "category-data-golf",
  City: "Lagos",
  Country: "Portugal",
  category: "golf",
  category_data: {
    vertical: "golf",
    holes_count: 18,
    par: 72,
    course_type: "championship",
    designer: "Example Designer",
    year_opened: 2004,
    is_signature: true,
  },
};

type MockImportListing = {
  id: string;
  slug: string;
  name: string;
  city_id?: string | null;
  address?: string | null;
  category_data?: unknown;
};

function createImporterReferenceClient(options: {
  listings?: MockImportListing[];
  slugAliases?: Array<{ slug: string; listing_id: string }>;
} = {}) {
  const insertedListings: Array<Record<string, unknown>> = [];
  const updatedListings: Array<{ id: string; payload: Record<string, unknown> }> = [];
  const listings = [...(options.listings ?? [])];
  const slugAliases = [...(options.slugAliases ?? [])];

  const findListing = (filters: Array<[string, string]>) => {
    if (filters.length === 0) return null;
    return listings.find((listing) =>
      filters.every(([column, value]) => {
        if (column === "id") return listing.id === value;
        if (column === "slug") return listing.slug === value;
        if (column === "name") return listing.name === value;
        if (column === "city_id") return listing.city_id === value;
        return false;
      }),
    ) ?? null;
  };

  const client = {
    from(table: string) {
      if (table === "categories") {
        return {
          select: async () => ({
            data: [
              { id: "cat-accommodation", slug: "accommodation" },
              { id: "cat-golf", slug: "golf" },
              { id: "cat-real-estate", slug: "real-estate" },
              { id: "cat-concierge-services", slug: "concierge-services" },
            ],
            error: null,
          }),
        };
      }

      if (table === "cities") {
        return {
          select: async () => ({
            data: [{ id: "city-lagos", name: "Lagos", slug: "lagos" }],
            error: null,
          }),
        };
      }

      if (table === "regions") {
        return {
          select: async () => ({
            data: [],
            error: null,
          }),
        };
      }

      if (table === "listings") {
        const createListingReadQuery = () => {
          const filters: Array<[string, string]> = [];
          return {
            eq(column: string, value: string) {
              filters.push([column, value]);
              return this;
            },
            maybeSingle: async () => ({ data: findListing(filters), error: null }),
          };
        };

        return {
          select: createListingReadQuery,
          insert: (payload: Record<string, unknown>) => {
            insertedListings.push(payload);
            return {
              select: () => ({
                single: async () => ({
                  data: { id: "listing-1", slug: payload.slug, name: payload.name },
                  error: null,
                }),
              }),
            };
          },
          update: (payload: Record<string, unknown>) => {
            let listingId = "";
            return {
              eq(column: string, value: string) {
                if (column === "id") listingId = value;
                return this;
              },
              select() {
                return this;
              },
              single: async () => {
                updatedListings.push({ id: listingId, payload });
                const existing = listings.find((listing) => listing.id === listingId);
                return {
                  data: {
                    id: listingId,
                    slug: String(payload.slug ?? existing?.slug ?? ""),
                    name: String(payload.name ?? existing?.name ?? ""),
                  },
                  error: null,
                };
              },
            };
          },
        };
      }

      if (table === "listing_slugs") {
        return {
          select: () => {
            const filters: Array<[string, string]> = [];
            return {
              eq(column: string, value: string) {
                filters.push([column, value]);
                return this;
              },
              maybeSingle: async () => ({
                data: slugAliases.find((alias) =>
                  filters.every(([column, value]) => {
                    if (column === "slug") return alias.slug === value;
                    if (column === "listing_id") return alias.listing_id === value;
                    return false;
                  }),
                ) ?? null,
                error: null,
              }),
            };
          },
        };
      }

      return {
        delete: () => ({
          eq: async () => ({ data: null, error: null }),
        }),
      };
    },
  } as unknown as ImporterSupabaseClient;

  return { client, insertedListings, updatedListings };
}

describe("unified listing importer", () => {
  it("passes top-level golf object imports", async () => {
    const result = await importListing(baseGolf, { dryRun: true });

    expect(result.ok).toBe(true);
    expect(result.type).toBe("golf");
    expect(result.preview.holes).toBe(18);
    expect(result.preview.par).toBe(72);
  });

  it("normalizes golf.holes_count to golf.holes", async () => {
    const result = await importListing({
      ...baseGolf,
      golf: {
        ...baseGolf.golf,
        holes: undefined,
        holes_count: 18,
      },
    }, { dryRun: true });

    expect(result.ok).toBe(true);
    expect(result.preview.holes).toBe(18);
    expect(result.preview.par).toBe(72);
    expect(result.normalized?.categoryDataPatch.golf).toMatchObject({
      holes: 18,
      par: 72,
    });
  });

  it("normalizes category_data.holes_count to golf.holes when top-level golf needs a fallback", async () => {
    const result = await importListing({
      ...baseGolf,
      golf: {
        par: 72,
      },
      category_data: {
        vertical: "golf",
        holes_count: 18,
      },
    }, { dryRun: true });

    expect(result.ok).toBe(true);
    expect(result.preview.holes).toBe(18);
    expect(result.preview.par).toBe(72);
    expect(result.normalized?.categoryDataPatch.golf).toMatchObject({
      holes: 18,
      par: 72,
    });
  });

  it("passes category_data vertical golf imports without a top-level golf object", async () => {
    const result = await importListing(categoryDataGolf, { dryRun: true });

    expect(result.ok).toBe(true);
    expect(result.type).toBe("golf");
    expect(result.preview.holes).toBe(18);
    expect(result.preview.par).toBe(72);
    expect(result.normalized?.categoryDataPatch.golf).toMatchObject({
      holes: 18,
      par: 72,
      course_type: "championship",
      designer: "Example Designer",
      year_opened: 2004,
      is_signature: true,
    });
    expect(result.errors).not.toContainEqual(expect.objectContaining({
      message: "golf object is required for golf imports.",
    }));
  });

  it("fails category golf imports when both golf and category_data vertical golf are missing", async () => {
    const result = await importListing({
      Nome: "Missing Golf Data",
      URL_slug: "missing-golf-data",
      City: "Lagos",
      category: "golf",
    }, { dryRun: true });

    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(expect.objectContaining({
      path: "golf",
      message: "golf object is required for golf imports.",
    }));
  });

  it("passes The Els Club Vilamoura when golf data is inside category_data", async () => {
    const result = await importListing({
      Nome: "The Els Club Vilamoura",
      URL_slug: "the-els-club-vilamoura",
      City: "Vilamoura",
      Region: "Vilamoura Prestige",
      Country: "Portugal",
      category: "golf",
      category_data: {
        vertical: "golf",
        course_type: "championship",
        holes_count: 18,
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
    }, { dryRun: true });

    expect(result.ok).toBe(true);
    expect(result.preview.holes).toBe(18);
    expect(result.preview.par).toBe(72);
    expect(result.normalized?.categoryDataPatch.golf).toMatchObject({
      holes: 18,
      par: 72,
      designer: "Ernie Els",
      year_opened: 2004,
    });
  });

  it("fails golf imports with missing par after holes_count normalization", async () => {
    const result = await importListing({
      Nome: "Missing Par Golf",
      URL_slug: "missing-par-golf",
      City: "Lagos",
      category: "golf",
      golf: {
        holes_count: 18,
        par: null,
      },
    }, { dryRun: true });

    expect(result.ok).toBe(false);
    expect(result.preview.holes).toBe(18);
    expect(result.preview.par).toBeUndefined();
    expect(result.errors).toContainEqual({
      path: "golf.par",
      message: "golf.par must be a positive number.",
    });
    expect(result.preview.errors).toContain("golf.par: golf.par must be a positive number.");
  });

  it("accepts golf optional nullable numeric fields in dry run", async () => {
    const result = await importListing(baseGolf, { dryRun: true });

    expect(result.ok).toBe(true);
    expect(result.type).toBe("golf");
    expect(result.errors).toHaveLength(0);
    expect(result.normalized?.categoryDataPatch.golf).toMatchObject({
      slope: null,
      course_rating: null,
      length_meters: null,
      year_opened: 2004,
      last_renovation: null,
    });
  });

  it("maps factual golf fields into the golf_courses persistence payload", async () => {
    const result = await importListing(baseGolf, { dryRun: true });

    expect(result.ok).toBe(true);
    expect(result.normalized).toBeDefined();

    const payload = buildGolfCoursePersistencePayload("listing-id", result.normalized!);
    expect(payload).toMatchObject({
      listing_id: "listing-id",
      name: "The Els Club Vilamoura",
      holes_count: 18,
      is_default: true,
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
    });
  });

  it.each([
    [{ last_renovation: undefined }, null],
    [{ last_renovation: null }, null],
    [{ last_renovation: "" }, null],
    [{ last_renovation: "2020" }, 2020],
    [{ last_renovation: 2020 }, 2020],
  ])("normalizes last_renovation variants", async (patch, expected) => {
    const result = await importListing({
      ...baseGolf,
      golf: { ...baseGolf.golf, ...patch },
    }, { dryRun: true });

    expect(result.ok).toBe(true);
    expect(result.normalized?.categoryDataPatch.golf).toMatchObject({
      last_renovation: expected,
    });
  });

  it("rejects non-numeric optional golf text", async () => {
    const result = await importListing({
      ...baseGolf,
      golf: { ...baseGolf.golf, last_renovation: "N/A" },
    }, { dryRun: true });

    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(expect.objectContaining({
      path: "golf.last_renovation",
    }));
  });

  it("keeps required golf holes and par strict", async () => {
    const result = await importListing({
      ...baseGolf,
      golf: { ...baseGolf.golf, holes: null, par: "" },
    }, { dryRun: true });

    expect(result.ok).toBe(false);
    expect(result.errors.map((error) => error.path)).toEqual(expect.arrayContaining([
      "golf.holes",
      "golf.par",
    ]));
  });

  it("rejects conflicting category and vertical objects", async () => {
    const result = await importListing({
      Nome: "Conflicting Import",
      URL_slug: "conflicting-import",
      City: "Lagos",
      category: "golf",
      property: { property_type: "villa" },
    }, { dryRun: true });

    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(expect.objectContaining({
      path: "category",
    }));
  });

  it("detects concierge-services as structured without no vertical data", async () => {
    const result = await importListing({
      Nome: "Nevada Bob’s Golf Quinta do Lago",
      URL_slug: "nevada-bobs-golf-quinta-do-lago",
      City: "Almancil",
      Region: "Golden Triangle",
      Country: "Portugal",
      category: "concierge-services",
      listing: { type: "service", subcategory: "golf-shop" },
      details: { title: "Golf Retail & Equipment" },
      features: ["club fitting"],
    }, { dryRun: true });

    expect(result.ok).toBe(true);
    expect(result.type).toBe("concierge-services");
    expect(result.preview.vertical).toBe("service");
  });

  it("keeps accommodation as accommodation in dry-run preview", async () => {
    const result = await importListing({
      Nome: "Boutique Stay",
      URL_slug: "boutique-stay",
      City: "Lagos",
      category: "accommodation",
    }, { dryRun: true });

    expect(result.ok).toBe(true);
    expect(result.preview.normalizedCategory).toBe("accommodation");
    expect(result.normalized?.base.categorySlug).toBe("accommodation");
    expect(JSON.stringify(result)).not.toContain("places-to-stay");
  });

  it("normalizes legacy places-to-stay to accommodation during dry-run reference validation", async () => {
    const { client } = createImporterReferenceClient();

    const result = await importListing({
      Nome: "Legacy Stay",
      URL_slug: "legacy-stay",
      City: "Lagos",
      category: "places-to-stay",
    }, { dryRun: true, writeClient: client });

    expect(result.ok).toBe(true);
    expect(result.preview.normalizedCategory).toBe("accommodation");
    expect(JSON.stringify(result)).not.toContain("places-to-stay");
  });

  it("resolves imported accommodation listings against categories.slug accommodation", async () => {
    const { client, insertedListings } = createImporterReferenceClient();

    const result = await importListing({
      Nome: "Imported Accommodation",
      URL_slug: "imported-accommodation",
      City: "Lagos",
      category: "accommodation",
    }, { writeClient: client });

    expect(result.ok).toBe(true);
    expect(result.normalized?.base.categorySlug).toBe("accommodation");
    expect(insertedListings[0]).toMatchObject({
      category_id: "cat-accommodation",
      city_id: "city-lagos",
    });
  });

  it("updates an existing listing when URL_slug matches a stable name and city", async () => {
    const { client, updatedListings } = createImporterReferenceClient({
      listings: [{
        id: "listing-existing",
        slug: "imported-accommodation",
        name: "Imported Accommodation",
        city_id: "city-lagos",
        category_data: { existing: true },
      }],
    });

    const result = await importListing({
      Nome: "Imported Accommodation",
      URL_slug: "imported-accommodation",
      City: "Lagos",
      category: "accommodation",
      Description: "Updated description.",
    }, { writeClient: client });

    expect(result.ok).toBe(true);
    expect(result.changed.listing).toBe("updated");
    expect(result.listingId).toBe("listing-existing");
    expect(updatedListings).toEqual([
      expect.objectContaining({
        id: "listing-existing",
        payload: expect.objectContaining({
          slug: "imported-accommodation",
          name: "Imported Accommodation",
          description: "Updated description.",
        }),
      }),
    ]);
  });

  it("updates an existing listing by stable listing id even when the slug changes", async () => {
    const { client, updatedListings } = createImporterReferenceClient({
      listings: [{
        id: "listing-stable",
        slug: "old-imported-accommodation",
        name: "Old Imported Accommodation",
        city_id: "city-lagos",
      }],
    });

    const result = await importListing({
      id: "listing-stable",
      Nome: "Imported Accommodation",
      URL_slug: "imported-accommodation",
      City: "Lagos",
      category: "accommodation",
    }, { writeClient: client });

    expect(result.ok).toBe(true);
    expect(result.changed.listing).toBe("updated");
    expect(result.warnings).toContain(
      'Existing listing "old-imported-accommodation" will be updated to canonical slug "imported-accommodation".',
    );
    expect(updatedListings[0]).toMatchObject({
      id: "listing-stable",
      payload: expect.objectContaining({ slug: "imported-accommodation" }),
    });
  });

  it("fails safely when URL_slug and stable id resolve to different existing listings", async () => {
    const { client } = createImporterReferenceClient({
      listings: [
        {
          id: "listing-by-id",
          slug: "old-imported-accommodation",
          name: "Imported Accommodation",
          city_id: "city-lagos",
        },
        {
          id: "listing-by-slug",
          slug: "imported-accommodation",
          name: "Imported Accommodation",
          city_id: "city-lagos",
        },
      ],
    });

    const result = await importListing({
      id: "listing-by-id",
      Nome: "Imported Accommodation",
      URL_slug: "imported-accommodation",
      City: "Lagos",
      category: "accommodation",
    }, { writeClient: client });

    expect(result.ok).toBe(false);
    expect(result.changed.listing).toBe("unchanged");
    expect(result.errors).toContainEqual(expect.objectContaining({
      path: "URL_slug",
      message: expect.stringContaining("resolves to multiple existing listings"),
    }));
  });

  it("fails safely when a duplicate URL_slug belongs to a different listing", async () => {
    const { client, updatedListings, insertedListings } = createImporterReferenceClient({
      listings: [{
        id: "listing-other",
        slug: "imported-accommodation",
        name: "Different Accommodation",
        city_id: "city-lagos",
      }],
    });

    const result = await importListing({
      Nome: "Imported Accommodation",
      URL_slug: "imported-accommodation",
      City: "Lagos",
      category: "accommodation",
    }, { writeClient: client });

    expect(result.ok).toBe(false);
    expect(result.changed.listing).toBe("unchanged");
    expect(result.errors).toContainEqual(expect.objectContaining({
      path: "URL_slug",
      message: expect.stringContaining("already associated with an existing listing"),
    }));
    expect(updatedListings).toHaveLength(0);
    expect(insertedListings).toHaveLength(0);
  });
});
