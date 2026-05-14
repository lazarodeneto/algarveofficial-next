import { describe, expect, it } from "vitest";

import {
  BEST_THINGS_TO_DO_ALGARVE_ARTICLE_SLUG,
  FAMILY_ATTRACTIONS_ALGARVE_ARTICLE_SLUG,
  GOLF_ALGARVE_ARTICLE_SLUG,
  getFamilyAttractionsMentionedListingSlugs,
  getGolfMentionedListingSlugs,
  getBestBeachesMentionedListingSlugs,
  isBestBeachesArticleSlug,
  shouldLinkBeachListingsInArticle,
  shouldLinkFamilyAttractionsInArticle,
  shouldLinkGolfListingsInArticle,
  WHERE_TO_STAY_ALGARVE_ARTICLE_SLUG,
} from "@/lib/blog/best-beaches-guide";

describe("best beaches guide linking", () => {
  it("recognizes both best-beaches article slugs", () => {
    expect(isBestBeachesArticleSlug("best-beaches-in-the-algarve")).toBe(true);
    expect(isBestBeachesArticleSlug("best-beaches-algarve-portugal")).toBe(true);
    expect(isBestBeachesArticleSlug(WHERE_TO_STAY_ALGARVE_ARTICLE_SLUG)).toBe(false);
    expect(isBestBeachesArticleSlug(BEST_THINGS_TO_DO_ALGARVE_ARTICLE_SLUG)).toBe(false);
    expect(isBestBeachesArticleSlug(GOLF_ALGARVE_ARTICLE_SLUG)).toBe(false);
    expect(isBestBeachesArticleSlug(FAMILY_ATTRACTIONS_ALGARVE_ARTICLE_SLUG)).toBe(false);
    expect(isBestBeachesArticleSlug("unrelated-article")).toBe(false);
  });

  it("enables inline beach links for non-beach-guide articles without making them beach guides", () => {
    expect(shouldLinkBeachListingsInArticle(WHERE_TO_STAY_ALGARVE_ARTICLE_SLUG)).toBe(true);
    expect(shouldLinkBeachListingsInArticle(BEST_THINGS_TO_DO_ALGARVE_ARTICLE_SLUG)).toBe(true);
    expect(shouldLinkBeachListingsInArticle(GOLF_ALGARVE_ARTICLE_SLUG)).toBe(true);
    expect(shouldLinkBeachListingsInArticle(FAMILY_ATTRACTIONS_ALGARVE_ARTICLE_SLUG)).toBe(true);
  });

  it("enables inline golf links for the golf guide", () => {
    expect(shouldLinkGolfListingsInArticle(GOLF_ALGARVE_ARTICLE_SLUG)).toBe(true);
    expect(shouldLinkGolfListingsInArticle(BEST_THINGS_TO_DO_ALGARVE_ARTICLE_SLUG)).toBe(false);
  });

  it("enables inline family-attraction links for the family guide", () => {
    expect(shouldLinkFamilyAttractionsInArticle(FAMILY_ATTRACTIONS_ALGARVE_ARTICLE_SLUG)).toBe(true);
    expect(shouldLinkFamilyAttractionsInArticle(BEST_THINGS_TO_DO_ALGARVE_ARTICLE_SLUG)).toBe(false);
  });

  it("returns mentioned listing slugs in article mention order", () => {
    expect(
      getBestBeachesMentionedListingSlugs([
        "Start at Praia da Marinha, continue to Ilha Deserta, then finish at Praia da Rocha.",
      ]),
    ).toEqual([
      "praia-da-marinha-lagoa",
      "praia-da-ilha-deserta-barreta-faro",
      "praia-da-rocha-portimao",
    ]);
  });

  it("does not include beach listings that are absent from the article text", () => {
    expect(getBestBeachesMentionedListingSlugs(["A guide to quiet Ria Formosa boat days."])).toEqual([]);
  });

  it("detects article-related Albufeira and Lagoa beach listings", () => {
    expect(
      getBestBeachesMentionedListingSlugs([
        "Use Albufeira for Praia dos Pescadores, Praia da Oura, São Rafael and Galé.",
        "Choose Lagoa for Praia do Carvoeiro and nearby Praia da Marinha.",
      ]),
    ).toEqual([
      "praia-dos-pescadores-albufeira",
      "praia-da-oura-albufeira",
      "praia-de-sao-rafael-albufeira",
      "praia-da-gale-albufeira",
      "praia-do-carvoeiro-lagoa",
      "praia-da-marinha-lagoa",
    ]);
  });

  it("detects article-related activity guide beach listings", () => {
    expect(
      getBestBeachesMentionedListingSlugs([
        "Try Ponta da Piedade, Praia do Tonel, Beliche, Arrifana, Odeceixe and Tavira Island.",
      ]),
    ).toEqual([
      "praia-do-tonel-vila-do-bispo",
      "praia-do-beliche-vila-do-bispo",
      "praia-da-arrifana-aljezur",
      "praia-de-odeceixe-aljezur",
      "praia-da-ilha-de-tavira",
    ]);
  });

  it("uses canonical listing slugs for category-section beach names", () => {
    expect(
      getBestBeachesMentionedListingSlugs([
        "Praia da Falésia, Meia Praia, Praia de Albandeira and Praia de Cacela Velha.",
      ]),
    ).toEqual([
      "praia-da-falesia-albufeira",
      "meia-praia-lagos",
      "praia-da-albandeira-lagoa",
      "praia-de-cacela-velha-fabrica-mar",
    ]);
  });

  it("detects article-related golf course listings", () => {
    expect(
      getGolfMentionedListingSlugs([
        "Start with The Old Course Vilamoura, then play Quinta do Lago South Course, Palmares, Penina and Monte Rei.",
      ]),
    ).toEqual([
      "vilamoura-old-course",
      "quinta-do-lago-golf",
      "quinta-do-lago-south-course",
      "palmares-golf",
      "penina-championship",
      "monte-rei-north-course",
    ]);
  });

  it("detects article-related family attraction listings", () => {
    expect(
      getFamilyAttractionsMentionedListingSlugs([
        "Plan Zoomarine, Slide & Splash, Aquashow, Aqualand Algarve, Lagos Zoo, Krazy World, SandCity, Parque Aventura, Karting Almancil, Centro Ciência Viva do Algarve and Centro Ciência Viva de Lagos.",
      ]),
    ).toEqual([
      "zoomarine-algarve",
      "slide-splash-lagoa",
      "aquashow-park-quarteira",
      "aqualand-algarve-alcantarilha",
      "lagos-zoo",
      "krazy-world-algoz",
      "sandcity-lagoa",
      "parque-aventura-albufeira",
      "karting-almancil",
      "centro-ciencia-viva-algarve-faro",
      "centro-ciencia-viva-lagos",
    ]);
  });
});
