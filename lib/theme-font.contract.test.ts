import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = process.cwd();

function read(relativePath: string) {
  return readFileSync(join(REPO_ROOT, relativePath), "utf8");
}

describe("theme font contract", () => {
  it("loads Inter in the root layout font variables", () => {
    const source = read("app/layout.tsx");
    expect(source).toContain("Inter");
    expect(source).toContain('variable: "--font-inter"');
  });

  it("loads Fira Sans for homepage quick-link titles", () => {
    const source = read("app/layout.tsx");
    expect(source).toContain("Fira_Sans");
    expect(source).toContain('variable: "--font-fira-sans"');
  });

  it("maps body sans token to Inter", () => {
    const source = read("index.css");
    expect(source).toContain("--font-sans: var(--font-inter), 'Inter', sans-serif;");
  });
});
