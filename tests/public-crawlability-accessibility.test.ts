import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

const PUBLIC_SCAN_ROOTS = [
  "app/[locale]",
  "components/blog",
  "components/events",
  "components/golf",
  "components/layout",
  "components/map",
  "components/properties",
  "components/real-estate",
  "legacy-pages/public",
];

function read(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function collectSourceFiles(root: string): string[] {
  const absoluteRoot = join(repoRoot, root);
  if (!existsSync(absoluteRoot)) return [];

  const files: string[] = [];
  for (const entry of readdirSync(absoluteRoot)) {
    const absolutePath = join(absoluteRoot, entry);
    const stat = statSync(absolutePath);

    if (stat.isDirectory()) {
      files.push(...collectSourceFiles(relative(repoRoot, absolutePath)));
      continue;
    }

    if (/\.(tsx?|jsx?)$/.test(entry)) {
      files.push(absolutePath);
    }
  }

  return files;
}

describe("public crawlability and accessibility guardrails", () => {
  it("keeps the map page crawlable before the interactive map hydrates", () => {
    const mapPage = read("app/[locale]/map/page.tsx");
    const mapClient = read("components/map/MapClient.tsx");

    expect(mapPage).toContain("function MapServerShell");
    expect(mapPage).toContain('id="map-server-shell"');
    expect(mapPage).toContain("<MapServerShell");
    expect(mapPage).toContain("<MapClient");
    expect(mapClient).toContain('hideServerShell("map-server-shell")');
  });

  it("does not show fake or unresolved weather values in the header pill", () => {
    const source = read("components/layout/HeaderWeatherPill.tsx");

    expect(source).not.toContain('celsius: "--"');
    expect(source).not.toContain('fahrenheit: "--"');
    expect(source).toContain("weather.unavailable");
  });

  it("keeps the cookie consent banner hydration-safe by reading storage after mount", () => {
    const source = read("components/gdpr/CookieConsentDrawer.tsx");

    expect(source).toContain("useState(false)");
    expect(source).toContain("const storedConsent = getStoredCookieConsent();");
    expect(source).not.toContain("getInitialConsentState");
  });

  it("keeps the mobile menu out of the generic nav tree and exposes it as a modal dialog when open", () => {
    const source = read("components/layout/Header.tsx");

    expect(source).toContain('role="dialog"');
    expect(source).toContain('aria-modal="true"');
    expect(source).toContain('aria-label={t("nav.mobilePrimary")}');
  });

  it("uses semantic table captions and scoped headers for public tables touched by this audit", () => {
    const scorecard = read("components/golf/Scorecard.tsx");
    const pricing = read("components/partner/PricingFeaturesTable.tsx");
    const ownerPerformance = read("legacy-pages/owner/OwnerPerformance.tsx");

    for (const [name, source] of [
      ["scorecard", scorecard],
      ["pricing", pricing],
      ["ownerPerformance", ownerPerformance],
    ] as const) {
      expect(source, name).toContain("<caption");
      expect(source, name).toContain('scope="col"');
      expect(source, name).toContain('scope="row"');
    }
  });

  it("keeps listing detail pages from immediately replacing server-rendered listing data", () => {
    const source = read("components/listing/ListingDetailClient.tsx");

    expect(source).toContain("staleTime: Number.POSITIVE_INFINITY");
    expect(source).toContain("refetchOnMount: false");
    expect(source).toContain("refetchOnWindowFocus: false");
  });

  it("does not add empty or hash-only links to public source files", () => {
    const files = PUBLIC_SCAN_ROOTS.flatMap(collectSourceFiles);
    const violations: string[] = [];
    const emptyOrHashOnlyHref = /href\s*=\s*(?:\{\s*)?["']#?["'](?:\s*\})?/g;

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(emptyOrHashOnlyHref)) {
        violations.push(`${relative(repoRoot, file)} -> ${match[0]}`);
      }
    }

    expect(violations).toEqual([]);
  });
});
