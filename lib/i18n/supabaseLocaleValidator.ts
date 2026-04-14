/**
 * lib/i18n/supabaseLocaleValidator.ts
 *
 * Runtime and build-time validator for localized Supabase content.
 *
 * Checks that dynamic data fetched from Supabase has been translated —
 * i.e. the relevant `*_translations` rows exist for the current locale —
 * and warns / falls back gracefully when they are missing.
 *
 * ─── Covered tables ──────────────────────────────────────────────────────────
 *  • listing_translations      (title, short_description, description, seo_*)
 *  • category_translations     (name, short_description, description)
 *  • city_translations         (name, short_description, description)
 *  • region_translations       (name, short_description, description)
 *
 * ─── Usage (runtime — in React Server Components) ────────────────────────────
 *
 *   import {
 *     validateListingLocale,
 *     applyListingTranslation,
 *   } from "@/lib/i18n/supabaseLocaleValidator";
 *
 *   const translatedListing = applyListingTranslation(listing, translations, locale);
 *
 * ─── Usage (build-time audit) ─────────────────────────────────────────────────
 *
 *   import { auditSupabaseLocale } from "@/lib/i18n/supabaseLocaleValidator";
 *   const report = await auditSupabaseLocale(supabase, ["pt-pt", "fr", "de"]);
 *   console.table(report.summary);
 */

import type {
  ListingTranslationContentRow,
  CategoryTranslationContentRow,
  CityTranslationContentRow,
  RegionTranslationContentRow,
  PublicContentLocale,
} from "@/lib/publicContentLocale";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocaleValidationResult {
  id: string;
  locale: PublicContentLocale;
  hasTranslation: boolean;
  missingFields: string[];
  isEnglishFallback: boolean;
}

export interface LocaleAuditReport {
  locale: PublicContentLocale;
  table: string;
  totalRows: number;
  translatedRows: number;
  missingRows: number;
  coveragePercent: number;
  missingIds: string[];
}

// ─── Dev-mode logger ──────────────────────────────────────────────────────────

const IS_DEV = process.env.NODE_ENV === "development";

function warnMissingLocaleData(
  entityType: string,
  id: string,
  locale: string,
  missingFields: string[],
): void {
  if (!IS_DEV) return;
  console.warn(
    `[supabaseLocaleValidator] ⚠️  Missing ${entityType} translation\n` +
      `  id:            ${id}\n` +
      `  locale:        ${locale}\n` +
      `  missing fields: ${missingFields.join(", ")}\n` +
      `  → Add a row to the ${entityType}_translations table for this locale`,
  );
}

// ─── Listing translation helpers ─────────────────────────────────────────────

export interface LocalizedListing {
  id: string;
  title: string;
  short_description: string | null;
  description: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  _locale: PublicContentLocale;
  _isEnglishFallback: boolean;
}

/**
 * Applies a locale-specific translation row to a base listing object.
 * Falls back to the English value if the translation row is missing.
 *
 * @param base     — the raw English listing row
 * @param txRow    — the translation row for the target locale (or undefined)
 * @param locale   — the requested locale
 */
export function applyListingTranslation(
  base: { id: string; title: string; short_description?: string | null; description?: string | null; seo_title?: string | null; seo_description?: string | null },
  txRow: ListingTranslationContentRow | undefined,
  locale: PublicContentLocale,
): LocalizedListing {
  if (!txRow) {
    warnMissingLocaleData("listing", base.id, locale, [
      "title", "short_description", "description",
    ]);
    return {
      id: base.id,
      title: base.title,
      short_description: base.short_description ?? null,
      description: base.description ?? null,
      seo_title: base.seo_title ?? null,
      seo_description: base.seo_description ?? null,
      _locale: locale,
      _isEnglishFallback: true,
    };
  }

  const missingFields: string[] = [];
  if (!txRow.title?.trim()) missingFields.push("title");
  if (!txRow.short_description?.trim()) missingFields.push("short_description");

  if (missingFields.length > 0) {
    warnMissingLocaleData("listing", base.id, locale, missingFields);
  }

  return {
    id: base.id,
    title: txRow.title?.trim() ?? base.title,
    short_description: txRow.short_description?.trim() || base.short_description ?? null,
    description: txRow.description?.trim() || base.description ?? null,
    seo_title: txRow.seo_title?.trim() || base.seo_title ?? null,
    seo_description: txRow.seo_description?.trim() || base.seo_description ?? null,
    _locale: locale,
    _isEnglishFallback: missingFields.length > 0,
  };
}

