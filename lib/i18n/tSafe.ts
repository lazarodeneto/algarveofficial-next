/**
 * lib/i18n/tSafe.ts
 *
 * Runtime translation guard — wraps react-i18next's `t()` with:
 *
 *  • Dev mode: logs missing keys to console, returns a visible ⚠️ marker
 *  • Prod mode: falls back silently to `defaultValue` or the raw key
 *
 * ─── Usage ───────────────────────────────────────────────────────────────────
 *
 *   // Client component (hook-based):
 *   const { tSafe } = useTSafe("common");
 *   <p>{tSafe("common.welcome")}</p>
 *
 *   // Standalone (pass the t function from useTranslation):
 *   import { makeTSafe } from "@/lib/i18n/tSafe";
 *   const tSafe = makeTSafe(t);
 *   <p>{tSafe("common.welcome")}</p>
 *
 *   // With defaultValue (suppresses dev warning — key is expected to be optional):
 *   tSafe("common.optionalKey", "Fallback text")
 *
 * ─── Dev-mode highlighting ────────────────────────────────────────────────────
 *   Missing keys render as:  ⚠️ MISSING: common.welcome
 *   Console error logged with file-friendly stack trace
 */

"use client";

import { useTranslation } from "react-i18next";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TSafeFunction = (
  key: string,
  defaultValue?: string,
  interpolation?: Record<string, string | number>,
) => string;

// ─── Dev-mode warning ─────────────────────────────────────────────────────────

const IS_DEV = process.env.NODE_ENV === "development";

/** Tracks keys already warned in this session to avoid console spam */
const _warnedKeys = new Set<string>();

function warnMissing(key: string, locale: string): void {
  if (!IS_DEV) return;
  const fingerprint = `${locale}:${key}`;
  if (_warnedKeys.has(fingerprint)) return;
  _warnedKeys.add(fingerprint);
  console.error(
    `[tSafe] ⚠️  Missing translation key "${key}" for locale "${locale}"\n` +
      `  → Add it to i18n/locales/${locale === "pt-pt" ? "pt" : locale}.json\n` +
      `  → Or provide a defaultValue: tSafe("${key}", "Your fallback")`,
  );
}

// ─── Core factory ─────────────────────────────────────────────────────────────

/**
 * Wraps a raw `t()` function with safety checks.
 * The `locale` string is used only for dev-mode logging.
 */
export function makeTSafe(
  t: (key: string, options?: Record<string, unknown>) => string,
  locale = "unknown",
): TSafeFunction {
  return function tSafe(
    key: string,
    defaultValue?: string,
    interpolation?: Record<string, string | number>,
  ): string {
    // Build i18next options
    const options: Record<string, unknown> = {};
    if (defaultValue !== undefined) {
      options.defaultValue = defaultValue;
    }
    if (interpolation) {
      Object.assign(options, interpolation);
    }

    const result = t(key, Object.keys(options).length > 0 ? options : undefined as unknown as Record<string, unknown>);

    // i18next returns the key itself when the key is missing and no defaultValue is set
    const isMissing = result === key && defaultValue === undefined;

    if (isMissing) {
      warnMissing(key, locale);
      if (IS_DEV) {
        return `⚠️ MISSING: ${key}`;
      }
      // Prod: return the key as a last-resort visible fallback
      return key;
    }

    return result;
  };
}

// ─── React hook ───────────────────────────────────────────────────────────────

/**
 * Drop-in replacement for `useTranslation` — returns a tSafe wrapper.
 *
 * @example
 *   const { tSafe, i18n } = useTSafe("common");
 *   <p>{tSafe("common.title")}</p>
 */
export function useTSafe(ns?: string): {
  tSafe: TSafeFunction;
  locale: string;
  i18n: ReturnType<typeof useTranslation>["i18n"];
} {
  const { t, i18n } = useTranslation(ns);
  const locale = i18n.language ?? "en";
  const tSafe = makeTSafe(t as (key: string, options?: Record<string, unknown>) => string, locale);
  return { tSafe, locale, i18n };
}

// ─── Static helper for Server Components ─────────────────────────────────────

/**
 * Safe accessor for the flat key maps returned by `getServerTranslations()`.
 *
 * @example
 *   const tx = await getServerTranslations(locale, ["common.title"]);
 *   const title = serverTSafe(tx, "common.title", "Default Title", locale);
 */
export function serverTSafe(
  translations: Record<string, string>,
  key: string,
  defaultValue?: string,
  locale = "unknown",
): string {
  const value = translations[key];

  if (value !== undefined && value !== "") {
    return value;
  }

  // Warn in dev, fall back gracefully
  if (IS_DEV && defaultValue === undefined) {
    warnMissing(key, locale);
    return `⚠️ MISSING: ${key}`;
  }

  return defaultValue ?? key;
}

// ─── Interpolation helper ─────────────────────────────────────────────────────

/**
 * Applies {{variable}} interpolation to a translation string
 * (useful when using `serverTSafe` which bypasses i18next's interpolation engine).
 *
 * @example
 *   interpolate("Hello {{name}}, you have {{count}} messages", { name: "Alice", count: 3 })
 *   // → "Hello Alice, you have 3 messages"
 */
export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`,
  );
}
