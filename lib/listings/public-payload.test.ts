import { describe, expect, it } from "vitest";

import {
  maskTierGatedListingFields,
  PUBLIC_LISTING_SUMMARY_EXCLUDED_FIELDS,
  PUBLIC_LISTING_SUMMARY_FIELDS,
  toPublicListingDetailPayload,
} from "@/lib/listings/public-payload";

const PROTECTED_DETAIL_KEYS = [
  "owner_id",
  "email",
  "phone",
  "contact_email",
  "contact_phone",
  "website_url",
  "facebook_url",
  "instagram_url",
  "linkedin_url",
  "twitter_url",
  "youtube_url",
  "tiktok_url",
  "telegram_url",
  "whatsapp_url",
  "whatsapp_number",
  "google_business_url",
  "category_data",
  "source_url",
  "view_count",
] as const;

const INTERNAL_DETAIL_KEYS = [
  "owner_id",
  "category_data",
  "view_count",
  "admin_notes",
  "rejection_notes",
  "rejection_reason",
  "claim_verified_at",
  "claim_verification_method",
  "source_url",
] as const;

function collectKeys(value: unknown, keys = new Set<string>()) {
  if (!value || typeof value !== "object") return keys;

  if (Array.isArray(value)) {
    value.forEach((item) => collectKeys(item, keys));
    return keys;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    keys.add(key);
    collectKeys(nestedValue, keys);
  }

  return keys;
}

function expectKeysAbsent(value: unknown, keys: readonly string[]) {
  const foundKeys = collectKeys(value);

  for (const key of keys) {
    expect(foundKeys.has(key), `${key} should not be serialized`).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(value as object, key), `${key} should be omitted`).toBe(false);
  }
}

