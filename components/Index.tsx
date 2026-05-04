"use client";

import { useMemo, type ComponentType } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomepageSignatureCollection } from "@/components/sections/HomepageSignatureCollection";
import { HeroSection } from "@/components/sections/HeroSection";
import { HomeAllCitiesSection } from "@/components/sections/HomeAllCitiesSection";
import { HomeQuickLinksSection } from "@/components/sections/HomeQuickLinksSection";
import { HomeFinalEndcap } from "@/components/sections/HomeFinalEndcap";
import { HomeSmartSearchSection } from "@/components/sections/HomeSmartSearchSection";
import { HomeTrustSection } from "@/components/sections/HomeTrustSection";
import { useHomepageSettings } from "@/hooks/useHomepageSettings";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { getHomeSectionCopy, type HomeSectionCopy } from "@/lib/cms/home-section-copy";
import type { ListingWithRelations } from "@/hooks/useListings";
import { homepageListingSplitQueryKey } from "@/lib/query-keys";
import { normalizePublicContentLocale } from "@/lib/publicContentLocale";

function HomeSectionFallback() {
  return (
    <div className="py-8" aria-hidden="true">
      <div className="h-64 rounded-xl border border-border/50 bg-muted/35 animate-pulse" />
    </div>
  );
}

function VipSectionFallback() {
  return (
    <div className="py-8" aria-hidden="true">
      <div className="app-container space-y-6">
        <div className="h-10 w-72 rounded-md bg-muted/35 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-72 rounded-sm border border-border/50 bg-muted/35 animate-pulse" />
          ))}
        </div>
        <div className="h-[460px] rounded-sm border border-border/50 bg-muted/35 animate-pulse" />
      </div>
    </div>
  );
}

const withHomeSectionLoading = <T extends ComponentType<any>>(
  loader: () => Promise<{ [key: string]: T } | { default: T }>,
  select?: (module: any) => T,
  loading: () => ReturnType<typeof HomeSectionFallback> = () => <HomeSectionFallback />,
) =>
  dynamic(async () => {
    const mod = await loader();
    return select ? select(mod) : (mod as { default: T }).default;
  }, {
    loading,
  });

const RegionsSection = withHomeSectionLoading(
  () => import("@/components/sections/RegionsSection"),
  (mod) => mod.RegionsSection,
);
const SignatureMapSection = withHomeSectionLoading(
  () => import("@/components/sections/SignatureMapSection"),
  (mod) => mod.SignatureMapSection,
  () => <VipSectionFallback />,
);
const CTASection = withHomeSectionLoading(
  () => import("@/components/sections/CTASection"),
  (mod) => mod.CTASection,
);
const AllListingsSection = withHomeSectionLoading(
  () => import("@/components/sections/AllListingsSection"),
  (mod) => mod.AllListingsSection,
);

// Section ID to component mapping
type HomeSectionComponentProps = {
  copy?: HomeSectionCopy;
  listingCount?: number;
};

const SECTION_COMPONENTS: Record<string, ComponentType<HomeSectionComponentProps>> = {
  categories: HomeQuickLinksSection,
  regions: RegionsSection,
  curated: HomepageSignatureCollection,
  cities: HomeAllCitiesSection,
  vip: SignatureMapSection,
  "all-listings": AllListingsSection,
  cta: CTASection,
};

const PUBLIC_BLOCK_ID_BY_HOME_SECTION: Record<string, string> = {
  categories: "quick-links",
  cities: "all-cities",
};

// Default section order if none in database
const DEFAULT_SECTION_ORDER = [
  "curated",
  "categories",
  "regions",
  "cities",
  "vip",
  "all-listings",
  "cta",
];

const EARLY_SECTION_IDS = new Set(["curated"]);

