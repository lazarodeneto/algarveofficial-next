"use client";

import { useMemo, type ComponentType } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomepageSignatureCollection } from "@/components/sections/HomepageSignatureCollection";
import { HeroSection } from "@/components/sections/HeroSection";
import { HomeAllCitiesSection } from "@/components/sections/HomeAllCitiesSection";
import { HomeQuickLinksSection } from "@/components/sections/HomeQuickLinksSection";
import { HomeSmartSearchSection } from "@/components/sections/HomeSmartSearchSection";
import { HomeTrustSection } from "@/components/sections/HomeTrustSection";
import { useHomepageSettings } from "@/hooks/useHomepageSettings";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { CmsBlock } from "@/components/cms/CmsBlock";

function HomeSectionFallback() {
  return (
    <div className="py-8" aria-hidden="true">
      <div className="h-64 rounded-[1.75rem] border border-border/50 bg-muted/35 animate-pulse" />
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
            <div key={index} className="h-72 rounded-2xl border border-border/50 bg-muted/35 animate-pulse" />
          ))}
        </div>
        <div className="h-[460px] rounded-2xl border border-border/50 bg-muted/35 animate-pulse" />
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

// Section ID to component mapping
const SECTION_COMPONENTS: Record<string, ComponentType<unknown>> = {
  regions: RegionsSection,
  vip: SignatureMapSection,
};

// Default section order if none in database
const DEFAULT_SECTION_ORDER = [
  "regions",
];

const Index = () => {
  const { settings, isLoading } = useHomepageSettings();
  const { getBlockOrder, isBlockEnabled } = useCmsPageBuilder("home");

  // Compute which sections to render and in what order
  const sectionsToRender = useMemo(() => {
    if (isLoading || !settings) {
      // Return default order while loading
      return DEFAULT_SECTION_ORDER.map(id => ({ id, enabled: true }));
    }

    const sectionOrderFromSettings = (settings.section_order as string[] | null) ?? DEFAULT_SECTION_ORDER;
    const sectionOrder = [...sectionOrderFromSettings];

    // Ensure newly introduced sections (e.g. "vip") appear even if older DB rows lack them.
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
      vip: settings.show_vip_section ?? true,
    };

    const normalizedOrder = sectionOrder.filter((id) => id in SECTION_COMPONENTS && id !== "vip");
    const cmsOrdered = getBlockOrder(normalizedOrder);

    return cmsOrdered
      .map(id => ({ id, enabled: visibilityMap[id] ?? true }));
  }, [settings, isLoading, getBlockOrder]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {!isBlockEnabled("hero", true) && <div className="h-[4.5rem] sm:h-20" aria-hidden="true" />}
      <main id="main-content" className="main">
        <CmsBlock pageId="home" blockId="hero" as="section">
          <HeroSection />
        </CmsBlock>
        {isBlockEnabled("quick-links", true) && (
          <CmsBlock pageId="home" blockId="quick-links" as="section">
            <HomeQuickLinksSection />
          </CmsBlock>
        )}
        {isBlockEnabled("smart-search", true) && (
          <CmsBlock pageId="home" blockId="smart-search" as="section">
            <HomeSmartSearchSection />
          </CmsBlock>
        )}
        {(settings?.show_curated_section ?? true) && isBlockEnabled("curated", true) && (
          <CmsBlock pageId="home" blockId="curated" as="section">
            <HomepageSignatureCollection />
          </CmsBlock>
        )}
        <div className="mx-auto w-full content-max density">
          {sectionsToRender.map(({ id, enabled }) => {
            const defaultEnabled = true;
            if (!enabled || !isBlockEnabled(id, defaultEnabled)) return null;

            const SectionComponent = SECTION_COMPONENTS[id];
            if (!SectionComponent) return null;

            return (
              <CmsBlock
                pageId="home"
                blockId={id}
                key={id}
                as="section"
                defaultEnabled={defaultEnabled}
              >
                <SectionComponent />
              </CmsBlock>
            );
          })}
        </div>
        {isBlockEnabled("all-cities", true) && (
          <CmsBlock pageId="home" blockId="all-cities" as="section">
            <HomeAllCitiesSection />
          </CmsBlock>
        )}
        {(settings?.show_vip_section ?? true) && isBlockEnabled("vip", true) && (
          <CmsBlock pageId="home" blockId="vip" as="section">
            <SignatureMapSection />
          </CmsBlock>
        )}
        {isBlockEnabled("trust", true) && (
          <CmsBlock pageId="home" blockId="trust" as="section">
            <HomeTrustSection />
          </CmsBlock>
        )}
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
