"use client";

import Link from "next/link";
import { ArrowRight, Crown, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import ListingImage from "@/components/ListingImage";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/ui/favorite-button";
import ListingTierBadge from "@/components/ui/ListingTierBadge";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { useLocalePath } from "@/hooks/useLocalePath";
import { supabase } from "@/integrations/supabase/client";
import { getHomepageSignatureSelection } from "@/lib/listings/getHomepageSignatureSelection";
import { translateCategoryName } from "@/lib/translateCategory";
import { useTranslation } from "react-i18next";

const DISPLAY_LIMIT = 8;

function EditorialListingCard({
  listing,
  href,
  isFavorite,
  onToggleFavorite,
  size,
}: {
  listing: Awaited<ReturnType<typeof getHomepageSignatureSelection>>["listings"][number];
  href: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  size: "featured" | "medium" | "small";
}) {
  const { t } = useTranslation();
  const sizeClasses = {
    featured: "min-h-[32rem] lg:col-span-2 lg:row-span-2",
    medium: "min-h-[23rem]",
    small: "min-h-[18rem]",
  }[size];
  const titleClasses = size === "featured" ? "text-4xl sm:text-5xl" : size === "medium" ? "text-3xl" : "text-2xl";

  return (
    <Link
      href={href}
      className={`${sizeClasses} group relative isolate overflow-hidden rounded-2xl bg-black shadow-[0_28px_90px_-48px_rgba(0,0,0,0.95)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_34px_100px_-48px_rgba(0,0,0,1)]`}
    >
      <ListingImage
        src={listing.featured_image_url}
        category={listing.category?.slug}
        categoryImageUrl={listing.category?.image_url}
        listingId={listing.id}
        alt={listing.name}
        fill
        sizes={size === "featured" ? "(max-width: 1024px) 92vw, 46vw" : "(max-width: 1024px) 92vw, 23vw"}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" />
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <ListingTierBadge tier={listing.tier} size="sm" />
      </div>
      <div className="absolute right-4 top-4" onClick={(event) => event.preventDefault()}>
        <FavoriteButton
          isFavorite={isFavorite}
          onToggle={onToggleFavorite}
          size="sm"
          variant="glassmorphism"
        />
      </div>
      <div className="relative z-10 flex h-full flex-col justify-end p-5 text-white sm:p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {listing.city?.name ?? "Algarve"} · {translateCategoryName(t, listing.category?.slug, listing.category?.name)}
        </p>
        <h3 className={`max-w-xl font-serif font-semibold leading-none tracking-normal ${titleClasses}`}>
          {listing.name}
        </h3>
        {size !== "small" ? (
          <p className="mt-4 max-w-lg line-clamp-2 text-sm leading-6 text-white/82">
            {listing.short_description || listing.description || "A selected Algarve destination from the editorial collection."}
          </p>
        ) : null}
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/90">
          View details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

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
  const subtitle = "A curated selection of the Algarve’s finest places";
  const displayListings = listings.slice(0, DISPLAY_LIMIT);
  const featuredListing = displayListings[0];
  const mediumListings = displayListings.slice(1, 5);
  const smallListings = displayListings.slice(5, 7);

  return (
    <section id="signature-collection" className="bg-background py-20 sm:py-24 lg:py-32">
      <div className="app-container content-max">
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Crown className="h-4 w-4" />
            Curated AlgarveOfficial
          </div>
          <h2 className="font-serif text-3xl font-medium tracking-normal text-foreground sm:text-4xl lg:text-5xl">
            Signature Collection in the Algarve
          </h2>
          <p className="mt-5 font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl">{title}</p>
          <p className="mx-auto mt-3 max-w-2xl text-body text-muted-foreground">
            {subtitle}. Hotels, restaurants, experiences and property selected for trust, quality and location.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-[25rem] rounded-2xl border border-border/60 bg-muted/35 animate-pulse" />
            ))}
          </div>
        ) : featuredListing ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-4 lg:auto-rows-fr">
            <EditorialListingCard
              listing={featuredListing}
              href={l(`/listing/${featuredListing.slug}`)}
              isFavorite={isFavorite(featuredListing.id)}
              onToggleFavorite={() => toggleFavorite(featuredListing.id)}
              size="featured"
            />
            {mediumListings.map((listing) => (
              <EditorialListingCard
                key={listing.id}
                listing={listing}
                href={l(`/listing/${listing.slug}`)}
                isFavorite={isFavorite(listing.id)}
                onToggleFavorite={() => toggleFavorite(listing.id)}
                size="medium"
              />
            ))}
            {smallListings.map((listing) => (
              <EditorialListingCard
                key={listing.id}
                listing={listing}
                href={l(`/listing/${listing.slug}`)}
                isFavorite={isFavorite(listing.id)}
                onToggleFavorite={() => toggleFavorite(listing.id)}
                size="small"
              />
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
