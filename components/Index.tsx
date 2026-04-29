"use client";

import { useMemo, type ComponentType } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DirectorySplitSection } from "@/components/sections/DirectorySplitSection";
import { HomepageSignatureCollection } from "@/components/sections/HomepageSignatureCollection";
import { HeroSection } from "@/components/sections/HeroSection";
import { HomeQuickLinksSection } from "@/components/sections/HomeQuickLinksSection";
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

const AlgarveGuideSection = withHomeSectionLoading(
  () => import("@/components/sections/AlgarveGuideSection"),
  (mod) => mod.AlgarveGuideSection,
);
const RegionsSection = withHomeSectionLoading(
  () => import("@/components/sections/RegionsSection"),
  (mod) => mod.RegionsSection,
);
const CategoriesSection = withHomeSectionLoading(
  () => import("@/components/sections/CategoriesSection"),
  (mod) => mod.CategoriesSection,
);
const CitiesSection = withHomeSectionLoading(
  () => import("@/components/sections/CitiesSection"),
  (mod) => mod.CitiesSection,
);
const SignatureMapSection = withHomeSectionLoading(
  () => import("@/components/sections/SignatureMapSection"),
  (mod) => mod.SignatureMapSection,
  () => <VipSectionFallback />,
);
const NewsletterSection = withHomeSectionLoading(
  () => import("@/components/sections/NewsletterSection"),
  (mod) => mod.NewsletterSection,
);
const CTASection = withHomeSectionLoading(
  () => import("@/components/sections/CTASection"),
  (mod) => mod.CTASection,
);

// Section ID to component mapping
const SECTION_COMPONENTS: Record<string, ComponentType<unknown>> = {
  regions: RegionsSection,
  categories: CategoriesSection,
  cities: CitiesSection,
  vip: SignatureMapSection,
};

// Default section order if none in database
const DEFAULT_SECTION_ORDER = [
  "regions",
  "categories",
  "vip",
  "cities",
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
      cities: settings.show_cities_section ?? true,
      curated: settings.show_curated_section ?? true,
      vip: settings.show_vip_section ?? true,
      'all-listings': settings.show_all_listings_section ?? true,
    };

    const normalizedOrder = sectionOrder.filter((id) => id in SECTION_COMPONENTS);
    const cmsOrdered = getBlockOrder(normalizedOrder);

    return cmsOrdered
      .map(id => ({ id, enabled: visibilityMap[id] ?? true }));
  }, [settings, isLoading, getBlockOrder]);

  // Check if CTA section should be shown
  const showCta = settings?.show_cta_section ?? true;

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
        {(settings?.show_curated_section ?? true) && isBlockEnabled("curated", true) && (
          <CmsBlock pageId="home" blockId="curated" as="section">
            <HomepageSignatureCollection />
          </CmsBlock>
        )}
        {(settings?.show_all_listings_section ?? true) && isBlockEnabled("all-listings", true) && (
          <CmsBlock pageId="home" blockId="all-listings" as="section">
            <DirectorySplitSection />
          </CmsBlock>
        )}
        {(settings?.show_vip_section ?? true) && isBlockEnabled("vip", true) && (
          <CmsBlock pageId="home" blockId="vip" as="section">
            <SignatureMapSection />
          </CmsBlock>
        )}
        <div className="mx-auto w-full content-max density">
          {sectionsToRender.filter(({ id }) => id !== "vip").map(({ id, enabled }) => {
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
          {isBlockEnabled("algarve-guide", true) && (
            <CmsBlock pageId="home" blockId="algarve-guide" as="section">
              <AlgarveGuideSection />
            </CmsBlock>
          )}
        </div>
        {isBlockEnabled("newsletter", true) && (
          <CmsBlock pageId="home" blockId="newsletter" as="section">
            <NewsletterSection />
          </CmsBlock>
        )}
        {showCta && isBlockEnabled("cta", true) && (
          <CmsBlock pageId="home" blockId="cta" as="section">
            <CTASection />
          </CmsBlock>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
