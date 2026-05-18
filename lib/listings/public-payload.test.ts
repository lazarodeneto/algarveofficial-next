import { describe, expect, it } from "vitest";

import {
  maskTierGatedListingFields,
  PUBLIC_LISTING_SUMMARY_EXCLUDED_FIELDS,
  PUBLIC_LISTING_SUMMARY_FIELDS,
} from "@/lib/listings/public-payload";

describe("public listing payload guardrails", () => {
  it("keeps directory summary selects free of gated and internal fields", () => {
    for (const field of PUBLIC_LISTING_SUMMARY_EXCLUDED_FIELDS) {
      expect(PUBLIC_LISTING_SUMMARY_FIELDS).not.toMatch(new RegExp(`\\b${field}\\b`));
    }
  });

  it("masks unverified tier contact, social, direct-contact, and internal fields", () => {
    const listing = maskTierGatedListingFields({
      tier: "unverified",
      owner_id: "owner-1",
      website_url: "https://example.com",
      google_business_url: "https://google.example",
      facebook_url: "https://facebook.example",
      instagram_url: "https://instagram.example",
      telegram_url: "https://t.me/example",
      whatsapp_number: "+351912345678",
    });

    expect(listing.owner_id).toBeNull();
    expect(listing.website_url).toBeNull();
    expect(listing.google_business_url).toBeNull();
    expect(listing.facebook_url).toBeNull();
    expect(listing.instagram_url).toBeNull();
    expect(listing.telegram_url).toBeNull();
    expect(listing.whatsapp_number).toBeNull();
  });

  it.each(["verified", "signature"])("keeps allowed public fields for %s listings", (tier) => {
    const listing = maskTierGatedListingFields({
      tier,
      owner_id: "owner-1",
      website_url: "https://example.com",
      google_business_url: "https://google.example",
      facebook_url: "https://facebook.example",
      instagram_url: "https://instagram.example",
      telegram_url: "https://t.me/example",
      whatsapp_number: "+351912345678",
    });

    expect(listing.owner_id).toBe("owner-1");
    expect(listing.website_url).toBe("https://example.com");
    expect(listing.google_business_url).toBe("https://google.example");
    expect(listing.facebook_url).toBe("https://facebook.example");
    expect(listing.instagram_url).toBe("https://instagram.example");
    expect(listing.telegram_url).toBe("https://t.me/example");
    expect(listing.whatsapp_number).toBe("+351912345678");
  });
});
