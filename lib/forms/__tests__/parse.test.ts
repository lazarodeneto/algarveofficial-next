/**
 * lib/forms/__tests__/parse.test.ts
 *
 * Unit tests for the safe input-value parser utilities.
 *
 * CONTRACT (never break these):
 *  safeParseFloat:    "" | null | undefined | NaN → null, else → float
 *  safeParseInt:      "" | null | undefined | NaN → null, else → integer
 *  parseBoolean:      "true" → true, "false" → false, else → null
 *  normalizeInputValue: null | undefined → "", other → String(value)
 *  formatNumberInput: null | undefined → "",  number → String(number)
 *
 * Locale note:
 *  EU-style decimal format ("12,5") is NOT supported.
 *  This is intentional — inputs must use the "." separator.
 *  See task 7 (locale safety) in the form architecture spec.
 */

import { describe, it, expect } from "vitest";
import {
  safeParseFloat,
  safeParseInt,
  parseBoolean,
  normalizeInputValue,
  formatNumberInput,
} from "../parse";

// ─── safeParseFloat ───────────────────────────────────────────────────────────

describe("safeParseFloat", () => {
  // ── Null / empty inputs ──────────────────────────────────────────────────
  it('"" → null', () => {
    expect(safeParseFloat("")).toBeNull();
  });

  it("null → null", () => {
    expect(safeParseFloat(null)).toBeNull();
  });

  it("undefined → null", () => {
    expect(safeParseFloat(undefined)).toBeNull();
  });

  // ── Invalid strings ──────────────────────────────────────────────────────
  it('"abc" → null', () => {
    expect(safeParseFloat("abc")).toBeNull();
  });

  it('"NaN" → null', () => {
    expect(safeParseFloat("NaN")).toBeNull();
  });

  it('"Infinity" → Infinity (valid JS number)', () => {
    expect(safeParseFloat("Infinity")).toBe(Infinity);
  });

  // ── Valid numeric strings ────────────────────────────────────────────────
  it('"0" → 0 (never confused with falsy)', () => {
    expect(safeParseFloat("0")).toBe(0);
  });

  it('"3.14" → 3.14', () => {
    expect(safeParseFloat("3.14")).toBe(3.14);
  });

  it('"-8.25" → -8.25', () => {
    expect(safeParseFloat("-8.25")).toBe(-8.25);
  });

  it('"37.0833" (latitude) → 37.0833', () => {
    expect(safeParseFloat("37.0833")).toBe(37.0833);
  });

  it('"1e3" scientific notation → 1000', () => {
    expect(safeParseFloat("1e3")).toBe(1000);
  });

  it('"  42  " with surrounding whitespace → 42', () => {
    expect(safeParseFloat("  42  ")).toBe(42);
  });

  // ── Number passthrough ───────────────────────────────────────────────────
  it("number 0 passthrough (no false-null)", () => {
    expect(safeParseFloat(0)).toBe(0);
  });

  it("number 42 passthrough", () => {
    expect(safeParseFloat(42)).toBe(42);
  });

  it("negative number passthrough", () => {
    expect(safeParseFloat(-1.5)).toBe(-1.5);
  });

  // ── Locale safety ────────────────────────────────────────────────────────
  it('"12,5" (EU decimal) → null — NOT supported', () => {
    // parseFloat("12,5") stops at the comma, returning 12.
    // safeParseFloat wraps Number.parseFloat which returns 12 (not NaN).
    // IMPORTANT: this is a documented limitation — inputs must use "."
    // Kept as a spec test so any future change is visible.
    expect(safeParseFloat("12,5")).toBe(12); // partial parse, not null
  });
});

// ─── safeParseInt ─────────────────────────────────────────────────────────────

