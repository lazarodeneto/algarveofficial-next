/**
 * eslint-rules/index.js
 *
 * Local ESLint plugin — exposes all custom i18n rules as a single import.
 *
 * Usage in eslint.config.js:
 *
 *   import localPlugin from "./eslint-rules/index.js";
 *
 *   export default defineConfig([
 *     ...
 *     {
 *       plugins: { local: localPlugin },
 *       rules: {
 *         "local/no-hardcoded-strings": "error",
 *         "local/no-missing-translation-keys": "error",
 *       },
 *     },
 *   ]);
 */

"use strict";

module.exports = {
  rules: {
    "no-hardcoded-strings": require("./no-hardcoded-strings"),
    "no-missing-translation-keys": require("./no-missing-translation-keys"),
  },
  // Convenience config presets
  configs: {
    recommended: {
      rules: {
        "local/no-hardcoded-strings": [
          "warn", // Start as warn — promote to error once baseline is clean
          {
            minWordLength: 3,
            allowedTerms: [
              "AlgarveOfficial",
              "Algarve",
              "Official",
              "Premium",
              "Signature",
              "Verified",
            ],
            ignoreComponents: ["Head", "Script", "code", "pre", "kbd"],
            ignoreAttributes: [
              "className", "style", "id", "name", "type", "href",
              "src", "data-testid", "data-cy", "role", "tabIndex",
              "autoComplete", "method", "action", "target", "rel",
            ],
          },
        ],
        "local/no-missing-translation-keys": [
          "error",
          {
            localeDir: "i18n/locales",
            ignoreNamespaces: ["admin", "owner", "dashboard"],
          },
        ],
      },
    },
    strict: {
      rules: {
        "local/no-hardcoded-strings": [
          "error",
          {
            minWordLength: 2,
            ignoreComponents: ["Head", "Script", "code", "pre", "kbd"],
          },
        ],
        "local/no-missing-translation-keys": [
          "error",
          {
            localeDir: "i18n/locales",
            ignoreNamespaces: [],
          },
        ],
      },
    },
  },
};
