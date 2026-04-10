#!/usr/bin/env node

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const LOCALE_DIR = path.join(ROOT, "i18n/locales");
const AUDIT_PATH = path.join(ROOT, "translation-audit.json");
const DEFAULT_LOCALE = "en";
const TARGET_LOCALES = ["pt-pt", "de", "fr", "es", "it", "nl", "sv", "no", "da"];
const BRAND_TOKENS = ["AlgarveOfficial", "Algarve", "WhatsApp", "LinkedIn", "Facebook"];
const TRANSLATION_API = "https://translate.googleapis.com/translate_a/single";

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

function unflattenTranslations(flatMap) {
  const root = {};
  const sortedEntries = [...flatMap.entries()].sort(([a], [b]) => a.localeCompare(b));

  for (const [fullKey, value] of sortedEntries) {
    const parts = fullKey.split(".");
    let cursor = root;
    for (let index = 0; index < parts.length - 1; index += 1) {
      const part = parts[index];
      if (!cursor[part] || typeof cursor[part] !== "object" || Array.isArray(cursor[part])) {
        cursor[part] = {};
      }
      cursor = cursor[part];
    }
    cursor[parts.at(-1)] = value;
  }

  return root;
}

function readLocale(locale) {
  const fullPath = path.join(LOCALE_DIR, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  return {
    path: fullPath,
    flat: flattenTranslations(data),
  };
}

function restoreTokens(translated, tokens) {
  let restored = translated;
  for (const [placeholder, original] of tokens) {
    restored = restored.replaceAll(placeholder, original);
  }
  return restored;
}

function protectTokens(value) {
  const tokens = new Map();
  let protectedValue = value;
  let tokenIndex = 0;

  const register = (original) => {
    const placeholder = `TOK${tokenIndex}ZZ`;
    tokenIndex += 1;
    tokens.set(placeholder, original);
    protectedValue = protectedValue.replaceAll(original, placeholder);
  };

  for (const match of value.matchAll(/\{\{[^}]+\}\}/g)) {
    register(match[0]);
  }

  for (const token of BRAND_TOKENS) {
    if (protectedValue.includes(token)) register(token);
  }

  return { protectedValue, tokens };
}

async function translateText(text, locale) {
  if (!text.trim()) return text;

  const targetLocale = locale === "pt-pt" ? "pt" : locale;
  const { protectedValue, tokens } = protectTokens(text);
  const url = new URL(TRANSLATION_API);

  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", targetLocale);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", protectedValue);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Translation request failed for ${locale}: ${response.status}`);
  }

  const payload = await response.json();
  const translated = Array.isArray(payload?.[0])
    ? payload[0].map((entry) => entry?.[0] ?? "").join("")
    : text;

  return restoreTokens(translated, tokens);
}

function escapeJsonString(value) {
  return JSON.stringify(value);
}

function normalizeEnglishValue(value) {
  return value.replace(/\$\{(\w+)\}/g, "{{$1}}");
}

async function main() {
  if (!fs.existsSync(AUDIT_PATH)) {
    throw new Error("translation-audit.json was not found. Run node scripts/auditTranslations.mjs first.");
  }

  const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf8"));
  const missingKeys = audit.missingKeys.filter(
    (entry) =>
      entry.key &&
      !entry.key.includes("${") &&
      entry.key !== "..." &&
      entry.key !== "common.title" &&
      entry.key !== "common.welcome" &&
      entry.key !== "common.optionalKey",
  );

  const locales = {
    [DEFAULT_LOCALE]: readLocale(DEFAULT_LOCALE),
  };

  for (const locale of TARGET_LOCALES) {
    locales[locale] = readLocale(locale);
  }

  const translationCache = new Map();

  for (const entry of missingKeys) {
    const englishValue = normalizeEnglishValue((entry.suggestedEnglish || "").trim());
    if (!englishValue) continue;

    if (!locales[DEFAULT_LOCALE].flat.has(entry.key)) {
      locales[DEFAULT_LOCALE].flat.set(entry.key, englishValue);
    }

    for (const locale of entry.missingLocales) {
      if (!locales[locale] || locales[locale].flat.has(entry.key)) continue;
      const cacheKey = `${locale}:${englishValue}`;
      let translatedValue = translationCache.get(cacheKey);
      if (!translatedValue) {
        translatedValue = await translateText(englishValue, locale);
        translationCache.set(cacheKey, translatedValue);
      }
      locales[locale].flat.set(entry.key, translatedValue);
      console.log(`${locale}: ${entry.key} -> ${escapeJsonString(translatedValue)}`);
    }
  }

  for (const locale of [DEFAULT_LOCALE, ...TARGET_LOCALES]) {
    const output = JSON.stringify(unflattenTranslations(locales[locale].flat), null, 2) + "\n";
    fs.writeFileSync(locales[locale].path, output);
  }

  console.log(`Updated ${1 + TARGET_LOCALES.length} locale files.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
