import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();
const HOME_PAGE_PATH = join(REPO_ROOT, "components", "Index.tsx");
const ADMIN_HOME_CMS_PATH = join(
  REPO_ROOT,
  "legacy-pages",
  "admin",
  "cms",
  "AdminHomePage.tsx",
);

describe("home CMS editor public rendering contract", () => {
  it("honors every dedicated Home CMS section toggle on the public homepage", () => {
    const source = readFileSync(HOME_PAGE_PATH, "utf8");

    [
      "show_regions_section",
      "show_categories_section",
      "show_curated_section",
      "show_cities_section",
      "show_vip_section",
      "show_all_listings_section",
      "show_cta_section",
    ].forEach((settingKey) => {
      expect(source).toContain(settingKey);
    });

    expect(source).toContain('categories: "quick-links"');
    expect(source).toContain('cities: "all-cities"');
    expect(source).toContain("getHomeSectionCopy(settings?.section_copy, id)");
    expect(source).toContain("quickLinksSection");
    expect(source).toContain("remainingSections");
  });

  it("hydrates localized Home section copy on the public homepage", () => {
    const source = readFileSync(join(REPO_ROOT, "lib", "homepage-data.ts"), "utf8");

    expect(source).toContain("section_copy");
    expect(source).toContain("mergeHomeSectionCopyMaps");
    expect(source).toContain("homepageSettingsQueryKey(resolvedLocale)");
  });

  it("exposes only publicly-connected Home section copy fields in the editor", () => {
    const source = readFileSync(ADMIN_HOME_CMS_PATH, "utf8");

    expect(source).toContain("SECTION_COPY_FIELDS");
    expect(source).toContain("categories:");
    expect(source).toContain("Home Quick Link Cards");
    expect(source).toContain("defaultSections.map(section");
    expect(source).toContain('"all-listings":');
    expect(source).toContain("Copy editable");
    expect(source).toContain("Dynamic data preserved");
    expect(source).toContain("Restore section copy defaults");
  });

  it("does not expose YouTube as a connected Home hero media mode", () => {
    const source = readFileSync(ADMIN_HOME_CMS_PATH, "utf8");

    expect(source).toContain('<RadioGroupItem value="youtube" id="media-youtube" disabled />');
    expect(source).toContain("public homepage no longer embeds YouTube media");
  });
});
