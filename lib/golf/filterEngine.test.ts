import { describe, expect, it } from "vitest";

import type { GolfListing } from "@/lib/golf";
import { rankGolfCourses } from "@/lib/golf/filterEngine";

function course(overrides: Partial<GolfListing>): GolfListing {
  return {
    id: "id",
    slug: "slug",
    name: "Course",
    shortDescription: null,
    description: null,
    featuredImageUrl: null,
    tier: null,
    status: "published",
    latitude: null,
    longitude: null,
    websiteUrl: null,
    contactPhone: null,
    contactEmail: null,
    city: null,
    region: null,
    categorySlug: "golf",
    categoryName: "Golf",
    details: null,
    holeCount: 0,
    scorecardHoles: [],
    ...overrides,
  };
}

describe("rankGolfCourses", () => {
  it("prioritizes signature listings and strong matches while keeping every course visible", () => {
    const strong = course({
      id: "strong",
      name: "Championship",
      tier: "verified",
      details: { holes: 18, difficulty: "high" } as GolfListing["details"],
    });
    const partial = course({
      id: "partial",
      name: "Partial",
      tier: "signature",
      details: { holes: 18, difficulty: null } as GolfListing["details"],
    });
    const other = course({
      id: "other",
      name: "Other",
      details: { holes: 9, difficulty: "low" } as GolfListing["details"],
    });

    const result = rankGolfCourses([other, partial, strong], { holes: 18, difficulty: "high" });

    expect(result.map((item) => item.id)).toEqual(["partial", "strong", "other"]);
    expect(result).toHaveLength(3);
  });

  it("does not penalize incomplete data and preserves order when scores tie", () => {
    const unknown = course({ id: "unknown", name: "Unknown", details: null });
    const mismatch = course({
      id: "mismatch",
      name: "Mismatch",
      details: { holes: 9, difficulty: "low" } as GolfListing["details"],
    });

    const result = rankGolfCourses([mismatch, unknown], { holes: 18, difficulty: "high" });

    expect(result.map((item) => item.id)).toEqual(["mismatch", "unknown"]);
  });

  it("returns the original list when no criteria are supplied", () => {
    const first = course({ id: "first", name: "First" });
    const second = course({ id: "second", name: "Second", tier: "signature" });

    const result = rankGolfCourses([first, second], {});

    expect(result.map((item) => item.id)).toEqual(["first", "second"]);
  });
});
