import { describe, expect, it } from "vitest";

import { buildLocalizedPath } from "@/lib/i18n/localized-routing";
import { MEGA_MENU_SECTIONS } from "@/lib/navigation/mega-menu";

function allMenuHrefs() {
  return MEGA_MENU_SECTIONS.flatMap((section) => [
    section.featuredHref,
    ...section.items.map((item) => item.href),
    ...(section.quickLinks ?? []).map((item) => item.href),
  ]);
}

describe("public header mega menu", () => {
  it("keeps Visit, Live, and Invest as the only top-level journeys", () => {
    expect(MEGA_MENU_SECTIONS.map((section) => section.id)).toEqual([
      "visit",
      "live",
      "invest",
    ]);
  });

  it("links Live to relocation and Invest to properties", () => {
    const live = MEGA_MENU_SECTIONS.find((section) => section.id === "live");
    const invest = MEGA_MENU_SECTIONS.find((section) => section.id === "invest");

    expect(live?.featuredHref).toEqual({ routeType: "static", routeKey: "relocation" });
    expect(invest?.featuredHref).toEqual({ routeType: "static", routeKey: "properties" });
  });

  it("does not expose placeholder hrefs", () => {
    for (const href of allMenuHrefs()) {
      const englishHref = buildLocalizedPath("en", href);
      expect(englishHref).toBeTruthy();
      expect(englishHref).not.toBe("#");
    }
  });

  it("localizes category route links through canonical route data", () => {
    const restaurants = MEGA_MENU_SECTIONS[0].items.find(
      (item) => item.labelKey === "categoryNames.restaurants",
    );

    expect(buildLocalizedPath("en", restaurants!.href)).toBe("/category/restaurants");
    expect(buildLocalizedPath("pt-pt", restaurants!.href)).toBe("/pt-pt/category/restaurantes");
  });
});
