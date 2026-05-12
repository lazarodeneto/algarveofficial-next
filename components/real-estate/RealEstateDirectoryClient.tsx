"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowRight, Building2, Loader2, Plus } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { PageHeroImage } from "@/components/sections/PageHeroImage";
import { STANDARD_PUBLIC_HERO_WRAPPER_CLASS } from "@/components/sections/hero-layout";
import { RealEstateCard } from "@/components/real-estate/RealEstateCard";
import { RealEstateFilters } from "@/components/real-estate/RealEstateFilters";
import { ConciergeContactDialog } from "@/components/real-estate/ConciergeContactDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useHydrated } from "@/hooks/useHydrated";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { hideServerShell } from "@/lib/dom/server-shell";
import type { Tables } from "@/integrations/supabase/types";

interface FilterState {
  priceMin: string;
  priceMax: string;
  type: string;
  beds: string;
  location: string;
}

const REAL_ESTATE_TIER_PRIORITY: Record<string, number> = {
  signature: 0,
  verified: 1,
  free: 2,
};

export type RealEstateCategory = Pick<Tables<"categories">, "id" | "name" | "slug">;

export type RealEstateListing = Pick<
  Tables<"listings">,
  | "id"
  | "slug"
  | "name"
  | "short_description"
  | "featured_image_url"
  | "updated_at"
  | "price_from"
  | "price_to"
  | "price_currency"
  | "tier"
  | "category_data"
> & {
  cities: { id: string; name: string; slug: string } | null;
};

export interface RealEstateDirectoryClientProps {
  initialCategory: RealEstateCategory;
  initialListings: RealEstateListing[];
}

