import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = process.cwd();
const ADMIN_PAGE_BUILDER_PATH = join(
  REPO_ROOT,
  "legacy-pages",
  "admin",
  "cms",
  "AdminPageBuilder.tsx",
);

describe("cms page builder locale contract", () => {
  it("reads and writes CMS settings with active locale context", () => {
    const source = readFileSync(ADMIN_PAGE_BUILDER_PATH, "utf8");

    expect(source).toContain("const { i18n } = useTranslation()");
    expect(source).toContain("useGlobalSettings({");
    expect(source).toContain("locale: i18n.resolvedLanguage ?? i18n.language");
  });
});
