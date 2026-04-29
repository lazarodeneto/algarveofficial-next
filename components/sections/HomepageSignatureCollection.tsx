"use client";

import Link from "next/link";
import { ArrowRight, Crown, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/Button";
import { SignatureCard } from "@/components/ui/cards/SignatureCard";
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
  const subtitle = "A curated selection of the Algarve's finest places";
  const displayListings = listings.slice(0, DISPLAY_LIMIT);
  const hero = displayListings[0];
  const rest = displayListings.slice(1);

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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[220px] lg:gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className={`min-h-[240px] rounded-2xl bg-muted/35 animate-pulse ${index === 0 ? "lg:col-span-2 lg:row-span-2" : index === 6 ? "lg:col-span-2" : ""}`}
              />
            ))}
          </div>
        ) : hero ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[220px] lg:gap-8">
            <SignatureCard
              title={hero.name}
              subtitle={hero.short_description || hero.description || "A selected Algarve destination from the editorial collection."}
              image={hero.featured_image_url}
              category={`${hero.city?.name ?? "Algarve"} · ${translateCategoryName(t, hero.category?.slug, hero.category?.name)}`}
              tier={hero.tier}
              href={l(`/listing/${hero.slug}`)}
              variant="hero"
              isFavorite={isFavorite(hero.id)}
              onToggleFavorite={() => toggleFavorite(hero.id)}
            />

            {(() => {
              // After hero's 2x2 area, 4 items fill the side (cols 3-4, rows 1-2).
              // Remaining items flow into full-width rows below.
              const itemsAfterSide = Math.max(0, rest.length - 4);
              const itemsInLastRow = itemsAfterSide > 0 ? itemsAfterSide % 4 : 0;
              const lastIndex = rest.length - 1;
              const secondLastIndex = rest.length - 2;

              return rest.map((listing, index) => {
                const isLast = index === lastIndex;
                const isSecondLast = index === secondLastIndex;

                // Gap-fill logic: make last card(s) wider to fill empty grid slots
                let spanClass = "";
                if (itemsInLastRow === 3 && isLast) {
                  spanClass = "lg:col-span-2"; // 3 items → last spans 2, fills 1-slot gap
                } else if (itemsInLastRow === 2 && (isLast || isSecondLast)) {
                  spanClass = "lg:col-span-2"; // 2 items → both span 2, fills 2-slot gap
                } else if (itemsInLastRow === 1 && isLast) {
                  spanClass = "lg:col-span-4"; // 1 item → full width, fills 3-slot gap
                }

                return (
                  <SignatureCard
                    key={listing.id}
                    title={listing.name}
                    subtitle={listing.short_description || listing.description || undefined}
                    image={listing.featured_image_url}
                    category={`${listing.city?.name ?? "Algarve"} · ${translateCategoryName(t, listing.category?.slug, listing.category?.name)}`}
                    tier={listing.tier}
                    href={l(`/listing/${listing.slug}`)}
                    variant={spanClass ? "hero" : "default"}
                    isFavorite={isFavorite(listing.id)}
                    onToggleFavorite={() => toggleFavorite(listing.id)}
                    className={spanClass || undefined}
                  />
                );
              });
            })()}
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
