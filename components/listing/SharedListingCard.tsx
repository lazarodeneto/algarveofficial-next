"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

import ListingImage from "@/components/ListingImage";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import ListingTierBadge from "@/components/ui/ListingTierBadge";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { getEnglishBeachDisplayName } from "@/lib/beachDisplayName";
import { renderCategoryIcon } from "@/lib/categoryIcons";
import { translateCategoryName } from "@/lib/translateCategory";
import { cn } from "@/lib/utils";

interface SharedListingCardCategory {
  slug?: string | null;
  name?: string | null;
  icon?: string | null;
  image_url?: string | null;
}

interface SharedListingCardPlace {
  name?: string | null;
}

export interface SharedListingCardData {
  id: string;
  name: string;
  short_description?: string | null;
  description?: string | null;
  featured_image_url?: string | null;
  updated_at?: string | null;
  tier?: string | null;
  google_rating?: number | null;
  google_review_count?: number | null;
  is_curated?: boolean | null;
  category?: SharedListingCardCategory | null;
  city?: SharedListingCardPlace | null;
  region?: SharedListingCardPlace | null;
  category_slug?: string | null;
  category_name?: string | null;
  city_name?: string | null;
  region_name?: string | null;
}

export interface SharedListingCardProps {
  listing: SharedListingCardData;
  href: string;
  index?: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onCardClick?: () => void;
  showCuratedBadge?: boolean;
  curatedLabel?: string;
  className?: string;
}

export function SharedListingCard({
  listing,
  href,
  isFavorite = false,
  onToggleFavorite,
  onCardClick,
  showCuratedBadge = false,
  curatedLabel,
  className,
}: SharedListingCardProps) {
  const { t } = useTranslation();
  const locale = useCurrentLocale();

  const categorySlug = listing.category?.slug ?? listing.category_slug ?? undefined;
  const categoryName = listing.category?.name ?? listing.category_name ?? undefined;
  const categoryIcon = listing.category?.icon ?? undefined;
  const categoryImageUrl = listing.category?.image_url ?? undefined;
  const cityName = listing.city?.name || listing.city_name || "Algarve";
  const regionName = listing.region?.name ?? listing.region_name ?? undefined;
  const description = listing.short_description || listing.description;
  const displayListingName = getEnglishBeachDisplayName(listing.name, locale, categorySlug);
  const shouldShowCuratedBadge = Boolean(showCuratedBadge && listing.is_curated && curatedLabel);
  const isSignature = listing.tier === "signature";
  const isVerified = listing.tier === "verified";

  return (
    <div className={cn("h-full", className)}>
        <article className="group relative z-0 isolate glass-box glass-box-listing-shimmer overflow-hidden flex flex-col h-full [backface-visibility:hidden]">
          <Link
            href={href}
            className="absolute inset-0 z-20 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={onCardClick}
            aria-label={displayListingName}
          >
            <span className="sr-only">{displayListingName}</span>
          </Link>
          {isSignature ? (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] border-[2px] border-[hsl(43,86%,58%)] shadow-[0_0_10px_hsla(43,86%,58%,0.34)]"
            />
          ) : null}

          {isVerified ? (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] border-[2px] border-emerald-500/80"
            />
          ) : null}

          <div className="relative z-0 aspect-square overflow-hidden rounded-t-[inherit] bg-muted">
            <ListingImage
              src={listing.featured_image_url}
              category={categorySlug}
              categoryImageUrl={categoryImageUrl}
              listingId={listing.id}
              imageVersion={listing.updated_at}
              alt={displayListingName}
              isRepresentative={!listing.featured_image_url}
              fill
              className="transition-transform duration-500 ease-out group-hover:scale-110"
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

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <Badge
                variant="secondary"
                className="text-xs bg-black/60 backdrop-blur-sm text-white flex items-center gap-1"
              >
                {renderCategoryIcon(categoryIcon, "h-3 w-3")}
                {translateCategoryName(t, categorySlug, categoryName)}
              </Badge>

              {onToggleFavorite ? (
                <div className="relative z-30">
                <FavoriteButton
                  isFavorite={isFavorite}
                  onToggle={onToggleFavorite}
                  size="sm"
                  variant="glassmorphism"
                />
                </div>
              ) : shouldShowCuratedBadge ? (
                <span className="rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  {curatedLabel}
                </span>
              ) : null}
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <h3 className="mb-1 font-serif text-[1.08rem] font-medium transition-colors line-clamp-1 group-hover:text-primary lg:text-[1.43rem]">
              {displayListingName}
            </h3>

            <p className="text-body-sm text-muted-foreground line-clamp-2 mb-3">
              {description}
            </p>

            <div className="mt-auto flex items-center gap-2 text-body-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{cityName}</span>
              {regionName ? (
                <>
                  <span>•</span>
                  <span>{regionName}</span>
                </>
              ) : null}
            </div>
          </div>
        </article>
    </div>
  );
}