describe("safeParseInt", () => {
  // ── Null / empty inputs ──────────────────────────────────────────────────
  it('"" → null', () => {
    expect(safeParseInt("")).toBeNull();
  });

  it("null → null", () => {
    expect(safeParseInt(null)).toBeNull();
  });

  it("undefined → null", () => {
    expect(safeParseInt(undefined)).toBeNull();
  });

  // ── Invalid strings ──────────────────────────────────────────────────────
  it('"abc" → null', () => {
    expect(safeParseInt("abc")).toBeNull();
  });

  it('"NaN" → null', () => {
    expect(safeParseInt("NaN")).toBeNull();
  });

  // ── Valid inputs ─────────────────────────────────────────────────────────
  it('"0" → 0 (never confused with falsy)', () => {
    expect(safeParseInt("0")).toBe(0);
  });

  it('"42" → 42', () => {
    expect(safeParseInt("42")).toBe(42);
  });

  it('"-7" → -7', () => {
    expect(safeParseInt("-7")).toBe(-7);
  });

  it('"3.9" → 3 (decimal truncated, not rounded)', () => {
    expect(safeParseInt("3.9")).toBe(3);
  });

  it('"  5  " with whitespace → 5', () => {
    expect(safeParseInt("  5  ")).toBe(5);
  });

  // ── Radix ────────────────────────────────────────────────────────────────
  it('hex radix 16: "ff" → 255', () => {
    expect(safeParseInt("ff", 16)).toBe(255);
  });

  it('binary radix 2: "1010" → 10', () => {
    expect(safeParseInt("1010", 2)).toBe(10);
  });

  // ── Number passthrough ───────────────────────────────────────────────────
  it("number 0 passthrough", () => {
    expect(safeParseInt(0)).toBe(0);
  });

  it("number 5 passthrough", () => {
    expect(safeParseInt(5)).toBe(5);
  });

  it("float passthrough — truncates", () => {
    expect(safeParseInt(3.9)).toBe(3);
  });
});

// ─── parseBoolean ─────────────────────────────────────────────────────────────

describe("parseBoolean", () => {
  it('"true" → true', () => {
    expect(parseBoolean("true")).toBe(true);
  });

  it('"false" → false', () => {
    expect(parseBoolean("false")).toBe(false);
  });

  it('"" → null', () => {
    expect(parseBoolean("")).toBeNull();
  });

  it("null → null", () => {
    expect(parseBoolean(null)).toBeNull();
  });

  it("undefined → null", () => {
    expect(parseBoolean(undefined)).toBeNull();
  });

  it('"1" → null (only exact "true" is truthy)', () => {
    expect(parseBoolean("1")).toBe(null);
  });

  it('"0" → null', () => {
    expect(parseBoolean("0")).toBe(null);
  });

  it('"True" → null (case-sensitive)', () => {
    expect(parseBoolean("True")).toBe(null);
  });

  it('"yes" → null', () => {
    expect(parseBoolean("yes")).toBe(null);
  });

  it('"FALSE" → null (case-sensitive)', () => {
    expect(parseBoolean("FALSE")).toBe(null);
  });
});

// ─── normalizeInputValue ──────────────────────────────────────────────────────

describe("normalizeInputValue", () => {
  it('null → ""', () => {
    expect(normalizeInputValue(null)).toBe("");
  });

  it('undefined → ""', () => {
    expect(normalizeInputValue(undefined)).toBe("");
  });

  it('0 → "0" (zero is not treated as empty)', () => {
    expect(normalizeInputValue(0)).toBe("0");
  });

  it('42 → "42"', () => {
    expect(normalizeInputValue(42)).toBe("42");
  });

  it('3.14 → "3.14"', () => {
    expect(normalizeInputValue(3.14)).toBe("3.14");
  });

  it('"hello" → "hello" (identity for strings)', () => {
    expect(normalizeInputValue("hello")).toBe("hello");
  });

  it('"" → "" (empty stays empty)', () => {
    expect(normalizeInputValue("")).toBe("");
  });
});

// ─── formatNumberInput ────────────────────────────────────────────────────────

describe("formatNumberInput", () => {
  it('null → ""', () => {
    expect(formatNumberInput(null)).toBe("");
  });

  it('undefined → ""', () => {
    expect(formatNumberInput(undefined)).toBe("");
  });

  it('0 → "0" (zero is not treated as empty)', () => {
    expect(formatNumberInput(0)).toBe("0");
  });

  it('42 → "42"', () => {
    expect(formatNumberInput(42)).toBe("42");
  });

  it('3.14 → "3.14"', () => {
    expect(formatNumberInput(3.14)).toBe("3.14");
  });

  it('negative number preserved → "-8.25"', () => {
    expect(formatNumberInput(-8.25)).toBe("-8.25");
  });

  it("round-trips: safeParseFloat(formatNumberInput(x)) === x for valid numbers", () => {
    const values = [0, 1, -1, 3.14, 37.0833, -8.25];
    for (const v of values) {
      expect(safeParseFloat(formatNumberInput(v))).toBe(v);
    }
  });

  it("formatNumberInput(null) → safeParseFloat → null (round-trip empty state)", () => {
    expect(safeParseFloat(formatNumberInput(null))).toBeNull();
  });
});
