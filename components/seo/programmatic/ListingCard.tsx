"use client";

import type { ProgrammaticListing } from "@/lib/seo/programmatic/category-city-data";
import { SharedListingCard } from "@/components/listing/SharedListingCard";

interface ListingCardProps {
  listing: ProgrammaticListing;
  tx: Record<string, string>;
  href?: string;
}

export function ListingCard({ listing, tx, href }: ListingCardProps) {
  const curatedLabel = tx["common.curated"];

  return (
    <SharedListingCard
      listing={listing}
      href={href ?? `/listing/${listing.slug}`}
      showCuratedBadge
      curatedLabel={curatedLabel}
    />
  );
}
