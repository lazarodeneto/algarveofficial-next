"use client";

import { useMemo, type ComponentType } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/sections/HeroSection";
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

type HomeSectionComponentProps = {
  copy?: HomeSectionCopy;
  listingCount?: number;
};
type HomeSectionRenderable = ComponentType<HomeSectionComponentProps>;

function selectHomeSection(module: unknown, exportName: string): HomeSectionRenderable {
  return (module as Record<string, HomeSectionRenderable>)[exportName];
}

const withHomeSectionLoading = (
  loader: () => Promise<unknown>,
  select?: (module: unknown) => HomeSectionRenderable,
  loading: () => ReturnType<typeof HomeSectionFallback> = () => <HomeSectionFallback />,
) =>
  dynamic<HomeSectionComponentProps>(async () => {
    const mod = await loader();
    return select ? select(mod) : (mod as { default: HomeSectionRenderable }).default;
  }, {
    loading,
  });

const RegionsSection = withHomeSectionLoading(
  () => import("@/components/sections/RegionsSection"),
  (mod) => selectHomeSection(mod, "RegionsSection"),
);
const HomeQuickLinksSection = dynamic<HomeSectionComponentProps>(
  () =>
    import("@/components/sections/HomeQuickLinksSection").then(
      (mod) => mod.HomeQuickLinksSection as ComponentType<HomeSectionComponentProps>,
    ),
);
const HomeSmartSearchSection = dynamic(
  () => import("@/components/sections/HomeSmartSearchSection").then((mod) => mod.HomeSmartSearchSection),
);
const CategoriesSection = withHomeSectionLoading(
  () => import("@/components/sections/CategoriesSection"),
  (mod) => selectHomeSection(mod, "CategoriesSection"),
);
const CitiesSection = withHomeSectionLoading(
  () => import("@/components/sections/CitiesSection"),
  (mod) => selectHomeSection(mod, "CitiesSection"),
);
const HomepageSignatureCollection = withHomeSectionLoading(
  () => import("@/components/sections/HomepageSignatureCollection"),
  (mod) => selectHomeSection(mod, "HomepageSignatureCollection"),
  () => <VipSectionFallback />,
);
const SignatureMapSection = withHomeSectionLoading(
  () => import("@/components/sections/SignatureMapSection"),
  (mod) => selectHomeSection(mod, "SignatureMapSection"),
  () => <VipSectionFallback />,
);
const CTASection = withHomeSectionLoading(
  () => import("@/components/sections/CTASection"),
  (mod) => selectHomeSection(mod, "CTASection"),
);
const AllListingsSection = withHomeSectionLoading(
  () => import("@/components/sections/AllListingsSection"),
  (mod) => selectHomeSection(mod, "AllListingsSection"),
);
const FeaturedCitySection = withHomeSectionLoading(
  () => import("@/components/sections/FeaturedCitySection"),
  (mod) => selectHomeSection(mod, "FeaturedCitySection"),
);
const HomeAllCitiesSection = withHomeSectionLoading(
  () => import("@/components/sections/HomeAllCitiesSection"),
  (mod) => selectHomeSection(mod, "HomeAllCitiesSection"),
);
const AlgarveGuideSection = withHomeSectionLoading(
  () => import("@/components/sections/AlgarveGuideSection"),
  (mod) => selectHomeSection(mod, "AlgarveGuideSection"),
);
const NewsletterSection = withHomeSectionLoading(
  () => import("@/components/sections/NewsletterSection"),
  (mod) => selectHomeSection(mod, "NewsletterSection"),
);
const HomeTrustSection = withHomeSectionLoading(
  () => import("@/components/sections/HomeTrustSection"),
  (mod) => selectHomeSection(mod, "HomeTrustSection"),
);
const HomeFinalEndcap = dynamic(
  () => import("@/components/sections/HomeFinalEndcap").then((mod) => mod.HomeFinalEndcap),
  {
    loading: () => (
      <div className="bg-background pb-14 pt-4 sm:pb-18 lg:pb-20" aria-hidden="true">
        <div className="app-container content-max">
          <div className="h-44 rounded-sm border border-border/50 bg-muted/35 animate-pulse sm:h-48" />
        </div>
      </div>
    ),
  },
);
const Footer = dynamic(() => import("@/components/layout/Footer").then((mod) => mod.Footer));

// Section ID to component mapping
const SECTION_COMPONENTS: Record<string, ComponentType<HomeSectionComponentProps>> = {
  "quick-links": HomeQuickLinksSection,
  "smart-search": HomeSmartSearchSection,
  regions: RegionsSection,
  categories: CategoriesSection,
  curated: HomepageSignatureCollection,
  cities: CitiesSection,
  "all-cities": HomeAllCitiesSection,
  "featured-city": FeaturedCitySection,
  vip: SignatureMapSection,
  "all-listings": AllListingsSection,
  "algarve-guide": AlgarveGuideSection,
  newsletter: NewsletterSection,
  cta: CTASection,
  trust: HomeTrustSection,
};

const PUBLIC_HOME_SECTION_ID_BY_ADMIN_SECTION_ID: Record<string, string> = {
  categories: "quick-links",
  cities: "all-cities",
};

const HOME_SECTION_COPY_SOURCE_ID_BY_PUBLIC_SECTION_ID = Object.fromEntries(
  Object.entries(PUBLIC_HOME_SECTION_ID_BY_ADMIN_SECTION_ID).map(([adminSectionId, publicSectionId]) => [
    publicSectionId,
    adminSectionId,
  ]),
);

const LEGACY_SECTION_ID_BY_HOME_SECTION: Record<string, string> = {
  categories: PUBLIC_HOME_SECTION_ID_BY_ADMIN_SECTION_ID.categories,
};

