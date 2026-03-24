import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { createRequire } from "module";

// Local custom rules (CommonJS plugin loaded via createRequire)
const require = createRequire(import.meta.url);
const localI18nPlugin = require("./eslint-rules/index.js");

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "@next/next/no-img-element": "error",
      "react-hooks/exhaustive-deps": "error",
      "import/no-anonymous-default-export": "off",
    },
  },
  // ─── i18n enforcement ────────────────────────────────────────────────────
  {
    // Apply to all app + component source files (not tests, scripts, config)
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
    plugins: { local: localI18nPlugin },
    rules: {
      // Warn on hardcoded strings — promote to "error" once the baseline is clean
      // Run `npm run lint:i18n` to see current count
      "local/no-hardcoded-strings": [
        "warn",
        {
          minWordLength: 3,
          allowedTerms: [
            "AlgarveOfficial",
            "Algarve",
            "Official",
            "Premium",
            "Signature",
            "Verified",
            "Michelin",
            "WhatsApp",
            "Black Friday",
          ],
          ignoreComponents: ["Head", "Script", "code", "pre", "kbd"],
          ignoreAttributes: [
            "className", "style", "id", "name", "type", "href", "src",
            "data-testid", "data-cy", "role", "tabIndex", "autoComplete",
            "method", "action", "target", "rel", "key", "ref", "as",
            "variant", "size", "align",
          ],
        },
      ],
      // Error on missing translation keys — catches gaps BEFORE deploy
      "local/no-missing-translation-keys": [
        "error",
        {
          localeDir: "i18n/locales",
          ignoreNamespaces: ["admin", "owner", "dashboard"],
        },
      ],
    },
  },
  // ─── Next.js page/layout components ────────────────────────────────────────
  {
    files: ["app/**/*.tsx"],
    rules: {
      // Next.js requires certain parameters (params, searchParams) even if unused
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^(params|searchParams|_)",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      // Allow 'any' in page files for metadata and other dynamic data
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Migration snapshots and generated bundles.
    ".migration-backup-*/**",
    // Archived React Router app kept for migration reference only.
    "legacy-pages/**",
    "assets/**",
    "output/**",
  ]),
]);

export default eslintConfig;
