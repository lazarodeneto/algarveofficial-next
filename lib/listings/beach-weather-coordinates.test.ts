import { describe, expect, it } from "vitest";

import { resolveBeachWeatherCoordinates } from "./beach-weather-coordinates";

describe("resolveBeachWeatherCoordinates", () => {
  it("does not resolve weather coordinates for non-beach categories", () => {
    expect(
      resolveBeachWeatherCoordinates({
        categorySlug: "restaurants",
        categoryName: "Restaurants",
        listingLatitude: 37.09,
        listingLongitude: -8.41,
        categoryData: {
          coordinates: {
            latitude: 37.1,
            longitude: -8.4,
          },
        },
      }),
    ).toEqual({
      isBeachListing: false,
      latitude: null,
      longitude: null,
      hasCoordinates: false,
      source: null,
    });
  });

  it("uses listing coordinates first for beach listings", () => {
    expect(
      resolveBeachWeatherCoordinates({
        categorySlug: "beaches",
        categoryName: "Beaches",
        listingLatitude: 37.0901,
        listingLongitude: -8.4123,
        categoryData: {
          coordinates: {
            latitude: 37.2,
            longitude: -8.5,
          },
        },
      }),
    ).toEqual({
      isBeachListing: true,
      latitude: 37.0901,
      longitude: -8.4123,
      hasCoordinates: true,
      source: "listing",
    });
  });

  it("uses explicit category data coordinates when listing coordinates are absent", () => {
    expect(
      resolveBeachWeatherCoordinates({
        categorySlug: "beaches",
        categoryName: "Beaches",
        listingLatitude: null,
        listingLongitude: null,
        categoryData: {
          coordinates: {
            latitude: "37.100591",
            longitude: "-8.356549",
          },
        },
      }),
    ).toEqual({
      isBeachListing: true,
      latitude: 37.100591,
      longitude: -8.356549,
      hasCoordinates: true,
      source: "category_data",
    });
  });

  it("does not fall back to broad city coordinates for beach weather", () => {
    expect(
      resolveBeachWeatherCoordinates({
        categorySlug: "beaches",
        categoryName: "Beaches",
        listingLatitude: null,
        listingLongitude: null,
        categoryData: {},
      }),
    ).toEqual({
      isBeachListing: true,
      latitude: null,
      longitude: null,
      hasCoordinates: false,
      source: null,
    });
  });
});