function baseListing(overrides: Record<string, unknown> = {}) {
  return {
    id: "listing-1",
    slug: "test-listing",
    name: "Test Listing",
    short_description: "Short",
    description: "Description",
    featured_image_url: "https://cdn.example/image.jpg",
    price_from: null,
    price_to: null,
    price_currency: "EUR",
    tier: "unverified",
    is_curated: false,
    status: "published",
    city_id: "city-1",
    region_id: "region-1",
    category_id: "category-1",
    owner_id: "owner-1",
    latitude: 37.1,
    longitude: -8.1,
    address: "Hidden address",
    contact_email: "owner@example.com",
    contact_phone: "+351912345678",
    website_url: "https://example.com",
    facebook_url: "https://facebook.example",
    instagram_url: "https://instagram.example",
    linkedin_url: "https://linkedin.example",
    twitter_url: "https://twitter.example",
    youtube_url: "https://youtube.example",
    tiktok_url: "https://tiktok.example",
    telegram_url: "https://t.me/example",
    whatsapp_number: "+351912345678",
    google_business_url: "https://google.example",
    google_rating: 4.8,
    google_review_count: 120,
    tags: ["family"],
    category_data: {
      booking_url: "https://book.example",
      publicFact: "Open all year",
      category_data: { nested: true },
      owner_id: "owner-1",
      email: "nested@example.com",
      phone: "+351911111111",
      contact_phone: "+351900000000",
      website_url: "https://nested.example",
      social: {
        instagram_url: "https://instagram.example/nested",
        whatsapp_url: "https://wa.me/351912345678",
      },
      source_url: "https://internal.example/source",
      stats: {
        source_url: "https://internal.example/nested-source",
        view_count: 999,
      },
    },
    view_count: 999,
    admin_notes: "admin only",
    rejection_notes: "private rejection notes",
    rejection_reason: "private rejection reason",
    claim_verified_at: "2026-01-03T00:00:00.000Z",
    claim_verification_method: "manual",
    published_at: "2026-01-01T00:00:00.000Z",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
    city: {
      id: "city-1",
      name: "Lagos",
      slug: "lagos",
      short_description: "City",
      image_url: "https://cdn.example/city.jpg",
      latitude: 37.1,
      longitude: -8.1,
      meta_title: "private city field",
    },
    category: {
      id: "category-1",
      name: "Experiences",
      slug: "experiences",
      icon: "sparkles",
      short_description: "Category",
      image_url: "https://cdn.example/category.jpg",
      template_fields: { private: true },
    },
    images: [
      {
        id: "image-1",
        image_url: "https://cdn.example/image.jpg",
        alt_text: "Image",
        display_order: 0,
        is_featured: true,
        listing_id: "listing-1",
      },
    ],
    ...overrides,
  };
}

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

  it("omits protected keys from unverified listing detail payloads instead of null-masking them", () => {
    const listing = toPublicListingDetailPayload(baseListing());

    expectKeysAbsent(listing, PROTECTED_DETAIL_KEYS);

    expect(listing).not.toHaveProperty("category_data");
    expect(listing).toHaveProperty("details");
    expect(listing.details).toMatchObject({ publicFact: "Open all year" });
    expect(listing.category).toMatchObject({ id: "category-1", name: "Experiences", slug: "experiences" });
  });

  it.each(["verified", "signature"])("keeps allowed detail contact and social fields for %s listings", (tier) => {
    const listing = toPublicListingDetailPayload(
      baseListing({
        tier,
        google_business_url: null,
        facebook_url: null,
        linkedin_url: "",
        telegram_url: null,
        category_data: {
          publicFact: "Open all year",
          owner_id: "owner-1",
          category_data: { nested: true },
          view_count: 999,
          admin_notes: "admin only",
          contact_phone: null,
          google_business_url: null,
          facebook_url: "",
          instagram_url: "https://instagram.example/nested",
          agent_email: null,
        },
      }),
    );

    expectKeysAbsent(listing, INTERNAL_DETAIL_KEYS);
    expect(listing.website_url).toBe("https://example.com");
    expect(listing).not.toHaveProperty("google_business_url");
    expect(listing).not.toHaveProperty("facebook_url");
    expect(listing.instagram_url).toBe("https://instagram.example");
    expect(listing).not.toHaveProperty("linkedin_url");
    expect(listing).not.toHaveProperty("telegram_url");
    expect(listing.whatsapp_number).toBe("+351912345678");
    expect(listing.details).toMatchObject({
      publicFact: "Open all year",
      instagram_url: "https://instagram.example/nested",
    });
    expect(listing.details).not.toHaveProperty("contact_phone");
    expect(listing.details).not.toHaveProperty("google_business_url");
    expect(listing.details).not.toHaveProperty("facebook_url");
    expect(listing.details).not.toHaveProperty("agent_email");
    expect(collectKeys(listing.details).has("source_url")).toBe(false);
  });

  it("does not expose category data through the category_data key", () => {
    const listing = toPublicListingDetailPayload(baseListing({ tier: "signature" }));

    expectKeysAbsent(listing, ["category_data"]);
    expect(listing.category).toMatchObject({ id: "category-1", slug: "experiences" });
    expect(listing.details).toMatchObject({ publicFact: "Open all year" });
  });

  it("scans the scoped listing payload instead of unrelated page metadata or translations", () => {
    const listing = toPublicListingDetailPayload(baseListing());
    const serializedPageShape = {
      metadata: {
        email: "info@algarveofficial.com",
        phone: "+351000000000",
      },
      translations: {
        listing: {
          form: {
            email: "Email address",
            phone: "Phone",
          },
        },
      },
      listing,
    };

    expect(collectKeys(serializedPageShape).has("email")).toBe(true);
    expect(collectKeys(serializedPageShape).has("phone")).toBe(true);
    expectKeysAbsent(serializedPageShape.listing, PROTECTED_DETAIL_KEYS);

    const serializedListingProps = JSON.stringify({ listing: serializedPageShape.listing });
    for (const key of PROTECTED_DETAIL_KEYS) {
      expect(serializedListingProps).not.toContain(`"${key}":`);
      expect(serializedListingProps).not.toContain(`\\"${key}\\":`);
    }
  });

  it("serializes verified listing props without internal listing keys", () => {
    const listing = toPublicListingDetailPayload(baseListing({ tier: "signature" }));
    const serializedListingProps = JSON.stringify({ listing });

    for (const key of INTERNAL_DETAIL_KEYS) {
      expect(serializedListingProps).not.toContain(`"${key}":`);
      expect(serializedListingProps).not.toContain(`\\"${key}\\":`);
    }
  });
});
