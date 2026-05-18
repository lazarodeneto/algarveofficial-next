import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

function walk(dir: string, files: string[] = []) {
  for (const entry of readdirSync(dir)) {
    if ([".git", ".next", "node_modules", "playwright-report", "test-results"].includes(entry)) {
      continue;
    }

    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

describe("performance guardrails", () => {
  it("keeps the homepage hero image on the optimized priority path", () => {
    const source = readFileSync(join(repoRoot, "components/sections/HeroSection.tsx"), "utf8");

    expect(source).toContain('sizes="100vw"');
    expect(source).toContain('fetchPriority={priority ? "high" : "auto"}');
    expect(source).toContain('loading={priority ? "eager" : "lazy"}');
    expect(source).toContain("priority={true}");
    expect(source).not.toMatch(/rel=["']preload["'][^>]+supabase\.co/i);
  });

  it("keeps homepage media payload progressive and optimized", () => {
    const heroSource = readFileSync(join(repoRoot, "components/sections/HeroSection.tsx"), "utf8");
    const ctaSource = readFileSync(join(repoRoot, "components/sections/CTASection.tsx"), "utf8");

    expect(heroSource).toContain('preload="none"');
    expect(heroSource).toContain("canEnhanceHeroVideo");
    expect(heroSource).toContain("getPrefersReducedData");
    expect(heroSource).not.toContain('window.matchMedia("(max-width: 1023px)")');
    expect(heroSource).toContain("prefers-reduced-motion: reduce");
    expect(ctaSource).toContain('src="/images/home/algarveofficial-join.webp"');
    expect(ctaSource).toContain('alt=""');
    expect(ctaSource).toContain('aria-hidden="true"');
    expect(ctaSource).toContain('sizes="(max-width: 1024px) 100vw, 42vw"');
    expect(ctaSource).toContain("quality={56}");
    expect(ctaSource).not.toContain("algarveofficial-join.jpg");
    expect(ctaSource).not.toContain("priority={true}");
  });

  it("keeps locale JSON imports isolated to the dynamic locale loader", () => {
    const offenders = walk(repoRoot)
      .filter((file) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file))
      .filter((file) => relative(repoRoot, file) !== "i18n/locale-loader.ts")
      .filter((file) => {
        const source = readFileSync(file, "utf8");
        return /from\s+["'][^"']*i18n\/locales\/[^"']+\.json["']/.test(source) ||
          /import\(["'][^"']*i18n\/locales\/[^"']+\.json["']\)/.test(source) ||
          /from\s+["']\.\/locales\/[^"']+\.json["']/.test(source) ||
          /import\(["']\.\/locales\/[^"']+\.json["']\)/.test(source);
      })
      .map((file) => relative(repoRoot, file));

    expect(offenders).toEqual([]);
  });

  it("keeps directory listing fetches bounded and summary-only", () => {
    const directoryClient = readFileSync(join(repoRoot, "components/directory/DirectoryClient.tsx"), "utf8");
    const directoryData = readFileSync(join(repoRoot, "lib/directory-data.ts"), "utf8");

    expect(directoryClient).toContain("DIRECTORY_CLIENT_LISTING_LIMIT = 60");
    expect(directoryClient).toContain("PUBLIC_LISTING_SUMMARY_FIELDS");
    expect(directoryClient).not.toContain("pageSize = 1000");
    expect(directoryData).toContain("DIRECTORY_INITIAL_LISTING_LIMIT = 60");
    expect(directoryData).toContain("PUBLIC_LISTING_SUMMARY_FIELDS");
  });

  it("keeps the homepage critical payload bounded and cacheable", () => {
    const homepageData = readFileSync(join(repoRoot, "lib/homepage-data.ts"), "utf8");
    const cmsRuntime = readFileSync(join(repoRoot, "lib/cms/runtime-settings.ts"), "utf8");
    const globalSettings = readFileSync(join(repoRoot, "hooks/useGlobalSettings.ts"), "utf8");

    const criticalStateStart = homepageData.indexOf("export async function getDehydratedHomeCriticalState");
    expect(criticalStateStart).toBeGreaterThan(-1);
    const criticalStateSource = homepageData.slice(criticalStateStart);

    expect(homepageData).toContain("HOMEPAGE_LISTING_CANDIDATE_GROUP_LIMIT");
    expect(homepageData).toContain("fetchHomepageListingCandidates");
    expect(criticalStateSource).not.toContain("publishedListingsQueryKey({}, resolvedLocale)");
    expect(criticalStateSource).not.toContain("fetchPublishedListings(supabase, resolvedLocale)");
    expect(cmsRuntime).toContain("if (includeDraft)");
    expect(globalSettings).toContain('refetchOnMount: isCmsPreviewRuntime ? "always" : false');
  });

  it("defers non-critical homepage client work during the initial viewport", () => {
    const indexSource = readFileSync(join(repoRoot, "components/Index.tsx"), "utf8");
    const quickLinksSource = readFileSync(join(repoRoot, "components/sections/HomeQuickLinksSection.tsx"), "utf8");
    const weatherSource = readFileSync(join(repoRoot, "components/layout/HeaderWeatherPill.tsx"), "utf8");
    const headerSource = readFileSync(join(repoRoot, "components/layout/Header.tsx"), "utf8");
    const maintenanceSource = readFileSync(join(repoRoot, "components/MaintenanceGuard.tsx"), "utf8");

    expect(indexSource).toContain("DeferredHomeSection");
    expect(indexSource).toContain('const CRITICAL_HOME_SECTION_IDS = new Set(["quick-links", "smart-search"])');
    expect(quickLinksSource).toContain("canLoadDecorativeVideo");
    expect(quickLinksSource).toContain('preload="none"');
    expect(weatherSource).toContain("loadMediaQuery");
    expect(headerSource).toContain("(min-width: 1280px) and (max-width: 1439.98px)");
    expect(headerSource).toContain("(min-width: 1440px)");
    expect(maintenanceSource).toContain("scheduleMaintenanceSettingsCheck");
    expect(maintenanceSource).toContain("enabled: settingsCheckEnabled");
  });
});
