/**
 * eslint-rules/no-missing-translation-keys.js
 *
 * Validates that every key passed to t() / tSafe() exists in ALL locale JSON
 * files.  Runs statically at lint-time - no runtime required.
 *
 * --- What it catches ---
 *  FAIL: t("pricing.title")          - key missing in fr.json
 *  FAIL: tSafe("hero.nonExistentKey")
 *
 * --- What it ignores ---
 *  OK: t("key", { defaultValue: "..." })  - has explicit fallback
 *  OK: Dynamic keys: t(`namespace.${variable}`) - cannot validate statically
 *  OK: Admin-only namespaces (configurable via ignoreNamespaces)
 *
 * --- Configuration (in eslint.config.js options) ---
 *  localeDir: string          - path to locale JSON files (default: "i18n/locales")
 *  locales: string[]          - locale filenames to check (default: all *.json in dir)
 *  ignoreNamespaces: string[] - namespace prefixes to skip (default: ["admin","owner","dashboard"])
 *  warnOnly: boolean          - downgrade errors to warnings (default: false)
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ---- Build a flat key set from a nested JSON object ----

function flattenKeys(obj, prefix = "", acc = new Set()) {
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      flattenKeys(v, full, acc);
    } else {
      acc.add(full);
    }
  }
  return acc;
}

// ---- Lazy-load and cache locale key sets ----

const _cache = new Map(); // cwd+localeDir → { locales: Map<name, Set<key>> }

function getLocaleData(cwd, localeDir, requestedLocales) {
  const cacheKey = `${cwd}::${localeDir}`;
  if (_cache.has(cacheKey)) return _cache.get(cacheKey);

  const absDir = path.resolve(cwd, localeDir);
  const result = { locales: new Map(), error: null };

  try {
    const files =
      requestedLocales?.length > 0
        ? requestedLocales.map((l) => `${l}.json`)
        : fs.readdirSync(absDir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const absFile = path.join(absDir, file);
      try {
        const raw = JSON.parse(fs.readFileSync(absFile, "utf-8"));
        result.locales.set(file.replace(".json", ""), flattenKeys(raw));
      } catch {
        result.error = `Cannot read ${absFile}`;
      }
    }
  } catch {
    result.error = `Cannot read locale directory: ${absDir}`;
  }

  _cache.set(cacheKey, result);
  return result;
}

// ---- Extract static string from first argument of t() ----

function extractStaticKey(node) {
  // t("namespace.key")  →  "namespace.key"
  if (node.type === "Literal" && typeof node.value === "string") {
    return node.value;
  }
  // t(`namespace.key`)  → template literal with no expressions
  if (
    node.type === "TemplateLiteral" &&
    node.expressions.length === 0 &&
    node.quasis.length === 1
  ) {
    return node.quasis[0].value.cooked;
  }
  return null; // dynamic key — cannot validate
}

// ---- Rule implementation ----

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Ensure every t() / tSafe() key exists in all locale JSON files.",
    },
    schema: [
      {
        type: "object",
        properties: {
          localeDir: { type: "string" },
          locales: { type: "array", items: { type: "string" } },
          ignoreNamespaces: { type: "array", items: { type: "string" } },
          warnOnly: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingKey:
        'Translation key "{{key}}" is missing in locale(s): {{locales}}. Add it or use tSafe() with a defaultValue.',
      localeLoadError:
        "Could not load locale files: {{error}}",
    },
  },

  create(context) {
    const opts = context.options[0] ?? {};
    const localeDir = opts.localeDir ?? "i18n/locales";
    const requestedLocales = opts.locales ?? [];
    const ignoreNamespaces = new Set(
      opts.ignoreNamespaces ?? ["admin", "owner", "dashboard"]
    );
    const severity = opts.warnOnly ? "warn" : "error";

    // Resolve cwd relative to the project root (where ESLint runs from)
    const cwd =
      context.getCwd?.() ?? process.cwd();

    const { locales, error } = getLocaleData(cwd, localeDir, requestedLocales);

    if (error) {
      // Emit a single file-level warning if we can't load locales
      return {
        Program(node) {
          context.report({
            node,
            messageId: "localeLoadError",
            data: { error },
            severity: "warn",
          });
        },
      };
    }

    /** Check a key against all loaded locales. */
    function checkKey(node, key) {
      // Skip dynamic-looking keys (contain template vars)
      if (!key || key.includes("${")) return;

      // Skip if namespace is in the ignore list
      const namespace = key.split(".")[0];
      if (ignoreNamespaces.has(namespace)) return;

      const missing = [];
      for (const [localeName, keySet] of locales) {
        if (!keySet.has(key)) {
          missing.push(localeName);
        }
      }

      if (missing.length > 0) {
        context.report({
          node,
          messageId: "missingKey",
          data: {
            key,
            locales: missing.join(", "),
          },
          // ESLint v9: severity override not directly on report — use rule-level severity
        });
      }
    }

    /** Is this call to t() or tSafe()? */
    function isTranslationCall(callNode) {
      const { callee } = callNode;
      if (callee.type === "Identifier") {
        return callee.name === "t" || callee.name === "tSafe";
      }
      if (callee.type === "MemberExpression") {
        return (
          callee.property.name === "t" ||
          callee.property.name === "tSafe"
        );
      }
      return false;
    }

    /** Does the call have an explicit defaultValue (making missing key non-fatal)? */
    function hasDefaultValue(callNode) {
      // Two-arg form: t("key", "default string")
      if (
        callNode.arguments.length >= 2 &&
        callNode.arguments[1].type === "Literal"
      ) {
        return true;
      }
      // Options object: t("key", { defaultValue: "..." })
      if (
        callNode.arguments.length >= 2 &&
        callNode.arguments[1].type === "ObjectExpression"
      ) {
        return callNode.arguments[1].properties.some(
          (p) =>
            p.type === "Property" &&
            ((p.key.type === "Identifier" && p.key.name === "defaultValue") ||
              (p.key.type === "Literal" && p.key.value === "defaultValue"))
        );
      }
      return false;
    }

    return {
      CallExpression(node) {
        if (!isTranslationCall(node)) return;
        if (node.arguments.length === 0) return;
        if (hasDefaultValue(node)) return; // explicit fallback → don't warn

        const key = extractStaticKey(node.arguments[0]);
        if (key) checkKey(node.arguments[0], key);
      },
    };
  },
};