// Default section order if none in database
const DEFAULT_SECTION_ORDER = [
  "quick-links",
  "smart-search",
  "curated",
  "regions",
  "categories",
  "featured-city",
  "vip",
  "cities",
  "all-cities",
  "all-listings",
  "algarve-guide",
  "newsletter",
  "cta",
  "trust",
];

const DEFAULT_DISABLED_BLOCK_IDS = new Set(["featured-city"]);

function moveSectionBefore(order: string[], sectionId: string, beforeSectionId: string) {
  const sectionIndex = order.indexOf(sectionId);
  const beforeIndex = order.indexOf(beforeSectionId);
  if (sectionIndex === -1 || beforeIndex === -1 || sectionIndex < beforeIndex) return order;

  const nextOrder = [...order];
  nextOrder.splice(sectionIndex, 1);
  nextOrder.splice(beforeIndex, 0, sectionId);
  return nextOrder;
}

function moveSectionAfter(order: string[], sectionId: string, afterSectionId: string) {
  const sectionIndex = order.indexOf(sectionId);
  const afterIndex = order.indexOf(afterSectionId);
  if (sectionIndex === -1 || afterIndex === -1 || sectionIndex > afterIndex) return order;

  const nextOrder = [...order];
  nextOrder.splice(sectionIndex, 1);
  nextOrder.splice(afterIndex, 0, sectionId);
  return nextOrder;
}

function applyHomepageHierarchy(order: string[]) {
  return moveSectionAfter(
    moveSectionBefore(order, "vip", "all-cities"),
    "cta",
    "all-listings",
  );
}

function normalizeHomeSectionOrder(sectionOrder: string[]) {
  const normalized: string[] = [];

  sectionOrder.forEach((sectionId) => {
    const normalizedId = LEGACY_SECTION_ID_BY_HOME_SECTION[sectionId] ?? sectionId;
    if (normalizedId in SECTION_COMPONENTS && !normalized.includes(normalizedId)) {
      normalized.push(normalizedId);
    }
  });

  const pinnedTopSectionIds = ["quick-links", "smart-search"];
  const orderedBodySections = normalized.filter((sectionId) => !pinnedTopSectionIds.includes(sectionId));
  normalized.length = 0;
  pinnedTopSectionIds.forEach((sectionId) => normalized.push(sectionId));
  orderedBodySections.forEach((sectionId) => normalized.push(sectionId));

  DEFAULT_SECTION_ORDER.forEach((sectionId) => {
    if (!normalized.includes(sectionId)) {
      normalized.push(sectionId);
    }
  });

  return normalized;
}

function getHomeSectionCopySourceId(sectionId: string) {
  return HOME_SECTION_COPY_SOURCE_ID_BY_PUBLIC_SECTION_ID[sectionId] ?? sectionId;
}

const Index = () => {
  const { settings, isLoading } = useHomepageSettings();
  const { getBlockOrder, isBlockEnabled } = useCmsPageBuilder("home");
  const locale = normalizePublicContentLocale(useCurrentLocale());
  const { data: editorListings = [] } = useQuery<ListingWithRelations[]>({
    queryKey: homepageListingSplitQueryKey("editors", locale),
    queryFn: async () => [],
    staleTime: 60 * 1000,
  });
  const { data: premiumListings = [] } = useQuery<ListingWithRelations[]>({
    queryKey: homepageListingSplitQueryKey("premium", locale),
    queryFn: async () => [],
    staleTime: 60 * 1000,
  });
  const homepageListingCount = editorListings.length + premiumListings.length;

  // Compute which sections to render and in what order
  const sectionsToRender = useMemo(() => {
    if (isLoading || !settings) {
      // Return default order while loading
      return DEFAULT_SECTION_ORDER.map(id => ({ id, enabled: true }));
    }

    const sectionOrderFromSettings = (settings.section_order as string[] | null) ?? DEFAULT_SECTION_ORDER;
    const sectionOrder = normalizeHomeSectionOrder([...sectionOrderFromSettings]);
    
    // Map section IDs to their visibility settings
    const visibilityMap: Record<string, boolean> = {
      "quick-links": settings.show_categories_section ?? true,
      regions: settings.show_regions_section ?? true,
      categories: settings.show_categories_section ?? true,
      curated: settings.show_curated_section ?? true,
      cities: settings.show_cities_section ?? true,
      "all-cities": settings.show_cities_section ?? true,
      vip: settings.show_vip_section ?? true,
      "all-listings": settings.show_all_listings_section ?? true,
      cta: settings.show_cta_section ?? true,
    };

    const cmsOrdered = applyHomepageHierarchy(getBlockOrder(sectionOrder));

    return cmsOrdered
      .map(id => ({ id, enabled: visibilityMap[id] ?? true }));
  }, [settings, isLoading, getBlockOrder]);

  const renderSection = ({ id, enabled }: { id: string; enabled: boolean }) => {
    const defaultEnabled = !DEFAULT_DISABLED_BLOCK_IDS.has(id);
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
        <SectionComponent
          copy={getHomeSectionCopy(settings?.section_copy, getHomeSectionCopySourceId(id))}
          listingCount={id === "cta" && homepageListingCount > 0 ? homepageListingCount : undefined}
        />
      </CmsBlock>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {!isBlockEnabled("hero", true) && <div className="h-[4.5rem] sm:h-20" aria-hidden="true" />}
      <main id="main-content" className="main">
        <CmsBlock pageId="home" blockId="hero" as="section">
          <HeroSection />
        </CmsBlock>
        <div className="mx-auto w-full content-max density">
          {sectionsToRender.map(renderSection)}
        </div>
        <HomeFinalEndcap />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
