import type { Locale } from "@/lib/i18n/config";

export type CanonicalCategorySlug =
  | "accommodation"
  | "restaurants"
  | "beach-clubs"
  | "experiences"
  | "golf"
  | "events"
  | "family-attractions"
  | "wellness-spas"
  | "beaches"
  | "shopping"
  | "real-estate"
  | "concierge-services"
  | "transportation"
  | "security-services"
  | "architecture-design";

export const ALL_CANONICAL_SLUGS: CanonicalCategorySlug[] = [
  "accommodation",
  "restaurants",
  "beach-clubs",
  "experiences",
  "golf",
  "events",
  "family-attractions",
  "wellness-spas",
  "beaches",
  "shopping",
  "real-estate",
  "concierge-services",
  "transportation",
  "security-services",
  "architecture-design",
];

export const CATEGORY_URL_SLUGS: Record<CanonicalCategorySlug, Record<Locale, string>> = {
  accommodation: {
    en: "accommodation",
    "pt-pt": "alojamento",
    fr: "hebergement",
    de: "unterkunft",
    es: "alojamiento",
    it: "alloggio",
    nl: "accommodatie",
    sv: "boende",
    no: "overnatting",
    da: "overnatning",
  },
  restaurants: {
    en: "restaurants",
    "pt-pt": "restaurantes",
    fr: "restaurants",
    de: "restaurants",
    es: "restaurantes",
    it: "ristoranti",
    nl: "restaurants",
    sv: "restauranger",
    no: "restauranter",
    da: "restauranter",
  },
  "beach-clubs": {
    en: "beach-clubs",
    "pt-pt": "clubes-praia",
    fr: "clubs-plage",
    de: "strand-clubs",
    es: "clubes-playa",
    it: "club-spiaggia",
    nl: "strand-clubs",
    sv: "strand-klubbar",
    no: "strandklubber",
    da: "strandklubber",
  },
  experiences: {
    en: "experiences",
    "pt-pt": "experiencias",
    fr: "experiences",
    de: "erlebnisse",
    es: "experiencias",
    it: "esperienze",
    nl: "ervaringen",
    sv: "upplevelser",
    no: "opplevelser",
    da: "oplevelser",
  },
  golf: {
    en: "golf",
    "pt-pt": "golfe",
    fr: "golf",
    de: "golf",
    es: "golf",
    it: "golf",
    nl: "golf",
    sv: "golf",
    no: "golf",
    da: "golf",
  },
  events: {
    en: "events",
    "pt-pt": "eventos",
    fr: "evenements",
    de: "veranstaltungen",
    es: "eventos",
    it: "eventi",
    nl: "evenementen",
    sv: "evenemang",
    no: "arrangementer",
    da: "begivenheder",
  },
  "family-attractions": {
    en: "family-attractions",
    "pt-pt": "atracoes-familia",
    fr: "attractions-familiales",
    de: "familienattraktionen",
    es: "atracciones-familiares",
    it: "attrazioni-famigliari",
    nl: "familie-attracties",
    sv: "familjesajonheter",
    no: "familieattraksjoner",
    da: "familieattraktioner",
  },
  "wellness-spas": {
    en: "wellness-spas",
    "pt-pt": "bem-estar-spas",
    fr: "bien-etre-spas",
    de: "wellness-spas",
    es: "bienestar-spas",
    it: "benessere-spa",
    nl: "wellness-spas",
    sv: "wellness-spa",
    no: "wellness-spa",
    da: "wellness-spa",
  },
  beaches: {
    en: "beaches",
    "pt-pt": "praias",
    fr: "plages",
    de: "straende",
    es: "playas",
    it: "spiagge",
    nl: "stranden",
    sv: "strander",
    no: "strender",
    da: "strande",
  },
  shopping: {
    en: "shopping",
    "pt-pt": "compras",
    fr: "shopping",
    de: "shopping",
    es: "compras",
    it: "shopping",
    nl: "winkelen",
    sv: "shopping",
    no: "shopping",
    da: "shopping",
  },
  "real-estate": {
    en: "real-estate",
    "pt-pt": "imoveis",
    fr: "immobilier",
    de: "immobilien",
    es: "inmuebles",
    it: "immobili",
    nl: "vastgoed",
    sv: "fastigheter",
    no: "eiendom",
    da: "ejendom",
  },
  "concierge-services": {
    en: "concierge-services",
    "pt-pt": "servicos-concierge",
    fr: "services-concierge",
    de: "concierge-dienste",
    es: "servicios-concierge",
    it: "servizi-concierge",
    nl: "concierge-diensten",
    sv: "conciergetjanster",
    no: "concierge-tjenester",
    da: "concierge-tjenester",
  },
  transportation: {
    en: "transportation",
    "pt-pt": "transportes",
    fr: "transport",
    de: "transport",
    es: "transporte",
    it: "trasporti",
    nl: "vervoer",
    sv: "transport",
    no: "transport",
    da: "transport",
  },
  "security-services": {
    en: "security-services",
    "pt-pt": "servicos-seguranca",
    fr: "services-securite",
    de: "sicherheitsdienste",
    es: "servicios-seguridad",
    it: "servizi-sicurezza",
    nl: "beveiligingsdiensten",
    sv: "sakerhetstjanster",
    no: "sikkerhetstjenester",
    da: "sikkerhedstjenester",
  },
  "architecture-design": {
    en: "architecture-design",
    "pt-pt": "arquitetura-design",
    fr: "architecture-design",
    de: "architektur-design",
    es: "arquitectura-diseno",
    it: "architettura-design",
    nl: "architectuur-design",
    sv: "arkitektur-design",
    no: "arkitektur-design",
    da: "arkitektur-design",
  },
};

