export const BEST_BEACHES_ARTICLE_SLUG = "best-beaches-in-the-algarve";
export const WHERE_TO_STAY_ALGARVE_ARTICLE_SLUG = "where-to-stay-in-the-algarve-portugal";
export const BEST_THINGS_TO_DO_ALGARVE_ARTICLE_SLUG = "best-things-to-do-algarve-portugal";
export const GOLF_ALGARVE_ARTICLE_SLUG = "golf-in-the-algarve-best-courses-areas-where-to-stay";
export const FAMILY_ATTRACTIONS_ALGARVE_ARTICLE_SLUG = "family-attractions-algarve-kids-guide";
export const BEST_BEACHES_ARTICLE_SLUGS = [
  BEST_BEACHES_ARTICLE_SLUG,
  "best-beaches-algarve-portugal",
] as const;
export const ARTICLE_BEACH_LINKING_SLUGS = [
  ...BEST_BEACHES_ARTICLE_SLUGS,
  WHERE_TO_STAY_ALGARVE_ARTICLE_SLUG,
  BEST_THINGS_TO_DO_ALGARVE_ARTICLE_SLUG,
  GOLF_ALGARVE_ARTICLE_SLUG,
  FAMILY_ATTRACTIONS_ALGARVE_ARTICLE_SLUG,
] as const;
export const ARTICLE_GOLF_LINKING_SLUGS = [
  GOLF_ALGARVE_ARTICLE_SLUG,
] as const;
export const ARTICLE_FAMILY_ATTRACTIONS_LINKING_SLUGS = [
  FAMILY_ATTRACTIONS_ALGARVE_ARTICLE_SLUG,
] as const;

export const BEST_BEACHES_RELATED_LISTING_SLUGS = [
  "praia-da-marinha-lagoa",
  "praia-da-falesia-albufeira",
  "praia-de-dona-ana-lagos",
  "praia-do-camilo-lagos",
  "praia-da-rocha-portimao",
  "praia-do-barril-tavira",
  "praia-da-ilha-deserta-barreta-faro",
  "praia-de-odeceixe-aljezur",
  "praia-de-benagil-lagoa",
  "praia-da-albandeira-lagoa",
  "praia-do-carvalho-lagoa",
  "praia-de-vale-centeanes-lagoa",
  "praia-da-ilha-de-tavira",
  "praia-da-arrifana-aljezur",
  "praia-do-amado-aljezur",
  "praia-de-cacela-velha-fabrica-mar",
  "meia-praia-lagos",
  "praia-dos-tres-castelos-portimao",
  "praia-do-vau-portimao",
  "praia-da-culatra-faro",
  "praia-da-armona-olhao",
  "praia-dos-pescadores-albufeira",
  "praia-da-oura-albufeira",
  "praia-de-sao-rafael-albufeira",
  "praia-da-gale-albufeira",
  "praia-do-carvoeiro-lagoa",
  "praia-do-ancao-loule",
  "praia-do-garrao-loule",
  "praia-de-quinta-do-lago-loule",
  "praia-de-vale-do-lobo-loule",
  "praia-do-tonel-vila-do-bispo",
  "praia-do-beliche-vila-do-bispo",
  "praia-da-bordeira-carrapateira-aljezur",
] as const;

