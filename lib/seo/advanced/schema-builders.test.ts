import { describe, expect, it } from "vitest";

import {
  buildEventSchema,
  buildItemListSchema,
  buildLocalBusinessSchema,
  cleanJsonLd,
} from "@/lib/seo/advanced/schema-builders";

describe("advanced structured data builders", () => {
  it("omits null, undefined, empty, and unproven LocalBusiness fields", () => {
    const schema = buildLocalBusinessSchema({
      id: "listing-1",
      slug: "praia-da-marinha-lagoa",
      name: "Praia da Marinha",
      description: null,
      category_slug: "beaches",
      category_name: "Beaches",
      city: "Lagoa",
      region: "Algarve",
      address: null,
      telephone: null,
      email: null,
      price_range: null,
      google_rating: null,
      google_review_count: null,
      tags: [],
    });

    expect(JSON.stringify(schema)).not.toContain("€€€€");
    expect(JSON.stringify(schema)).not.toContain("OpeningHoursSpecification");
    expect(schema).not.toHaveProperty("priceRange");
    expect(schema).not.toHaveProperty("openingHoursSpecification");
    expect(schema).not.toHaveProperty("aggregateRating");
  });

  it("does not invent event locations, organizers, or offers without source data", () => {
    const schema = buildEventSchema({
      id: "event-1",
      slug: "future-event",
      name: "Future Event",
      start_date: "2026-08-01",
      end_date: null,
      venue_name: null,
      city: null,
      ticket_url: null,
    });

    expect(schema).not.toHaveProperty("location");
    expect(schema).not.toHaveProperty("organizer");
    expect(schema).not.toHaveProperty("offers");
    expect(schema).toMatchObject({
      "@type": "Event",
      startDate: "2026-08-01",
      endDate: "2026-08-01",
    });
  });

  it("builds ItemList JSON-LD from visible item values only", () => {
    const schema = buildItemListSchema(
      "Events in the Algarve",
      [
        {
          name: "Festival F",
          url: "/events/festival-f",
          description: undefined,
          image: "",
        },
      ],
      "/events",
    );

    expect(schema).toMatchObject({
      "@type": "ItemList",
      numberOfItems: 1,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
        },
      ],
    });
    expect(JSON.stringify(schema)).not.toContain("\"image\"");
    expect(schema.itemListElement[0].item).not.toHaveProperty("description");
  });

  it("deep-cleans JSON-LD arrays and nested objects", () => {
    expect(
      cleanJsonLd({
        keep: "value",
        empty: "",
        nested: {
          nil: null,
          arr: [undefined, "", { ok: true, no: undefined }],
        },
      }),
    ).toEqual({
      keep: "value",
      nested: {
        arr: [{ ok: true }],
      },
    });
  });
});
