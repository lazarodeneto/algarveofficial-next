import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  join(process.cwd(), "legacy-pages/admin/cms/AdminTranslations.tsx"),
  "utf8",
);

describe("AdminTranslations locale sync safety", () => {
  it("labels English fallback syncs as pending manual when the processor is unavailable", () => {
    expect(source).not.toContain("Object.assign(translated, batchObj)");
    expect(source).toContain("pending_manual");
    expect(source).toContain("Missing keys were synced as pending/manual translation");
  });

  it("reports incomplete syncs without marking the locale complete", () => {
    expect(source).toContain("sync incomplete");
    expect(source).toContain("afterCoverage.isFullySynced");
  });
});
