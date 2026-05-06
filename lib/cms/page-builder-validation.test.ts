import { describe, expect, it } from "vitest";

import { CMS_PAGE_DEFINITION_MAP } from "@/lib/cms/pageBuilderRegistry";
import { validateCmsPageBuilderDraft } from "@/lib/cms/page-builder-validation";

describe("validateCmsPageBuilderDraft", () => {
  it("accepts a known page with known blocks and safe values", () => {
    const report = validateCmsPageBuilderDraft({
      pageId: "golf",
      locale: "en",
      pageDefinition: CMS_PAGE_DEFINITION_MAP.golf,
      pageConfig: {
        blocks: {
          hero: { enabled: true, order: 10 },
          discovery: {
            enabled: true,
            data: {
              cards: [{ tag: "coastal", title: "Coastal", href: "/en/golf/discover/coastal" }],
            },
          },
        },
        text: {
          "hero.title": "Golf in the Algarve",
          "meta.title": "Golf",
          "meta.description": "Golf courses in the Algarve.",
        },
      },
    });

    expect(report.valid).toBe(true);
    expect(report.errors).toHaveLength(0);
  });

  it("rejects unknown locales and unknown blocks", () => {
    const report = validateCmsPageBuilderDraft({
      pageId: "golf",
      locale: "xx",
      pageDefinition: CMS_PAGE_DEFINITION_MAP.golf,
      pageConfig: {
        blocks: {
          "rogue-block": { enabled: true },
        },
      },
    });

    expect(report.valid).toBe(false);
    expect(report.errors.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["INVALID_LOCALE", "UNKNOWN_BLOCK"]),
    );
  });

  it("rejects unsafe HTML and unsafe URL values", () => {
    const report = validateCmsPageBuilderDraft({
      pageId: "golf",
      locale: "en",
      pageDefinition: CMS_PAGE_DEFINITION_MAP.golf,
      pageConfig: {
        blocks: {
          discovery: {
            enabled: true,
            data: {
              title: "<script>alert(1)</script>",
              cards: [{ tag: "coastal", imageUrl: "javascript:alert(1)" }],
            },
          },
        },
      },
    });

    expect(report.valid).toBe(false);
    expect(report.errors.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["UNSAFE_HTML", "UNSAFE_URL"]),
    );
  });

  it("rejects missing referenced listing, city, and category ids when datasets are supplied", () => {
    const report = validateCmsPageBuilderDraft({
      pageId: "home",
      locale: "en",
      pageDefinition: CMS_PAGE_DEFINITION_MAP.home,
      cityIds: ["city-1"],
      categoryIds: ["category-1"],
      listingIds: ["listing-1"],
      pageConfig: {
        blocks: {
          cities: { data: { selectedCityIds: ["city-1", "missing-city"] } },
          curated: { data: { selectedListingIds: ["missing-listing"], categoryId: "missing-category" } },
        },
      },
    });

    expect(report.valid).toBe(false);
    expect(report.errors.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["UNKNOWN_CITY_ID", "UNKNOWN_LISTING_ID", "UNKNOWN_CATEGORY_ID"]),
    );
  });

  it("warns about unlocalized relative CTA links without blocking draft validity", () => {
    const report = validateCmsPageBuilderDraft({
      pageId: "golf",
      locale: "fr",
      pageDefinition: CMS_PAGE_DEFINITION_MAP.golf,
      pageConfig: {
        blocks: {
          cta: {
            enabled: true,
            data: {
              primaryHref: "/contact",
            },
          },
        },
      },
    });

    expect(report.valid).toBe(true);
    expect(report.warnings.map((issue) => issue.code)).toContain("UNLOCALIZED_LINK");
  });
});
