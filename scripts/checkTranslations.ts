#!/usr/bin/env node
/**
 * scripts/checkTranslations.ts
 *
 * Build-time translation parity validator.
 *
 * Usage:
 *   npx tsx scripts/checkTranslations.ts
 *   npx tsx scripts/checkTranslations.ts --fix          → adds missing keys with ⚠️ placeholders
 *   npx tsx scripts/checkTranslations.ts --report       → writes i18n-report.json
 *   npx tsx scripts/checkTranslations.ts --warn-only    → exit 0 even if issues found
 *
 * Exit codes:
 *   0  → all checks pass
 *   1  → critical issues found (missing keys, empty values, broken interpolation)
 *   2  → minor issues found (extra keys, identical-to-EN strings)
 *
 * CI integration:  npm run check:i18n
 */

import fs from "fs";
import path from "path";

// ─── Configuration ────────────────────────────────────────────────────────────

const LOCALE_DIR = path.resolve(process.cwd(), "i18n/locales");
const BASELINE_LOCALE = "en";
const REPORT_PATH = path.resolve(process.cwd(), "i18n-report.json");

/** Namespaces that belong to admin/CMS tooling — checked for completeness
 *  but not counted against the public-facing score. */
const INTERNAL_NAMESPACES = new Set(["admin", "owner", "dashboard"]);

/** Known brand terms and proper nouns that are allowed to remain in English. */
const ALLOWED_IDENTICAL_TERMS = new Set([
  "AlgarveOfficial",
  "Algarve",
  "Premium",
  "Signature",
  "Verified",
  "WhatsApp",
  "Golf",
  "VIP",
  "Michelin",
  "Black Friday",
  "Black Friday 2026",
  "Beach Club",
  "Golf Front",
  "Wellness Retreat",
  "On Demand",
  "AI Image Gen",
  "Google Ratings Sync",
  "AlgarveOfficial CMS v1.0",
  "Tax Free Shopping",
  "VIP Cabanas",
  "Live DJ",
  "Yoga & Meditation",
  "Gated Community",
  "VIP Service Promise",
  "24/7 Service",
  "Executive Protection",
  "Architecture Studios",
  "Cliff Beach",
  "Gourmet & Delicatessen",
  "Golf & Sports",
  "Sports & Fitness",
  "Wellness & Retreat",
  "Per Week",
  "Book Tee Time",
  "Concierge Service",
  "Dress Code",
  "Executive Chef",
  "District of Faro",
  "Blog & Insights",
  "Shopping & Boutiques",
  "Wellness & Spas",
]);

// ─── Arg parsing ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const FIX_MODE = args.includes("--fix");
const REPORT_MODE = args.includes("--report");
const WARN_ONLY = args.includes("--warn-only");
const VERBOSE = args.includes("--verbose") ?? args.includes("-v");

// ─── Types ────────────────────────────────────────────────────────────────────

interface TranslationNode {
  [key: string]: string | TranslationNode;
}

interface LocaleData {
  name: string;
  raw: TranslationNode;
  flat: Map<string, string>;
}

interface CheckResult {
  locale: string;
  missingKeys: string[];
  extraKeys: string[];
  emptyValues: string[];
  brokenInterpolations: Array<{
    key: string;
    enValue: string;
    localeValue: string;
    missingVars: string[];
    extraVars: string[];
  }>;
  identicalToEn: Array<{ key: string; value: string }>;
}

interface Report {
  timestamp: string;
  baseline: string;
  totalBaselineKeys: number;
  publicFacingKeys: number;
  results: CheckResult[];
  summary: {
    totalMissing: number;
    totalEmpty: number;
    totalBrokenInterp: number;
    totalIdentical: number;
    localesWithCriticalIssues: string[];
    passedLocales: string[];
    coveragePercent: Record<string, number>;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flattenTranslations(
  obj: TranslationNode,
  prefix = "",
  acc = new Map<string, string>()
): Map<string, string> {
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      flattenTranslations(v as TranslationNode, full, acc);
    } else {
      acc.set(full, String(v ?? ""));
    }
  }
  return acc;
}

function unflattenTranslations(flat: Map<string, string>): TranslationNode {
  const result: TranslationNode = {};
  for (const [key, value] of flat) {
    const parts = key.split(".");
    let node: TranslationNode = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]] || typeof node[parts[i]] !== "object") {
        node[parts[i]] = {};
      }
      node = node[parts[i]] as TranslationNode;
    }
    node[parts[parts.length - 1]] = value;
  }
  return result;
}