export const BEST_BEACHES_LINK_ALIASES: Array<{
  slug: string;
  phrases: string[];
}> = [
  { slug: "praia-da-marinha-lagoa", phrases: ["Praia da Marinha", "Marinha Beach"] },
  { slug: "praia-da-falesia-albufeira", phrases: ["Praia da Falésia", "Praia da Falesia", "Falésia Beach", "Falesia Beach", "Falésia", "Falesia"] },
  { slug: "praia-de-benagil-lagoa", phrases: ["Praia de Benagil", "Benagil Beach"] },
  { slug: "praia-do-camilo-lagos", phrases: ["Praia do Camilo", "Camilo Beach"] },
  { slug: "praia-de-dona-ana-lagos", phrases: ["Praia da Dona Ana", "Praia de Dona Ana", "Praia Dona Ana", "Dona Ana Beach", "Dona Ana"] },
  { slug: "praia-dos-tres-castelos-portimao", phrases: ["Praia dos Três Castelos", "Praia dos Tres Castelos", "Três Castelos", "Tres Castelos"] },
  { slug: "praia-do-vau-portimao", phrases: ["Praia do Vau"] },
  { slug: "praia-do-barril-tavira", phrases: ["Praia do Barril", "Barril Beach"] },
  { slug: "praia-da-ilha-deserta-barreta-faro", phrases: ["Praia da Ilha Deserta / Barreta", "Praia da Ilha da Barreta", "Ilha Deserta", "Ilha da Barreta", "Barreta"] },
  { slug: "praia-de-odeceixe-aljezur", phrases: ["Praia de Odeceixe", "Odeceixe Beach", "Odeceixe"] },
  { slug: "praia-do-amado-aljezur", phrases: ["Praia do Amado", "Amado Beach"] },
  { slug: "praia-da-rocha-portimao", phrases: ["Praia da Rocha", "Rocha Beach"] },
  { slug: "praia-da-albandeira-lagoa", phrases: ["Praia da Albandeira", "Praia de Albandeira", "Albandeira Beach"] },
  { slug: "praia-do-carvalho-lagoa", phrases: ["Praia do Carvalho", "Carvalho Beach"] },
  { slug: "praia-de-vale-centeanes-lagoa", phrases: ["Praia de Vale de Centeanes", "Praia do Vale de Centeanes", "Vale de Centeanes"] },
  { slug: "praia-da-ilha-de-tavira", phrases: ["Praia da Ilha de Tavira", "Ilha de Tavira", "Tavira Island Beach", "Tavira Island"] },
  { slug: "praia-da-arrifana-aljezur", phrases: ["Praia da Arrifana", "Arrifana Beach", "Arrifana"] },
  { slug: "praia-de-cacela-velha-fabrica-mar", phrases: ["Praia de Cacela Velha", "Cacela Velha Beach"] },
  { slug: "meia-praia-lagos", phrases: ["Meia Praia"] },
  { slug: "praia-da-culatra-faro", phrases: ["Praia da Culatra", "Praia da Ilha da Culatra", "Ilha da Culatra", "Culatra"] },
  { slug: "praia-da-armona-olhao", phrases: ["Praia da Armona", "Praia da Ilha da Armona", "Ilha da Armona", "Armona"] },
  { slug: "praia-dos-pescadores-albufeira", phrases: ["Praia dos Pescadores", "Pescadores Beach"] },
  { slug: "praia-da-oura-albufeira", phrases: ["Praia da Oura", "Oura Beach"] },
  { slug: "praia-de-sao-rafael-albufeira", phrases: ["Praia de São Rafael", "Praia de Sao Rafael", "São Rafael Beach", "Sao Rafael Beach", "São Rafael", "Sao Rafael"] },
  { slug: "praia-da-gale-albufeira", phrases: ["Praia da Galé", "Praia da Gale", "Galé Beach", "Gale Beach", "Galé", "Gale"] },
  { slug: "praia-do-carvoeiro-lagoa", phrases: ["Praia do Carvoeiro", "Carvoeiro Beach"] },
  { slug: "praia-do-ancao-loule", phrases: ["Praia do Ancão", "Praia do Ancao", "Ancão Beach", "Ancao Beach", "Ancão", "Ancao"] },
  { slug: "praia-do-garrao-loule", phrases: ["Praia do Garrão", "Praia do Garrao", "Garrão Beach", "Garrao Beach", "Garrão", "Garrao"] },
  { slug: "praia-de-quinta-do-lago-loule", phrases: ["Praia de Quinta do Lago", "Praia da Quinta do Lago", "Quinta do Lago Beach"] },
  { slug: "praia-de-vale-do-lobo-loule", phrases: ["Praia de Vale do Lobo", "Vale do Lobo Beach"] },
  { slug: "praia-do-tonel-vila-do-bispo", phrases: ["Praia do Tonel", "Tonel Beach", "Tonel"] },
  { slug: "praia-do-beliche-vila-do-bispo", phrases: ["Praia do Beliche", "Beliche Beach", "Beliche"] },
  { slug: "praia-da-bordeira-carrapateira-aljezur", phrases: ["Praia da Bordeira", "Bordeira Beach"] },
];

export const GOLF_RELATED_LISTING_SLUGS = [
  "dom-pedro-golf-vilamoura",
  "vilamoura-old-course",
  "vilamoura-millennium",
  "quinta-do-lago-golf",
  "quinta-do-lago-south-course",
  "vale-do-lobo-golf",
  "palmares-golf",
  "penina-championship",
  "monte-rei-north-course",
] as const;

export const GOLF_LINK_ALIASES: Array<{
  slug: string;
  phrases: string[];
}> = [
  {
    slug: "dom-pedro-golf-vilamoura",
    phrases: ["Dom Pedro Golf Vilamoura", "Vilamoura Golf"],
  },
  {
    slug: "vilamoura-old-course",
    phrases: ["The Old Course Vilamoura", "Old Course Vilamoura", "Vilamoura Old Course", "The Old Course", "Old Course"],
  },
  {
    slug: "vilamoura-millennium",
    phrases: ["Vilamoura Millennium Course", "Millennium Golf Course", "Millennium Vilamoura", "Millennium Course", "Millennium"],
  },
  {
    slug: "quinta-do-lago-golf",
    phrases: ["Quinta do Lago Golf", "Quinta do Lago"],
  },
  {
    slug: "quinta-do-lago-south-course",
    phrases: ["Quinta do Lago South Course", "Quinta do Lago South", "South Course"],
  },
  {
    slug: "vale-do-lobo-golf",
    phrases: ["Vale do Lobo Golf Club", "Vale do Lobo Golf", "Vale do Lobo"],
  },
  {
    slug: "palmares-golf",
    phrases: ["Palmares Golf Course", "Palmares Golf", "Palmares"],
  },
  {
    slug: "penina-championship",
    phrases: ["Penina Sir Henry Cotton Championship Course", "Sir Henry Cotton Championship Course", "Penina Championship Course", "Penina Hotel & Golf Resort", "Penina"],
  },
  {
    slug: "monte-rei-north-course",
    phrases: ["Monte Rei North Course", "Monte Rei Golf & Country Club", "Monte Rei Golf and Country Club", "Monte Rei"],
  },
];

