#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const LOCALES_DIR = path.join(process.cwd(), "i18n", "locales");
const LOCALES = ["en", "pt-pt", "fr", "de", "es", "it", "nl", "sv", "no", "da"];
const BASE_LOCALE = "en";

function flattenValues(obj, prefix = "", out = new Map()) {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenValues(value, fullKey, out);
    } else {
      out.set(fullKey, String(value ?? ""));
    }
  }
  return out;
}

function loadLocale(locale) {
  const filePath = path.join(LOCALES_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Locale file not found: ${filePath}`);
  }
  return flattenValues(JSON.parse(fs.readFileSync(filePath, "utf8")));
}

function interpolationTokens(value) {
  return new Set([...value.matchAll(/\{\{\s*([\w.-]+)\s*\}\}|\{\s*([\w.-]+)\s*\}/g)].map((m) => m[1] ?? m[2]));
}

function pluralTokens(value) {
  return new Set([...value.matchAll(/\b(one|two|few|many|other|zero)\s*\{/g)].map((m) => m[1]));
}

function diffSets(a, b) {
  return [...a].filter((item) => !b.has(item));
}

function main() {
  console.log("Checking i18n translation coverage...\n");

  const locales = Object.fromEntries(LOCALES.map((locale) => [locale, loadLocale(locale)]));
  const base = locales[BASE_LOCALE];
  let failed = false;
  let warned = false;

  for (const locale of LOCALES) {
    if (locale === BASE_LOCALE) continue;

    const current = locales[locale];
    const missing = diffSets(new Set(base.keys()), new Set(current.keys()));
    const extra = diffSets(new Set(current.keys()), new Set(base.keys()));
    const empty = [...current.entries()]
      .filter(([, value]) => value.trim().length === 0)
      .map(([key]) => key);
    const sameAsEnglish = [...base.entries()]
      .filter(([key, value]) => current.has(key) && value.trim() && current.get(key)?.trim() === value.trim())
      .map(([key]) => key);

    const interpolationMismatches = [];
    const pluralMismatches = [];
    for (const [key, enValue] of base.entries()) {
      if (!current.has(key)) continue;
      const localeValue = current.get(key) ?? "";
      const missingInterpolation = diffSets(interpolationTokens(enValue), interpolationTokens(localeValue));
      const extraInterpolation = diffSets(interpolationTokens(localeValue), interpolationTokens(enValue));
      if (missingInterpolation.length || extraInterpolation.length) {
        interpolationMismatches.push({ key, missingInterpolation, extraInterpolation });
      }

      const missingPlural = diffSets(pluralTokens(enValue), pluralTokens(localeValue));
      const extraPlural = diffSets(pluralTokens(localeValue), pluralTokens(enValue));
      if (missingPlural.length || extraPlural.length) {
        pluralMismatches.push({ key, missingPlural, extraPlural });
      }
    }

    if (missing.length || empty.length || interpolationMismatches.length || pluralMismatches.length) {
      failed = true;
    }
    if (extra.length || sameAsEnglish.length) {
      warned = true;
    }

    const status = missing.length || empty.length || interpolationMismatches.length || pluralMismatches.length ? "FAIL" : "OK";
    console.log(`${status} ${locale}`);
    if (missing.length) console.log(`  Missing keys: ${missing.slice(0, 12).join(", ")}${missing.length > 12 ? ` (+${missing.length - 12})` : ""}`);
    if (empty.length) console.log(`  Empty values: ${empty.slice(0, 12).join(", ")}${empty.length > 12 ? ` (+${empty.length - 12})` : ""}`);
    if (interpolationMismatches.length) console.log(`  Interpolation mismatches: ${interpolationMismatches.slice(0, 8).map((m) => m.key).join(", ")}`);
    if (pluralMismatches.length) console.log(`  ICU/plural mismatches: ${pluralMismatches.slice(0, 8).map((m) => m.key).join(", ")}`);
    if (extra.length) console.log(`  Warning extra/orphan keys: ${extra.slice(0, 8).join(", ")}${extra.length > 8 ? ` (+${extra.length - 8})` : ""}`);
    if (sameAsEnglish.length) console.log(`  Warning same as English: ${sameAsEnglish.slice(0, 8).join(", ")}${sameAsEnglish.length > 8 ? ` (+${sameAsEnglish.length - 8})` : ""}`);
  }

  if (failed) {
    console.error("\nTranslation check failed.");
    process.exit(1);
  }

  console.log(warned ? "\nTranslation check passed with warnings." : "\nAll translations complete.");
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