function extractInterpolationVars(str: string): Set<string> {
  const matches = str.matchAll(/\{\{(\w+)\}\}/g);
  return new Set([...matches].map((m) => m[1]));
}

function isPublicFacing(key: string): boolean {
  const ns = key.split(".")[0];
  return !INTERNAL_NAMESPACES.has(ns);
}

function loadLocale(file: string): LocaleData {
  const absPath = path.join(LOCALE_DIR, file);
  const raw = JSON.parse(fs.readFileSync(absPath, "utf-8")) as TranslationNode;
  return {
    name: file.replace(".json", ""),
    raw,
    flat: flattenTranslations(raw),
  };
}

// ─── ANSI colours ─────────────────────────────────────────────────────────────

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  grey: "\x1b[90m",
};

function fmt(color: string, msg: string) {
  return `${color}${msg}${c.reset}`;
}

// ─── Main validation logic ────────────────────────────────────────────────────

function checkLocale(baseline: LocaleData, locale: LocaleData): CheckResult {
  const result: CheckResult = {
    locale: locale.name,
    missingKeys: [],
    extraKeys: [],
    emptyValues: [],
    brokenInterpolations: [],
    identicalToEn: [],
  };

  // 1. Missing keys (in EN but not in this locale)
  for (const [key] of baseline.flat) {
    if (!locale.flat.has(key)) {
      result.missingKeys.push(key);
    }
  }

  // 2. Extra keys (in this locale but not in EN)
  for (const [key] of locale.flat) {
    if (!baseline.flat.has(key)) {
      result.extraKeys.push(key);
    }
  }

  // 3. Empty values
  for (const [key, val] of locale.flat) {
    if (val.trim() === "") {
      result.emptyValues.push(key);
    }
  }

  // 4. Broken interpolation variables
  for (const [key, enVal] of baseline.flat) {
    if (!locale.flat.has(key)) continue;
    const localeVal = locale.flat.get(key)!;
    const enVars = extractInterpolationVars(enVal);
    if (enVars.size === 0) continue; // key has no vars — skip

    const localeVars = extractInterpolationVars(localeVal);
    const missingVars = [...enVars].filter((v) => !localeVars.has(v));
    const extraVars = [...localeVars].filter((v) => !enVars.has(v));

    if (missingVars.length > 0 || extraVars.length > 0) {
      result.brokenInterpolations.push({
        key,
        enValue: enVal,
        localeValue: localeVal,
        missingVars,
        extraVars,
      });
    }
  }

  // 5. Strings identical to English (possible untranslated)
  for (const [key, enVal] of baseline.flat) {
    if (!locale.flat.has(key)) continue;
    const localeVal = locale.flat.get(key)!;
    // Only flag multi-word strings that aren't allowed proper nouns
    if (
      enVal.toLowerCase() === localeVal.toLowerCase() &&
      enVal.split(" ").length > 1 &&
      !ALLOWED_IDENTICAL_TERMS.has(enVal.trim()) &&
      isPublicFacing(key)
    ) {
      result.identicalToEn.push({ key, value: enVal });
    }
  }

  return result;
}

// ─── Fix mode: insert placeholder for missing keys ────────────────────────────

