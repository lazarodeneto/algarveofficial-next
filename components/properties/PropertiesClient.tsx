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
import { SeoHead } from "@/components/seo/SeoHead";
import { Database } from "@/integrations/supabase/types";

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

interface FilterState {
    priceMin: string;
    priceMax: string;
    type: string;
    beds: string;
    location: string;
}

export default function PropertiesClient() {
    const { t, i18n } = useTranslation();
    const targetLang = normalizeLang(i18n.language);
    const [filters, setFilters] = useState<FilterState>({
        priceMin: "",
        priceMax: "",
        type: "all",
        beds: "all",
        location: ""
    });

    const { data: listings, isLoading } = useQuery({
        queryKey: ["properties-listings", filters, targetLang],
        queryFn: async () => {
            let query = supabase
                .from("listings")
                .select(`*, cities ( name, slug )`)
                .eq("category_id", "11df48fe-34e4-4743-8837-e5a1fb399a37")
                .eq("status", "published");

            if (filters.priceMin) query = query.gte("price", parseFloat(filters.priceMin));
            if (filters.priceMax) query = query.lte("price", parseFloat(filters.priceMax));
            if (filters.type !== "all") query = query.eq("subcategory", filters.type);
            if (filters.beds !== "all") query = query.gte("bedrooms", parseInt(filters.beds));
            if (filters.location) {
                const { data: cityData } = await supabase.from("cities").select("id").ilike("name", `%${filters.location}%`);
                if (cityData && cityData.length > 0) query = query.in("city_id", cityData.map(c => c.id));
            }

            query = query.order("tier", { ascending: true }).order("created_at", { ascending: false });
            const { data, error } = await query;
            if (error) throw error;
            return data as RealEstateListing[];
        },
        staleTime: 1000 * 60 * 5,
    });

    const filteredListings = useMemo(() => listings ?? [], [listings]);

    const handleFilterChange = (key: string, value: string) => setFilters(prev => ({ ...prev, [key]: value }));
    const handleClear = () => setFilters({ priceMin: "", priceMax: "", type: "all", beds: "all", location: "" });

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SeoHead
                title="Properties — AlgarveOfficial"
                description="Explore premium property investment opportunities in the Algarve."
                canonicalUrl="https://algarveofficial.com/properties"
                keywords="Algarve properties, Portugal real estate, premium property Algarve"
            />
            <Header />
            <div className="h-[4.5rem] sm:h-20" aria-hidden="true" />
            <main className="flex-grow">
                <div className="app-container py-14 sm:py-20 relative z-20">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
                        <div className="xl:col-span-4 2xl:col-span-3">
                            <div className="sticky top-24">
                                <RealEstateFilters
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    onSearch={() => { }}
                                    onClear={handleClear}
                                />
                                <div className="hidden xl:block mt-6 sm:mt-8 p-5 sm:p-8 bg-black text-white rounded-2xl space-y-4">
                                    <h4 className="font-serif text-xl italic">{t("realEstate.searchAssistance.title", "Search Assistance")}</h4>
                                    <p className="text-sm text-white/70 font-light leading-relaxed">
                                        {t("realEstate.searchAssistance.description", "Cannot find what you are looking for? Our concierge team has access to off-market properties.")}
                                    </p>
                                    <ConciergeContactDialog>
                                        <Button className="w-full bg-primary hover:bg-primary/90 text-black rounded-full text-[11px] sm:text-xs tracking-[0.18em] uppercase py-4 sm:py-6 whitespace-normal">
                                            {t("realEstate.searchAssistance.cta", "Contact Concierge")}
                                        </Button>
                                    </ConciergeContactDialog>
                                </div>
                            </div>
                        </div>
                        <div className="xl:col-span-8 2xl:col-span-9 min-w-0">
                            <CuratedExcellence
                                context={{ type: 'category', categoryId: '11df48fe-34e4-4743-8837-e5a1fb399a37' }}
                                limit={1}
                                showSectionHeader={false}
                                fullWidth
                            />
                            <div className="mb-8 sm:mb-10 flex flex-col md:flex-row justify-between items-baseline gap-3 sm:gap-4 border-b border-primary/20 pb-5 sm:pb-6">
                                <h2 className="text-2xl sm:text-3xl font-serif italic text-foreground">
                                    {filteredListings?.length || 0} <span className="not-italic font-sans text-sm sm:text-lg text-muted-foreground sm:ml-2 tracking-[0.16em] uppercase">{t("realEstate.propertiesAvailable", "Properties Available")}</span>
                                </h2>
                                <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-[0.16em] font-medium">{t("realEstate.sortedByFeatured", "Sorted by: Featured")}</div>
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

                        <div className="xl:hidden xl:col-span-4 2xl:col-span-3">
                            <div className="p-5 sm:p-8 bg-black text-white rounded-2xl space-y-4">
                                <h4 className="font-serif text-xl italic">{t("realEstate.searchAssistance.title", "Search Assistance")}</h4>
                                <p className="text-sm text-white/70 font-light leading-relaxed">
                                    {t("realEstate.searchAssistance.description", "Cannot find what you are looking for? Our concierge team has access to off-market properties.")}
                                </p>
                                <ConciergeContactDialog>
                                    <Button className="w-full bg-primary hover:bg-primary/90 text-black rounded-full text-[11px] sm:text-xs tracking-[0.18em] uppercase py-4 sm:py-6 whitespace-normal">
                                        {t("realEstate.searchAssistance.cta", "Contact Concierge")}
                                    </Button>
                                </ConciergeContactDialog>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
