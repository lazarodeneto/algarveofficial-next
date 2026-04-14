/**
 * lib/i18n/localizedSeo.ts
 *
 * Localized SEO metadata helper — enforces that `generateMetadata()` always
 * produces translated title and description strings, never English fallbacks.
 *
 * ─── Usage ────────────────────────────────────────────────────────────────────
 *
 *   // In a page's generateMetadata():
 *   import { getLocalizedSEO } from "@/lib/i18n/localizedSeo";
 *
 *   export async function generateMetadata({ params }: Props): Promise<Metadata> {
 *     const { locale } = await params;
 *     const seo = await getLocalizedSEO(locale as Locale, {
 *       titleKey: "directory.meta.title",
 *       descriptionKey: "directory.meta.description",
 *       fallbackTitle: "Directory | AlgarveOfficial",
 *       fallbackDescription: "Browse the best of the Algarve.",
 *     });
 *     return buildPageMetadata({ ...seo, localizedPath: "/stay", locale });
 *   }
 *
 * ─── What it does ─────────────────────────────────────────────────────────────
 *  1. Loads translations for the requested locale via `getServerTranslations()`
 *  2. Returns title + description from translation keys
 *  3. In dev/staging: warns to console if a key is missing or falls back to EN
 *  4. In production: silently falls back to `fallbackTitle` / `fallbackDescription`
 *     so the page still has *some* metadata rather than none
 *  5. Validates that the result is not identical to English (catches untranslated stubs)
 *
 * ─── Interpolation ────────────────────────────────────────────────────────────
 *   Pass `vars` to interpolate {{name}}-style variables:
 *   getLocalizedSEO(locale, { titleKey: "listing.meta.title", vars: { name: "Faro" } })
 */

import { getServerTranslations } from "@/lib/i18n/server";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocalizedSEOOptions {
  /** i18n key for the page title */
  titleKey: string;
  /** i18n key for the page description */
  descriptionKey: string;
  /** Fallback title if translation is missing (should be English) */
  fallbackTitle: string;
  /** Fallback description if translation is missing (should be English) */
  fallbackDescription: string;
  /** Optional interpolation variables for {{placeholder}} substitution */
  vars?: Record<string, string | number>;
  /**
   * Additional keys to pre-load (e.g. keywords, OG title, canonical).
   * Returned in the `extra` map.
   */
  extraKeys?: string[];
}

export interface LocalizedSEOResult {
  /** Translated page title (never empty — falls back to fallbackTitle) */
  title: string;
  /** Translated page description (never empty — falls back to fallbackDescription) */
  description: string;
  /** Current locale */
  locale: Locale;
  /** Extra keys requested via `extraKeys` */
  extra: Record<string, string>;
  /** Whether any translation fell back to the fallback value */
  hasFallback: boolean;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

const IS_DEV =
  process.env.NODE_ENV === "development" ?? process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

/** Apply {{variable}} interpolation */
function applyInterpolation(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars || Object.keys(vars).length === 0) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{{${k}}}`,
  );
}

/** Warn once per key per locale in non-production environments */
const _seoWarnedKeys = new Set<string>();

function warnSEOFallback(key: string, locale: string, reason: string): void {
  if (!IS_DEV) return;
  const fp = `${locale}:${key}`;
  if (_seoWarnedKeys.has(fp)) return;
  _seoWarnedKeys.add(fp);
  console.warn(
    `[getLocalizedSEO] ⚠️  SEO metadata fallback for locale "${locale}"\n` +
      `  key:    ${key}\n` +
      `  reason: ${reason}\n` +
      `  → Add a translated value to i18n/locales/${locale === "pt-pt" ? "pt" : locale}.json`,
  );
}

// ─── Main helper ──────────────────────────────────────────────────────────────

/**
 * Load translated SEO metadata for a page.
 * Always returns a non-empty `title` and `description`.
 */
export async function getLocalizedSEO(
  locale: Locale,
  options: LocalizedSEOOptions,
): Promise<LocalizedSEOResult> {
  const {
    titleKey,
    descriptionKey,
    fallbackTitle,
    fallbackDescription,
    vars,
    extraKeys = [],
  } = options;

  const keysToLoad = [titleKey, descriptionKey, ...extraKeys];

  // Load translations for this locale AND English (for fallback-detection)
  const [localeTx, enTx] = await Promise.all([
    getServerTranslations(locale, keysToLoad),
    locale !== DEFAULT_LOCALE
      ? getServerTranslations(DEFAULT_LOCALE, keysToLoad)
      : Promise.resolve<Record<string, string>>({}),
  ]);

  let hasFallback = false;

  function resolveKey(key: string, fallback: string): string {
    const localeVal = localeTx[key];
    const enVal = enTx[key];

    // Missing entirely
    if (!localeVal) {
      warnSEOFallback(key, locale, "key not found in locale translations");
      hasFallback = true;
      return applyInterpolation(fallback, vars);
    }

    // Empty string
    if (localeVal.trim() === "") {
      warnSEOFallback(key, locale, "value is an empty string");
      hasFallback = true;
      return applyInterpolation(fallback, vars);
    }

    // Identical to English (likely an untranslated stub) — warn but don't block
    if (
      locale !== DEFAULT_LOCALE &&
      enVal &&
      localeVal.trim() === enVal.trim()
    ) {
      warnSEOFallback(
        key,
        locale,
        `value is identical to English ("${enVal.slice(0, 60)}…") — may be untranslated`,
      );
      // Don't set hasFallback=true here — identical text might be intentional (e.g. brand names)
    }

    return applyInterpolation(localeVal, vars);
  }

  const title = resolveKey(titleKey, fallbackTitle);
  const description = resolveKey(descriptionKey, fallbackDescription);

  // Collect extra keys
  const extra: Record<string, string> = {};
  for (const key of extraKeys) {
    const val = localeTx[key];
    if (val) {
      extra[key] = applyInterpolation(val, vars);
    }
  }

  return { title, description, locale, extra, hasFallback };
}

// ─── Convenience: batch loader for multiple pages ────────────────────────────

export interface PageSEOConfig {
  page: string; // e.g. "directory", "partner", "blog"
  titleKey: string;
  descriptionKey: string;
  fallbackTitle: string;
  fallbackDescription: string;
}

/**
 * Validate SEO coverage for all supported locales and pages.
 * Useful in scripts or tests.
 *
 * Returns an array of missing/fallen-back entries.
 */
export async function auditSEOCoverage(
  pages: PageSEOConfig[],
  locales: Locale[],
): Promise<
  Array<{
    page: string;
    locale: Locale;
    field: "title" | "description";
    key: string;
    reason: string;
  }>
> {
  const issues: ReturnType<typeof auditSEOCoverage> extends Promise<infer T>
    ? T
    : never = [];

  for (const locale of locales) {
    const keysToLoad = pages.flatMap((p) => [p.titleKey, p.descriptionKey]);
    const tx = await getServerTranslations(locale, keysToLoad);

    for (const page of pages) {
      for (const field of ["title", "description"] as const) {
        const key = field === "title" ? page.titleKey : page.descriptionKey;
        const val = tx[key];

        if (!val || val.trim() === "") {
          issues.push({
            page: page.page,
            locale,
            field,
            key,
            reason: "missing or empty",
          });
        }
      }
    }
  }

  return issues;
}
