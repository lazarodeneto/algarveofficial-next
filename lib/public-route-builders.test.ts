import { describe, expect, it } from "vitest";

import {
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
    expect(buildCategoryHref("restaurants")).toBe("/stay?category=restaurants");
    expect(buildCityHref("lagos")).toBe("/visit/lagos");
  });

  it("keeps generated public paths locale-aware through the central router", () => {
    expect(buildLocalizedPath("en", buildCityHref("lagos"))).toBe("/en/visit/lagos");
    expect(buildLocalizedPath("en", buildListingHref({ slug: "seafront-villa", id: "listing-1" }))).toBe(
      "/en/listing/seafront-villa",
    );
    expect(buildLocalizedPath("pt-pt", buildCityHref("lagos"))).toBe("/pt-pt/visit/lagos");
    expect(buildLocalizedPath("fr", buildCategoryHref("restaurants"))).toBe(
      "/fr/stay?category=restaurants",
    );
    expect(
      buildLocalizedPath(
        "de",
        buildListingHref({ slug: "seafront-villa", id: "listing-1" }),
      ),
    ).toBe("/de/listing/seafront-villa");
  });
});