// ─── Generic entity translation helpers ──────────────────────────────────────

export interface LocalizedNamedEntity {
  id: string;
  name: string;
  short_description: string | null;
  description: string | null;
  _locale: PublicContentLocale;
  _isEnglishFallback: boolean;
}

type NamedEntityTxRow =
  | CategoryTranslationContentRow
  | CityTranslationContentRow
  | RegionTranslationContentRow;

/**
 * Apply translation to any entity that has a name + descriptions pattern
 * (category, city, region).
 */
export function applyNamedEntityTranslation(
  base: { id: string; name: string; short_description?: string | null; description?: string | null },
  txRow: NamedEntityTxRow | undefined,
  locale: PublicContentLocale,
  entityType: "category" | "city" | "region",
): LocalizedNamedEntity {
  if (!txRow) {
    warnMissingLocaleData(entityType, base.id, locale, ["name"]);
    return {
      id: base.id,
      name: base.name,
      short_description: base.short_description ?? null,
      description: base.description ?? null,
      _locale: locale,
      _isEnglishFallback: true,
    };
  }

  const missingFields: string[] = [];
  if (!txRow.name?.trim()) missingFields.push("name");

  if (missingFields.length > 0) {
    warnMissingLocaleData(entityType, base.id, locale, missingFields);
  }

  return {
    id: base.id,
    name: txRow.name?.trim() ?? base.name,
    short_description: (txRow.short_description?.trim() || base.short_description) ?? null,
    description: (txRow.description?.trim() || base.description) ?? null,
    _locale: locale,
    _isEnglishFallback: missingFields.length > 0,
  };
}

// ─── Translation map builders ─────────────────────────────────────────────────

/** Build a lookup map from listing_id → translation row */
export function buildListingTxMap(
  rows: ListingTranslationContentRow[],
): Map<string, ListingTranslationContentRow> {
  return new Map(rows.map((r) => [r.listing_id, r]));
}

/** Build a lookup map from category_id → translation row */
export function buildCategoryTxMap(
  rows: CategoryTranslationContentRow[],
): Map<string, CategoryTranslationContentRow> {
  return new Map(rows.map((r) => [r.category_id, r]));
}

/** Build a lookup map from city_id → translation row */
export function buildCityTxMap(
  rows: CityTranslationContentRow[],
): Map<string, CityTranslationContentRow> {
  return new Map(rows.map((r) => [r.city_id, r]));
}

/** Build a lookup map from region_id → translation row */
export function buildRegionTxMap(
  rows: RegionTranslationContentRow[],
): Map<string, RegionTranslationContentRow> {
  return new Map(rows.map((r) => [r.region_id, r]));
}

// ─── Validation helpers ───────────────────────────────────────────────────────

/**
 * Validate a list of entity IDs against a translation map.
 * Returns entries that are missing or have empty required fields.
 */
export function validateTranslationCoverage(
  entityIds: string[],
  txMap: Map<string, { name?: string | null; title?: string | null }>,
  locale: PublicContentLocale,
): LocaleValidationResult[] {
  return entityIds.map((id) => {
    const row = txMap.get(id);
    if (!row) {
      return {
        id,
        locale,
        hasTranslation: false,
        missingFields: ["all"],
        isEnglishFallback: true,
      };
    }

    const missingFields: string[] = [];
    const nameField = (row as Record<string, string | null>).name ?? (row as Record<string, string | null>).title;
    if (!nameField?.trim()) missingFields.push("name/title");

    return {
      id,
      locale,
      hasTranslation: true,
      missingFields,
      isEnglishFallback: missingFields.length > 0,
    };
  });
}

