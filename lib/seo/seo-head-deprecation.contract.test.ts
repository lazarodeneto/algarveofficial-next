import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = process.cwd();
const SCAN_ROOTS = ["app", "components", "legacy-pages", "hooks", "lib"] as const;
const SOURCE_EXTENSIONS = [".ts", ".tsx"] as const;

function walkFiles(dir: string, collector: string[]) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walkFiles(fullPath, collector);
      continue;
    }
    if (SOURCE_EXTENSIONS.some((ext) => fullPath.endsWith(ext))) {
      collector.push(fullPath);
    }
  }
}

describe("seo-head deprecation contract", () => {
  it("keeps SeoHead removed from runtime code paths", () => {
    const seoHeadPath = join(REPO_ROOT, "components", "seo", "SeoHead.tsx");
    expect(existsSync(seoHeadPath)).toBe(false);

    const sourceFiles: string[] = [];
    for (const root of SCAN_ROOTS) {
      const absoluteRoot = join(REPO_ROOT, root);
      if (existsSync(absoluteRoot)) {
        walkFiles(absoluteRoot, sourceFiles);
      }
    }

    const offenders: string[] = [];
    for (const filePath of sourceFiles) {
      if (filePath.endsWith("seo-head-deprecation.contract.test.ts")) continue;
      const source = readFileSync(filePath, "utf8");
      if (
        source.includes("/seo/SeoHead") ||
        source.includes('from "./SeoHead"') ||
        source.includes("from './SeoHead'") ||
        source.includes("<SeoHead")
      ) {
        offenders.push(relative(REPO_ROOT, filePath));
      }
    }

    expect(offenders).toEqual([]);
  });
});
