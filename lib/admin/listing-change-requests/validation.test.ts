import { describe, expect, it } from "vitest";

import { validateListingChangeRequestValue } from "./validation";

describe("listing change request admin validation", () => {
  it("rejects unsupported fields such as slug and category", () => {
    expect(validateListingChangeRequestValue("slug", "new-slug").ok).toBe(false);
    expect(validateListingChangeRequestValue("category_id", "restaurants").ok).toBe(false);
  });

  it("validates contact email, phone, and URL fields", () => {
    expect(validateListingChangeRequestValue("contact_email", "owner@example.com").ok).toBe(true);
    expect(validateListingChangeRequestValue("contact_email", "not-an-email").ok).toBe(false);
    expect(validateListingChangeRequestValue("contact_phone", "+351 282 123 456").ok).toBe(true);
    expect(validateListingChangeRequestValue("contact_phone", "call me maybe").ok).toBe(false);
    expect(validateListingChangeRequestValue("website_url", "https://example.com").ok).toBe(true);
    expect(validateListingChangeRequestValue("website_url", "javascript:alert(1)").ok).toBe(false);
  });

  it("allows clearing optional fields with null values", () => {
    expect(validateListingChangeRequestValue("website_url", null)).toEqual({
      ok: true,
      value: null,
    });
  });
});

