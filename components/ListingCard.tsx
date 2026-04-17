"use client";

import type { SharedListingCardData } from "@/components/listing/SharedListingCard";
import { SharedListingCard } from "@/components/listing/SharedListingCard";

export interface ListingCardProps {
  listing: SharedListingCardData;
  href: string;
  index?: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onCardClick?: () => void;
}

export function ListingCard({
  listing,
  href,
  index = 0,
  isFavorite = false,
  onToggleFavorite,
  onCardClick,
}: ListingCardProps) {
  return (
    <SharedListingCard
      listing={listing}
      href={href}
      index={index}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      onCardClick={onCardClick}
    />
  );
}
