import { describe, expect, it } from "vitest";

import {
  cmsText,
  isSafeHomeCtaHref,
  mergeHomeSectionCopyMaps,
  normalizeHomeSectionCopyMap,
} from "./home-section-copy";

describe("home section copy", () => {
  it("uses CMS text when present and translated fallback when empty", () => {
    expect(cmsText(" Browse the Algarve ", "Fallback")).toBe("Browse the Algarve");
    expect(cmsText("", "Fallback")).toBe("Fallback");
    expect(cmsText(null, "Fallback")).toBe("Fallback");
    expect(cmsText(undefined, "Fallback")).toBe("Fallback");
  });

  it("normalizes empty section copy fields to null", () => {
    expect(
      normalizeHomeSectionCopyMap({
        categories: {
          title: "  Browse  ",
          subtitle: "",
          ctaHref: "   ",
        },
      }),
    ).toEqual({
      categories: {
        eyebrow: null,
        title: "Browse",
        subtitle: null,
        description: null,
        ctaLabel: null,
        ctaHref: null,
        secondaryCtaLabel: null,
        secondaryCtaHref: null,
      },
    });
  });

  it("merges locale section copy over base copy", () => {
    expect(
      mergeHomeSectionCopyMaps(
        { categories: { title: "Browse", subtitle: "Base subtitle" } },
        { categories: { title: "Explorar" } },
      ).categories,
    ).toMatchObject({
      title: "Explorar",
      subtitle: "Base subtitle",
    });
  });

  it("validates CTA hrefs for home section copy", () => {
    expect(isSafeHomeCtaHref("#regions")).toBe(true);
    expect(isSafeHomeCtaHref("/visit")).toBe(true);
    expect(isSafeHomeCtaHref("/pt-pt/visit")).toBe(true);
    expect(isSafeHomeCtaHref("https://algarveofficial.com")).toBe(true);
    expect(isSafeHomeCtaHref("mailto:hello@example.com")).toBe(true);
    expect(isSafeHomeCtaHref("tel:+351123456789")).toBe(true);
    expect(isSafeHomeCtaHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHomeCtaHref("data:text/html,hello")).toBe(false);
  });
});
