import { describe, expect, it } from "vitest";

import { buildGolfCoursePersistencePayload, importListing } from "./importListing";

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

describe("unified listing importer", () => {
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
});
