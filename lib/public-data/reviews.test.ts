import { describe, expect, it } from "vitest";

import {
  buildPublicReviewsSummary,
  resolvePublicRatingSummary,
} from "@/lib/public-data/reviews";

describe("resolvePublicRatingSummary", () => {
  it("uses approved native reviews ahead of external ratings by default", () => {
    expect(
      resolvePublicRatingSummary({
        externalRating: 4.8,
        externalReviewCount: 120,
        nativeRatings: [5, 4, 4],
      }),
    ).toMatchObject({
      averageRating: 4.3,
      reviewCount: 3,
      source: "native",
      externalRating: 4.8,
      externalReviewCount: 120,
      nativeAverageRating: 4.3,
      nativeReviewCount: 3,
    });
  });

  it("uses external ratings when no native reviews exist", () => {
    expect(
      resolvePublicRatingSummary({
        google_rating: 4.6,
        google_review_count: 42,
        nativeRatings: [],
      }),
    ).toMatchObject({
      averageRating: 4.6,
      reviewCount: 42,
      source: "external",
      externalRating: 4.6,
      externalReviewCount: 42,
      nativeAverageRating: null,
      nativeReviewCount: 0,
    });
  });

  it("does not invent stars or counts when there is no valid rating", () => {
    expect(
      resolvePublicRatingSummary({
        externalRating: null,
        externalReviewCount: null,
        nativeRatings: [Number.NaN, 0, 6],
      }),
    ).toMatchObject({
      averageRating: null,
      reviewCount: null,
      source: "none",
      externalRating: null,
      externalReviewCount: null,
      nativeAverageRating: null,
      nativeReviewCount: 0,
    });
  });

  it("combines native and external ratings only when explicitly requested", () => {
    expect(
      resolvePublicRatingSummary(
        {
          externalRating: 4,
          externalReviewCount: 2,
          nativeRatings: [5, 5],
        },
        "combined",
      ),
    ).toMatchObject({
      averageRating: 4.5,
      reviewCount: 4,
      source: "combined",
      externalRating: 4,
      externalReviewCount: 2,
      nativeAverageRating: 5,
      nativeReviewCount: 2,
    });
  });

  it("preserves legacy Google aliases for existing listing cards", () => {
    expect(
      buildPublicReviewsSummary(
        {
          google_rating: 4.2,
          google_review_count: 18,
        },
        [5],
      ),
    ).toMatchObject({
      averageRating: 5,
      reviewCount: 1,
      source: "native",
      nativeAverage: 5,
      nativeCount: 1,
      googleRating: 4.2,
      googleReviewCount: 18,
      displayRating: 5,
      displayReviewCount: 1,
      displaySource: "native",
    });
  });

  it("can deliberately prefer external ratings without mixing counts", () => {
    expect(
      resolvePublicRatingSummary(
        {
          externalRating: 4.7,
          externalReviewCount: 220,
          nativeRatings: [5],
        },
        "external-first",
      ),
    ).toMatchObject({
      averageRating: 4.7,
      reviewCount: 220,
      source: "external",
      nativeAverageRating: 5,
      nativeReviewCount: 1,
    });
  });

  it("does not display an invalid native average even when a native count is present", () => {
    expect(
      resolvePublicRatingSummary({
        nativeAverageRating: 6,
        nativeReviewCount: 4,
        externalRating: null,
        externalReviewCount: null,
      }),
    ).toMatchObject({
      averageRating: null,
      reviewCount: null,
      source: "none",
      nativeAverageRating: null,
      nativeReviewCount: 4,
    });
  });
});
