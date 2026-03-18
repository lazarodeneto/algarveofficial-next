import { describe, expect, it } from "vitest";

import { isUuid } from "./slugify";

describe("isUuid", () => {
  it("accepts valid v4 UUID values", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("rejects UUID values that are not v4", () => {
    // Version nibble is "1", so this must not match a v4-only UUID check.
    expect(isUuid("123e4567-e89b-12d3-a456-426614174000")).toBe(false);
  });
});
