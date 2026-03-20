import { describe, expect, it } from "vitest";

import { isUuid, slugify } from "./slugify";

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

  it("limits length to 80 characters", () => {
    const longString = "a".repeat(100);
    expect(slugify(longString).length).toBe(80);
  });

  it("handles empty strings", () => {
    expect(slugify("")).toBe("");
    expect(slugify("   ")).toBe("");
  });

  it("handles real-world examples", () => {
    expect(slugify("Restaurante & Bar")).toBe("restaurante-bar");
    expect(slugify("Villa with Pool (Albufeira)")).toBe("villa-with-pool-albufeira");
  });
});
