import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: [
      "tests/e2e/**",
      "node_modules/**",
      ".next/**",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
