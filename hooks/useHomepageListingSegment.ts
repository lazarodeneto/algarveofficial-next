"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { usePublishedListings, type ListingWithRelations } from "@/hooks/useListings";
import {
  buildHomepageListingPool,
  getLisbonDateSeed,
  splitHomepageListings,
} from "@/lib/listings/homepage-listing-pool";
import { normalizePublicContentLocale } from "@/lib/publicContentLocale";
import {
  homepageListingSplitQueryKey,
  publishedListingsQueryKey,
} from "@/lib/query-keys";

type HomepageListingSegment = "editors" | "premium";

function getSegmentListings(
  segment: HomepageListingSegment,
  listings: readonly ListingWithRelations[],
) {
  const split = splitHomepageListings(buildHomepageListingPool(listings, getLisbonDateSeed()));
  return segment === "editors" ? split.editorsSelection : split.premiumListings;
}

export function useHomepageListingSegment(
  segment: HomepageListingSegment,
  localeOverride?: string | null,
) {
  const currentLocale = useCurrentLocale();
  const locale = normalizePublicContentLocale(localeOverride ?? currentLocale);
  const queryClient = useQueryClient();
  const queryKey = homepageListingSplitQueryKey(segment, locale);

  const { data: hydratedSegment = [], isLoading: isSegmentLoading } = useQuery<ListingWithRelations[]>({
    queryKey,
    queryFn: async () => {
      const publishedListings =
        queryClient.getQueryData<ListingWithRelations[]>(publishedListingsQueryKey({}, locale)) ?? [];
      return getSegmentListings(segment, publishedListings);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const needsFallback = hydratedSegment.length === 0;
  const {
    data: fallbackPublishedListings = [],
    isLoading: isFallbackLoading,
  } = usePublishedListings({}, { enabled: needsFallback });

  const fallbackSegment = useMemo(
    () => (needsFallback ? getSegmentListings(segment, fallbackPublishedListings) : []),
    [fallbackPublishedListings, needsFallback, segment],
  );

  const listings = hydratedSegment.length > 0 ? hydratedSegment : fallbackSegment;

  return {
    data: listings,
    isLoading: isSegmentLoading || (needsFallback && isFallbackLoading && fallbackSegment.length === 0),
    locale,
  };
}
