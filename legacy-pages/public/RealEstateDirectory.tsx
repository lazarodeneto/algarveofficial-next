"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RealEstateCard } from "@/components/real-estate/RealEstateCard";
import { RealEstateFilters } from "@/components/real-estate/RealEstateFilters";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CuratedExcellence } from "@/components/sections/CuratedExcellence";
import { ConciergeContactDialog } from "@/components/real-estate/ConciergeContactDialog";
import { useTranslation } from "react-i18next";
import { Database } from "@/integrations/supabase/types";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { PageHeroImage } from "@/components/sections/PageHeroImage";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { useCities } from "@/hooks/useReferenceData";
import Link from "next/link";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useLocalePath } from "@/hooks/useLocalePath";
import {
    STANDARD_PUBLIC_HERO_WRAPPER_CLASS,
    STANDARD_PUBLIC_NO_HERO_SPACER_CLASS,
} from "@/components/sections/hero-layout";

type Lang = "en" | "pt-pt" | "fr" | "de" | "es" | "it" | "nl" | "sv" | "no" | "da";

const normalizeLang = (raw?: string | null): Lang => {
    if (!raw) return "en";
    const v = raw.toLowerCase().replace("_", "-").trim();
    if (v === "pt" || v === "pt-pt" || v === "pt_pt") return "pt-pt";
    if (v.startsWith("fr")) return "fr";
    if (v.startsWith("de")) return "de";
    if (v.startsWith("es")) return "es";
    if (v.startsWith("it")) return "it";
    if (v.startsWith("nl")) return "nl";
    if (v.startsWith("sv")) return "sv";
    if (v === "no" || v.startsWith("nb") || v.startsWith("nn")) return "no";
    if (v.startsWith("da")) return "da";
    return "en";
};

type RealEstateListing = Database["public"]["Tables"]["listings"]["Row"] & {
    cities: { name: string; slug: string } | null;
};

