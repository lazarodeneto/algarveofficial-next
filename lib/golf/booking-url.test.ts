import { describe, expect, it } from "vitest";

import { isEmptyOrValidUrl } from "./booking-url";

describe("isEmptyOrValidUrl", () => {
  it("accepts empty values and full external URLs with affiliate parameters", () => {
    expect(isEmptyOrValidUrl("")).toBe(true);
    expect(isEmptyOrValidUrl("   ")).toBe(true);
    expect(isEmptyOrValidUrl("https://partner.example/book?course=els&partner_id=ao&utm_source=algarve")).toBe(true);
  });

  it("rejects invalid URLs", () => {
    expect(isEmptyOrValidUrl("not a url")).toBe(false);
    expect(isEmptyOrValidUrl("/relative-path")).toBe(false);
  });
});
