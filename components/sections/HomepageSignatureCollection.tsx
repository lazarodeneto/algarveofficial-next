"use client";

import Link from "next/link";
import { ArrowRight, Crown, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import ListingImage from "@/components/ListingImage";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import ListingTierBadge from "@/components/ui/ListingTierBadge";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { useLocalePath } from "@/hooks/useLocalePath";
import { supabase } from "@/integrations/supabase/client";
import { getHomepageSignatureSelection } from "@/lib/listings/getHomepageSignatureSelection";
import { translateCategoryName } from "@/lib/translateCategory";
import { useTranslation } from "react-i18next";

const DISPLAY_LIMIT = 8;

export function HomepageSignatureCollection() {
  const l = useLocalePath();
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite } = useFavoriteListings();
  const { data, isLoading } = useQuery({
    queryKey: ["homepage-signature-selection"],
    queryFn: () => getHomepageSignatureSelection(supabase),
    staleTime: 1000 * 60 * 5,
  });

  const listings = data?.listings ?? [];
  const isFallback = data?.isFallback ?? true;
  const title = isFallback ? "Editor's Selection" : "Signature Collection";
  const subtitle = isFallback
    ? "A curated selection of the best places across the Algarve"
    : "24 handpicked premium places in the Algarve";
  const displayListings = listings.slice(0, DISPLAY_LIMIT);

  return (
    <section id="signature-collection" className="bg-background py-16 sm:py-20 lg:py-28">
      <div className="app-container content-max">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Crown className="h-4 w-4" />
            Curated AlgarveOfficial
          </div>
          <h2 className="font-serif text-3xl font-medium tracking-normal text-foreground sm:text-4xl lg:text-5xl">
            Signature Collection in the Algarve
          </h2>
          <p className="mt-4 text-lg font-medium text-foreground">{title}</p>
          <p className="mx-auto mt-3 max-w-2xl text-body text-muted-foreground">
            {subtitle}. Discover hotels, restaurants, experiences and real estate selected for trust, quality and location.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-[25rem] rounded-2xl border border-border/60 bg-muted/35 animate-pulse" />
            ))}
          </div>
        ) : displayListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {displayListings.map((listing, index) => (
              <Link
                key={listing.id}
                href={l(`/listing/${listing.slug}`)}
                className="group relative flex min-h-[25rem] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <ListingImage
                    src={listing.featured_image_url}
                    category={listing.category?.slug}
                    categoryImageUrl={listing.category?.image_url}
                    listingId={listing.id}
                    alt={listing.name}
                    fill
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 24vw"
                    className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3">
                    <ListingTierBadge tier={listing.tier} size="sm" />
                  </div>
                  <div className="absolute right-3 top-3" onClick={(event) => event.preventDefault()}>
                    <FavoriteButton
                      isFavorite={isFavorite(listing.id)}
                      onToggle={() => toggleFavorite(listing.id)}
                      size="sm"
                      variant="glassmorphism"
                    />
                  </div>
                  {listing.google_rating ? (
                    <GoogleRatingBadge
                      rating={listing.google_rating}
                      reviewCount={listing.google_review_count}
                      variant="overlay"
                      size="sm"
                      className="absolute bottom-3 left-3"
                    />
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    {listing.city?.name ?? "Algarve"} · {translateCategoryName(t, listing.category?.slug, listing.category?.name)}
                  </p>
                  <h3 className="mt-3 font-serif text-2xl font-medium leading-tight text-foreground">
                    {listing.name}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {listing.short_description || listing.description || "A selected Algarve destination from the editorial collection."}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-primary">
                    View details <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-muted/25 p-8 text-center">
            <p className="text-lg font-medium text-foreground">Curated listings are being prepared.</p>
            <p className="mt-2 text-muted-foreground">Browse the full Algarve directory while the editorial collection is updated.</p>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={l("/directory?tier=signature")} className="w-full sm:w-auto">
            <Button size="lg" variant="gold" className="w-full gap-2">
              View Full Collection (24)
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={l("/directory")} className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full gap-2">
              <Search className="h-4 w-4" />
              Browse All Listings
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
