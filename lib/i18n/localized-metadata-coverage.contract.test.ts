import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const REPO_ROOT = process.cwd();
const LOCALE_ROOT = join(REPO_ROOT, "app", "[locale]");

const PUBLIC_LOCALIZED_PAGES = [
  "page.tsx",
  "about-us/page.tsx",
  "blog/page.tsx",
  "blog/[slug]/page.tsx",
  "contact/page.tsx",
  "cookie-policy/page.tsx",
  "destinations/page.tsx",
  "destinations/[slug]/page.tsx",
  "directory/page.tsx",
  "events/page.tsx",
  "events/[slug]/page.tsx",
  "experiences/page.tsx",
  "golf/page.tsx",
  "guides/[slug]/page.tsx",
  "invest/page.tsx",
  "listing/[id]/page.tsx",
  "live/page.tsx",
  "map/page.tsx",
  "partner/page.tsx",
  "pricing/page.tsx",
  "privacy-policy/page.tsx",
  "properties/page.tsx",
  "real-estate/page.tsx",
  "stay/page.tsx",
  "terms/page.tsx",
  "trips/page.tsx",
  "visit/page.tsx",
  "visit/[city]/page.tsx",
  "visit/[city]/[category]/page.tsx",
  "[city]/[category]/page.tsx",
] as const;

function fileHasMetadataExport(filePath: string) {
  const source = readFileSync(filePath, "utf8");
  return (
    source.includes("export async function generateMetadata") ||
    source.includes("export function generateMetadata") ||
    source.includes("export const metadata")
  );
}

function hasRouteLevelMetadata(pageFilePath: string) {
  if (fileHasMetadataExport(pageFilePath)) {
    return true;
  }

  const layoutPath = join(dirname(pageFilePath), "layout.tsx");
  return existsSync(layoutPath) ? fileHasMetadataExport(layoutPath) : false;
}

describe("localized metadata coverage contract", () => {
  it("ensures every public localized route has page or route-level metadata exports", () => {
    const missingCoverage: string[] = [];

    for (const page of PUBLIC_LOCALIZED_PAGES) {
      const absolutePagePath = join(LOCALE_ROOT, page);
      expect(existsSync(absolutePagePath), `Missing expected route file: ${page}`).toBe(true);

      if (!hasRouteLevelMetadata(absolutePagePath)) {
        missingCoverage.push(relative(REPO_ROOT, absolutePagePath));
      }
    }

    expect(missingCoverage).toEqual([]);
  });
});
