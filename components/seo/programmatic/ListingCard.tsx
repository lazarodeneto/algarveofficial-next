"use client";

import type { ProgrammaticListing } from "@/lib/seo/programmatic/category-city-data";
import { SharedListingCard } from "@/components/listing/SharedListingCard";
import { useLocalePath } from "@/hooks/useLocalePath";
import { buildListingHref } from "@/lib/public-route-builders";

interface ListingCardProps {
  listing: ProgrammaticListing;
  tx: Record<string, string>;
  href?: string;
}

export function ListingCard({ listing, tx, href }: ListingCardProps) {
  const l = useLocalePath();
  const curatedLabel = tx["common.curated"];
  const listingHref = href ?? l(buildListingHref({ slug: listing.slug, id: listing.id }));

  return (
    <SharedListingCard
      listing={listing}
      href={listingHref}
      showCuratedBadge
      curatedLabel={curatedLabel}
    />
  );
}
