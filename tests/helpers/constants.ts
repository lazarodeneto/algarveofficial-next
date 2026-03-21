/**
 * Shared test constants for the AlgarveOfficial Playwright suite.
 * Derived from the real application config so tests stay in sync with code.
 */

// ─── Locales ──────────────────────────────────────────────────────────────────

export const SUPPORTED_LOCALES = [
  "en", "pt-pt", "fr", "de", "es", "it", "nl", "sv", "no", "da",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Locales exercised in most multi-locale test loops — broad coverage, reasonable speed. */
export const CORE_LOCALES: SupportedLocale[] = ["en", "pt-pt", "fr", "de"];

/** Expected hreflang values from LOCALE_CONFIGS */
export const HREFLANG_TAGS: Record<SupportedLocale, string> = {
  en: "en",
  "pt-pt": "pt-PT",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
  it: "it-IT",
  nl: "nl-NL",
  sv: "sv-SE",
  no: "nb-NO",
  da: "da-DK",
};

/** Expected <html lang="..."> values per locale (same as hreflang) */
export const HTML_LANG: Record<SupportedLocale, string> = HREFLANG_TAGS;

// ─── Category URL slugs per locale ───────────────────────────────────────────

export type CanonicalCategory =
  | "restaurants"
  | "places-to-stay"
  | "golf"
  | "things-to-do"
  | "beaches-clubs"
  | "wellness-spas"
  | "shopping-boutiques"
  | "algarve-services"
  | "whats-on";

/**
 * Canonical DB slug → { locale: urlSlug }
 * Mirrors lib/seo/programmatic/category-slugs.ts exactly.
 */
export const CATEGORY_URL_SLUGS: Record<CanonicalCategory, Record<SupportedLocale, string>> = {
  restaurants:      { en: "restaurants", "pt-pt": "restaurantes", fr: "restaurants", de: "restaurants", es: "restaurantes", it: "ristoranti", nl: "restaurants", sv: "restauranger", no: "restauranter", da: "restauranter" },
  "places-to-stay": { en: "accommodation", "pt-pt": "alojamento", fr: "hebergement", de: "unterkunft", es: "alojamiento", it: "alloggio", nl: "accommodatie", sv: "boende", no: "overnatting", da: "overnatning" },
  golf:             { en: "golf", "pt-pt": "golfe", fr: "golf", de: "golf", es: "golf", it: "golf", nl: "golf", sv: "golf", no: "golf", da: "golf" },
  "things-to-do":   { en: "activities", "pt-pt": "atividades", fr: "activites", de: "aktivitaeten", es: "actividades", it: "attivita", nl: "activiteiten", sv: "aktiviteter", no: "aktiviteter", da: "aktiviteter" },
  "beaches-clubs":  { en: "beaches", "pt-pt": "praias", fr: "plages", de: "straende", es: "playas", it: "spiagge", nl: "stranden", sv: "strander", no: "strender", da: "strande" },
  "wellness-spas":  { en: "wellness", "pt-pt": "bem-estar", fr: "bien-etre", de: "wellness", es: "bienestar", it: "benessere", nl: "wellness", sv: "wellness", no: "wellness", da: "wellness" },
  "shopping-boutiques": { en: "shopping", "pt-pt": "compras", fr: "shopping", de: "shopping", es: "compras", it: "shopping", nl: "winkelen", sv: "shopping", no: "shopping", da: "shopping" },
  "algarve-services":   { en: "services", "pt-pt": "servicos", fr: "services", de: "dienstleistungen", es: "servicios", it: "servizi", nl: "diensten", sv: "tjanster", no: "tjenester", da: "tjenester" },
  "whats-on":       { en: "events", "pt-pt": "eventos", fr: "evenements", de: "veranstaltungen", es: "eventos", it: "eventi", nl: "evenementen", sv: "evenemang", no: "arrangementer", da: "begivenheder" },
};

/** City slugs that exist in the database (from LOCATION_META + known DB data) */
export const KNOWN_CITY_SLUGS = [
  "albufeira", "vilamoura", "portimao", "lagos", "tavira",
  "faro", "quarteira", "carvoeiro", "sagres", "armacao-de-pera",
] as const;
export type CitySlug = (typeof KNOWN_CITY_SLUGS)[number];

// ─── Programmatic page combinations to test ───────────────────────────────────

/**
 * Representative subset of real /{locale}/{category}/{city} pages.
 * These MUST exist in the database (published listings for this combo).
 * Tests skip automatically if the page returns 404.
 */
export const PROGRAMMATIC_TEST_PAGES = [
  { locale: "en",    category: "restaurants",   city: "lagos" },
  { locale: "en",    category: "restaurants",   city: "albufeira" },
  { locale: "en",    category: "accommodation", city: "vilamoura" },
  { locale: "en",    category: "golf",          city: "vilamoura" },
  { locale: "en",    category: "activities",    city: "lagos" },
  { locale: "en",    category: "beaches",       city: "albufeira" },
  { locale: "pt-pt", category: "restaurantes",  city: "lagos" },
  { locale: "pt-pt", category: "alojamento",    city: "vilamoura" },
  { locale: "fr",    category: "restaurants",   city: "lagos" },
  { locale: "fr",    category: "hebergement",   city: "vilamoura" },
  { locale: "de",    category: "restaurants",   city: "albufeira" },
  { locale: "de",    category: "unterkunft",    city: "vilamoura" },
] as const;

// ─── Static pages that must always be accessible ─────────────────────────────

export const STATIC_PAGES = [
  "/",
  "/en",
  "/en/directory",
  "/en/blog",
  "/en/events",
  "/en/destinations",
  "/en/about-us",
  "/en/map",
  "/en/invest",
  "/en/partner",
  "/en/pricing",
  "/en/privacy-policy",
  "/en/terms",
  "/en/cookie-policy",
  "/en/login",
] as const;

// ─── Selectors ────────────────────────────────────────────────────────────────

/** Reliable selector for the language-switcher trigger button */
export const LANG_SWITCHER_TRIGGER =
  'button:has(svg[class*="Globe"], svg[data-lucide="Globe"]), button[aria-label*="language" i], button:has-text("EN"), button:has-text("PT"), button:has-text("FR"), button:has-text("DE")';

/** Language display names as they appear in the dropdown */
export const LOCALE_DISPLAY_NAMES: Record<SupportedLocale, string> = {
  en:    "English",
  "pt-pt": "Português",
  fr:    "Français",
  de:    "Deutsch",
  es:    "Español",
  it:    "Italiano",
  nl:    "Nederlands",
  sv:    "Svenska",
  no:    "Norsk",
  da:    "Dansk",
};
