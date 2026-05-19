"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { SoftReveal } from "@/components/ui/SoftReveal";
import { usePublicHomepageSettings } from "@/hooks/usePublicHomepageSettings";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { cmsText, getHomeSectionCopy, type HomeSectionCopy } from "@/lib/cms/home-section-copy";
import type { HomeSectionRenderable } from "@/components/home/home-section-loader";

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

const FINAL_ENDCAP_FALLBACK = () => (
  <div className="bg-background pb-14 pt-4 sm:pb-18 lg:pb-20" aria-hidden="true">
    <div className="app-container content-max">
      <div className="h-44 rounded-sm border border-border/50 bg-muted/35 animate-pulse sm:h-48" />
    </div>
  </div>
);

function renderVipSectionFallback() {
  return <VipSectionFallback />;
}

const HOME_SECTION_IDS = new Set([
  "quick-links",
  "smart-search",
  "regions",
  "categories",
  "curated",
  "cities",
  "all-cities",
  "featured-city",
  "vip",
  "all-listings",
  "algarve-guide",
  "newsletter",
  "cta",
  "trust",
]);

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
  "all-listings",
  "cities",
  "all-cities",
  "algarve-guide",
  "newsletter",
  "cta",
  "trust",
];

const DEFAULT_DISABLED_BLOCK_IDS = new Set(["featured-city"]);
const CRITICAL_HOME_SECTION_IDS = new Set<string>();

function scheduleDeferredHomeSectionReveal(callback: () => void) {
  let disposed = false;
  let timeoutId: number | null = null;

  const run = () => {
    if (disposed) return;
    disposed = true;
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
    window.removeEventListener("pointerdown", run);
    window.removeEventListener("keydown", run);
    window.removeEventListener("scroll", run);
    callback();
  };

  timeoutId = window.setTimeout(run, 15000);
  window.addEventListener("pointerdown", run, { once: true, passive: true });
  window.addEventListener("keydown", run, { once: true });
  window.addEventListener("scroll", run, { once: true, passive: true });

  return () => {
    disposed = true;
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
    window.removeEventListener("pointerdown", run);
    window.removeEventListener("keydown", run);
    window.removeEventListener("scroll", run);
  };
}

function HomeQuickLinksStaticPreview({ copy }: { copy?: HomeSectionCopy }) {
  const { t } = useTranslation();

  return (
    <section className="relative z-10 bg-background pb-10 pt-3 sm:pb-12 sm:pt-4 lg:pb-14 lg:pt-5" aria-hidden="true">
      <div className="app-container content-max">
        <div className="mx-auto mb-6 max-w-[720px] text-center sm:mb-8">
          <h2 className="font-serif text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[0.98] tracking-normal text-foreground">
            {cmsText(copy?.title, t("sections.homepage.categories.title"))}
          </h2>
          <p className="mx-auto mt-3 max-w-[720px] text-base leading-relaxed text-muted-foreground dark:text-white/80 sm:text-lg">
            {cmsText(copy?.subtitle ?? copy?.description, t("sections.homepage.categories.intro"))}
          </p>
        </div>
      </div>
    </section>
  );
}

function DeferredHomeSection({
  children,
  id,
  placeholder,
}: {
  children: ReactNode;
  id: string;
  placeholder?: ReactNode;
}) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) return undefined;
    return scheduleDeferredHomeSectionReveal(() => setShouldRender(true));
  }, [shouldRender]);

  return (
    <div data-home-section-deferred={id}>
      {shouldRender ? children : placeholder}
    </div>
  );
}

