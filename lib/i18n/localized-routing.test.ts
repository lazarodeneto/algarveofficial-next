import { describe, expect, it } from "vitest";

import {
  buildEntityPath,
  buildLocalizedPath,
  buildLocaleSwitchPathsForEntity,
  buildRouteMetadataAlternates,
  buildStaticRouteData,
  buildStaticRoutePath,
  type CityCategoryRouteData,
  type ListingRouteData,
} from "@/lib/i18n/localized-routing";

describe("localized routing contract", () => {
  it("builds static route paths from route keys", () => {
    expect(buildStaticRoutePath("blog", "fr")).toBe("/fr/blog");
    expect(buildLocalizedPath("en", buildStaticRouteData("home"))).toBe("/");
  });

  it("builds entity paths from structured localized slugs", () => {
    const listingRoute: ListingRouteData = {
      routeType: "listing",
      id: "listing-1",
      slugs: {
        en: "luxury-villa",
        fr: "villa-luxe",
        "pt-pt": "vivenda-luxo",
        de: "luxus-villa",
        es: "villa-lujo",
        it: "villa-di-lusso",
        nl: "luxe-villa",
        sv: "lyxvilla",
        no: "luksusvilla",
        da: "luksusvilla",
      },
    };

    expect(buildEntityPath("fr", listingRoute)).toBe("/fr/listing/villa-luxe");
    expect(
      buildLocalizedPath("pt-pt", listingRoute, {
        query: { view: "gallery" },
        hash: "contact",
      }),
    ).toBe("/pt-pt/listing/vivenda-luxo?view=gallery#contact");
  });

  it("builds switcher maps and metadata alternates from entity identity", () => {
    const cityCategoryRoute: CityCategoryRouteData = {
      routeType: "city-category",
      citySlugs: {
        en: "lagos",
        "pt-pt": "lagos",
        fr: "lagos",
        de: "lagos",
        es: "lagos",
        it: "lagos",
        nl: "lagos",
        sv: "lagos",
        no: "lagos",
        da: "lagos",
      },
      categorySlugs: {
        en: "restaurants",
        "pt-pt": "restaurantes",
        fr: "restaurants",
        de: "restaurants",
        es: "restaurantes",
        it: "ristoranti",
        nl: "restaurants",
        sv: "restauranger",
        no: "restauranter",
        da: "restauranter",
      },
    };

    const switchPaths = buildLocaleSwitchPathsForEntity(cityCategoryRoute, [
      "en",
      "pt-pt",
      "fr",
    ]);

    expect(switchPaths).toEqual({
      en: "/visit/lagos/restaurants",
      "pt-pt": "/pt-pt/visit/lagos/restaurantes",
      fr: "/fr/visit/lagos/restaurants",
    });

    const alternates = buildRouteMetadataAlternates(cityCategoryRoute, "pt-pt");
    expect(alternates?.canonical).toBe(
      "https://algarveofficial.com/pt-pt/visit/lagos/restaurantes",
    );
    expect(alternates?.languages?.["x-default"]).toBe(
      "https://algarveofficial.com/visit/lagos/restaurants",
    );
  });
});
