import { describe, expect, it } from "vitest";

import { resolvePublicLocation } from "@/lib/public-data/location";

describe("resolvePublicLocation", () => {
  it("prefers joined city and region names", () => {
    expect(
      resolvePublicLocation({
        city: { name: "Lagos", slug: "lagos" },
        region: { name: "Algarve", slug: "algarve" },
        cityName: "Fallback City",
        regionName: "Fallback Region",
      }),
    ).toMatchObject({
      city: "Lagos",
      region: "Algarve",
      country: "Portugal",
    });
  });

  it("keeps listing coordinates ahead of city fallback coordinates", () => {
    expect(
      resolvePublicLocation(
        {
          city: { name: "Faro", latitude: 37.0194, longitude: -7.9322 },
          latitude: 37.1,
          longitude: -8.1,
        },
        { allowCityCoordinateFallback: true },
      ),
    ).toMatchObject({
      latitude: 37.1,
      longitude: -8.1,
    });
  });

  it("does not invent marker coordinates unless city fallback is explicitly allowed", () => {
    expect(
      resolvePublicLocation({
        city: { name: "Faro", latitude: 37.0194, longitude: -7.9322 },
      }),
    ).toMatchObject({
      latitude: null,
      longitude: null,
    });
  });

  it("unwraps relation arrays and trims denormalized fallbacks", () => {
    expect(
      resolvePublicLocation({
        city: [{ name: "  Tavira  ", slug: "tavira" }],
        region: [],
        cityName: "  Ignored City  ",
        regionName: "  Algarve  ",
        country: "  Portugal  ",
      }),
    ).toMatchObject({
      city: "Tavira",
      region: "Algarve",
      country: "Portugal",
    });
  });

  it("drops invalid coordinate values instead of exposing broken map positions", () => {
    expect(
      resolvePublicLocation({
        city: { name: "Lagos", latitude: Number.NaN, longitude: -8.67 },
        latitude: "not-a-number" as never,
        longitude: Number.POSITIVE_INFINITY,
      }),
    ).toMatchObject({
      latitude: null,
      longitude: null,
    });
  });
});
