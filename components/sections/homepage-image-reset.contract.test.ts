import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readWorkspaceFile(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("homepage CMS image reset guardrails", () => {
  it("does not keep static fallback artwork in homepage quick-link card metadata", () => {
    const source = readWorkspaceFile("lib/homeQuickLinks.ts");

    expect(source).not.toContain("fallbackImageUrl");
    expect(source).not.toContain("/home-quick-links/");
  });

  it("does not import hardcoded hero or region fallbacks into homepage surfaces", () => {
    const heroSource = readWorkspaceFile("components/sections/HeroSection.tsx");
    const regionsSource = readWorkspaceFile("components/sections/RegionsSection.tsx");

    expect(heroSource).not.toContain("heroAssets");
    expect(regionsSource).not.toContain("getRegionImageSet");
  });

  it("does not let stale CMS hero media override Home Page Editor media resets", () => {
    const source = readWorkspaceFile("components/sections/HeroSection.tsx");

    expect(source).toContain("Home Page Editor owns hero media");
    expect(source).toContain("getSafeCmsImageSrc(settings?.hero_poster_url)");
    expect(source).not.toContain("hasCmsHeroMediaOverride");
    expect(source).not.toContain('getCmsHeroMediaValue("hero.imageUrl")');
  });

  it("uses black empty-image mode for homepage city cards", () => {
    const source = readWorkspaceFile("components/sections/CitiesSection.tsx");

    expect(source).toContain('emptyImageMode="black"');
  });

  it("revalidates every localized homepage path after homepage media writes", () => {
    const helperSource = readWorkspaceFile("lib/server/revalidate-homepage.ts");
    const globalSettingsRoute = readWorkspaceFile("app/api/admin/global-settings/route.ts");
    const pageConfigRoute = readWorkspaceFile("app/api/admin/cms/page-config/route.ts");
    const taxonomyRoute = readWorkspaceFile("app/api/admin/taxonomy/[entity]/route.ts");

    expect(helperSource).toContain("SUPPORTED_LOCALES");
    expect(helperSource).toContain("addLocaleToPathname");
    expect(globalSettingsRoute).toContain("revalidateHomepageRoutes");
    expect(pageConfigRoute).toContain('pageId === "home"');
    expect(taxonomyRoute).toContain("revalidateHomepageForTaxonomy");
  });
});
