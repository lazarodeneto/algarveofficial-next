import { describe, expect, it } from "vitest";

import {
  buildCategoryRouteData,
  buildCategoryHref,
  buildCityHref,
  buildListingHref,
} from "@/lib/public-route-builders";
import { buildLocalizedPath } from "@/lib/i18n/localized-routing";

describe("public route builders", () => {
  it("builds canonical public listing, category, and city paths", () => {
    expect(buildListingHref({ slug: "alvor-golf-shop", id: "listing-1" })).toBe(
      "/listing/alvor-golf-shop",
    );
    expect(buildListingHref({ slug: "", id: "listing-1" })).toBe("/listing/listing-1");
    expect(buildCategoryHref("restaurants")).toBe("/category/restaurants");
    expect(buildCategoryHref("fine-dining")).toBe("/category/restaurants");
    expect(buildCategoryHref("restaurants", "pt-pt")).toBe("/pt-pt/category/restaurantes");
    expect(buildCategoryHref("events")).toBe("/events");
    expect(buildCityHref("lagos")).toBe("/visit/lagos");
  });

  it("keeps generated public paths locale-aware through the central router", () => {
    expect(buildLocalizedPath("en", buildCityHref("lagos"))).toBe("/visit/lagos");
    expect(buildLocalizedPath("en", buildListingHref({ slug: "seafront-villa", id: "listing-1" }))).toBe(
      "/listing/seafront-villa",
    );
    expect(buildLocalizedPath("pt-pt", buildCityHref("lagos"))).toBe("/pt-pt/visit/lagos");
    expect(buildCategoryHref("restaurants", "fr")).toBe("/fr/category/restaurants");
    expect(
      buildLocalizedPath(
        "de",
        buildListingHref({ slug: "seafront-villa", id: "listing-1" }),
      ),
    ).toBe("/de/listing/seafront-villa");
  });

  it("generates localized canonical category route data for hreflang and links", () => {
    expect(buildCategoryRouteData("restaurants")).toEqual({
      routeType: "category",
      slugs: expect.objectContaining({
        en: "restaurants",
        "pt-pt": "restaurantes",
        fr: "restaurants",
      }),
    });
    expect(buildCategoryRouteData("fine-dining")).toEqual(buildCategoryRouteData("restaurants"));
    expect(buildCategoryRouteData("events")).toBeNull();
    expect(buildLocalizedPath("pt-pt", buildCategoryRouteData("restaurants")!)).toBe(
      "/pt-pt/category/restaurantes",
    );
  });
});
