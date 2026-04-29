import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  emptyToNull,
  nullToEmpty,
  normalizeSelect,
  denormalizeSelect,
  normalizeBooleanSelect,
  denormalizeBooleanSelect,
  emptyArrayToNull,
} from "@/lib/forms/normalize";
import { safeParseFloat, safeParseInt } from "@/lib/forms/parse";
import { safeMutation } from "@/lib/api/safeMutation";

const listingFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  short_description: z.string().min(1).max(300),
  full_description: z.string().nullable().default(null),
  category_id: z.string().min(1, "Category is required"),
  city_id: z.string().min(1, "City is required"),
  premium_region_id: z.string().optional(),
  tier: z.enum(["unverified", "verified", "signature"]).default("unverified"),
  published_status: z
    .enum(["draft", "pending_review", "published", "rejected", "archived"])
    .default("draft"),
  is_curated: z.boolean().default(false),
  lat: z.number().min(-90).max(90).nullable().default(null),
  lng: z.number().min(-180).max(180).nullable().default(null),
  tags: z.array(z.string()).default([]),
});

function normalizeForDb(values: z.infer<typeof listingFormSchema>) {
  return {
    name: emptyToNull(values.name),
    slug: emptyToNull(values.slug),
    short_description: emptyToNull(values.short_description),
    full_description: emptyToNull(values.full_description) ?? null,
    category_id: normalizeSelect(values.category_id) ?? "",
    city_id: normalizeSelect(values.city_id) ?? "",
    premium_region_id: normalizeSelect(values.premium_region_id) ?? null,
    tier: values.tier ?? "unverified",
    published_status: values.published_status ?? "draft",
    is_curated: values.is_curated ?? false,
    lat: values.lat ?? null,
    lng: values.lng ?? null,
    tags: emptyArrayToNull(values.tags) ?? [],
  };
}

function denormalizeForUi(dbValues: Record<string, unknown>) {
  return {
    name: nullToEmpty(dbValues.name as string | null | undefined),
    slug: nullToEmpty(dbValues.slug as string | null | undefined),
    short_description: nullToEmpty(dbValues.short_description as string | null | undefined),
    full_description: dbValues.full_description as string | null | undefined,
    category_id: denormalizeSelect(dbValues.category_id as string | undefined),
    city_id: denormalizeSelect(dbValues.city_id as string | undefined),
    premium_region_id: denormalizeSelect(dbValues.premium_region_id as string | undefined),
    tier: (dbValues.tier as string) ?? "unverified",
    published_status: (dbValues.published_status as string) ?? "draft",
    is_curated: dbValues.is_curated as boolean,
    lat: dbValues.lat as number | null,
    lng: dbValues.lng as number | null,
    tags: (dbValues.tags as string[]) ?? [],
  };
}

