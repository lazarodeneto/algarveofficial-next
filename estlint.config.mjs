
import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const localI18nPlugin = require("./eslint-rules/index.js");

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      local: localI18nPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // 🔴 fix crítico
      "local/no-unsafe-default": "off",

      // ⚠️ warnings úteis
      "local/no-hardcoded-strings": "warn",
      "no-console": "warn",
      "prefer-const": "warn",
    },
  },
]);
