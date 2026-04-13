/**
 * lib/forms/__tests__/normalize.test.ts
 *
 * Unit tests for the UI ↔ API normalization layer.
 *
 * RULES this suite enforces:
 *  - emptyToNull:            "" | null | undefined → null, non-empty → itself
 *  - nullToEmpty:            null | undefined → "",  other → itself
 *  - normalizeSelect:        "" | sentinel | undefined → undefined, valid → itself
 *  - denormalizeSelect:      null | undefined → sentinel, valid → itself
 *  - normalizeBooleanSelect: "true" → true, "false" → false, else → undefined
 *  - denormalizeBooleanSelect: true → "true", false → "false", null/undefined → ""
 *  - emptyArrayToNull:       [] | null | undefined → null, non-empty → itself
 */

import { describe, it, expect } from "vitest";
import {
  emptyToNull,
  nullToEmpty,
  normalizeSelect,
  denormalizeSelect,
  emptyArrayToNull,
  normalizeBooleanSelect,
  denormalizeBooleanSelect,
} from "../normalize";

// ─── emptyToNull ──────────────────────────────────────────────────────────────

describe("emptyToNull", () => {
  it('converts "" to null', () => {
    expect(emptyToNull("")).toBeNull();
  });

  it("converts null to null", () => {
    expect(emptyToNull(null)).toBeNull();
  });

  it("converts undefined to null", () => {
    expect(emptyToNull(undefined)).toBeNull();
  });

  it("preserves a non-empty string", () => {
    expect(emptyToNull("hello")).toBe("hello");
  });

  it("preserves a whitespace-only string (only literal '' collapses)", () => {
    expect(emptyToNull("  ")).toBe("  ");
  });

  it("preserves a string that contains a zero digit", () => {
    expect(emptyToNull("0")).toBe("0");
  });

  it("preserves a string that is a single space", () => {
    expect(emptyToNull(" ")).toBe(" ");
  });
});

// ─── nullToEmpty ──────────────────────────────────────────────────────────────

describe("nullToEmpty", () => {
  it('converts null to ""', () => {
    expect(nullToEmpty(null)).toBe("");
  });

  it('converts undefined to ""', () => {
    expect(nullToEmpty(undefined)).toBe("");
  });

  it("preserves a non-empty string", () => {
    expect(nullToEmpty("hello")).toBe("hello");
  });

  it('preserves "" (empty string stays empty)', () => {
    expect(nullToEmpty("")).toBe("");
  });

  it("preserves a whitespace string", () => {
    expect(nullToEmpty("  ")).toBe("  ");
  });
});

// ─── normalizeSelect ─────────────────────────────────────────────────────────

describe("normalizeSelect", () => {
  it('converts "" to undefined', () => {
    expect(normalizeSelect("")).toBeUndefined();
  });

  it('converts default sentinel "none" to undefined', () => {
    expect(normalizeSelect("none")).toBeUndefined();
  });

  it("converts undefined to undefined", () => {
    expect(normalizeSelect(undefined)).toBeUndefined();
  });

  it("preserves a valid ID string", () => {
    expect(normalizeSelect("abc-123")).toBe("abc-123");
  });

  it("preserves a valid string that happens to spell 'null'", () => {
    expect(normalizeSelect("null")).toBe("null");
  });

  it("uses a custom sentinel correctly", () => {
    expect(normalizeSelect("all", "all")).toBeUndefined();
    expect(normalizeSelect("abc", "all")).toBe("abc");
  });

  it("does NOT collapse strings that merely look empty-ish ('0')", () => {
    expect(normalizeSelect("0")).toBe("0");
  });

  it("sentinel match is exact — 'noneX' is NOT treated as sentinel", () => {
    expect(normalizeSelect("noneX")).toBe("noneX");
  });
});

// ─── denormalizeSelect ────────────────────────────────────────────────────────