function DeferredLoadedHomeSection({
  loadKind = "section",
  sectionId,
  copy,
  listingCount,
  loading,
}: {
  loadKind?: "section" | "final-endcap" | "footer";
  sectionId?: string;
  copy?: HomeSectionCopy;
  listingCount?: number;
  loading?: () => ReactNode;
}) {
  const [SectionComponent, setSectionComponent] = useState<HomeSectionRenderable | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);

  useEffect(() => {
    let disposed = false;

    setSectionComponent(null);
    setLoadError(null);

    void import("@/components/home/home-section-loader")
      .then((module) => {
        if (loadKind === "final-endcap") {
          return module.loadHomeFinalEndcap();
        }
        if (loadKind === "footer") {
          return module.loadHomeFooter();
        }
        if (!sectionId) return null;
        return module.loadHomeSection(sectionId);
      })
      .then((loadedComponent) => {
        if (disposed) return;
        if (!loadedComponent) {
          throw new Error(`Unknown home section: ${sectionId ?? loadKind}`);
        }
        setSectionComponent(() => loadedComponent);
      })
      .catch((error: unknown) => {
        if (!disposed) {
          setLoadError(error);
        }
      });

    return () => {
      disposed = true;
    };
  }, [loadKind, sectionId]);

  if (loadError) {
    throw loadError;
  }

  if (!SectionComponent) {
    return <>{loading?.() ?? <HomeSectionFallback />}</>;
  }

  return <SectionComponent copy={copy} listingCount={listingCount} />;
}

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
  const editorialOrder = moveSectionAfter(
    moveSectionBefore(
      moveSectionBefore(order, "vip", "all-cities"),
      "curated",
      "all-cities",
    ),
    "cta",
    "all-listings",
  );

  return moveSectionAfter(
    moveSectionAfter(editorialOrder, "all-cities", "all-listings"),
    "cities",
    "all-listings",
  );
}

function normalizeHomeSectionOrder(sectionOrder: string[]) {
  const normalized: string[] = [];

  sectionOrder.forEach((sectionId) => {
    const normalizedId = LEGACY_SECTION_ID_BY_HOME_SECTION[sectionId] ?? sectionId;
    if (HOME_SECTION_IDS.has(normalizedId) && !normalized.includes(normalizedId)) {
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

function getHomeSectionLoading(sectionId: string): (() => ReactNode) | undefined {
  if (sectionId === "curated" || sectionId === "vip") {
    return renderVipSectionFallback;
  }

  return undefined;
}

const Index = () => {
  const { settings, isLoading } = usePublicHomepageSettings();
  const { getBlockOrder, isBlockEnabled } = useCmsPageBuilder("home");

  // Compute which sections to render and in what order
  const sectionsToRender = useMemo(() => {
    if (isLoading || !settings || !settings.id) {
      // Return default order while loading or if settings are missing
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

    if (!HOME_SECTION_IDS.has(id)) return null;

    const sectionCopy = getHomeSectionCopy(settings?.section_copy, getHomeSectionCopySourceId(id));

    const content = (
      <CmsBlock
        pageId="home"
        blockId={id}
        key={id}
        as="section"
        defaultEnabled={defaultEnabled}
      >
        <SoftReveal className="min-w-0">
          <DeferredLoadedHomeSection
            sectionId={id}
            copy={sectionCopy}
            loading={getHomeSectionLoading(id)}
          />
        </SoftReveal>
      </CmsBlock>
    );

    if (CRITICAL_HOME_SECTION_IDS.has(id)) {
      return content;
    }

    return (
      <DeferredHomeSection
        key={id}
        id={id}
        placeholder={
          id === "quick-links" ? (
            <HomeQuickLinksStaticPreview
              copy={sectionCopy}
            />
          ) : null
        }
      >
        {content}
      </DeferredHomeSection>
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
          {settings ? sectionsToRender.map(renderSection) : null}
        </div>
        <DeferredHomeSection id="final-endcap">
          <SoftReveal className="min-w-0">
            <DeferredLoadedHomeSection
              loadKind="final-endcap"
              loading={FINAL_ENDCAP_FALLBACK}
            />
          </SoftReveal>
        </DeferredHomeSection>
      </main>
      <DeferredHomeSection id="footer">
        <DeferredLoadedHomeSection loadKind="footer" />
      </DeferredHomeSection>
    </div>
  );
};

export default Index;
