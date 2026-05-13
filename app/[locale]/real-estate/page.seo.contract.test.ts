import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const PAGE_SOURCE = readFileSync(
  join(process.cwd(), "app", "[locale]", "real-estate", "page.tsx"),
  "utf8",
);

describe("real estate route SEO contract", () => {
  it("redirects the legacy /real-estate alias to the canonical /properties route", () => {
    expect(PAGE_SOURCE).toContain("permanentRedirect");
    expect(PAGE_SOURCE).toContain('buildLocalizedPath(locale, "/properties")');
  });

  it("does not render a duplicate indexable property directory", () => {
    expect(PAGE_SOURCE).not.toContain("RealEstateDirectoryClient");
    expect(PAGE_SOURCE).not.toContain("buildItemListSchema(");
  });
});
