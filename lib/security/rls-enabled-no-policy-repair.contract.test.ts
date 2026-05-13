import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();
const RLS_REPAIR_MIGRATION = join(
  REPO_ROOT,
  "supabase/migrations/20260514193000_restore_missing_rls_policies.sql",
);

const PUBLIC_READ_TABLES = ["golf_holes", "listing_featured_positions"];
const DENY_CLIENT_TABLES = [
  "content_links",
  "listing_quality_checks",
  "stripe_webhook_events",
  "subscription_audit_log",
];

function migrationSource() {
  return readFileSync(RLS_REPAIR_MIGRATION, "utf8");
}

describe("RLS enabled no-policy repair migration", () => {
  it("enables RLS for every table reported by Supabase advisor", () => {
    const source = migrationSource();

    [...PUBLIC_READ_TABLES, ...DENY_CLIENT_TABLES].forEach((table) => {
      expect(source).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`);
    });
    expect(source).not.toMatch(/DISABLE\s+ROW\s+LEVEL\s+SECURITY/i);
  });

  it("restores public read policies only for public listing/golf data", () => {
    const source = migrationSource();

    expect(source).toContain("CREATE POLICY golf_holes_select_public");
    expect(source).toContain("ON public.golf_holes");
    expect(source).toContain("FOR SELECT");
    expect(source).toContain("TO anon, authenticated");
    expect(source).toContain("USING (true)");
    expect(source).toContain("CREATE POLICY golf_holes_admin_write");
    expect(source).toContain("public.has_role(auth.uid(), 'admin'::public.app_role)");

    expect(source).toContain("CREATE POLICY listing_featured_positions_public_read");
    expect(source).toContain("ON public.listing_featured_positions");
    expect(source).toContain("CREATE POLICY listing_featured_positions_admin_manage");
    expect(source).toContain("public.is_admin_or_editor(auth.uid())");
    expect(source).toContain(
      "REVOKE INSERT, UPDATE, DELETE ON public.listing_featured_positions FROM anon, authenticated",
    );
  });

  it("keeps internal and unknown tables closed to anon/authenticated clients", () => {
    const source = migrationSource();

    DENY_CLIENT_TABLES.forEach((table) => {
      const policyName = `${table}_no_client_access`;

      expect(source).toContain(`CREATE POLICY ${policyName}`);
      expect(source).toContain(`ON public.${table}`);
    });

    const denyPolicyCount = source.match(/USING \(false\)[\s\S]*?WITH CHECK \(false\)/g) ?? [];
    expect(denyPolicyCount).toHaveLength(DENY_CLIENT_TABLES.length);
  });

  it("does not grant client writes or public reads to internal tables", () => {
    const source = migrationSource();

    DENY_CLIENT_TABLES.forEach((table) => {
      expect(source).not.toMatch(
        new RegExp(`GRANT\\s+(SELECT|INSERT|UPDATE|DELETE|ALL).*public\\.${table}.*TO\\s+(anon|authenticated)`, "i"),
      );
    });
  });
});
