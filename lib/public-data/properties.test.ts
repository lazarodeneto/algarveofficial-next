import { describe, expect, it } from "vitest";

import {
  normalizePublicProperty,
  resolvePublicPropertyDetails,
} from "@/lib/public-data/properties";
import type { PublicListingDTO } from "@/lib/public-data/types";

const emptyReviews = {
  averageRating: null,
  reviewCount: null,
  source: "none" as const,
  externalRating: null,
  externalReviewCount: null,
  nativeAverageRating: null,
  nativeReviewCount: 0,
  nativeAverage: null,
  nativeCount: 0,
  googleRating: null,
  googleReviewCount: null,
  displayRating: null,
  displayReviewCount: 0,
  displaySource: "none" as const,
};

function buildListing(overrides: Partial<PublicListingDTO> = {}): PublicListingDTO {
  return {
    id: "listing-1",
    slug: "quinta-villa",
    name: "Quinta Villa",
    shortDescription: null,
    description: null,
    imageUrl: null,
    status: "published",
    tier: "unverified",
    isCurated: false,
    category: null,
    categoryId: "category-1",
    city: null,
    cityId: null,
    region: null,
    regionId: null,
    location: {
      city: "Lagos",
      region: "Algarve",
      country: "Portugal",
      latitude: null,
      longitude: null,
    },
    address: null,
    websiteUrl: null,
    contactPhone: null,
    contactEmail: null,
    priceFrom: null,
    priceTo: null,
    priceCurrency: null,
    googleBusinessUrl: null,
    reviews: emptyReviews,
    tags: [],
    categoryData: {},
    claimStatus: null,
    publishedAt: null,
    updatedAt: null,
    createdAt: null,
    ...overrides,
  };
}

describe("resolvePublicPropertyDetails", () => {
  it("normalizes supported property details from top-level or nested category data", () => {
    expect(
      resolvePublicPropertyDetails({
        property: {
          property_type: "Villa",
          bedrooms: "4",
          bathrooms: 3,
          property_size_m2: "280",
        },
      }),
    ).toMatchObject({
      propertyType: "Villa",
      bedrooms: 4,
      bathrooms: 3,
      areaSqm: 280,
      areaSquareMeters: 280,
    });
  });
});

describe("normalizePublicProperty", () => {
  it("returns a flat public property DTO without inventing missing price or currency", () => {
    expect(
      normalizePublicProperty(
        buildListing({
          categoryData: {
            bedrooms: 2,
            bathrooms: 1,
            area_sqm: 95,
          },
        }),
      ),
    ).toMatchObject({
      id: "listing-1",
      slug: "quinta-villa",
      title: "Quinta Villa",
      city: "Lagos",
      region: "Algarve",
      price: null,
      currency: null,
      bedrooms: 2,
      bathrooms: 1,
      areaSqm: 95,
      imageUrl: null,
      href: "/listing/quinta-villa",
    });
  });

  it("uses stored listing price and currency before category_data fallbacks", () => {
    expect(
      normalizePublicProperty(
        buildListing({
          priceFrom: 725000,
          priceCurrency: "EUR",
          categoryData: {
            price: 650000,
            currency: "USD",
          },
        }),
      ),
    ).toMatchObject({
      price: 725000,
      currency: "EUR",
    });
  });

  it("can fall back to explicit property category data when listing price fields are absent", () => {
    expect(
      normalizePublicProperty(
        buildListing({
          categoryData: {
            property: {
              price: "495000",
              currency: "EUR",
            },
          },
        }),
      ),
    ).toMatchObject({
      price: 495000,
      currency: "EUR",
    });
  });

  it("normalizes invalid numeric detail values to null", () => {
    expect(
      resolvePublicPropertyDetails({
        bedrooms: "not listed",
        bathrooms: Number.NaN,
        property_size_m2: "",
        plot_sqm: "1250.5",
      }),
    ).toMatchObject({
      bedrooms: null,
      bathrooms: null,
      areaSqm: null,
      plotSqm: 1250.5,
    });
  });
});
