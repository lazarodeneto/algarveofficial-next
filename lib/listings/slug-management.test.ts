import { describe, expect, it } from "vitest";

import {
  buildListingCanonicalPath,
  suggestListingCanonicalSlug,
} from "@/lib/listings/slug-management";

describe("listing canonical slug policy", () => {
  it("suggests canonical golf course slugs from the course name only", () => {
    expect(
      suggestListingCanonicalSlug({
        name: "Espiche Golf",
        cityName: "Lagos",
        citySlug: "lagos",
        categorySlug: "golf",
      }),
    ).toBe("espiche-golf");
  });

  it("keeps the existing normal listing convention as name-only slugs", () => {
    expect(
      suggestListingCanonicalSlug({
        name: "Casa do Alto Almancil",
        cityName: "Almancil",
        citySlug: "almancil",
        categorySlug: "restaurants",
      }),
    ).toBe("casa-do-alto-almancil");
  });

  it("builds canonical public paths for golf and normal listings", () => {
    expect(buildListingCanonicalPath({ slug: "espiche-golf", categorySlug: "golf" })).toBe(
      "/golf/courses/espiche-golf",
    );
    expect(buildListingCanonicalPath({ slug: "casa-do-alto", categorySlug: "restaurants" })).toBe(
      "/listing/casa-do-alto",
    );
  });
});