function RealEstateDirectoryClientInner({
  initialCategory,
  initialListings,
}: RealEstateDirectoryClientProps) {
  const { t } = useTranslation();
  const cms = useCmsPageBuilder("real-estate");
  const { user } = useAuth();
  const l = useLocalePath();

  const [filters, setFilters] = useState<FilterState>({
    priceMin: "",
    priceMax: "",
    type: "all",
    beds: "all",
    location: "",
  });

  const realEstateCategory = initialCategory;
  const realEstateCategoryId = realEstateCategory?.id;
  const listings = initialListings;
  const error: Error | null = null;

  const filteredListings = useMemo(() => {
    return listings
      .filter((listing) => {
        const categoryData = (listing.category_data as Record<string, unknown> | null) ?? {};
        const propertyType = String(categoryData.property_type ?? "").toLowerCase();
        const bedrooms = Number(categoryData.bedrooms ?? 0);
        const location = listing.cities?.name?.toLowerCase() ?? "";

        const minPrice = Number.parseFloat(filters.priceMin);
        const maxPrice = Number.parseFloat(filters.priceMax);
        const lowPrice = listing.price_from ?? listing.price_to ?? null;
        const highPrice = listing.price_to ?? listing.price_from ?? null;

        if (filters.priceMin && Number.isFinite(minPrice) && (highPrice === null || highPrice < minPrice)) return false;
        if (filters.priceMax && Number.isFinite(maxPrice) && (lowPrice === null || lowPrice > maxPrice)) return false;
        if (filters.type !== "all" && propertyType !== filters.type.toLowerCase()) return false;

        if (filters.beds !== "all") {
          const minBeds = Number(filters.beds);
          if (Number.isFinite(minBeds) && bedrooms < minBeds) return false;
        }

        if (filters.location && !location.includes(filters.location.toLowerCase())) return false;

        return true;
      })
      .sort((a, b) => {
        const tierPriorityDiff =
          (REAL_ESTATE_TIER_PRIORITY[a.tier ?? "free"] ?? 99) -
          (REAL_ESTATE_TIER_PRIORITY[b.tier ?? "free"] ?? 99);

        if (tierPriorityDiff !== 0) {
          return tierPriorityDiff;
        }

        return a.name.localeCompare(b.name);
      });
  }, [filters, listings]);

  const isLoading = false;

  const addListingHref = useMemo(() => {
    if (user?.role === "admin" || user?.role === "editor") return l("/admin/listings/new");
    if (user?.role === "owner") return l("/owner/support");
    return l("/partner");
  }, [l, user?.role]);

  const addListingNote = useMemo(() => {
    if (user?.role === "admin" || user?.role === "editor") {
      return t("realEstate.addListingNoteAdmin");
    }
    if (user?.role === "owner") {
      return t(
        "realEstate.addListingNoteOwner",
      );
    }
    return t(
      "realEstate.addListingNoteGuest",
    );
  }, [t, user?.role]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      priceMin: "",
      priceMax: "",
      type: "all",
      beds: "all",
      location: "",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main id="main-content" className="flex-grow">
        <section className={STANDARD_PUBLIC_HERO_WRAPPER_CLASS}>
          <LiveStyleHero
            badge={cms.getText("hero.badge", t("realEstate.hero.badge"))}
            title={cms.getText("hero.title", t("realEstate.hero.title"))}
            subtitle={cms.getText(
              "hero.subtitle",
              t("realEstate.hero.subtitle"),
            )}
            media={
              <HeroBackgroundMedia
                mediaType={cms.getText("hero.mediaType", "image")}
                imageUrl={cms.getText("hero.imageUrl", "")}
                videoUrl={cms.getText("hero.videoUrl", "")}
                youtubeUrl={cms.getText("hero.youtubeUrl", "")}
                posterUrl={cms.getText("hero.posterUrl", "")}
                alt={cms.getText("hero.alt", t("realEstate.hero.alt"))}
                fallback={
                  <PageHeroImage
                    page="real-estate"
                    alt={t("realEstate.hero.alt")}
                  />
                }
              />
            }
            ctas={
              <>
                <Link href={addListingHref}>
                  <Button variant="gold" size="lg" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    {t("realEstate.addListing")}
                  </Button>
                </Link>
                <Link href={l("/invest")}>
                  <Button variant="heroOutline" size="lg" className="w-full sm:w-auto">
                    {t("realEstate.backToInvest")}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </>
            }
          >
            <p className="text-xs uppercase tracking-[0.12em] text-white/75">{addListingNote}</p>
          </LiveStyleHero>
        </section>

        <section className="app-container pb-16 md:pb-20">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
            <aside className="xl:col-span-4 2xl:col-span-3">
              <div className="sticky top-24 space-y-6">
                <RealEstateFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onSearch={() => undefined}
                  onClear={clearFilters}
                />

                <div className="rounded-sm border border-border bg-card p-6 space-y-4">
                  <h3 className="font-serif text-xl">
                    {t("realEstate.conciergeTitle")}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(
                      "realEstate.conciergeDescription",
                    )}
                  </p>
                  <ConciergeContactDialog>
                    <Button className="w-full">
                      {t("realEstate.conciergeButton")}
                    </Button>
                  </ConciergeContactDialog>
                </div>
              </div>
            </aside>

            <div className="xl:col-span-8 2xl:col-span-9 min-w-0">
              <div className="mb-7 sm:mb-8 flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-2xl md:text-3xl font-serif">
                  {filteredListings.length} {t("realEstate.propertiesAvailable")}
                </h2>
                <Badge variant="outline" className="uppercase tracking-[0.12em] text-[10px]">
                  {t("realEstate.categoryOnly")}
                </Badge>
              </div>

              {isLoading ? (
                <div className="py-20 flex items-center justify-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  {t("common.loading")}
                </div>
              ) : !realEstateCategoryId ? (
                <div className="rounded-sm border border-destructive/30 bg-destructive/5 p-8 text-center">
                  <Building2 className="h-8 w-8 mx-auto mb-3 text-destructive" />
                  <p className="font-medium">
                    {t("realEstate.categoryMissing")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t(
                      "realEstate.categoryMissingHelp",
                    )}
                  </p>
                </div>
              ) : error ? (
                <div className="rounded-sm border border-destructive/30 bg-destructive/5 p-8 text-center">
                  <p className="font-medium">
                    {t("realEstate.loadError")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">{(error as Error).message}</p>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="rounded-sm border border-border bg-card p-10 text-center">
                  <Building2 className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium">
                    {t("realEstate.emptyState")}
                  </p>
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    {t("realEstate.clearFilters")}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {filteredListings.map((listing) => (
                    <RealEstateCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export function RealEstateDirectoryClient(props: RealEstateDirectoryClientProps) {
  const mounted = useHydrated();

  useEffect(() => {
    return hideServerShell("real-estate-server-shell");
  }, []);

  if (!mounted) {
    return null;
  }

  return <RealEstateDirectoryClientInner {...props} />;
}

export default RealEstateDirectoryClient;
