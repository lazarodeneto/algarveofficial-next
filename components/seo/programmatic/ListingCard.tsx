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
import { m } from "framer-motion";
import type { ProgrammaticListing } from "@/lib/seo/programmatic/category-city-data";
import { useTranslation } from "react-i18next";

interface ListingCardProps {
  listing: ProgrammaticListing;
  tx: Record<string, string>;
}

export function ListingCard({ listing, tx }: ListingCardProps) {
  const { t } = useTranslation();
  const curatedLabel = tx["common.curated"];

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0 }}
      className="h-full"
    >
      <Link href={`/listing/${listing.slug}`} className="group block h-full">
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
              category={listing.category_slug}
              categoryImageUrl={null}
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
            >
              <Badge
                variant="secondary"
                className="text-xs bg-black/60 backdrop-blur-sm text-white flex items-center gap-1"
              >
                {renderCategoryIcon(listing.category_slug, "h-3 w-3")}
                {translateCategoryName(t, listing.category_slug, listing.category_name)}
              </Badge>

              {listing.is_curated && (
                <span className="rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  {curatedLabel}
                </span>
              )}
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <h3 className="font-serif font-medium text-base lg:text-[1.32rem] mb-1 group-hover:text-primary transition-colors line-clamp-1">
              {listing.name}
            </h3>

            <p className="text-body-sm text-muted-foreground line-clamp-2 mb-3">
              {listing.short_description}
            </p>

            <div className="mt-auto flex items-center gap-2 text-body-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{listing.city_name}</span>
            </div>
          </div>
        </article>
      </Link>
    </m.div>
  );
}