// ─── Build-time audit (server-side only) ─────────────────────────────────────

/**
 * Performs a coverage audit against live Supabase data.
 * Run from scripts or CI (not in the browser).
 *
 * Requires a server-side Supabase client with service-role privileges
 * to count all rows without RLS restrictions.
 *
 * @example
 *   import { createClient } from "@supabase/supabase-js";
 *   const supabase = createClient(url, serviceKey);
 *   const reports = await auditSupabaseLocale(supabase, ["pt-pt", "fr"]);
 */
export async function auditSupabaseLocale(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  locales: PublicContentLocale[],
): Promise<LocaleAuditReport[]> {
  const tables = [
    { table: "listings", txTable: "listing_translations", idField: "listing_id", localeField: "language_code" },
    { table: "categories", txTable: "category_translations", idField: "category_id", localeField: "locale" },
    { table: "cities", txTable: "city_translations", idField: "city_id", localeField: "locale" },
    { table: "regions", txTable: "region_translations", idField: "region_id", localeField: "locale" },
  ];

  const reports: LocaleAuditReport[] = [];

  for (const locale of locales) {
    for (const { table, txTable, idField, localeField } of tables) {
      try {
        // Count base rows
        const { count: totalCount, error: countError } = await supabase
          .from(table)
          .select("id", { count: "exact", head: true });

        if (countError) {
          console.warn(`[auditSupabaseLocale] Cannot count ${table}: ${countError.message}`);
          continue;
        }

        // Fetch all translated IDs for this locale
        const { data: txRows, error: txError } = await supabase
          .from(txTable)
          .select(idField)
          .eq(localeField, locale);

        if (txError) {
          console.warn(`[auditSupabaseLocale] Cannot query ${txTable}: ${txError.message}`);
          continue;
        }

        // Fetch all base IDs
        const { data: baseRows, error: baseError } = await supabase
          .from(table)
          .select("id");

        if (baseError) {
          console.warn(`[auditSupabaseLocale] Cannot query ${table}: ${baseError.message}`);
          continue;
        }

        const translatedIds = new Set<string>(
          (txRows ?? []).map((r: Record<string, string>) => r[idField]),
        );
        const allIds: string[] = (baseRows ?? []).map((r: Record<string, string>) => r.id);
        const missingIds = allIds.filter((id) => !translatedIds.has(id));

        const totalRows = totalCount ?? allIds.length;
        const translatedRows = translatedIds.size;
        const missingRows = totalRows - translatedRows;

        reports.push({
          locale,
          table: txTable,
          totalRows,
          translatedRows,
          missingRows,
          coveragePercent:
            totalRows > 0
              ? Math.round((translatedRows / totalRows) * 100)
              : 100,
          missingIds: missingIds.slice(0, 50), // cap to first 50
        });
      } catch (err) {
        console.error(`[auditSupabaseLocale] Unexpected error for ${table}/${locale}:`, err);
      }
    }
  }

  return reports;
}

// ─── Summary printer ──────────────────────────────────────────────────────────

/** Print a human-readable coverage table to the console. */
export function printAuditReport(reports: LocaleAuditReport[]): void {
  const grouped = reports.reduce<Record<string, LocaleAuditReport[]>>((acc, r) => {
    (acc[r.locale] ??= []).push(r);
    return acc;
  }, {});

  for (const [locale, rows] of Object.entries(grouped)) {
    console.log(`\n─── ${locale.toUpperCase()} ────────────────────────────────`);
    console.table(
      rows.map((r) => ({
        table: r.table,
        total: r.totalRows,
        translated: r.translatedRows,
        missing: r.missingRows,
        coverage: `${r.coveragePercent}%`,
      })),
    );
  }
}
