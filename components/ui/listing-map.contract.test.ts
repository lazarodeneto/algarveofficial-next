import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();

describe("ListingMap marker icon", () => {
  it("uses a Lucide Sun marker instead of the legacy dot marker", () => {
    const source = readFileSync(join(REPO_ROOT, "components", "ui", "listing-map.tsx"), "utf8");

    expect(source).toContain('import { Sun } from "lucide-react"');
    expect(source).toContain("createElement(Sun");
    expect(source).toContain('color: "#ffffff"');
    expect(source).toContain("#f97316");
    expect(source).not.toContain(">•</span>");
  });
});
