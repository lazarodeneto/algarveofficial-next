import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const PAGE_SOURCE = readFileSync(
  join(process.cwd(), "app", "[locale]", "real-estate", "page.tsx"),
  "utf8",
);

describe("real estate route SEO contract", () => {
  it("keeps /properties as the canonical property directory", () => {
    expect(PAGE_SOURCE).toContain("buildLocalizedAliasMetadata");
    expect(PAGE_SOURCE).toContain('canonicalPath: "/properties"');
  });

  it("emits conservative collection JSON-LD for the canonical property list", () => {
    expect(PAGE_SOURCE).toContain("buildItemListSchema(");
    expect(PAGE_SOURCE).toContain("schema-real-estate-item-list");
    expect(PAGE_SOURCE).toContain("schema-real-estate-breadcrumb");
  });
});
