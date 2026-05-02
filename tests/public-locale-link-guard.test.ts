import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const PUBLIC_ROUTE_PREFIXES = [
  "listing",
  "listings",
  "visit",
  "category",
  "city",
  "directory",
  "map",
  "golf",
  "properties",
  "real-estate",
  "stay",
  "experiences",
  "destinations",
  "relocation",
];

const SCANNED_ROOTS = [
  "components/golf",
  "components/listing",
  "components/partner",
  "components/properties",
  "app/[locale]/golf",
  "app/[locale]/listing",
  "app/[locale]/partner",
  "app/[locale]/properties",
];

const ALLOWED_PREFIXES = [
  "/api",
  "/admin",
  "/owner",
  "/_next",
  "/images",
  "/favicon",
  "/robots.txt",
  "/sitemap.xml",
];

function collectSourceFiles(root: string): string[] {
  if (!existsSync(root)) return [];
  const files: string[] = [];

  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...collectSourceFiles(path));
      continue;
    }

    if (/\.(tsx?|jsx?)$/.test(entry)) {
      files.push(path);
    }
  }

  return files;
}

function isAllowedInternalHref(href: string): boolean {
  if (
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.includes("supabase") ||
    href.includes("storage")
  ) {
    return true;
  }

  return ALLOWED_PREFIXES.some((prefix) => href.startsWith(prefix));
}

describe("public locale link guard", () => {
  it("keeps touched public links behind localized route builders", () => {
    const files = SCANNED_ROOTS.flatMap(collectSourceFiles);
    const publicRoutePattern = PUBLIC_ROUTE_PREFIXES.join("|");
    const rawInternalLinkPattern = new RegExp(
      String.raw`(?:href\s*=\s*\{\s*["'\`](/(?:${publicRoutePattern})(?:[/?#][^"'\`}]*)?)["'\`]|href\s*=\s*["'\`](/(?:${publicRoutePattern})(?:[/?#][^"'\`]*)?)["'\`]|router\.(?:push|replace)\(\s*["'\`](/(?:${publicRoutePattern})(?:[/?#][^"'\`]*)?)["'\`])`,
      "g",
    );

    const violations: string[] = [];

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(rawInternalLinkPattern)) {
        const href = match[1] ?? match[2] ?? match[3];
        if (!href || isAllowedInternalHref(href)) continue;
        violations.push(`${relative(process.cwd(), file)} -> ${href}`);
      }
    }

    expect(violations).toEqual([]);
  });
});
