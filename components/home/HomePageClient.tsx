"use client";

import { HydrationBoundary, type DehydratedState } from "@tanstack/react-query";
import { useEffect } from "react";
import { LegacyRouterProvider } from "@/components/router/LegacyRouterBridge";

import type { Tables } from "@/integrations/supabase/types";
import type { GlobalSetting } from "@/hooks/useGlobalSettings";
import type { CityRow, RegionRow, CategoryRow } from "@/hooks/useReferenceData";
import type { CuratedListingWithRelations } from "@/hooks/useCuratedAssignments";
import type { ListingWithRelations } from "@/hooks/useListings";
import { useHydrated } from "@/hooks/useHydrated";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PublicSiteSidebar } from "@/components/layout/PublicSiteSidebar";
import { AlgarveGuideSection } from "@/components/sections/AlgarveGuideSection";
import { AllListingsSection } from "@/components/sections/AllListingsSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { CTASection } from "@/components/sections/CTASection";
import { CitiesSection } from "@/components/sections/CitiesSection";
import { CuratedExcellence } from "@/components/sections/CuratedExcellence";
import { HeroSection } from "@/components/sections/HeroSection";
import { HomeQuickLinksSection } from "@/components/sections/HomeQuickLinksSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { RegionsSection } from "@/components/sections/RegionsSection";
import { useHomepageSettings } from "@/hooks/useHomepageSettings";
import dynamic from "next/dynamic";

const SignatureMapSection = dynamic(
  () => import("@/components/sections/SignatureMapSection").then((module) => module.SignatureMapSection),
  { ssr: false },
);

type HomePageSettingsLike = Pick<
  Tables<"homepage_settings">,
  | "show_regions_section"
  | "show_categories_section"
  | "show_cities_section"
  | "show_vip_section"
  | "show_curated_section"
  | "show_all_listings_section"
  | "show_cta_section"
>;

export interface HomePageClientProps {
  locale: string;
  homepageSettings: HomePageSettingsLike | null;
  regions: RegionRow[];
  categories: CategoryRow[];
  allCategories: CategoryRow[];
  cities: CityRow[];
  listings: ListingWithRelations[];
  curatedAssignments: CuratedListingWithRelations[];
  globalSettings: GlobalSetting[];
  dehydratedState: DehydratedState;
}

export function HomePageClient(props: HomePageClientProps) {
  const hydrated = useHydrated();
  const { settings } = useHomepageSettings();

  useEffect(() => {
    if (!hydrated) return;

    const serverShell = document.getElementById("home-server-shell");
    if (serverShell) {
      serverShell.style.display = "none";
    }
  }, [hydrated]);

  if (!hydrated) {
    return null;
  }

  const activeSettings = settings ?? props.homepageSettings;
  const showRegions = activeSettings?.show_regions_section ?? true;
  const showCategories = activeSettings?.show_categories_section ?? true;
  const showCities = activeSettings?.show_cities_section ?? true;
  const showVip = activeSettings?.show_vip_section ?? true;
  const showCurated = activeSettings?.show_curated_section ?? true;
  const showAllListings = activeSettings?.show_all_listings_section ?? true;
  const showCta = activeSettings?.show_cta_section ?? true;

  // The legacy homepage sections still read from their existing React Query hooks.
  // We seed those queries from the server via HydrationBoundary so this phase can
  // preserve the current component tree without rewriting each section yet.
  return (
    <HydrationBoundary state={props.dehydratedState}>
      <LegacyRouterProvider>
        <div className="min-h-screen bg-background">
          <div className="hidden lg:block">
            <PublicSiteSidebar />
          </div>
          <div className="lg:pl-16 lg:pr-6">
            <Header />
            <main className="main">
              <CmsBlock pageId="home" blockId="hero" as="section">
                <HeroSection />
              </CmsBlock>
              <CmsBlock pageId="home" blockId="quick-links" as="section">
                <HomeQuickLinksSection />
              </CmsBlock>
              <div className="mx-auto w-full content-max density">
                {showRegions ? (
                  <CmsBlock pageId="home" blockId="regions" as="section">
                    <RegionsSection />
                  </CmsBlock>
                ) : null}
                {showCategories ? (
                  <CmsBlock pageId="home" blockId="categories" as="section">
                    <CategoriesSection />
                  </CmsBlock>
                ) : null}
                {showCities ? (
                  <CmsBlock pageId="home" blockId="cities" as="section">
                    <CitiesSection />
                  </CmsBlock>
                ) : null}
                {showCurated ? (
                  <CmsBlock pageId="home" blockId="curated" as="section">
                    <CuratedExcellence context={{ type: "home" }} limit={4} />
                  </CmsBlock>
                ) : null}
                {showVip ? (
                  <CmsBlock pageId="home" blockId="vip" as="section">
                    <SignatureMapSection />
                  </CmsBlock>
                ) : null}
                {showAllListings ? (
                  <CmsBlock pageId="home" blockId="all-listings" as="section">
                    <AllListingsSection />
                  </CmsBlock>
                ) : null}
                <CmsBlock pageId="home" blockId="algarve-guide" as="section">
                  <AlgarveGuideSection />
                </CmsBlock>
              </div>
              <CmsBlock pageId="home" blockId="newsletter" as="section">
                <NewsletterSection />
              </CmsBlock>
              {showCta ? (
                <CmsBlock pageId="home" blockId="cta" as="section">
                  <CTASection />
                </CmsBlock>
              ) : null}
            </main>
            <Footer />
          </div>
        </div>
      </LegacyRouterProvider>
    </HydrationBoundary>
  );
}

export default HomePageClient;
