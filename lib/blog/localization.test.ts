import { describe, expect, it } from "vitest";

import { applyBlogTranslation } from "@/lib/blog/localization";

describe("applyBlogTranslation", () => {
  it("uses translated blog tags when available", () => {
    const localized = applyBlogTranslation(
      {
        id: "post-1",
        slug: "family-attractions-algarve-kids-guide",
        title: "Family Attractions",
        tags: ["family attractions in the Algarve", "Algarve with kids"],
      },
      {
        post_id: "post-1",
        locale: "pt-pt",
        title: "Atrações para Famílias",
        excerpt: null,
        tags: ["atrações para famílias no Algarve", "Algarve com crianças"],
        seo_title: null,
        seo_description: null,
      },
      "pt-pt",
    );

    expect(localized.tags).toEqual([
      "atrações para famílias no Algarve",
      "Algarve com crianças",
    ]);
  });

  it("keeps source tags when the translation has no usable tags", () => {
    const localized = applyBlogTranslation(
      {
        id: "post-1",
        slug: "family-attractions-algarve-kids-guide",
        title: "Family Attractions",
        tags: ["family attractions in the Algarve"],
      },
      {
        post_id: "post-1",
        locale: "fr",
        title: null,
        excerpt: null,
        tags: ["   "],
        seo_title: null,
        seo_description: null,
      },
      "fr",
    );

    expect(localized.tags).toEqual(["family attractions in the Algarve"]);
  });
});
