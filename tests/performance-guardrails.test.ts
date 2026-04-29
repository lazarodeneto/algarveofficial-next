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
});
