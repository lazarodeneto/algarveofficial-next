"use client";

import type { Tables } from "@/integrations/supabase/types";
import type { GlobalSetting } from "@/hooks/useGlobalSettings";
import type { CityRow, RegionRow, CategoryRow } from "@/hooks/useReferenceData";
import type { CuratedListingWithRelations } from "@/hooks/useCuratedAssignments";
import type { ListingWithRelations } from "@/hooks/useListings";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AlgarveGuideSection } from "@/components/sections/AlgarveGuideSection";
import { AllListingsSection } from "@/components/sections/AllListingsSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { CTASection } from "@/components/sections/CTASection";
import { CitiesSection } from "@/components/sections/CitiesSection";
import { CuratedExcellence } from "@/components/sections/CuratedExcellence";
import { FeaturedCitySection } from "@/components/sections/FeaturedCitySection";
import { HeroSection } from "@/components/sections/HeroSection";
import { HomeQuickLinksSection } from "@/components/sections/HomeQuickLinksSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { RegionsSection } from "@/components/sections/RegionsSection";
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
}

export function HomePageClient(props: HomePageClientProps) {
  const activeSettings = props.homepageSettings;
  const showRegions = activeSettings?.show_regions_section ?? true;
  const showCategories = activeSettings?.show_categories_section ?? true;
  const showCities = activeSettings?.show_cities_section ?? true;
  const showVip = activeSettings?.show_vip_section ?? true;
  const showCurated = activeSettings?.show_curated_section ?? true;
  const showAllListings = activeSettings?.show_all_listings_section ?? true;
  const showCta = activeSettings?.show_cta_section ?? true;

  return (
    <div className="min-h-screen bg-background">
        <Header />
        <main className="main">
          <CmsBlock pageId="home" blockId="hero" as="section">
            <HeroSection />
          </CmsBlock>
          {showCurated ? (
            <CmsBlock pageId="home" blockId="curated" as="section">
              <CuratedExcellence context={{ type: "home" }} limit={1} />
            </CmsBlock>
          ) : null}
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
            <CmsBlock pageId="home" blockId="featured-city" as="section" defaultEnabled={false}>
              <FeaturedCitySection />
            </CmsBlock>
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
  );
}

export default HomePageClient;
