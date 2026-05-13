import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();
const CURRENT_REPAIR_MIGRATION = join(
  REPO_ROOT,
  "supabase/migrations/20260514190000_enable_cms_pages_v2_rls.sql",
);

function migrationSource() {
  return readFileSync(CURRENT_REPAIR_MIGRATION, "utf8");
}

describe("current cms_pages_v2 RLS repair migration", () => {
  it("enables row level security on cms_pages_v2", () => {
    const source = migrationSource();

    expect(source).toContain("ALTER TABLE public.cms_pages_v2 ENABLE ROW LEVEL SECURITY;");
    expect(source).not.toMatch(/DISABLE\s+ROW\s+LEVEL\s+SECURITY/i);
  });

  it("does not widen cms_pages_v2 grants or policies", () => {
    const source = migrationSource();

    expect(source).not.toMatch(/GRANT\s+(INSERT|UPDATE|DELETE|ALL).*TO\s+(anon|authenticated)/i);
    expect(source).not.toMatch(/CREATE\s+POLICY/i);
    expect(source).not.toMatch(/DROP\s+POLICY/i);
  });
});
