import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();

describe("listing map popup CTA", () => {
  it("uses the app green action styling for map popup View Details links", () => {
    const source = readFileSync(
      join(REPO_ROOT, "components", "map", "ListingsLeafletMap.tsx"),
      "utf8",
    );

    expect(source).toContain("bg-green-600");
    expect(source).toContain("hover:bg-green-700");
    expect(source).toContain("shadow-green-600/20");
    expect(source).not.toContain("rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground");
  });
});