export const FAMILY_ATTRACTIONS_RELATED_LISTING_SLUGS = [
  "zoomarine-algarve",
] as const;

export const FAMILY_ATTRACTIONS_LINK_ALIASES: Array<{
  slug: string;
  phrases: string[];
}> = [
  {
    slug: "zoomarine-algarve",
    phrases: ["Zoomarine Algarve", "Zoomarine"],
  },
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeArticleSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getPhraseIndex(text: string, phrase: string) {
  const normalizedPhrase = normalizeArticleSearchText(phrase.trim());
  if (!normalizedPhrase) return -1;

  const match = new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedPhrase)}([^a-z0-9]|$)`).exec(text);
  if (!match || typeof match.index !== "number") return -1;

  return match.index + (match[1]?.length ?? 0);
}

function getMentionedListingSlugs(
  articleParts: Array<string | null | undefined>,
  linkAliases: Array<{ slug: string; phrases: string[] }>,
) {
  const articleText = normalizeArticleSearchText(articleParts.filter(Boolean).join(" "));

  return linkAliases
    .map((definition) => ({
      slug: definition.slug,
      index: Math.min(
        ...definition.phrases
          .map((phrase) => getPhraseIndex(articleText, phrase))
          .filter((index) => index >= 0),
      ),
    }))
    .filter((definition) => Number.isFinite(definition.index))
    .sort((left, right) => left.index - right.index)
    .map((definition) => definition.slug);
}

export function getBestBeachesMentionedListingSlugs(
  articleParts: Array<string | null | undefined>,
) {
  return getMentionedListingSlugs(articleParts, BEST_BEACHES_LINK_ALIASES);
}

export function getGolfMentionedListingSlugs(
  articleParts: Array<string | null | undefined>,
) {
  return getMentionedListingSlugs(articleParts, GOLF_LINK_ALIASES);
}

export function getFamilyAttractionsMentionedListingSlugs(
  articleParts: Array<string | null | undefined>,
) {
  return getMentionedListingSlugs(articleParts, FAMILY_ATTRACTIONS_LINK_ALIASES);
}

export function isBestBeachesArticleSlug(slug: string | null | undefined) {
  return BEST_BEACHES_ARTICLE_SLUGS.includes(
    String(slug ?? "") as (typeof BEST_BEACHES_ARTICLE_SLUGS)[number],
  );
}

export function shouldLinkBeachListingsInArticle(slug: string | null | undefined) {
  return ARTICLE_BEACH_LINKING_SLUGS.includes(
    String(slug ?? "") as (typeof ARTICLE_BEACH_LINKING_SLUGS)[number],
  );
}

export function shouldLinkGolfListingsInArticle(slug: string | null | undefined) {
  return ARTICLE_GOLF_LINKING_SLUGS.includes(
    String(slug ?? "") as (typeof ARTICLE_GOLF_LINKING_SLUGS)[number],
  );
}

export function shouldLinkFamilyAttractionsInArticle(slug: string | null | undefined) {
  return ARTICLE_FAMILY_ATTRACTIONS_LINKING_SLUGS.includes(
    String(slug ?? "") as (typeof ARTICLE_FAMILY_ATTRACTIONS_LINKING_SLUGS)[number],
  );
}

export function getBestBeachesRelatedOrder(slug: string) {
  const index = BEST_BEACHES_RELATED_LISTING_SLUGS.indexOf(
    slug as (typeof BEST_BEACHES_RELATED_LISTING_SLUGS)[number],
  );
  return index === -1 ? Number.POSITIVE_INFINITY : index;
}

export function getGolfRelatedOrder(slug: string) {
  const index = GOLF_RELATED_LISTING_SLUGS.indexOf(
    slug as (typeof GOLF_RELATED_LISTING_SLUGS)[number],
  );
  return index === -1 ? Number.POSITIVE_INFINITY : index;
}

export function getFamilyAttractionsRelatedOrder(slug: string) {
  const index = FAMILY_ATTRACTIONS_RELATED_LISTING_SLUGS.indexOf(
    slug as (typeof FAMILY_ATTRACTIONS_RELATED_LISTING_SLUGS)[number],
  );
  return index === -1 ? Number.POSITIVE_INFINITY : index;
}
