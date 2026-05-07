import { describe, expect, it } from "vitest";

import { resolveListingDetailLayoutKey } from "./listingDetailLayout";

describe("resolveListingDetailLayoutKey", () => {
  it("uses accommodation layout for canonical and legacy accommodation slugs", () => {
    expect(resolveListingDetailLayoutKey("accommodation")).toBe("accommodation");
    expect(resolveListingDetailLayoutKey("places-to-stay")).toBe("accommodation");
    expect(resolveListingDetailLayoutKey("premium-accommodation")).toBe("accommodation");
  });

  it("uses shopping layout only for shopping slugs", () => {
    expect(resolveListingDetailLayoutKey("shopping")).toBe("shopping");
    expect(resolveListingDetailLayoutKey("shopping-boutiques")).toBe("shopping");
  });

  it("keeps specialized legacy layouts where they differ from merged category navigation", () => {
    expect(resolveListingDetailLayoutKey("private-chefs")).toBe("private-chefs");
    expect(resolveListingDetailLayoutKey("family-fun")).toBe("family-attractions");
  });

  it("normalizes case and whitespace", () => {
    expect(resolveListingDetailLayoutKey("  GOLF  ")).toBe("golf");
    expect(resolveListingDetailLayoutKey(" VIP-CONCIERGE ")).toBe("concierge-services");
  });

  it("does not fall back to shopping for unknown or missing slugs", () => {
    expect(resolveListingDetailLayoutKey("unknown-category")).toBeNull();
    expect(resolveListingDetailLayoutKey("")).toBeNull();
    expect(resolveListingDetailLayoutKey(null)).toBeNull();
    expect(resolveListingDetailLayoutKey(undefined)).toBeNull();
  });
});
