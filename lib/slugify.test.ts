import { describe, expect, it } from "vitest";

import {
  assertValidSlug,
  getSlugValidationError,
  isUuid,
  normalizeSlug,
  slugify,
  slugifyEntityName,
} from "./slugify";

describe("isUuid", () => {
  it("accepts valid v4 UUID values", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("rejects UUID values that are not v4", () => {
    expect(isUuid("123e4567-e89b-12d3-a456-426614174000")).toBe(false);
  });

  it("rejects invalid strings", () => {
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("")).toBe(false);
    expect(isUuid(null)).toBe(false);
  });
});

describe("slugify", () => {
  it("converts basic strings to lowercase hyphenated slugs", () => {
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("THIS IS A TEST")).toBe("this-is-a-test");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! @World# $Test%")).toBe("hello-world-test");
  });

  it("handles Portuguese characters (removes diacritics)", () => {
    expect(slugify("São Miguel")).toBe("sao-miguel");
    expect(slugify("Portimão")).toBe("portimao");
    expect(slugify("Algarve")).toBe("algarve");
  });

  it("collapses multiple spaces and hyphens", () => {
    expect(slugify("hello   world")).toBe("hello-world");
    expect(slugify("hello---world")).toBe("hello-world");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  hello world  ")).toBe("hello-world");
    expect(slugify("-hello-world-")).toBe("hello-world");
  });

  it("limits length by entity type", () => {
    const longString = "a".repeat(140);
    expect(slugify(longString).length).toBe(100);
    expect(slugifyEntityName(longString, { entityType: "listing" }).length).toBe(120);
    expect(slugifyEntityName(longString, { entityType: "taxonomy" }).length).toBe(80);
  });

  it("handles empty strings", () => {
    expect(slugify("")).toBe("");
    expect(slugify("   ")).toBe("");
    expect(slugify(null)).toBe("");
    expect(slugifyEntityName(undefined)).toBe("");
  });

  it("handles real-world examples", () => {
    expect(slugify("Restaurante & Bar")).toBe("restaurante-bar");
    expect(slugifyEntityName("Golf & Spa")).toBe("golf-spa");
    expect(slugifyEntityName("D'El Rei")).toBe("del-rei");
    expect(slugify("Villa with Pool (Albufeira)")).toBe("villa-with-pool-albufeira");
    expect(slugifyEntityName("Boavista Golf & Spa Resort Lagos")).toBe("boavista-golf-spa-resort-lagos");
    expect(slugifyEntityName("Quinta do Lago South Course")).toBe("quinta-do-lago-south-course");
    expect(slugifyEntityName("Praia da Rocha")).toBe("praia-da-rocha");
    expect(slugifyEntityName("Carvoeiro Cliffs")).toBe("carvoeiro-cliffs");
    expect(slugifyEntityName("Casa do Alto Almancil")).toBe("casa-do-alto-almancil");
    expect(slugifyEntityName("Amendoeira O'Connor Jnr.")).toBe("amendoeira-oconnor-jnr");
  });

  it("normalizes user-provided slugs into canonical form", () => {
    expect(normalizeSlug("  Praia da Rocha  ")).toBe("praia-da-rocha");
    expect(normalizeSlug("casa_do_alto")).toBe("casa-do-alto");
    expect(normalizeSlug("São--Miguel")).toBe("sao-miguel");
  });

  it("validates strict canonical slug values", () => {
    expect(assertValidSlug("praia-da-rocha")).toBe(true);
    expect(assertValidSlug("Praia-da-Rocha")).toBe(false);
    expect(assertValidSlug(null)).toBe(false);
    expect(assertValidSlug("pt-pt/praia-da-rocha")).toBe(false);
    expect(assertValidSlug("https://example.com/praia-da-rocha")).toBe(false);
    expect(getSlugValidationError(null)).toBe("Slug is required.");
    expect(getSlugValidationError("")).toBe("Slug is required.");
    expect(getSlugValidationError("https://example.com/praia-da-rocha")).toBe(
      "Slug must not be a full URL.",
    );
    expect(getSlugValidationError("pt-pt/praia-da-rocha")).toBe(
      "Slug must not include a locale prefix.",
    );
    expect(getSlugValidationError("praia_da_rocha")).toBe(
      "Slug must use lowercase ASCII letters, numbers, and single hyphens only.",
    );
  });
});
