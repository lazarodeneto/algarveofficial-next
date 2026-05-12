import { cache } from "react";

import { createPublicServerClient } from "@/lib/supabase/public-server";
import type {
  PublicRatingSummaryDTO,
  PublicReviewsSummaryDTO,
} from "@/lib/public-data/types";

type GoogleRatingSource = {
  google_rating?: number | null;
  google_review_count?: number | null;
};

type PublicRatingResolverInput = GoogleRatingSource & {
  externalRating?: number | null;
  externalReviewCount?: number | null;
  nativeAverageRating?: number | null;
  nativeReviewCount?: number | null;
  nativeRatings?: readonly number[];
};

export type PublicRatingPolicy = "native-first" | "external-first" | "combined";

export const EMPTY_PUBLIC_REVIEWS_SUMMARY: PublicReviewsSummaryDTO = {
  averageRating: null,
  reviewCount: null,
  source: "none",
  externalRating: null,
  externalReviewCount: null,
  nativeAverageRating: null,
  nativeReviewCount: null,
  nativeAverage: null,
  nativeCount: 0,
  googleRating: null,
  googleReviewCount: null,
  displayRating: null,
  displayReviewCount: 0,
  displaySource: "none",
};

function roundRating(value: number): number {
  return Math.round(value * 10) / 10;
}

function normalizeRating(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value <= 0 || value > 5) return null;
  return roundRating(value);
}

function normalizeCount(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.max(0, Math.trunc(value));
}

function resolveNativeSummary(input: PublicRatingResolverInput): {
  nativeAverageRating: number | null;
  nativeReviewCount: number | null;
} {
  if (input.nativeRatings) {
    const validNativeRatings = input.nativeRatings.filter((rating) => normalizeRating(rating) !== null);
    const nativeReviewCount = validNativeRatings.length;
    return {
      nativeAverageRating:
        nativeReviewCount > 0
          ? roundRating(validNativeRatings.reduce((sum, rating) => sum + rating, 0) / nativeReviewCount)
          : null,
      nativeReviewCount,
    };
  }

  const nativeReviewCount = normalizeCount(input.nativeReviewCount);
  const nativeAverageRating = nativeReviewCount && nativeReviewCount > 0
    ? normalizeRating(input.nativeAverageRating)
    : null;

  return {
    nativeAverageRating,
    nativeReviewCount: nativeAverageRating !== null ? nativeReviewCount : nativeReviewCount ?? null,
  };
}

function chooseRatingSummary(
  base: Required<Pick<
    PublicRatingSummaryDTO,
    "externalRating" | "externalReviewCount" | "nativeAverageRating" | "nativeReviewCount"
  >>,
  policy: PublicRatingPolicy,
): Pick<PublicRatingSummaryDTO, "averageRating" | "reviewCount" | "source"> {
  const hasNative = base.nativeAverageRating !== null && (base.nativeReviewCount ?? 0) > 0;
  const hasExternal = base.externalRating !== null;
  const canCombine = hasNative && hasExternal && (base.externalReviewCount ?? 0) > 0;

  if (policy === "combined" && canCombine) {
    const nativeCount = base.nativeReviewCount ?? 0;
    const externalCount = base.externalReviewCount ?? 0;
    const totalCount = nativeCount + externalCount;

    return {
      averageRating: roundRating(
        ((base.nativeAverageRating ?? 0) * nativeCount + (base.externalRating ?? 0) * externalCount) / totalCount,
      ),
      reviewCount: totalCount,
      source: "combined",
    };
  }

  if (policy === "external-first" && hasExternal) {
    return {
      averageRating: base.externalRating,
      reviewCount: base.externalReviewCount,
      source: "external",
    };
  }

  if (hasNative) {
    return {
      averageRating: base.nativeAverageRating,
      reviewCount: base.nativeReviewCount,
      source: "native",
    };
  }

  if (hasExternal) {
    return {
      averageRating: base.externalRating,
      reviewCount: base.externalReviewCount,
      source: "external",
    };
  }

  return {
    averageRating: null,
    reviewCount: null,
    source: "none",
  };
}

export function resolvePublicRatingSummary(
  input: PublicRatingResolverInput,
  policy: PublicRatingPolicy = "native-first",
): PublicRatingSummaryDTO {
  const externalRating = normalizeRating(input.externalRating ?? input.google_rating);
  const externalReviewCount = normalizeCount(input.externalReviewCount ?? input.google_review_count);
  const native = resolveNativeSummary(input);
  const base = {
    externalRating,
    externalReviewCount,
    nativeAverageRating: native.nativeAverageRating,
    nativeReviewCount: native.nativeReviewCount,
  };

  return {
    ...chooseRatingSummary(base, policy),
    ...base,
  };
}

export function buildPublicReviewsSummary(
  google: GoogleRatingSource,
  nativeRatings: readonly number[] = [],
  policy: PublicRatingPolicy = "native-first",
): PublicReviewsSummaryDTO {
  const summary = resolvePublicRatingSummary(
    {
      ...google,
      nativeRatings,
    },
    policy,
  );

  return {
    ...summary,
    nativeAverage: summary.nativeAverageRating ?? null,
    nativeCount: summary.nativeReviewCount ?? 0,
    googleRating: summary.externalRating ?? null,
    googleReviewCount: summary.externalReviewCount ?? null,
    displayRating: summary.averageRating,
    displayReviewCount: summary.reviewCount ?? 0,
    displaySource: summary.source,
  };
}

export const getPublicReviewsSummary = cache(
  async (listingIds: readonly string[]): Promise<Record<string, PublicReviewsSummaryDTO>> => {
    const uniqueListingIds = Array.from(new Set(listingIds.filter(Boolean)));
    if (uniqueListingIds.length === 0) return {};

    const supabase = createPublicServerClient();
    const [{ data: listings }, { data: reviews }] = await Promise.all([
      supabase
        .from("listings")
        .select("id, google_rating, google_review_count")
        .in("id", uniqueListingIds)
        .eq("status", "published"),
      supabase
        .from("listing_reviews")
        .select("listing_id, rating")
        .in("listing_id", uniqueListingIds)
        .eq("status", "approved"),
    ]);

    const nativeRatingsByListing = new Map<string, number[]>();
    (reviews ?? []).forEach((review) => {
      const listingId = review.listing_id;
      if (!listingId) return;
      const bucket = nativeRatingsByListing.get(listingId) ?? [];
      bucket.push(Number(review.rating));
      nativeRatingsByListing.set(listingId, bucket);
    });

    return Object.fromEntries(
      (listings ?? []).map((listing) => [
        listing.id,
        buildPublicReviewsSummary(listing, nativeRatingsByListing.get(listing.id) ?? []),
      ]),
    );
  },
);
