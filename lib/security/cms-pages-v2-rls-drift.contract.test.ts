import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();
const MIGRATION_PATH = join(
  REPO_ROOT,
  "supabase/migrations/20260504201000_fix_cms_pages_v2_rls_drift.sql",
);

function migrationSource() {
  return readFileSync(MIGRATION_PATH, "utf8");
}

describe("cms_pages_v2 RLS drift migration", () => {
  it("enables RLS without disabling it elsewhere", () => {
    const source = migrationSource();

    expect(source).toContain("ALTER TABLE public.cms_pages_v2 ENABLE ROW LEVEL SECURITY;");
    expect(source).not.toMatch(/DISABLE\s+ROW\s+LEVEL\s+SECURITY/i);
  });

  it("keeps public reads limited to published CMS pages", () => {
    const source = migrationSource();

    expect(source).toContain("DROP POLICY IF EXISTS cms_pages_v2_public_read ON public.cms_pages_v2;");
    expect(source).toContain("CREATE POLICY cms_pages_v2_public_read");
    expect(source).toMatch(/FOR\s+SELECT\s+TO\s+anon,\s*authenticated\s+USING\s+\(status\s+=\s+'published'\)/s);
    expect(source).toContain("GRANT SELECT ON public.cms_pages_v2 TO anon, authenticated;");
  });

  it("keeps authenticated CMS writes behind admin/editor checks", () => {
    const source = migrationSource();

    expect(source).toContain("DROP POLICY IF EXISTS cms_pages_v2_admin_all ON public.cms_pages_v2;");
    expect(source).toContain("CREATE POLICY cms_pages_v2_admin_all");
    expect(source).toContain("FOR ALL");
    expect(source).toContain("TO authenticated");
    expect(source).toContain("USING (public.is_admin_or_editor(auth.uid()))");
    expect(source).toContain("WITH CHECK (public.is_admin_or_editor(auth.uid()))");
    expect(source).not.toMatch(/GRANT\s+ALL\s+ON\s+public\.cms_pages_v2\s+TO\s+authenticated/i);
  });

  it("preserves service-role maintenance access without widening public grants", () => {
    const source = migrationSource();

    expect(source).toContain("GRANT ALL ON public.cms_pages_v2 TO service_role;");
    expect(source).not.toMatch(/GRANT\s+(INSERT|UPDATE|DELETE|ALL).*TO\s+anon/i);
  });
});