function applyFixes(
  locale: LocaleData,
  missingKeys: string[],
  baselineFlat: Map<string, string>
): void {
  if (missingKeys.length === 0) return;

  const updatedFlat = new Map(locale.flat);
  for (const key of missingKeys) {
    const enVal = baselineFlat.get(key) ?? "";
    // Insert a placeholder that is obviously untranslated so reviewers see it
    updatedFlat.set(key, `⚠️ UNTRANSLATED: ${enVal}`);
  }

  const nested = unflattenTranslations(updatedFlat);
  const outPath = path.join(LOCALE_DIR, `${locale.name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(nested, null, 2) + "\n", "utf-8");
  console.log(
    fmt(c.green, `  ✓ Applied ${missingKeys.length} placeholder fix(es) to ${locale.name}.json`)
  );
}

// ─── Entry point ──────────────────────────────────────────────────────────────

function main(): void {
  console.log(fmt(c.bold, "\n🌍 AlgarveOfficial — Translation Parity Check\n"));

  // Load all locale files
  const allFiles = fs
    .readdirSync(LOCALE_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  if (allFiles.length === 0) {
    console.error(fmt(c.red, `✗ No JSON files found in ${LOCALE_DIR}`));
    process.exit(1);
  }

  const locales = allFiles.map(loadLocale);
  const baseline = locales.find((l) => l.name === BASELINE_LOCALE);

  if (!baseline) {
    console.error(
      fmt(c.red, `✗ Baseline locale "${BASELINE_LOCALE}.json" not found in ${LOCALE_DIR}`)
    );
    process.exit(1);
  }

  const nonBaselineLocales = locales.filter((l) => l.name !== BASELINE_LOCALE);
  const publicFacingKeyCount = [...baseline.flat.keys()].filter(isPublicFacing).length;

  console.log(
    `Baseline (${BASELINE_LOCALE}): ${fmt(c.bold, String(baseline.flat.size))} total keys` +
      ` (${fmt(c.cyan, String(publicFacingKeyCount))} public-facing)\n`
  );

  // Run checks
  const results: CheckResult[] = nonBaselineLocales.map((locale) =>
    checkLocale(baseline, locale)
  );

  // ── Per-locale output ──────────────────────────────────────────────────────
  let hasCritical = false;
  let hasMinor = false;

  for (const result of results) {
    const criticalCount =
      result.missingKeys.length +
      result.emptyValues.length +
      result.brokenInterpolations.length;

    const minorCount = result.identicalToEn.length;

    const statusIcon =
      criticalCount > 0 ? fmt(c.red, "✗") : minorCount > 0 ? fmt(c.yellow, "⚠") : fmt(c.green, "✓");

    const coverage =
      ((baseline.flat.size - result.missingKeys.length) / baseline.flat.size) * 100;

    console.log(
      `${statusIcon}  ${fmt(c.bold, result.locale.padEnd(8))}` +
        `  coverage: ${fmt(coverage >= 99 ? c.green : coverage >= 95 ? c.yellow : c.red, coverage.toFixed(1) + "%")}` +
        `  missing: ${result.missingKeys.length}` +
        `  empty: ${result.emptyValues.length}` +
        `  broken-interp: ${result.brokenInterpolations.length}` +
        `  identical-to-EN: ${result.identicalToEn.length}` +
        (result.extraKeys.length > 0 ? `  extra: ${result.extraKeys.length}` : "")
    );

    if (criticalCount > 0) hasCritical = true;
    if (minorCount > 0) hasMinor = true;

    // ── Verbose detail ────────────────────────────────────────────────────
    if (VERBOSE || criticalCount > 0) {
      if (result.missingKeys.length > 0) {
        const publicMissing = result.missingKeys.filter(isPublicFacing);
        const adminMissing = result.missingKeys.filter((k) => !isPublicFacing(k));

        if (publicMissing.length > 0) {
          console.log(
            fmt(c.red, `\n   Missing public-facing keys (${publicMissing.length}):`)
          );
          publicMissing.slice(0, 20).forEach((k) =>
            console.log(fmt(c.grey, `     - ${k}`))
          );
          if (publicMissing.length > 20)
            console.log(fmt(c.grey, `     … and ${publicMissing.length - 20} more`));
        }

        if (adminMissing.length > 0 && VERBOSE) {
          console.log(
            fmt(c.yellow, `\n   Missing internal keys (${adminMissing.length}):`)
          );
          adminMissing.slice(0, 10).forEach((k) =>
            console.log(fmt(c.grey, `     - ${k}`))
          );
        }
      }

      if (result.emptyValues.length > 0) {
        console.log(fmt(c.red, `\n   Empty values (${result.emptyValues.length}):`));
        result.emptyValues.slice(0, 10).forEach((k) =>
          console.log(fmt(c.grey, `     - ${k}`))
        );
      }

      if (result.brokenInterpolations.length > 0) {
        console.log(
          fmt(c.red, `\n   Broken interpolations (${result.brokenInterpolations.length}):`)
        );
        result.brokenInterpolations.forEach(({ key, enValue, localeValue, missingVars }) => {
          console.log(fmt(c.grey, `     ${key}`));
          console.log(fmt(c.grey, `       EN:     "${enValue}"`));
          console.log(fmt(c.grey, `       ${result.locale}: "${localeValue}"`));
          console.log(fmt(c.red, `       Missing vars: {{ ${missingVars.join(" }}, {{ ")} }}`));
        });
      }

      if (result.extraKeys.length > 0 && VERBOSE) {
        console.log(fmt(c.yellow, `\n   Orphan keys (not in EN): ${result.extraKeys.length}`));
        result.extraKeys.slice(0, 5).forEach((k) =>
          console.log(fmt(c.grey, `     + ${k}`))
        );
      }

      if (result.identicalToEn.length > 0 && VERBOSE) {
        console.log(
          fmt(c.yellow, `\n   Potentially untranslated (identical to EN): ${result.identicalToEn.length}`)
        );
        result.identicalToEn.slice(0, 10).forEach(({ key, value }) =>
          console.log(fmt(c.grey, `     ${key} = "${value}"`))
        );
      }
    }

    // ── Apply fixes if requested ────────────────────────────────────────
    if (FIX_MODE && result.missingKeys.length > 0) {
      const locale = nonBaselineLocales.find((l) => l.name === result.locale)!;
      applyFixes(locale, result.missingKeys, baseline.flat);
    }

    console.log();
  }

  // ── Summary ───────────────────────────────────────────────────────────────

  const totalMissing = results.reduce((s, r) => s + r.missingKeys.length, 0);
  const totalEmpty = results.reduce((s, r) => s + r.emptyValues.length, 0);
  const totalBrokenInterp = results.reduce((s, r) => s + r.brokenInterpolations.length, 0);
  const totalIdentical = results.reduce((s, r) => s + r.identicalToEn.length, 0);

  const coveragePercent: Record<string, number> = {};
  for (const result of results) {
    coveragePercent[result.locale] =
      ((baseline.flat.size - result.missingKeys.length) / baseline.flat.size) * 100;
  }

  console.log(fmt(c.bold, "─".repeat(60)));
  console.log(
    fmt(c.bold, `SUMMARY`) +
      `  missing: ${totalMissing > 0 ? fmt(c.red, String(totalMissing)) : fmt(c.green, "0")}` +
      `  empty: ${totalEmpty > 0 ? fmt(c.red, String(totalEmpty)) : fmt(c.green, "0")}` +
      `  broken-interp: ${totalBrokenInterp > 0 ? fmt(c.red, String(totalBrokenInterp)) : fmt(c.green, "0")}` +
      `  identical-to-EN: ${totalIdentical > 0 ? fmt(c.yellow, String(totalIdentical)) : fmt(c.green, "0")}`
  );

  if (totalMissing === 0 && totalEmpty === 0 && totalBrokenInterp === 0) {
    console.log(fmt(c.green, "\n✅ All locale files are complete and consistent.\n"));
  } else {
    if (!WARN_ONLY) {
      console.log(
        fmt(
          c.red,
          "\n❌ Translation issues found. Fix before deploying.\n" +
            "   Run with --fix to auto-insert placeholders for missing keys.\n" +
            "   Run with --verbose for full details.\n"
        )
      );
    } else {
      console.log(
        fmt(c.yellow, "\n⚠️  Translation issues found (warn-only mode — not failing build).\n")
      );
    }
  }

  // ── JSON Report ───────────────────────────────────────────────────────────

  if (REPORT_MODE) {
    const report: Report = {
      timestamp: new Date().toISOString(),
      baseline: BASELINE_LOCALE,
      totalBaselineKeys: baseline.flat.size,
      publicFacingKeys: publicFacingKeyCount,
      results,
      summary: {
        totalMissing,
        totalEmpty,
        totalBrokenInterp,
        totalIdentical,
        localesWithCriticalIssues: results
          .filter(
            (r) =>
              r.missingKeys.length > 0 ||
              r.emptyValues.length > 0 ||
              r.brokenInterpolations.length > 0
          )
          .map((r) => r.locale),
        passedLocales: results
          .filter(
            (r) =>
              r.missingKeys.length === 0 &&
              r.emptyValues.length === 0 &&
              r.brokenInterpolations.length === 0
          )
          .map((r) => r.locale),
        coveragePercent,
      },
    };

    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf-8");
    console.log(fmt(c.cyan, `📄 Report written to ${REPORT_PATH}\n`));
  }

  // ── Exit code ─────────────────────────────────────────────────────────────

  if (WARN_ONLY) {
    process.exit(0);
  }

  if (hasCritical) {
    process.exit(1); // critical: missing keys, empty, broken interp
  }

  if (hasMinor) {
    process.exit(2); // minor: identical-to-EN strings
  }

  process.exit(0);
}

main();
