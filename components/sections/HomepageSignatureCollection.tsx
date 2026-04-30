"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/Button";
import { SignatureCard } from "@/components/ui/cards/SignatureCard";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { useLocalePath } from "@/hooks/useLocalePath";
import { supabase } from "@/integrations/supabase/client";
import { getHomepageSignatureSelection } from "@/lib/listings/getHomepageSignatureSelection";
import { translateCategoryName } from "@/lib/translateCategory";
import { useTranslation } from "react-i18next";

const DISPLAY_LIMIT = 6;

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
  const displayListings = listings.slice(0, DISPLAY_LIMIT);

  return (
    <section id="signature-collection" className="bg-background py-14 sm:py-20 lg:py-24">
      <div className="app-container content-max">
        <div className="mb-9 flex flex-col gap-5 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Editor&apos;s picks
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-normal text-foreground sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Handpicked places and properties that define the very best of the Algarve.
            </p>
          </div>
          <Link href={l("/directory?tier=signature")} className="hidden text-sm font-semibold text-primary transition-colors hover:text-primary/80 lg:inline-flex">
            View all collection <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {Array.from({ length: DISPLAY_LIMIT }).map((_, index) => (
              <div
                key={index}
                className="min-h-[240px] rounded-2xl bg-muted/35 animate-pulse"
              />
            ))}
          </div>
        ) : displayListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {displayListings.map((listing, index) => (
              <SignatureCard
                key={listing.id}
                title={listing.name}
                subtitle={listing.short_description || listing.description || undefined}
                image={listing.featured_image_url}
                category={`${listing.city?.name ?? "Algarve"} · ${translateCategoryName(t, listing.category?.slug, listing.category?.name)}`}
                tier={listing.tier}
                href={l(`/listing/${listing.slug}`)}
                variant="default"
                isFavorite={isFavorite(listing.id)}
                onToggleFavorite={() => toggleFavorite(listing.id)}
                className={index > 3 ? "hidden sm:block" : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-muted/25 p-8 text-center">
            <p className="text-lg font-medium text-foreground">Curated listings are being prepared.</p>
            <p className="mt-2 text-muted-foreground">Browse the full Algarve directory while the editorial collection is updated.</p>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:hidden">
          <Link href={l("/directory?tier=signature")} className="w-full sm:w-auto">
            <Button size="lg" variant="gold" className="w-full gap-2">
              View full collection
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