const _reverseIndex: Partial<Record<Locale, Record<string, CanonicalCategorySlug>>> = {};

function buildReverseIndex(locale: Locale): Record<string, CanonicalCategorySlug> {
  const map: Record<string, CanonicalCategorySlug> = {};
  for (const [canonical, localeMap] of Object.entries(CATEGORY_URL_SLUGS)) {
    const urlSlug = localeMap[locale];
    if (urlSlug) map[urlSlug] = canonical as CanonicalCategorySlug;
  }
  return map;
}

export function getCanonicalFromUrlSlug(
  urlSlug: string,
  locale: Locale,
): CanonicalCategorySlug | null {
  if (!_reverseIndex[locale]) {
    _reverseIndex[locale] = buildReverseIndex(locale);
  }
  return _reverseIndex[locale]![urlSlug] ?? null;
}

export function getCategoryUrlSlug(
  canonical: CanonicalCategorySlug,
  locale: Locale,
): string {
  return CATEGORY_URL_SLUGS[canonical][locale] ?? CATEGORY_URL_SLUGS[canonical].en;
}

export const CATEGORY_DISPLAY_NAMES: Record<CanonicalCategorySlug, Record<Locale, string>> = {
  accommodation: {
    en: "Accommodation",
    "pt-pt": "Alojamento",
    fr: "Hébergement",
    de: "Unterkunft",
    es: "Alojamiento",
    it: "Alloggio",
    nl: "Accommodatie",
    sv: "Boende",
    no: "Overnatting",
    da: "Overnatning",
  },
  restaurants: {
    en: "Restaurants",
    "pt-pt": "Restaurantes",
    fr: "Restaurants",
    de: "Restaurants",
    es: "Restaurantes",
    it: "Ristoranti",
    nl: "Restaurants",
    sv: "Restauranger",
    no: "Restauranter",
    da: "Restauranter",
  },
  "beach-clubs": {
    en: "Beach Clubs",
    "pt-pt": "Clubes de Praia",
    fr: "Clubs de Plage",
    de: "Strand-Clubs",
    es: "Clubes de Playa",
    it: "Club Spiaggia",
    nl: "Strand-Clubs",
    sv: "Strand-klubbar",
    no: "Strandklubber",
    da: "Strandklubber",
  },
  experiences: {
    en: "Experiences",
    "pt-pt": "Experiências",
    fr: "Expériences",
    de: "Erlebnisse",
    es: "Experiencias",
    it: "Esperienze",
    nl: "Ervaringen",
    sv: "Upplevelser",
    no: "Opplevelser",
    da: "Oplevelser",
  },
  golf: {
    en: "Golf",
    "pt-pt": "Golfe",
    fr: "Golf",
    de: "Golf",
    es: "Golf",
    it: "Golf",
    nl: "Golf",
    sv: "Golf",
    no: "Golf",
    da: "Golf",
  },
  events: {
    en: "Events",
    "pt-pt": "Eventos",
    fr: "Événements",
    de: "Veranstaltungen",
    es: "Eventos",
    it: "Eventi",
    nl: "Evenementen",
    sv: "Evenemang",
    no: "Arrangementer",
    da: "Begivenheder",
  },
  "family-attractions": {
    en: "Family Attractions",
    "pt-pt": "Atrações Familiares",
    fr: "Attractions Familiales",
    de: "Familienattraktionen",
    es: "Atracciones Familiares",
    it: "Attrazioni Famigliari",
    nl: "Familie-Attracties",
    sv: "Familjesajonheter",
    no: "Familieattraksjoner",
    da: "Familieattraktioner",
  },
  "wellness-spas": {
    en: "Wellness & Spas",
    "pt-pt": "Bem-estar & Spas",
    fr: "Bien-être & Spas",
    de: "Wellness & Spas",
    es: "Bienestar & Spas",
    it: "Benessere & Spa",
    nl: "Wellness & Spa's",
    sv: "Wellness & Spa",
    no: "Wellness & Spa",
    da: "Wellness & Spa",
  },
  beaches: {
    en: "Beaches",
    "pt-pt": "Praias",
    fr: "Plages",
    de: "Strände",
    es: "Playas",
    it: "Spiagge",
    nl: "Stranden",
    sv: "Stränder",
    no: "Strender",
    da: "Strande",
  },
  shopping: {
    en: "Shopping",
    "pt-pt": "Compras",
    fr: "Shopping",
    de: "Shopping",
    es: "Compras",
    it: "Shopping",
    nl: "Winkelen",
    sv: "Shopping",
    no: "Shopping",
    da: "Shopping",
  },
  "real-estate": {
    en: "Real Estate",
    "pt-pt": "Imóveis",
    fr: "Immobilier",
    de: "Immobilien",
    es: "Inmuebles",
    it: "Immobili",
    nl: "Vastgoed",
    sv: "Fastigheter",
    no: "Eiendom",
    da: "Ejendom",
  },
  "concierge-services": {
    en: "Concierge Services",
    "pt-pt": "Serviços de Concierge",
    fr: "Services Concierge",
    de: "Concierge-Dienste",
    es: "Servicios Concierge",
    it: "Servizi Concierge",
    nl: "Concierge-diensten",
    sv: "Conciärgetjänster",
    no: "Concierge-tjenester",
    da: "Concierge-tjenester",
  },
  transportation: {
    en: "Transportation",
    "pt-pt": "Transportes",
    fr: "Transport",
    de: "Transport",
    es: "Transporte",
    it: "Trasporti",
    nl: "Vervoer",
    sv: "Transport",
    no: "Transport",
    da: "Transport",
  },
  "security-services": {
    en: "Security Services",
    "pt-pt": "Serviços de Segurança",
    fr: "Services de Sécurité",
    de: "Sicherheitsdienste",
    es: "Servicios de Seguridad",
    it: "Servizi di Sicurezza",
    nl: "Beveiligingsdiensten",
    sv: "Säkerhetstjänster",
    no: "Sikkerhetstjenester",
    da: "Sikkerhedstjenester",
  },
  "architecture-design": {
    en: "Architecture & Design",
    "pt-pt": "Arquitetura & Design",
    fr: "Architecture & Design",
    de: "Architektur & Design",
    es: "Arquitectura & Diseño",
    it: "Architettura & Design",
    nl: "Architectuur & Design",
    sv: "Arkitektur & Design",
    no: "Arkitektur & Design",
    da: "Arkitektur & Design",
  },
};

export function getCategoryDisplayName(
  canonical: CanonicalCategorySlug,
  locale: Locale,
): string {
  return CATEGORY_DISPLAY_NAMES[canonical][locale] ?? CATEGORY_DISPLAY_NAMES[canonical].en;
}

export function getAllCategoryUrlSlugsForLocale(locale: Locale): string[] {
  return ALL_CANONICAL_SLUGS.map((slug) => getCategoryUrlSlug(slug, locale));
}
