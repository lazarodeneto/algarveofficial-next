import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  join(process.cwd(), "legacy-pages/admin/cms/AdminTranslations.tsx"),
  "utf8",
);

describe("AdminTranslations locale sync safety", () => {
  it("does not persist English source strings as translated locale overrides", () => {
    expect(source).not.toContain("Object.assign(translated, batchObj)");
    expect(source).not.toContain("synced with English fallback");
  });

  it("reports incomplete syncs without marking the locale complete", () => {
    expect(source).toContain("sync incomplete");
    expect(source).toContain("remainingMissingKeys.length === 0");
  });
});
