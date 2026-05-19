"use client";

import type { ComponentType } from "react";
import type { HomeSectionCopy } from "@/lib/cms/home-section-copy";

export type HomeSectionComponentProps = {
  copy?: HomeSectionCopy;
  listingCount?: number;
};

export type HomeSectionRenderable = ComponentType<HomeSectionComponentProps>;

function selectHomeSection(module: unknown, exportName: string): HomeSectionRenderable {
  return (module as Record<string, HomeSectionRenderable>)[exportName];
}

export async function loadHomeSection(sectionId: string): Promise<HomeSectionRenderable | null> {
  switch (sectionId) {
    case "quick-links":
      return import("@/components/sections/HomeQuickLinksSection").then((mod) =>
        selectHomeSection(mod, "HomeQuickLinksSection"),
      );
    case "smart-search":
      return import("@/components/sections/HomeSmartSearchSection").then((mod) =>
        selectHomeSection(mod, "HomeSmartSearchSection"),
      );
    case "regions":
      return import("@/components/sections/RegionsSection").then((mod) =>
        selectHomeSection(mod, "RegionsSection"),
      );
    case "categories":
      return import("@/components/sections/CategoriesSection").then((mod) =>
        selectHomeSection(mod, "CategoriesSection"),
      );
    case "curated":
      return import("@/components/sections/HomepageSignatureCollection").then((mod) =>
        selectHomeSection(mod, "HomepageSignatureCollection"),
      );
    case "cities":
      return import("@/components/sections/CitiesSection").then((mod) =>
        selectHomeSection(mod, "CitiesSection"),
      );
    case "all-cities":
      return import("@/components/sections/HomeAllCitiesSection").then((mod) =>
        selectHomeSection(mod, "HomeAllCitiesSection"),
      );
    case "featured-city":
      return import("@/components/sections/FeaturedCitySection").then((mod) =>
        selectHomeSection(mod, "FeaturedCitySection"),
      );
    case "vip":
      return import("@/components/sections/SignatureMapSection").then((mod) =>
        selectHomeSection(mod, "SignatureMapSection"),
      );
    case "all-listings":
      return import("@/components/sections/AllListingsSection").then((mod) =>
        selectHomeSection(mod, "AllListingsSection"),
      );
    case "algarve-guide":
      return import("@/components/sections/AlgarveGuideSection").then((mod) =>
        selectHomeSection(mod, "AlgarveGuideSection"),
      );
    case "newsletter":
      return import("@/components/sections/NewsletterSection").then((mod) =>
        selectHomeSection(mod, "NewsletterSection"),
      );
    case "cta":
      return import("@/components/sections/CTASection").then((mod) =>
        selectHomeSection(mod, "CTASection"),
      );
    case "trust":
      return import("@/components/sections/HomeTrustSection").then((mod) =>
        selectHomeSection(mod, "HomeTrustSection"),
      );
    default:
      return null;
  }
}

export async function loadHomeFinalEndcap(): Promise<HomeSectionRenderable> {
  return import("@/components/sections/HomeFinalEndcap").then((mod) =>
    selectHomeSection(mod, "HomeFinalEndcap"),
  );
}

export async function loadHomeFooter(): Promise<HomeSectionRenderable> {
  return import("@/components/layout/Footer").then((mod) =>
    selectHomeSection(mod, "Footer"),
  );
}