describe("Form Pipeline: UI → API → DB", () => {
  describe("1. Empty string → null (required text fields)", () => {
    it('"" becomes null for DB', () => {
      expect(emptyToNull("")).toBe(null);
    });

    it('null becomes null for DB', () => {
      expect(emptyToNull(null)).toBe(null);
    });

    it('undefined becomes null for DB', () => {
      expect(emptyToNull(undefined)).toBe(null);
    });

    it('non-empty string passes through', () => {
      expect(emptyToNull("valid")).toBe("valid");
    });
  });

  describe("2. Number parsing (string → number)", () => {
    it('"0" → 0 (not null)', () => {
      expect(safeParseFloat("0")).toBe(0);
    });

    it('"37.0194" → 37.0194', () => {
      expect(safeParseFloat("37.0194")).toBe(37.0194);
    });

    it('"" → null (empty number field)', () => {
      expect(safeParseFloat("")).toBe(null);
    });

    it('"abc" → null (invalid)', () => {
      expect(safeParseFloat("abc")).toBe(null);
    });

    it('safeParseInt truncates decimals', () => {
      expect(safeParseInt("12.5")).toBe(12);
    });
  });

  describe("3. Select sentinel isolation", () => {
    it('"" select → undefined (normalized)', () => {
      expect(normalizeSelect("")).toBe(undefined);
    });

    it('sentinel "none" → undefined (normalized)', () => {
      expect(normalizeSelect("none")).toBe(undefined);
    });

    it('valid select value passes through', () => {
      expect(normalizeSelect("cat-123")).toBe("cat-123");
    });

    it('undefined → sentinel for UI (denormalized)', () => {
      expect(denormalizeSelect(undefined)).toBe("none");
    });

    it('null → sentinel for UI (denormalized)', () => {
      expect(denormalizeSelect(null)).toBe("none");
    });

    it('valid value unchanged', () => {
      expect(denormalizeSelect("cat-123")).toBe("cat-123");
    });
  });

  describe("4. Boolean select → true/false", () => {
    it('"true" → true', () => {
      expect(normalizeBooleanSelect("true")).toBe(true);
    });

    it('"false" → false', () => {
      expect(normalizeBooleanSelect("false")).toBe(false);
    });

    it('"" → undefined', () => {
      expect(normalizeBooleanSelect("")).toBe(undefined);
    });

    it('true → "true" for UI', () => {
      expect(denormalizeBooleanSelect(true)).toBe("true");
    });

    it('false → "false" for UI', () => {
      expect(denormalizeBooleanSelect(false)).toBe("false");
    });

    it('null → "" for UI', () => {
      expect(denormalizeBooleanSelect(null)).toBe("");
    });
  });

  describe("5. Full pipeline: normalizeForDb()", () => {
    it("handles empty form submission", () => {
      const formValues = {
        name: "",
        slug: "",
        short_description: "",
        full_description: null,
        category_id: "",
        city_id: "",
        premium_region_id: undefined,
        tier: "unverified" as const,
        published_status: "draft" as const,
        is_curated: false,
        lat: null,
        lng: null,
        tags: [],
      };

      const db = normalizeForDb(formValues);

      expect(db.name).toBe(null);
      expect(db.slug).toBe(null);
      expect(db.category_id).toBe("");
      expect(db.lat).toBe(null);
    });

    it("handles valid form submission", () => {
      const formValues = {
        name: "Beach Club",
        slug: "beach-club",
        short_description: "Great beach club",
        full_description: "Full description here",
        category_id: "cat-123",
        city_id: "city-456",
        premium_region_id: "region-789",
        tier: "verified" as const,
        published_status: "published" as const,
        is_curated: true,
        lat: 37.0194,
        lng: -7.9302,
        tags: ["beach", "sun"],
      };

      const db = normalizeForDb(formValues);

      expect(db.name).toBe("Beach Club");
      expect(db.category_id).toBe("cat-123");
      expect(db.lat).toBe(37.0194);
      expect(db.tags).toEqual(["beach", "sun"]);
    });
  });

  describe("6. Full pipeline: denormalizeForUi()", () => {
    it("converts DB nulls to UI empty strings", () => {
      const dbValues = {
        name: null,
        slug: null,
        short_description: "Desc",
        full_description: null,
        category_id: null,
        city_id: "city-456",
        premium_region_id: null,
        tier: "verified",
        published_status: "published",
        is_curated: true,
        lat: null,
        lng: null,
        tags: [],
      };

      const ui = denormalizeForUi(dbValues);

      expect(ui.name).toBe("");
      expect(ui.slug).toBe("");
      expect(ui.category_id).toBe("none");
      expect(ui.premium_region_id).toBe("none");
    });

    it("preserves valid DB values for UI", () => {
      const dbValues = {
        name: "Test",
        slug: "test",
        short_description: "Desc",
        full_description: "Full",
        category_id: "cat-123",
        city_id: "city-456",
        premium_region_id: "region-789",
        tier: "signature",
        published_status: "draft",
        is_curated: false,
        lat: 37.0194,
        lng: -7.9302,
        tags: ["tag1", "tag2"],
      };

      const ui = denormalizeForUi(dbValues);

      expect(ui.name).toBe("Test");
      expect(ui.category_id).toBe("cat-123");
      expect(ui.lat).toBe(37.0194);
      expect(ui.tags).toEqual(["tag1", "tag2"]);
    });
  });

  describe("7. API validation: safeMutation rejects invalid payloads", () => {
    it("rejects missing required fields", async () => {
      const result = await safeMutation(
        listingFormSchema,
        async (data) => data,
        { name: "", slug: "" },
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });

    it("rejects invalid enum value", async () => {
      const result = await safeMutation(
        listingFormSchema,
        async (data) => data,
        { name: "Test", slug: "test", short_description: "Desc", category_id: "1", city_id: "2", tier: "invalid" },
      );

      expect(result.success).toBe(false);
    });

    it("rejects out-of-range coordinates", async () => {
      const result = await safeMutation(
        listingFormSchema,
        async (data) => data,
        { name: "Test", slug: "test", short_description: "Desc", category_id: "1", city_id: "2", lat: 100 },
      );

      expect(result.success).toBe(false);
    });
  });

  describe("8. API validation: safeMutation accepts valid payloads", () => {
    it("accepts valid form data", async () => {
      const validPayload = {
        name: "Beach Club",
        slug: "beach-club",
        short_description: "Great beach club",
        full_description: "Full description",
        category_id: "cat-123",
        city_id: "city-456",
        tier: "verified",
        published_status: "draft",
        is_curated: false,
        lat: 37.0194,
        lng: -7.9302,
        tags: ["beach"],
      };

      const result = await safeMutation(
        listingFormSchema,
        async (data) => data,
        validPayload,
      );

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe("Beach Club");
    });

    it("applies defaults when omitted", async () => {
      const minimalPayload = {
        name: "Test",
        slug: "test",
        short_description: "Desc",
        category_id: "1",
        city_id: "2",
      };

      const result = await safeMutation(
        listingFormSchema,
        async (data) => data,
        minimalPayload,
      );

      expect(result.success).toBe(true);
      expect(result.data?.tier).toBe("unverified");
      expect(result.data?.published_status).toBe("draft");
      expect(result.data?.is_curated).toBe(false);
    });
  });

  describe("9. Empty array → array (not null)", () => {
    it("[] → null (empty array becomes null)", () => {
      expect(emptyArrayToNull([])).toBe(null);
    });

    it("null → null", () => {
      expect(emptyArrayToNull(null)).toBe(null);
    });

    it("undefined → null", () => {
      expect(emptyArrayToNull(undefined)).toBe(null);
    });

    it("non-empty array passes through", () => {
      expect(emptyArrayToNull(["a", "b"])).toEqual(["a", "b"]);
    });
  });

  describe("10. Null to empty string", () => {
    it("null → ''", () => {
      expect(nullToEmpty(null)).toBe("");
    });

    it("undefined → ''", () => {
      expect(nullToEmpty(undefined)).toBe("");
    });

    it("string passes through", () => {
      expect(nullToEmpty("hello")).toBe("hello");
    });
  });
});