"use client";

import { useMemo, useState, useEffect, type ComponentType } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { HomeQuickLinksSection } from "@/components/sections/HomeQuickLinksSection";
import { useHomepageSettings } from "@/hooks/useHomepageSettings";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { CmsBlock } from "@/components/cms/CmsBlock";

const SKELETON_DELAY_MS = 120;

function DelayedFallback() {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSkeleton(true), SKELETON_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!showSkeleton) {
    return <div className="min-h-[200px]" />;
  }

  return (
    <div className="py-8">
      <div className="h-48 rounded-[1.75rem] border border-border/50 bg-muted/35 animate-pulse" />
    </div>
  );
}

function FadeInWrapper({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className="transition-opacity duration-300 ease-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {children}
    </div>
  );
}

function HomeSectionFallback() {
  return (
    <div className="py-8">
      <div className="h-48 rounded-[1.75rem] border border-border/50 bg-muted/35 animate-pulse" />
    </div>
  );
}

const withHomeSectionLoading = <T extends ComponentType<any>>(
  loader: () => Promise<{ [key: string]: T } | { default: T }>,
  select?: (module: any) => T,
) =>
  dynamic(async () => {
    const mod = await loader();
    return select ? select(mod) : (mod as { default: T }).default;
  }, {
    loading: () => <DelayedFallback />,
  });

const withFadeIn = <T extends ComponentType<any>>(
  WrappedComponent: T,
) => {
  return function FadeInComponent(props: any) {
    return (
      <FadeInWrapper>
        <WrappedComponent {...props} />
      </FadeInWrapper>
    );
  };
};

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
const FeaturedCitySection = withHomeSectionLoading(
  () => import("@/components/sections/FeaturedCitySection"),
  (mod) => mod.FeaturedCitySection,
);
const CuratedExcellence = withHomeSectionLoading(
  () => import("@/components/sections/CuratedExcellence"),
  (mod) => mod.CuratedExcellence,
);
const SignatureMapSection = withHomeSectionLoading(
  () => import("@/components/sections/SignatureMapSection"),
  (mod) => mod.SignatureMapSection,
);
const AllListingsSection = withHomeSectionLoading(
  () => import("@/components/sections/AllListingsSection"),
  (mod) => mod.AllListingsSection,
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
  "featured-city": FeaturedCitySection,
  cities: CitiesSection,
  vip: SignatureMapSection,
  'all-listings': AllListingsSection,
};

// Default section order if none in database
const DEFAULT_SECTION_ORDER = [
  "regions",
  "categories",
  "featured-city",
  "curated",
  "vip",
  "cities",
  "all-listings",
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
      {!isBlockEnabled("hero", true) && <div className="h-[4.5rem] sm:h-20" aria-hidden="true" />}
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
            const defaultEnabled = id === "featured-city" ? false : true;
            if (!enabled || !isBlockEnabled(id, defaultEnabled)) return null;

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
