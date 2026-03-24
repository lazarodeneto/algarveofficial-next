/**
 * eslint-rules/no-hardcoded-strings.js
 *
 * Detects hardcoded English string literals inside JSX that bypass the
 * translation system.  Works with ESLint v9 flat-config (used by this project).
 *
 * --- What it catches ---
 *  FAIL: <Button>Book Now</Button>
 *  FAIL: <p>Welcome to the Algarve</p>
 *  FAIL: <h1>Our Partners</h1>
 *
 * --- What it allows ---
 *  OK: <Button>{t("cta.book")}</Button>
 *  OK: <p>{t("hero.subtitle")}</p>
 *  OK: <span>{count}</span>          (variable, not a literal)
 *  OK: <div className="foo">         (attribute string, not JSX text)
 *  OK: <img alt="logo" />            (alt text exempt when short)
 *  OK: Comments are ignored
 *  OK: AlgarveOfficial               (brand name - configurable)
 *  OK: &amp; / © 2025                (punctuation-only strings)
 *  OK: Numbers / prices              (e.g. "€299", "4.8")
 *
 * --- Options ---
 *  allowedTerms: string[]     - exact terms that are always allowed
 *  minWordLength: number      - strings shorter than this are skipped (default 3)
 *  ignoreComponents: string[] - component names whose JSX text is never checked
 *  ignoreAttributes: string[] - JSX attribute names that are never checked
 */

"use strict";

const DEFAULT_ALLOWED_TERMS = new Set([
  // Brand / product names
  "AlgarveOfficial",
  "Algarve",
  "Official",
  "Supabase",
  "Vercel",
  // Commonly-used English proper nouns in Algarve context
  "Algarve Official",
  "Premium",
  "Signature",
  "Verified",
  // Technical strings that are legitimate in JSX
  "Loading…",
  "...",
  "—",
  "·",
  "&amp;",
  "&copy;",
]);

