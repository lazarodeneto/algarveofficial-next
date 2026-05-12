import { describe, expect, it } from "vitest";

import { calculateBusinessClaimConfidence } from "./business-claim-scoring";

describe("calculateBusinessClaimConfidence", () => {
  it("scores matching email domain, company website, and phone", () => {
    expect(
      calculateBusinessClaimConfidence({
        claimantEmail: "owner@example.com",
        companyWebsite: "https://www.example.com/about",
        claimantPhone: "+351 282 123 456",
        listingWebsite: "https://example.com",
        listingPhone: "+351282123456",
      }),
    ).toBe(70);
  });

  it("scores zero when signals do not match", () => {
    expect(
      calculateBusinessClaimConfidence({
        claimantEmail: "owner@agency.test",
        companyWebsite: "https://agency.test",
        claimantPhone: "+351 900 000 000",
        listingWebsite: "https://business.example",
        listingPhone: "+351 282 123 456",
      }),
    ).toBe(0);
  });
});
