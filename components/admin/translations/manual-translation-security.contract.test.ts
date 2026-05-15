import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const drawerSource = readFileSync(
  join(process.cwd(), "components", "admin", "translations", "TranslationEditorDrawer.tsx"),
  "utf8",
);
const tableSource = readFileSync(
  join(process.cwd(), "components", "admin", "translations", "TranslationJobsTable.tsx"),
  "utf8",
);
const queriesSource = readFileSync(
  join(process.cwd(), "lib", "admin", "translations", "queries.ts"),
  "utf8",
);

describe("manual translation admin security contract", () => {
  it("keeps service-role access out of client translation UI", () => {
    for (const source of [drawerSource, tableSource]) {
      expect(source).not.toContain("createServiceRoleClient");
      expect(source).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    }
    expect(queriesSource).toContain("/api/admin/translations/jobs");
  });
});
