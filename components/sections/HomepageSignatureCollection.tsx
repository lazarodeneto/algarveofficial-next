"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/Button";
import { SignatureCard } from "@/components/ui/cards/SignatureCard";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { useLocalePath } from "@/hooks/useLocalePath";
import type { ListingWithRelations } from "@/hooks/useListings";
import { homepageListingSplitQueryKey } from "@/lib/query-keys";
import { translateCategoryName } from "@/lib/translateCategory";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { cmsText, isSafeHomeCtaHref, type HomeSectionCopy } from "@/lib/cms/home-section-copy";

const DISPLAY_LIMIT = 8;
type Lang = "en" | "pt-pt" | "fr" | "de" | "es" | "it" | "nl" | "sv" | "no" | "da";

const normalizeLang = (raw?: string | null): Lang => {
  if (!raw) return "en";
  const value = raw.toLowerCase().replace("_", "-").trim();
  if (value === "pt" || value === "pt-pt") return "pt-pt";
  if (value.startsWith("fr")) return "fr";
  if (value.startsWith("de")) return "de";
  if (value.startsWith("es")) return "es";
  if (value.startsWith("it")) return "it";
  if (value.startsWith("nl")) return "nl";
  if (value.startsWith("sv")) return "sv";
  if (value === "no" || value.startsWith("nb") || value.startsWith("nn")) return "no";
  if (value.startsWith("da")) return "da";
  return "en";
};

export function HomepageSignatureCollection({ copy }: { copy?: HomeSectionCopy } = {}) {
  const l = useLocalePath();
  const { t } = useTranslation();
  const targetLang = normalizeLang(useCurrentLocale());
  const { isFavorite, toggleFavorite } = useFavoriteListings();
  const { data: listings = [], isLoading } = useQuery<ListingWithRelations[]>({
    queryKey: homepageListingSplitQueryKey("editors", targetLang),
    queryFn: async () => [],
    staleTime: Number.POSITIVE_INFINITY,
  });

  const title = t("sections.homepage.editorsSelection.title");
  const ctaHref = isSafeHomeCtaHref(copy?.ctaHref) && copy?.ctaHref?.trim()
    ? copy.ctaHref.trim()
    : "/directory?tier=signature";
  const displayListings = listings.slice(0, DISPLAY_LIMIT);

  return (
    <section id="signature-collection" className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="app-container content-max">
        <div className="mb-9 flex flex-col gap-5 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {cmsText(copy?.eyebrow, t("sections.homepage.editorsSelection.badge"))}
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-normal text-foreground sm:text-4xl">
              {cmsText(copy?.title, title)}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              {cmsText(copy?.subtitle ?? copy?.description, t("sections.homepage.editorsSelection.subtitle"))}
            </p>
          </div>
          <Link href={l(ctaHref)} className="hidden text-sm font-semibold text-primary transition-colors hover:text-primary/80 lg:inline-flex">
            {cmsText(copy?.ctaLabel, t("sections.homepage.editorsSelection.cta"))} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-3 lg:gap-6">
            {Array.from({ length: DISPLAY_LIMIT }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "min-h-[200px] rounded-md bg-muted/35 animate-pulse",
                  index === 0 && "lg:col-span-2 lg:row-span-2",
                  index === 7 && "lg:col-span-2"
                )}
              />
            ))}
          </div>
        ) : displayListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-3 lg:gap-6">
            {displayListings.map((listing, index) => (
              <SignatureCard
                key={listing.id}
                title={listing.name}
                subtitle={listing.short_description || listing.description || undefined}
                image={listing.featured_image_url}
                category={`${listing.city?.name ?? t("sections.homepage.common.algarve")} · ${translateCategoryName(t, listing.category?.slug, listing.category?.name)}`}
                tier={listing.tier}
                href={l(`/listing/${listing.slug}`)}
                variant={index === 0 ? "featured" : "standard"}
                isFavorite={isFavorite(listing.id)}
                onToggleFavorite={() => toggleFavorite(listing.id)}
                googleRating={listing.google_rating}
                googleReviewCount={listing.google_review_count}
                className={cn(
                  index === 0 && "lg:col-span-2 lg:row-span-2",
                  index === 7 && "lg:col-span-2",
                  index > 5 ? "hidden sm:block lg:block" : undefined
                )}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-sm border border-border/70 bg-muted/25 p-8 text-center">
            <p className="text-lg font-medium text-foreground">{t("sections.homepage.editorsSelection.emptyTitle")}</p>
            <p className="mt-2 text-muted-foreground">{t("sections.homepage.editorsSelection.emptySubtitle")}</p>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:hidden">
          <Link href={l(ctaHref)} className="w-full sm:w-auto">
            <Button size="lg" variant="gold" className="w-full gap-2">
              {cmsText(copy?.ctaLabel, t("sections.homepage.editorsSelection.ctaMobile"))}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
