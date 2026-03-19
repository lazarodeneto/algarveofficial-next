"use client";

import { Suspense, lazy, useMemo, type ComponentType, type LazyExoticComponent } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { HomeQuickLinksSection } from "@/components/sections/HomeQuickLinksSection";
import { AlgarveGuideSection } from "@/components/sections/AlgarveGuideSection";
import { useHomepageSettings } from "@/hooks/useHomepageSettings";
import { SeoHead } from "@/components/seo/SeoHead";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo/JsonLd";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { CmsBlock } from "@/components/cms/CmsBlock";

// Lazy load below-the-fold sections to reduce initial main-thread work
const RegionsSection = lazy(() => import("@/components/sections/RegionsSection").then(m => ({ default: m.RegionsSection })));
const CategoriesSection = lazy(() => import("@/components/sections/CategoriesSection").then(m => ({ default: m.CategoriesSection })));
const CitiesSection = lazy(() => import("@/components/sections/CitiesSection").then(m => ({ default: m.CitiesSection })));
const CuratedExcellence = lazy(() => import("@/components/sections/CuratedExcellence").then(m => ({ default: m.CuratedExcellence })));
const SignatureMapSection = lazy(() => import("@/components/sections/SignatureMapSection").then(m => ({ default: m.SignatureMapSection })));
const AllListingsSection = lazy(() => import("@/components/sections/AllListingsSection").then(m => ({ default: m.AllListingsSection })));
const NewsletterSection = lazy(() => import("@/components/sections/NewsletterSection").then(m => ({ default: m.NewsletterSection })));
const CTASection = lazy(() => import("@/components/sections/CTASection").then(m => ({ default: m.CTASection })));

// Section ID to component mapping
const SECTION_COMPONENTS: Record<string, LazyExoticComponent<ComponentType<unknown>>> = {
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
  const { getBlockOrder, getMetaDescription, getMetaTitle, getText, isBlockEnabled } = useCmsPageBuilder("home");

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
      {/* SEO: Dynamic meta tags and JSON-LD structured data */}
      <SeoHead
        title={getMetaTitle(getText("seo.title", "Premium Experiences in the Algarve"))}
        description={getMetaDescription(getText("seo.description", "Your curated gateway to premium accommodation, fine dining, golf, and bespoke VIP experiences across Portugal's most prestigious coastal region."))}
        canonicalUrl="https://algarveofficial.com"
        keywords={getText("seo.keywords", "Algarve premium, Portugal villas, Quinta do Lago, Vale do Lobo, Vilamoura golf, fine dining Portugal, VIP concierge Algarve")}
      />
      <OrganizationJsonLd />
      <WebsiteJsonLd />

      <Header />
      <main className="main">
        <CmsBlock pageId="home" blockId="hero" as="section">
          <HeroSection />
        </CmsBlock>
        <CmsBlock pageId="home" blockId="quick-links" as="section">
          <HomeQuickLinksSection />
        </CmsBlock>
        <Suspense fallback={null}>
          <div className="mx-auto w-full content-max density">
            {sectionsToRender.map(({ id, enabled }) => {
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
            <CmsBlock pageId="home" blockId="algarve-guide" as="section">
              <AlgarveGuideSection />
            </CmsBlock>
          </div>
          <CmsBlock pageId="home" blockId="newsletter" as="section">
            <NewsletterSection />
          </CmsBlock>
          {showCta && (
            <CmsBlock pageId="home" blockId="cta" as="section">
              <CTASection />
            </CmsBlock>
          )}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
