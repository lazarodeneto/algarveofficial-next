import { supabase } from "@/integrations/supabase/client";

export const PUBLIC_CONTENT_LOCALES = [
  "en",
  "pt-pt",
  "de",
  "fr",
  "es",
  "it",
  "nl",
  "sv",
  "no",
  "da",
] as const;

export type PublicContentLocale = (typeof PUBLIC_CONTENT_LOCALES)[number];

export interface ListingTranslationContentRow {
  listing_id: string;
  language_code: string;
  title: string | null;
  short_description: string | null;
  description: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
}

export interface CategoryTranslationContentRow {
  category_id: string;
  locale: string;
  name: string | null;
  short_description: string | null;
  description: string | null;
}

export interface CityTranslationContentRow {
  city_id: string;
  locale: string;
  name: string | null;
  short_description: string | null;
  description: string | null;
}

export interface RegionTranslationContentRow {
  region_id: string;
  locale: string;
  name: string | null;
  short_description: string | null;
  description: string | null;
}

export interface FooterSectionTranslationContentRow {
  section_id: string;
  locale: string;
  title: string | null;
}

export interface FooterLinkTranslationContentRow {
  link_id: string;
  locale: string;
  name: string | null;
}

export function normalizePublicContentLocale(raw?: string | null): PublicContentLocale {
  if (!raw) return "en";

  const normalized = raw.toLowerCase().replaceAll("_", "-").trim();

  if (normalized === "pt" || normalized === "pt-pt") return "pt-pt";
  if (normalized.startsWith("de")) return "de";
  if (normalized.startsWith("fr")) return "fr";
  if (normalized.startsWith("es")) return "es";
  if (normalized.startsWith("it")) return "it";
  if (normalized.startsWith("nl")) return "nl";
  if (normalized.startsWith("sv")) return "sv";
  if (normalized === "no" || normalized.startsWith("nb") || normalized.startsWith("nn")) return "no";
  if (normalized.startsWith("da")) return "da";
  return "en";
}

export function isDefaultPublicContentLocale(locale?: string | null): boolean {
  return normalizePublicContentLocale(locale) === "en";
}

function uniqueIds(ids: readonly string[]): string[] {
  return Array.from(new Set(ids.filter(Boolean)));
}

function chunkIds(ids: readonly string[], size = 500): string[][] {
  const unique = uniqueIds(ids);
  const chunks: string[][] = [];

  for (let index = 0; index < unique.length; index += size) {
    chunks.push(unique.slice(index, index + size));
  }

  return chunks;
}

async function fetchChunkedTranslations<T>(
  table: string,
  idField: string,
  localeField: string,
  locale: PublicContentLocale,
  ids: readonly string[],
  select: string,
): Promise<T[]> {
  if (locale === "en" || ids.length === 0) return [];

  const chunks = chunkIds(ids);
  const rows: T[] = [];

  for (const chunk of chunks) {
    const { data, error } = await (supabase as any)
      .from(table)
      .select(select)
      .eq(localeField, locale)
      .in(idField, chunk);

    if (error) throw error;
    rows.push(...((data as T[] | null) ?? []));
  }

  return rows;
}

export function fetchListingTranslations(locale: PublicContentLocale, listingIds: readonly string[]) {
  return fetchChunkedTranslations<ListingTranslationContentRow>(
    "listing_translations",
    "listing_id",
    "language_code",
    locale,
    listingIds,
    "listing_id, language_code, title, short_description, description, seo_title, seo_description",
  );
}

export function fetchCategoryTranslations(locale: PublicContentLocale, categoryIds: readonly string[]) {
  return fetchChunkedTranslations<CategoryTranslationContentRow>(
    "category_translations",
    "category_id",
    "locale",
    locale,
    categoryIds,
    "category_id, locale, name, short_description, description",
  );
}

export function fetchCityTranslations(locale: PublicContentLocale, cityIds: readonly string[]) {
  return fetchChunkedTranslations<CityTranslationContentRow>(
    "city_translations",
    "city_id",
    "locale",
    locale,
    cityIds,
    "city_id, locale, name, short_description, description",
  );
}

export function fetchRegionTranslations(locale: PublicContentLocale, regionIds: readonly string[]) {
  return fetchChunkedTranslations<RegionTranslationContentRow>(
    "region_translations",
    "region_id",
    "locale",
    locale,
    regionIds,
    "region_id, locale, name, short_description, description",
  );
}

export function fetchFooterSectionTranslations(locale: PublicContentLocale, sectionIds: readonly string[]) {
  return fetchChunkedTranslations<FooterSectionTranslationContentRow>(
    "footer_section_translations",
    "section_id",
    "locale",
    locale,
    sectionIds,
    "section_id, locale, title",
  );
}

export function fetchFooterLinkTranslations(locale: PublicContentLocale, linkIds: readonly string[]) {
  return fetchChunkedTranslations<FooterLinkTranslationContentRow>(
    "footer_link_translations",
    "link_id",
    "locale",
    locale,
    linkIds,
    "link_id, locale, name",
  );
}
