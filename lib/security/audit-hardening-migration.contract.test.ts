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
    expect(source).toContain("to_regclass('public.placement_slots')");
    expect(source).toContain("ALTER TABLE public.placement_slots FORCE ROW LEVEL SECURITY");
    expect(source).toContain("to_regclass('public.listing_subscriptions')");
    expect(source).toContain("ALTER TABLE public.listing_subscriptions FORCE ROW LEVEL SECURITY");
    expect(source).toContain("REVOKE ALL ON public.placement_slots FROM anon");
    expect(source).toContain("REVOKE ALL ON public.listing_subscriptions FROM authenticated");
    expect(source).not.toMatch(/FOR ALL\s+USING\s*\(\s*true\s*\)/i);
  });

  it("keeps revenue audit tables service-role only", () => {
    expect(source).toContain("to_regclass('public.stripe_events_processed')");
    expect(source).toContain("ALTER TABLE public.stripe_events_processed ENABLE ROW LEVEL SECURITY");
    expect(source).toContain("to_regclass('public.slot_transactions')");
    expect(source).toContain("ALTER TABLE public.slot_transactions FORCE ROW LEVEL SECURITY");
    expect(source).toContain("REVOKE ALL ON public.stripe_events_processed FROM authenticated");
    expect(source).toContain("REVOKE ALL ON public.slot_transactions FROM anon");
    expect(source).toContain("GRANT ALL ON public.stripe_events_processed TO service_role");
    expect(source).toContain("GRANT ALL ON public.slot_transactions TO service_role");
  });

  it("guards optional legacy functions with valid Postgres syntax", () => {
    expect(source).toContain(
      "to_regprocedure('public.confirm_slot_with_validation(uuid,text,text,integer,integer,text)')",
    );
    expect(source).toContain("to_regprocedure('public.cleanup_stale_slots()')");
    expect(source).toContain(
      "to_regprocedure('public.reserve_slot(uuid,text,text,integer,uuid,integer,text)')",
    );
    expect(source).toContain("to_regprocedure('public.reserve_slot(uuid,text,text,integer,uuid)')");
    expect(source).toContain("to_regprocedure('public.release_expired_reservations()')");
    expect(source).toContain(
      "to_regprocedure('public.confirm_slot_reservation(uuid,text,text,integer)')",
    );
    expect(source).toContain("to_regprocedure('public.clear_slot_reservation(text,text,integer)')");
    expect(source).not.toContain("ALTER FUNCTION IF EXISTS");
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