// Regex patterns that identify "safe" strings we should never flag
const SAFE_PATTERNS = [
  /^[\s\d€$£¥.,/:;!?*#@()\[\]{}\-+=%&|<>~`'"\\]+$/, // punctuation / numbers only
  /^\d/, // starts with a digit (price, count, year…)
  /^©/, // copyright symbol
  /^[A-Z]{1,5}$/, // short acronym / code e.g. "EN", "FAQ", "CMS"
  /^[a-z]{1,4}$/, // very short lowercase words (e.g. "px", "vs")
  /^\s+$/, // pure whitespace
  /^[\u2018\u2019\u201C\u201D\u2014\u2013\u00A0]+$/, // typographic punctuation
];

/** Returns true when a string is considered safe to hardcode. */
function isSafeString(str, allowedTerms) {
  const trimmed = str.trim();
  if (!trimmed) return true;
  if (allowedTerms.has(trimmed)) return true;
  if (SAFE_PATTERNS.some((re) => re.test(trimmed))) return true;
  // Strip HTML entities and check again
  const stripped = trimmed.replace(/&\w+;/g, "").trim();
  if (!stripped) return true;
  return false;
}

/** Checks whether a JSX node is already wrapped in a t() / tSafe() call. */
function isInsideTranslationCall(node) {
  let parent = node.parent;
  while (parent) {
    if (
      parent.type === "CallExpression" &&
      parent.callee &&
      (
        (parent.callee.type === "Identifier" &&
          (parent.callee.name === "t" || parent.callee.name === "tSafe")) ||
        (parent.callee.type === "MemberExpression" &&
          parent.callee.property &&
          (parent.callee.property.name === "t" ||
            parent.callee.property.name === "tSafe"))
      )
    ) {
      return true;
    }
    // Stop climbing when we leave JSX context
    if (
      parent.type === "JSXElement" ||
      parent.type === "JSXExpressionContainer"
    ) {
      break;
    }
    parent = parent.parent;
  }
  return false;
}

/** Get the name of the containing JSX element (e.g. "Button", "p"). */
function getContainingJSXElementName(node) {
  let cur = node.parent;
  while (cur) {
    if (cur.type === "JSXElement" && cur.openingElement) {
      const name = cur.openingElement.name;
      if (name.type === "JSXIdentifier") return name.name;
      if (name.type === "JSXMemberExpression") {
        return `${name.object.name}.${name.property.name}`;
      }
    }
    cur = cur.parent;
  }
  return null;
}

/** Walk up and check if inside a JSX attribute (like aria-label="foo"). */
function isInsideJSXAttribute(node, allowedAttributes) {
  let cur = node.parent;
  while (cur) {
    if (cur.type === "JSXAttribute") {
      if (!allowedAttributes) return true; // any attribute → skip
      const attrName =
        cur.name?.type === "JSXIdentifier" ? cur.name.name : null;
      if (attrName && allowedAttributes.includes(attrName)) return true;
    }
    // Stop when we've left attribute territory
    if (cur.type === "JSXOpeningElement") break;
    cur = cur.parent;
  }
  return false;
}

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow hardcoded string literals inside JSX — use t() instead.",
      url: "https://github.com/algarveofficial/algarveofficial-next/blob/main/eslint-rules/no-hardcoded-strings.js",
    },
    schema: [
      {
        type: "object",
        properties: {
          allowedTerms: { type: "array", items: { type: "string" } },
          minWordLength: { type: "number" },
          ignoreComponents: { type: "array", items: { type: "string" } },
          ignoreAttributes: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      hardcodedString:
        'Hardcoded string "{{text}}" in JSX. Use t("namespace.key") instead.',
    },
  },

  create(context) {
    const options = context.options[0] ?? {};
    const allowedTerms = new Set([
      ...DEFAULT_ALLOWED_TERMS,
      ...(options.allowedTerms ?? []),
    ]);
    const minWordLength = options.minWordLength ?? 3;
    const ignoreComponents = new Set(options.ignoreComponents ?? [
      // Components where hardcoded strings are expected (e.g. UI primitives)
      "Head",
      "Script",
      "style",
      "code",
      "pre",
      "kbd",
    ]);
    const ignoreAttributes = options.ignoreAttributes ?? [
      "className",
      "style",
      "id",
      "name",
      "type",
      "href",
      "src",
      "placeholder", // Usually should be translated — flag separately
      "data-testid",
      "data-cy",
      "role",
      "tabIndex",
      "autoComplete",
      "method",
      "action",
      "target",
      "rel",
      "key",
      "ref",
    ];

    /** Report a violation on the node. */
    function report(node, text) {
      context.report({
        node,
        messageId: "hardcodedString",
        data: { text: text.trim().slice(0, 60) },
      });
    }

    return {
      // ── JSX text nodes (e.g. <p>Hello World</p>) ─────────────────────────
      JSXText(node) {
        const raw = node.value;
        const trimmed = raw.trim();

        // Skip empty / whitespace-only
        if (!trimmed) return;

        // Skip very short tokens (single chars, punctuation)
        if (trimmed.length < minWordLength) return;

        // Must contain at least one letter to be considered a string
        if (!/[a-zA-ZÀ-ÿ]/.test(trimmed)) return;

        if (isSafeString(trimmed, allowedTerms)) return;

        const componentName = getContainingJSXElementName(node);
        if (componentName && ignoreComponents.has(componentName)) return;

        report(node, trimmed);
      },

      // ── String literals inside JSX expressions: <p>{"Hello"}</p> ─────────
      "JSXExpressionContainer > Literal"(node) {
        if (typeof node.value !== "string") return;
        const trimmed = node.value.trim();
        if (!trimmed) return;
        if (trimmed.length < minWordLength) return;
        if (!/[a-zA-ZÀ-ÿ]/.test(trimmed)) return;
        if (isSafeString(trimmed, allowedTerms)) return;

        // Skip if inside a JSX attribute (handled below)
        if (isInsideJSXAttribute(node, null)) return;

        // Skip if the parent expression is a t() call
        if (isInsideTranslationCall(node)) return;

        const componentName = getContainingJSXElementName(node);
        if (componentName && ignoreComponents.has(componentName)) return;

        report(node, trimmed);
      },

      // ── JSX attribute string literals: <Button label="Submit"> ───────────
      "JSXAttribute > Literal, JSXAttribute > JSXExpressionContainer > Literal"(node) {
        if (typeof node.value !== "string") return;
        const trimmed = node.value.trim();
        if (!trimmed || trimmed.length < minWordLength) return;
        if (!/[a-zA-ZÀ-ÿ]/.test(trimmed)) return;
        if (isSafeString(trimmed, allowedTerms)) return;

        // Find the attribute this literal belongs to
        let attrNode = node.parent;
        while (attrNode && attrNode.type !== "JSXAttribute") {
          attrNode = attrNode.parent;
        }
        if (!attrNode) return;

        const attrName =
          attrNode.name?.type === "JSXIdentifier" ? attrNode.name.name : null;

        // Always ignore structural / non-displayed attributes
        if (attrName && ignoreAttributes.includes(attrName)) return;

        // User-visible attributes that MUST be translated:
        const MUST_TRANSLATE_ATTRS = [
          "alt",
          "title",
          "aria-label",
          "aria-description",
          "placeholder",
          "label",
        ];
        if (!attrName || !MUST_TRANSLATE_ATTRS.includes(attrName)) return;

        if (isInsideTranslationCall(node)) return;

        report(node, trimmed);
      },
    };
  },
};
