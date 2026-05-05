#!/usr/bin/env node

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const LOCALE_DIR = path.join(ROOT, "i18n/locales");
const REPORT_PATH = path.join(ROOT, "translation-audit.json");
const SOURCE_DIRS = ["app", "components", "hooks", "legacy-pages", "lib"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);
const IGNORED_FILES = new Set(["lib/i18n/tSafe.ts"]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name === ".git" ||
      entry.name === "dist"
    ) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (!SOURCE_EXTENSIONS.has(path.extname(entry.name))) continue;
    if (fullPath.includes(".test.") || fullPath.includes(".spec.")) continue;
    files.push(fullPath);
  }

  return files;
}

function flattenTranslations(obj, prefix = "", out = new Map()) {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenTranslations(value, fullKey, out);
    } else {
      out.set(fullKey, String(value ?? ""));
    }
  }
  return out;
}

function lineNumberForIndex(text, index) {
  return text.slice(0, index).split("\n").length;
}

function humanizeKeySegment(segment) {
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function suggestKey(filePath, rawText) {
  const parts = filePath
    .replace(`${ROOT}/`, "")
    .split("/")
    .filter(Boolean);

  const namespace = parts.includes("components")
    ? parts[parts.indexOf("components") + 1] || "common"
    : parts.includes("legacy-pages")
      ? parts[parts.indexOf("legacy-pages") + 1] || "common"
      : "common";

  const slug = rawText
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join("-");

  return `${namespace}.${slug || "text"}`;
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function shouldIgnoreHardcodedText(value) {
  if (!value) return true;
  if (/^[\d\s.,:+/%-]+$/.test(value)) return true;
  if (value.length < 2) return true;
  if (value.includes("{") || value.includes("}")) return true;
  if (/^[A-Z0-9_-]+$/.test(value)) return true;
  return false;
}

function loadLocales() {
  const locales = {};
  for (const file of fs.readdirSync(LOCALE_DIR).filter((name) => name.endsWith(".json")).sort()) {
    const locale = file.replace(/\.json$/, "");
    const data = JSON.parse(fs.readFileSync(path.join(LOCALE_DIR, file), "utf8"));
    locales[locale] = flattenTranslations(data);
  }
  return locales;
}

function scanTranslations(files, localeMaps) {
  const baseline = localeMaps.en ?? new Map();
  const translationKeyUsages = new Map();
  const translationDefaults = new Map();
  const fallbackPatterns = [];
  const hardcoded = [];

  const keyRegex = /\b(?:t|tSafe)\(\s*(["'`])([^"'`$]+)\1/g;
  const directDefaultRegex =
    /\b(?:t|tSafe)\(\s*(["'`])([^"'`]+)\1\s*,\s*(["'`])((?:\\.|(?!\3)[\s\S])*?)\3/g;
  const objectDefaultRegex =
    /\b(?:t|tSafe)\(\s*(["'`])([^"'`]+)\1\s*,\s*\{[\s\S]*?defaultValue\s*:\s*(["'`])((?:\\.|(?!\3)[\s\S])*?)\3[\s\S]*?\}\s*\)/g;
  const fallbackOrRegex = /\b(?:t|tSafe)\([\s\S]*?\)\s*\|\|\s*(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  const attrRegex =
    /\b(?:placeholder|aria-label|title)\s*=\s*(["'])([^"'{}][^"']*)\1/g;
  const textNodeRegex =
    /<(p|span|button|label|a|h[1-6]|option|li|dt|dd)\b[^>]*>\s*([^<>{][^<>]*?)\s*<\/\1>/g;

  for (const file of files) {
    const relativePath = file.replace(`${ROOT}/`, "");
    if (IGNORED_FILES.has(relativePath)) continue;
    const source = fs.readFileSync(file, "utf8");

    for (const match of source.matchAll(keyRegex)) {
      const key = match[2];
      if (key.includes("${") || key === "...") continue;
      if (!translationKeyUsages.has(key)) translationKeyUsages.set(key, []);
      translationKeyUsages.get(key).push({
        file: relativePath,
        line: lineNumberForIndex(source, match.index),
      });
    }

    for (const match of source.matchAll(directDefaultRegex)) {
      const [, , key, , value] = match;
      const normalizedValue = normalizeWhitespace(value);
      if (!translationDefaults.has(key)) translationDefaults.set(key, new Set());
      translationDefaults.get(key).add(normalizedValue);
      fallbackPatterns.push({
        type: "translation-default",
        file: relativePath,
        line: lineNumberForIndex(source, match.index),
        key,
        value: normalizedValue,
      });
    }

    for (const match of source.matchAll(objectDefaultRegex)) {
      const [, , key, , value] = match;
      const normalizedValue = normalizeWhitespace(value);
      if (!translationDefaults.has(key)) translationDefaults.set(key, new Set());
      translationDefaults.get(key).add(normalizedValue);
      fallbackPatterns.push({
        type: "translation-default",
        file: relativePath,
        line: lineNumberForIndex(source, match.index),
        key,
        value: normalizedValue,
      });
    }

    for (const match of source.matchAll(fallbackOrRegex)) {
      fallbackPatterns.push({
        type: "logical-or-fallback",
        file: relativePath,
        line: lineNumberForIndex(source, match.index),
        value: normalizeWhitespace(match[2]),
      });
    }

    for (const match of source.matchAll(attrRegex)) {
      const value = normalizeWhitespace(match[2]);
      if (shouldIgnoreHardcodedText(value)) continue;
      hardcoded.push({
        file: relativePath,
        line: lineNumberForIndex(source, match.index),
        string: value,
        suggestedKey: suggestKey(relativePath, value),
        type: "attribute",
      });
    }

    for (const match of source.matchAll(textNodeRegex)) {
      const value = normalizeWhitespace(match[2]);
      if (shouldIgnoreHardcodedText(value)) continue;
      if (/^(true|false|null|undefined)$/i.test(value)) continue;
      hardcoded.push({
        file: relativePath,
        line: lineNumberForIndex(source, match.index),
        string: value,
        suggestedKey: suggestKey(relativePath, value),
        type: "text-node",
      });
    }
  }

  const missingKeys = [];
  for (const [key, usages] of translationKeyUsages.entries()) {
    const missingLocales = Object.entries(localeMaps)
      .filter(([, map]) => !map.has(key))
      .map(([locale]) => locale);

    if (missingLocales.length === 0) continue;
    missingKeys.push({
      key,
      missingLocales,
      usage: usages,
      defaults: [...(translationDefaults.get(key) ?? [])],
      suggestedEnglish: [...(translationDefaults.get(key) ?? [])][0] ?? humanizeKeySegment(key.split(".").pop() ?? key),
      presentInEnglish: baseline.has(key),
    });
  }

  return {
    hardcoded,
    missingKeys: missingKeys.sort((a, b) => a.key.localeCompare(b.key)),
    fallbackPatterns,
  };
}

const localeMaps = loadLocales();
const files = SOURCE_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)));
const report = {
  generatedAt: new Date().toISOString(),
  localeFiles: Object.keys(localeMaps),
  summary: {
    hardcodedCount: 0,
    missingKeyCount: 0,
    fallbackPatternCount: 0,
  },
  ...scanTranslations(files, localeMaps),
};

report.summary.hardcodedCount = report.hardcoded.length;
report.summary.missingKeyCount = report.missingKeys.length;
report.summary.fallbackPatternCount = report.fallbackPatterns.length;

fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n");

console.log(`Audit written to ${REPORT_PATH}`);
console.log(`Missing keys: ${report.summary.missingKeyCount}`);
console.log(`Hardcoded strings: ${report.summary.hardcodedCount}`);
console.log(`Fallback patterns: ${report.summary.fallbackPatternCount}`);
