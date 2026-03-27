import type { Locale } from "@/lib/i18n/config";

/**
 * Canonical slugs are the DB-level slugs used by the categories table.
 * URL slugs are locale-specific, SEO-friendly slugs used in the programmatic URL:
 *   /{locale}/{url-slug}/{city}
 */
export type CanonicalCategorySlug =
  | "restaurants"
  | "places-to-stay"
  | "golf"
  | "things-to-do"
  | "beaches-clubs"
  | "wellness-spas"
  | "shopping-boutiques"
  | "algarve-services"
  | "whats-on";

export const ALL_CANONICAL_SLUGS: CanonicalCategorySlug[] = [
  "restaurants",
  "places-to-stay",
  "golf",
  "things-to-do",
  "beaches-clubs",
  "wellness-spas",
  "shopping-boutiques",
  "algarve-services",
  "whats-on",
];

/**
 * Bidirectional URL slug map.
 * canonical DB slug → { locale → URL-visible slug }
 *
 * Design rules:
 * - English uses clean, short, high-volume keywords
 * - Other locales use the native-language equivalent
 * - All slugs are lowercase, hyphen-separated, URL-safe
 */
export const CATEGORY_URL_SLUGS: Record<CanonicalCategorySlug, Record<Locale, string>> = {
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
  "places-to-stay": {
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
  "things-to-do": {
    en: "activities",
    "pt-pt": "atividades",
    fr: "activites",
    de: "aktivitaeten",
    es: "actividades",
    it: "attivita",
    nl: "activiteiten",
    sv: "aktiviteter",
    no: "aktiviteter",
    da: "aktiviteter",
  },
  "beaches-clubs": {
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
  "wellness-spas": {
    en: "wellness",
    "pt-pt": "bem-estar",
    fr: "bien-etre",
    de: "wellness",
    es: "bienestar",
    it: "benessere",
    nl: "wellness",
    sv: "wellness",
    no: "wellness",
    da: "wellness",
  },
  "shopping-boutiques": {
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
  "algarve-services": {
    en: "services",
    "pt-pt": "servicos",
    fr: "services",
    de: "dienstleistungen",
    es: "servicios",
    it: "servizi",
    nl: "diensten",
    sv: "tjanster",
    no: "tjenester",
    da: "tjenester",
  },
  "whats-on": {
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
};

/**
 * Reverse index: for a given locale, maps URL slug → canonical slug.
 * Built lazily; used for fast lookups in page params.
 */
const _reverseIndex: Partial<Record<Locale, Record<string, CanonicalCategorySlug>>> = {};

function buildReverseIndex(locale: Locale): Record<string, CanonicalCategorySlug> {
  const map: Record<string, CanonicalCategorySlug> = {};
  for (const [canonical, localeMap] of Object.entries(CATEGORY_URL_SLUGS)) {
    const urlSlug = localeMap[locale];
    if (urlSlug) map[urlSlug] = canonical as CanonicalCategorySlug;
  }
  return map;
}

/**
 * Convert a locale URL slug → canonical DB slug.
 * Returns null if the slug is not a valid programmatic category.
 */
export function getCanonicalFromUrlSlug(
  urlSlug: string,
  locale: Locale,
): CanonicalCategorySlug | null {
  if (!_reverseIndex[locale]) {
    _reverseIndex[locale] = buildReverseIndex(locale);
  }
  return _reverseIndex[locale]![urlSlug] ?? null;
}

/**
 * Convert canonical slug → locale-specific URL slug.
 */
export function getCategoryUrlSlug(
  canonical: CanonicalCategorySlug,
  locale: Locale,
): string {
  return CATEGORY_URL_SLUGS[canonical][locale] ?? CATEGORY_URL_SLUGS[canonical].en;
}

/**
 * Human-readable display names per canonical slug and locale.
 */
export const CATEGORY_DISPLAY_NAMES: Record<CanonicalCategorySlug, Record<Locale, string>> = {
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
  "places-to-stay": {
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
  "things-to-do": {
    en: "Activities",
    "pt-pt": "Atividades",
    fr: "Activités",
    de: "Aktivitäten",
    es: "Actividades",
    it: "Attività",
    nl: "Activiteiten",
    sv: "Aktiviteter",
    no: "Aktiviteter",
    da: "Aktiviteter",
  },
  "beaches-clubs": {
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
  "shopping-boutiques": {
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
  "algarve-services": {
    en: "Services",
    "pt-pt": "Serviços",
    fr: "Services",
    de: "Dienstleistungen",
    es: "Servicios",
    it: "Servizi",
    nl: "Diensten",
    sv: "Tjänster",
    no: "Tjenester",
    da: "Tjenester",
  },
  "whats-on": {
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
};

export function getCategoryDisplayName(
  canonical: CanonicalCategorySlug,
  locale: Locale,
): string {
  return CATEGORY_DISPLAY_NAMES[canonical][locale] ?? CATEGORY_DISPLAY_NAMES[canonical].en;
}

/**
 * Returns every valid URL slug for a given locale.
 * Used to build the full URL matrix in generateStaticParams.
 */
export function getAllCategoryUrlSlugsForLocale(locale: Locale): string[] {
  return ALL_CANONICAL_SLUGS.map((slug) => getCategoryUrlSlug(slug, locale));
}
