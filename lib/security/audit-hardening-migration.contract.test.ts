import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = join(
  process.cwd(),
  "supabase/migrations/20260518100000_harden_audit_blockers.sql",
);

const source = readFileSync(migrationPath, "utf8");

describe("audit hardening migration", () => {
  it("removes unsafe monetization policies and denies anon table access", () => {
    expect(source).toContain('DROP POLICY IF EXISTS "Public read placement_slots"');
    expect(source).toContain('DROP POLICY IF EXISTS "Admin manage placement_slots"');
    expect(source).toContain('DROP POLICY IF EXISTS "Public read listing_subscriptions"');
    expect(source).toContain('DROP POLICY IF EXISTS "Admin manage listing_subscriptions"');
    expect(source).toContain("ALTER TABLE IF EXISTS public.placement_slots FORCE ROW LEVEL SECURITY");
    expect(source).toContain("ALTER TABLE IF EXISTS public.listing_subscriptions FORCE ROW LEVEL SECURITY");
    expect(source).toContain("REVOKE ALL ON public.placement_slots FROM anon");
    expect(source).toContain("REVOKE ALL ON public.listing_subscriptions FROM authenticated");
    expect(source).not.toMatch(/FOR ALL\s+USING\s*\(\s*true\s*\)/i);
  });

  it("keeps revenue audit tables service-role only", () => {
    expect(source).toContain("ALTER TABLE IF EXISTS public.stripe_events_processed ENABLE ROW LEVEL SECURITY");
    expect(source).toContain("ALTER TABLE IF EXISTS public.slot_transactions FORCE ROW LEVEL SECURITY");
    expect(source).toContain("REVOKE ALL ON public.stripe_events_processed FROM authenticated");
    expect(source).toContain("REVOKE ALL ON public.slot_transactions FROM anon");
    expect(source).toContain("GRANT ALL ON public.stripe_events_processed TO service_role");
    expect(source).toContain("GRANT ALL ON public.slot_transactions TO service_role");
  });

  it("uses an atomic security-definer RPC for communication rate limits", () => {
    expect(source).toContain("CREATE OR REPLACE FUNCTION public.check_communication_rate_limit");
    expect(source).toContain("SECURITY DEFINER");
    expect(source).toContain("SET search_path = public, pg_temp");
    expect(source).toContain("ON CONFLICT (scope, identifier_hash)");
    expect(source).toContain("RETURN v_count > p_max_attempts");
    expect(source).toContain(
      "REVOKE ALL ON FUNCTION public.check_communication_rate_limit(TEXT, TEXT, INTEGER, INTEGER, JSONB)",
    );
    expect(source).toContain(
      "GRANT EXECUTE ON FUNCTION public.check_communication_rate_limit(TEXT, TEXT, INTEGER, INTEGER, JSONB)",
    );
  });
});