describe("denormalizeSelect", () => {
  it('converts undefined to "none"', () => {
    expect(denormalizeSelect(undefined)).toBe("none");
  });

  it('converts null to "none"', () => {
    expect(denormalizeSelect(null)).toBe("none");
  });

  it("preserves a valid string", () => {
    expect(denormalizeSelect("abc-123")).toBe("abc-123");
  });

  it("uses a custom sentinel", () => {
    expect(denormalizeSelect(undefined, "all")).toBe("all");
    expect(denormalizeSelect("abc", "all")).toBe("abc");
  });

  it("round-trips with normalizeSelect (none → undefined → none)", () => {
    const raw = undefined;
    const display = denormalizeSelect(raw);   // "none"
    const normalized = normalizeSelect(display); // undefined
    expect(normalized).toBeUndefined();
  });

  it("round-trips with normalizeSelect (value → value → value)", () => {
    const raw = "city-id-42";
    const display = denormalizeSelect(raw);
    const normalized = normalizeSelect(display);
    expect(normalized).toBe("city-id-42");
  });
});

// ─── normalizeBooleanSelect ───────────────────────────────────────────────────

describe("normalizeBooleanSelect", () => {
  it('"true" → true', () => {
    expect(normalizeBooleanSelect("true")).toBe(true);
  });

  it('"false" → false', () => {
    expect(normalizeBooleanSelect("false")).toBe(false);
  });

  it('"" → undefined', () => {
    expect(normalizeBooleanSelect("")).toBeUndefined();
  });

  it("undefined → undefined", () => {
    expect(normalizeBooleanSelect(undefined)).toBeUndefined();
  });

  it('"1" → false (only exact "true" is truthy)', () => {
    expect(normalizeBooleanSelect("1")).toBe(false);
  });

  it('"True" → false (case-sensitive)', () => {
    expect(normalizeBooleanSelect("True")).toBe(false);
  });

  it('"yes" → false', () => {
    expect(normalizeBooleanSelect("yes")).toBe(false);
  });
});

// ─── denormalizeBooleanSelect ─────────────────────────────────────────────────

describe("denormalizeBooleanSelect", () => {
  it('true → "true"', () => {
    expect(denormalizeBooleanSelect(true)).toBe("true");
  });

  it('false → "false"', () => {
    expect(denormalizeBooleanSelect(false)).toBe("false");
  });

  it('null → ""', () => {
    expect(denormalizeBooleanSelect(null)).toBe("");
  });

  it('undefined → ""', () => {
    expect(denormalizeBooleanSelect(undefined)).toBe("");
  });

  it("round-trips with normalizeBooleanSelect (true)", () => {
    expect(normalizeBooleanSelect(denormalizeBooleanSelect(true))).toBe(true);
  });

  it("round-trips with normalizeBooleanSelect (false)", () => {
    expect(normalizeBooleanSelect(denormalizeBooleanSelect(false))).toBe(false);
  });

  it("round-trips with normalizeBooleanSelect (undefined → '' → undefined)", () => {
    expect(normalizeBooleanSelect(denormalizeBooleanSelect(undefined))).toBeUndefined();
  });
});

// ─── emptyArrayToNull ─────────────────────────────────────────────────────────

describe("emptyArrayToNull", () => {
  it("[] → null", () => {
    expect(emptyArrayToNull([])).toBeNull();
  });

  it("null → null", () => {
    expect(emptyArrayToNull(null)).toBeNull();
  });

  it("undefined → null", () => {
    expect(emptyArrayToNull(undefined)).toBeNull();
  });

  it("returns the same reference for a non-empty array", () => {
    const arr = ["a", "b"];
    expect(emptyArrayToNull(arr)).toBe(arr);
  });

  it("single-element array is preserved", () => {
    const arr = [0];
    expect(emptyArrayToNull(arr)).toBe(arr);
  });

  it("array of objects is preserved", () => {
    const arr = [{ id: "1" }];
    expect(emptyArrayToNull(arr)).toBe(arr);
  });

  it("does NOT mutate the input array", () => {
    const arr = ["x"];
    emptyArrayToNull(arr);
    expect(arr).toHaveLength(1);
  });
});