export default function RealEstateDirectory() {
    const { t } = useTranslation();
    const { getText, isBlockEnabled, getBlockData } = useCmsPageBuilder("real-estate");
    const l = useLocalePath();
    const { data: cities = [] } = useCities();
    const targetLang = normalizeLang(useCurrentLocale());
    const heroEnabled = isBlockEnabled("hero", true);
    const showCityHubs = cities.length > 0 && isBlockEnabled("city-hubs", true);
    const [filters, setFilters] = useState({
        priceMin: "",
        priceMax: "",
        type: "all",
        beds: "all",
        location: ""
    });
    const imageTimestamp = Date.now();

    const featuredCities = useMemo(
        () => cities.filter((city) => city.is_featured).slice(0, 6),
        [cities],
    );
    const featuredCityHubData = getBlockData("featured-city-hub");
    const highlightedCityId =
        typeof featuredCityHubData.cityId === "string" ? featuredCityHubData.cityId.trim() : "";
    const featuredCity =
        (highlightedCityId ? cities.find((city) => city.id === highlightedCityId) : null) ??
        featuredCities[0] ??
        cities[0] ??
        null;

    const { data: cityListingCounts = {} } = useQuery<Record<string, number>>({
        queryKey: ["real-estate-city-counts"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("listings")
                .select("city_id")
                .eq("category_id", "11df48fe-34e4-4743-8837-e5a1fb399a37")
                .eq("status", "published");

            if (error) throw error;

            const counts: Record<string, number> = {};
            for (const row of data ?? []) {
                if (row.city_id) {
                    counts[row.city_id] = (counts[row.city_id] ?? 0) + 1;
                }
            }
            return counts;
        },
        staleTime: 1000 * 60 * 5,
    });

    const { data: listings, isLoading } = useQuery({
        queryKey: ["real-estate-listings", filters, targetLang],
        queryFn: async () => {
            let query = supabase
                .from("listings")
                .select(`
          *,
          cities ( name, slug )
        `)
                .eq("category_id", "11df48fe-34e4-4743-8837-e5a1fb399a37") // Prime Real Estate
                .eq("status", "published");

            if (filters.priceMin) {
                query = query.gte("price_from", parseFloat(filters.priceMin));
            }
            if (filters.priceMax) {
                query = query.lte("price_from", parseFloat(filters.priceMax));
            }
            // Note: JSONB filtering for type/beds is harder in simple query, might need client side or rpc
            // For now, we fetch all and filter client side for JSONB fields

            const { data, error } = await query;
            if (error) throw error;

            if (!data?.length || targetLang === "en") {
                return data as RealEstateListing[];
            }

            const listingIds = data.map((listing) => listing.id);

            const { data: trRows, error: trError } = await supabase
                .from("listing_translations")
                .select("listing_id, title, short_description")
                .in("listing_id", listingIds)
                .eq("language_code", targetLang);

            if (trError) {
                console.error("Failed to load listing translations for cards", trError);
                return data as RealEstateListing[];
            }

            const trMap = new Map(
                (trRows || []).map((tr) => [
                    tr.listing_id,
                    {
                        title: tr.title?.trim(),
                        short_description: tr.short_description?.trim(),
                    },
                ]),
            );

            return (data as RealEstateListing[]).map((listing) => {
                const tr = trMap.get(listing.id);
                if (!tr) return listing;
                return {
                    ...listing,
                    name: tr.title || listing.name,
                    short_description: tr.short_description || listing.short_description,
                };
            });
        }
    });

    const filteredListings = listings?.filter(listing => {
        const data = listing.category_data as Record<string, any> || {};

        if (filters.type !== "all" && data.property_type !== filters.type) return false;
        if (filters.beds !== "all" && (data.bedrooms || 0) < parseInt(filters.beds)) return false;
        if (filters.location && !listing.cities?.name.toLowerCase().includes(filters.location.toLowerCase())) return false;

        return true;
    });

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleClear = () => {
        setFilters({
            priceMin: "",
            priceMax: "",
            type: "all",
            beds: "all",
            location: ""
        });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col" data-cms-page="real-estate">
            <Header />
            {!heroEnabled && <div className={STANDARD_PUBLIC_NO_HERO_SPACER_CLASS} aria-hidden="true" />}

            <main className="flex-grow">
                {heroEnabled ? (
                    <CmsBlock pageId="real-estate" blockId="hero" as="section" className={STANDARD_PUBLIC_HERO_WRAPPER_CLASS}>
                        <LiveStyleHero
                            className="min-h-[19rem] sm:min-h-[20rem] md:min-h-[22rem] rounded-none shadow-sm"
                            badge={t("realEstate.hero.badge")}
                            title={t("realEstate.hero.title")}
                            subtitle={t(
                                "realEstate.hero.subtitle",
                            )}
                            media={
                                <HeroBackgroundMedia
                                    mediaType={getText("hero.mediaType", "image")}
                                    imageUrl={getText("hero.imageUrl", "")}
                                    videoUrl={getText("hero.videoUrl", "")}
                                    youtubeUrl={getText("hero.youtubeUrl", "")}
                                    posterUrl={getText("hero.posterUrl", "")}
                                    alt={t("realEstate.hero.alt")}
                                    fallback={<PageHeroImage page="real-estate" alt={t("realEstate.hero.alt")} />}
                                />
                            }
                        />
                    </CmsBlock>
                ) : null}

                {showCityHubs ? (
                    <div className="app-container content-max pb-[calc(4rem+10px)] sm:pb-[calc(5rem+10px)]">
                        <section className="mb-[calc(4rem+10px)] sm:mb-[calc(5rem+10px)] space-y-8">
                            {featuredCity && isBlockEnabled("featured-city-hub", true) ? (
                                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                                    <Link
                                        href={l(`/visit/${featuredCity.slug}`)}
                                        className="group block h-full overflow-hidden rounded-[32px] border border-border bg-card shadow-sm"
                                    >
                                        <div className="relative h-full min-h-[20rem]">
                                            <img
                                                src={featuredCity.image_url ? `${featuredCity.image_url}?_t=${imageTimestamp}` : "/placeholder.svg"}
                                                alt={featuredCity.name}
                                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                                            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                                                    {t("realEstate.featuredCityHub")}
                                                </p>
                                                <h2 className="font-serif text-3xl md:text-4xl leading-tight">
                                                    {featuredCity.name}
                                                </h2>
                                                <p className="mt-3 max-w-2xl text-sm text-white/85">
                                                    {featuredCity.short_description ||
                                                        t("realEstate.featuredCityHubDescription", { name: featuredCity.name })}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                            {t("realEstate.cityIndex")}
                                        </p>
                                        <h2 className="mt-3 font-serif text-2xl text-foreground">
                                            {t("realEstate.exploreAlgarveCities")}
                                        </h2>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                            {t("realEstate.cityIndexDescription")}
                                        </p>
                                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {cities
                                                .filter((city) => (cityListingCounts[city.id] ?? 0) > 0)
                                                .sort((a, b) => (cityListingCounts[b.id] ?? 0) - (cityListingCounts[a.id] ?? 0))
                                                .slice(0, 6)
                                                .map((city) => (
                                                <Link
                                                    key={city.id}
                                                    href={l(`/visit/${city.slug}`)}
                                                    className="rounded-2xl border border-border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
                                                >
                                                    <div className="font-medium text-foreground">{city.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {t("realEstate.listingsCount", { count: cityListingCounts[city.id] ?? 0 })}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {isBlockEnabled("all-city-hubs", true) ? (
                            <div>
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="font-serif text-2xl text-foreground">{t("realEstate.allActiveCityHubs")}</h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {t("realEstate.allActiveCityHubsDescription")}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {cities.filter((city) => (cityListingCounts[city.id] ?? 0) > 0).map((city) => (
                                        <Link
                                            key={city.id}
                                            href={l(`/visit/${city.slug}`)}
                                            className="group block"
                                        >
                                            <article className="glass-box overflow-hidden">
                                                <div className="h-36 w-full overflow-hidden">
                                                    <img
                                                        src={city.image_url ? `${city.image_url}?_t=${imageTimestamp}` : "/placeholder.svg"}
                                                        alt={city.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-serif font-medium text-lg text-foreground group-hover:text-primary transition-colors">
                                                        {city.name}
                                                    </h3>
                                                    <div className="mt-1 text-sm text-muted-foreground">
                                                        {t("realEstate.listingsCount", { count: cityListingCounts[city.id] ?? 0 })}
                                                    </div>
                                                </div>
                                            </article>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            ) : null}
                        </section>
                    </div>
                ) : null}

                <div className={`app-container relative z-20 ${heroEnabled || showCityHubs ? "py-14 sm:py-20" : "pb-14 sm:pb-20"}`}>
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
                        {/* Sidebar Filters */}
                        <div className="xl:col-span-4 2xl:col-span-3">
                            <div className="sticky top-24">
                                <RealEstateFilters
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    onSearch={() => { }} // Live filtering for now
                                    onClear={handleClear}
                                />

                                <div className="mt-6 sm:mt-8 p-5 sm:p-8 bg-black text-white rounded-2xl space-y-4">
                                    <h4 className="font-serif text-xl italic">{t("realEstate.searchAssistance.title")}</h4>
                                    <p className="text-sm text-white/70 font-light leading-relaxed">
                                        {t("realEstate.searchAssistance.description")}
                                    </p>
                                    <ConciergeContactDialog>
                                        <Button className="w-full bg-primary hover:bg-primary/90 text-black rounded-full text-[11px] sm:text-xs tracking-[0.18em] uppercase py-4 sm:py-6 whitespace-normal">
                                            {t("realEstate.searchAssistance.cta")}
                                        </Button>
                                    </ConciergeContactDialog>
                                </div>
                            </div>
                        </div>

                        {/* Listings Grid */}
                        <div className="xl:col-span-8 2xl:col-span-9 min-w-0">
                            {/* Signature Selection Area */}
                            <CuratedExcellence
                                context={{ type: 'category', categoryId: '11df48fe-34e4-4743-8837-e5a1fb399a37' }}
                                limit={1}
                                showSectionHeader={false}
                                fullWidth
                            />

                            <div className="mb-8 sm:mb-10 flex flex-col md:flex-row justify-between items-baseline gap-3 sm:gap-4 border-b border-primary/20 pb-5 sm:pb-6">
                                <h2 className="text-2xl sm:text-3xl font-serif italic text-foreground">
                                    {filteredListings?.length || 0} <span className="not-italic font-sans text-sm sm:text-lg text-muted-foreground sm:ml-2 tracking-[0.16em] uppercase">{t("realEstate.propertiesAvailable")}</span>
                                </h2>
                                <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-[0.16em] font-medium">{t("realEstate.sortedByFeatured")}</div>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center py-40">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-2 border-primary/20 rounded-full animate-ping" />
                                        <Loader2 className="w-8 h-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                    </div>
                                </div>
                            ) : filteredListings && filteredListings.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                                    {filteredListings.map((listing) => (
                                        <RealEstateCard key={listing.id} listing={listing} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-32 bg-card/50 backdrop-blur-md rounded-[2.5rem] border border-primary/10 flex flex-col items-center justify-center">
                                    <Building2 className="w-12 h-12 text-primary/30 mb-4" />
                                    <p className="text-2xl font-serif italic text-muted-foreground">No properties match your refined search</p>
                                    <Button variant="link" onClick={handleClear} className="mt-4 text-primary hover:text-primary/80 uppercase tracking-widest text-xs font-semibold">Clear All Filters</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