const Index = () => {
  const { settings, isLoading } = useHomepageSettings();
  const { getBlockOrder, isBlockEnabled } = useCmsPageBuilder("home");
  const locale = normalizePublicContentLocale(useCurrentLocale());
  const allCitiesBlockEnabled = isBlockEnabled("all-cities", true);
  const { data: editorListings = [] } = useQuery<ListingWithRelations[]>({
    queryKey: homepageListingSplitQueryKey("editors", locale),
    queryFn: async () => [],
    staleTime: Number.POSITIVE_INFINITY,
  });
  const { data: premiumListings = [] } = useQuery<ListingWithRelations[]>({
    queryKey: homepageListingSplitQueryKey("premium", locale),
    queryFn: async () => [],
    staleTime: Number.POSITIVE_INFINITY,
  });
  const homepageListingCount = editorListings.length + premiumListings.length;

  // Compute which sections to render and in what order
  const sectionsToRender = useMemo(() => {
    if (isLoading || !settings) {
      // Return default order while loading
      return DEFAULT_SECTION_ORDER.map(id => ({ id, enabled: true }));
    }

    const sectionOrderFromSettings = (settings.section_order as string[] | null) ?? DEFAULT_SECTION_ORDER;
    const sectionOrder = [...sectionOrderFromSettings];

    // Ensure known homepage sections appear even if older DB rows lack them.
    DEFAULT_SECTION_ORDER.forEach((sectionId) => {
      if (!sectionOrder.includes(sectionId)) {
        sectionOrder.push(sectionId);
      }
    });
    
    // Map section IDs to their visibility settings
    const visibilityMap: Record<string, boolean> = {
      regions: settings.show_regions_section ?? true,
      categories: settings.show_categories_section ?? true,
      curated: settings.show_curated_section ?? true,
      cities: settings.show_cities_section ?? true,
      vip: settings.show_vip_section ?? true,
      "all-listings": settings.show_all_listings_section ?? true,
      cta: settings.show_cta_section ?? true,
    };

    const normalizedOrder = sectionOrder.filter((id) => id in SECTION_COMPONENTS);
    const cmsOrdered = getBlockOrder(normalizedOrder);

    return cmsOrdered
      .map(id => ({ id, enabled: visibilityMap[id] ?? true }));
  }, [settings, isLoading, getBlockOrder]);

  const quickLinksSection = sectionsToRender.find(({ id }) => id === "categories");
  const earlySections = sectionsToRender.filter(({ id }) => EARLY_SECTION_IDS.has(id));
  const remainingSections = sectionsToRender.filter(({ id }) => id !== "categories" && !EARLY_SECTION_IDS.has(id));
  const quickLinksEnabled =
    Boolean(quickLinksSection?.enabled) &&
    isBlockEnabled(PUBLIC_BLOCK_ID_BY_HOME_SECTION.categories, true);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {!isBlockEnabled("hero", true) && <div className="h-[4.5rem] sm:h-20" aria-hidden="true" />}
      <main id="main-content" className="main">
        <CmsBlock pageId="home" blockId="hero" as="section">
          <HeroSection />
        </CmsBlock>
        {quickLinksEnabled && (
          <CmsBlock
            pageId="home"
            blockId={PUBLIC_BLOCK_ID_BY_HOME_SECTION.categories}
            as="section"
            defaultEnabled
          >
            <HomeQuickLinksSection copy={getHomeSectionCopy(settings?.section_copy, "categories")} />
          </CmsBlock>
        )}
        {isBlockEnabled("smart-search", true) && (
          <CmsBlock pageId="home" blockId="smart-search" as="section">
            <HomeSmartSearchSection />
          </CmsBlock>
        )}
        <div className="mx-auto w-full content-max density">
          {earlySections.map(({ id, enabled }) => {
            const blockId = PUBLIC_BLOCK_ID_BY_HOME_SECTION[id] ?? id;
            const defaultEnabled = true;
            if (!enabled || !isBlockEnabled(blockId, defaultEnabled)) return null;

            const SectionComponent = SECTION_COMPONENTS[id];
            if (!SectionComponent) return null;

            return (
              <CmsBlock
                pageId="home"
                blockId={blockId}
                key={id}
                as="section"
                defaultEnabled={defaultEnabled}
              >
                <SectionComponent copy={getHomeSectionCopy(settings?.section_copy, id)} />
              </CmsBlock>
            );
          })}
        </div>
        <div className="mx-auto w-full content-max density">
          {remainingSections.map(({ id, enabled }) => {
            const blockId = PUBLIC_BLOCK_ID_BY_HOME_SECTION[id] ?? id;
            const defaultEnabled = true;
            if (id === "cities" && !allCitiesBlockEnabled) return null;
            if (!enabled || !isBlockEnabled(blockId, defaultEnabled)) return null;

            const SectionComponent = SECTION_COMPONENTS[id];
            if (!SectionComponent) return null;

            return (
              <CmsBlock
                pageId="home"
                blockId={blockId}
                key={id}
                as="section"
                defaultEnabled={defaultEnabled}
              >
                <SectionComponent
                  copy={getHomeSectionCopy(settings?.section_copy, id)}
                  listingCount={id === "cta" && homepageListingCount > 0 ? homepageListingCount : undefined}
                />
              </CmsBlock>
            );
          })}
        </div>
        <HomeFinalEndcap />
        {isBlockEnabled("trust", true) && (
          <CmsBlock pageId="home" blockId="trust" as="section">
            <HomeTrustSection />
          </CmsBlock>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
