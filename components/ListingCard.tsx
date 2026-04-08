"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ListingImage from "@/components/ListingImage";
import ListingTierBadge from "@/components/ui/ListingTierBadge";
import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { renderCategoryIcon } from "@/lib/categoryIcons";
import { translateCategoryName } from "@/lib/translateCategory";
import { LazyMotion, domAnimation, m } from "framer-motion";
import type { ListingWithRelations } from "@/hooks/useListings";
import { useTranslation } from "react-i18next";

export interface ListingCardProps {
  listing: ListingWithRelations;
  href: string;
  index?: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function ListingCard({
  listing,
  href,
  index = 0,
  isFavorite = false,
  onToggleFavorite,
}: ListingCardProps) {
  const { t } = useTranslation();

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5) }}
      className="h-full"
    >
      <Link href={href} className="group block h-full">
        <article className="relative z-0 isolate glass-box glass-box-listing-shimmer overflow-hidden flex flex-col h-full">
          {listing.tier === "signature" ? (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] border-[2px] border-[hsl(43,86%,58%)] shadow-[0_0_10px_hsla(43,86%,58%,0.34)]"
            />
          ) : null}

          <div className="relative z-0 aspect-square bg-muted overflow-hidden">
            <ListingImage
              src={listing.featured_image_url}
              category={listing.category?.slug}
              categoryImageUrl={listing.category?.image_url}
              listingId={listing.id}
              alt={listing.name}
              isRepresentative={!listing.featured_image_url}
              fill={true}
              className="transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <ListingTierBadge tier={listing.tier} />
            </div>

            {listing.google_rating ? (
              <GoogleRatingBadge
                rating={listing.google_rating}
                reviewCount={listing.google_review_count}
                variant="overlay"
                size="sm"
                className="absolute top-3 right-3"
              />
            ) : null}

            <div
              className="absolute bottom-3 left-3 right-3 flex items-center justify-between"
              onClick={(event) => event.preventDefault()}
            >
              <Badge
                variant="secondary"
                className="text-xs bg-black/60 backdrop-blur-sm text-white flex items-center gap-1"
              >
                {renderCategoryIcon(listing.category?.icon ?? undefined, "h-3 w-3")}
                {translateCategoryName(t, listing.category?.slug, listing.category?.name)}
              </Badge>

              {onToggleFavorite ? (
                <FavoriteButton
                  isFavorite={isFavorite}
                  onToggle={onToggleFavorite}
                  size="sm"
                  variant="glassmorphism"
                />
              ) : null}
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <h3 className="font-serif font-medium text-base lg:text-[1.32rem] mb-1 group-hover:text-primary transition-colors line-clamp-1">
              {listing.name}
            </h3>

            <p className="text-body-sm text-muted-foreground line-clamp-2 mb-3">
              {listing.short_description || listing.description}
            </p>

            <div className="mt-auto flex items-center gap-2 text-body-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{listing.city?.name}</span>
              {listing.region ? (
                <>
                  <span>•</span>
                  <span>{listing.region.name}</span>
                </>
              ) : null}
            </div>
          </div>
        </article>
      </Link>
    </m.div>
  );
}
