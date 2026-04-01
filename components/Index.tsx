"use client";

import { useMemo, type ComponentType } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { HomeQuickLinksSection } from "@/components/sections/HomeQuickLinksSection";
import { AlgarveGuideSection } from "@/components/sections/AlgarveGuideSection";
import { RegionsSection } from "@/components/sections/RegionsSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { CitiesSection } from "@/components/sections/CitiesSection";
import { CuratedExcellence } from "@/components/sections/CuratedExcellence";
import { SignatureMapSection } from "@/components/sections/SignatureMapSection";
import { AllListingsSection } from "@/components/sections/AllListingsSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { CTASection } from "@/components/sections/CTASection";
import { useHomepageSettings } from "@/hooks/useHomepageSettings";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { CmsBlock } from "@/components/cms/CmsBlock";

// Section ID to component mapping
const SECTION_COMPONENTS: Record<string, ComponentType<unknown>> = {
  regions: RegionsSection,
  categories: CategoriesSection,
  cities: CitiesSection,
  vip: SignatureMapSection,
  'all-listings': AllListingsSection,
};

// Default section order if none in database
const DEFAULT_SECTION_ORDER = ['regions', 'categories', 'curated', 'vip', 'cities', 'all-listings'];

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

    const normalizedOrder = sectionOrder.filter((id) => id === "curated" || id in SECTION_COMPONENTS);
    const cmsOrdered = getBlockOrder(normalizedOrder);

    return cmsOrdered
      .map(id => ({ id, enabled: visibilityMap[id] ?? true }));
  }, [settings, isLoading, getBlockOrder]);

  // Check if CTA section should be shown
  const showCta = settings?.show_cta_section ?? true;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="main">
        {isBlockEnabled("hero", true) && (
          <CmsBlock pageId="home" blockId="hero" as="section">
            <HeroSection />
          </CmsBlock>
        )}
        {isBlockEnabled("quick-links", true) && (
          <CmsBlock pageId="home" blockId="quick-links" as="section">
            <HomeQuickLinksSection />
          </CmsBlock>
        )}
        {(settings?.show_vip_section ?? true) && isBlockEnabled("vip", true) && (
          <CmsBlock pageId="home" blockId="vip" as="section">
            <SignatureMapSection />
          </CmsBlock>
        )}
        {(settings?.show_all_listings_section ?? true) && isBlockEnabled("all-listings", true) && (
          <CmsBlock pageId="home" blockId="all-listings" as="section">
            <AllListingsSection />
          </CmsBlock>
        )}
        <div className="mx-auto w-full content-max density">
          {sectionsToRender.filter(({ id }) => id !== "vip" && id !== "all-listings").map(({ id, enabled }) => {
            if (!enabled || !isBlockEnabled(id, true)) return null;

            const SectionComponent = SECTION_COMPONENTS[id];
            if (!SectionComponent) return null;

            if (id === 'curated') {
              return (
                <CmsBlock pageId="home" blockId={id} key={id} as="section">
                  <CuratedExcellence
                    context={{ type: 'home' }}
                    limit={4}
                  />
                </CmsBlock>
              );
            }

            return (
              <CmsBlock pageId="home" blockId={id} key={id} as="section">
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
