import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();
const MIGRATION_PATH = join(
  REPO_ROOT,
  "supabase/migrations/20260504193500_harden_p0_rpc_functions.sql",
);

function migrationSource() {
  return readFileSync(MIGRATION_PATH, "utf8");
}

describe("Supabase P0 RPC hardening migration", () => {
  it("derives claim approver identity from auth.uid instead of caller input", () => {
    const source = migrationSource();

    expect(source).toContain("CREATE OR REPLACE FUNCTION public.approve_claim_and_assign_listing");
    expect(source).toContain("_actor_id uuid := auth.uid()");
    expect(source).toContain("public.has_role(_actor_id, 'admin'::public.app_role)");
    expect(source).toContain("public.has_role(_actor_id, 'editor'::public.app_role)");
    expect(source).toContain("reviewed_by = _actor_id");
    expect(source).not.toContain("reviewed_by = _reviewer_id");
  });

  it("derives contact and subscription access from auth.uid", () => {
    const source = migrationSource();

    expect(source).toContain("CREATE OR REPLACE FUNCTION public.get_listing_contact_for_user");
    expect(source).toContain("_user_id IS NOT NULL AND _user_id <> _actor_id");
    expect(source).toContain("owner_id = _actor_id");
    expect(source).toContain("viewer_id = _actor_id");
    expect(source).not.toContain("owner_id = _user_id");
    expect(source).not.toContain("viewer_id = _user_id");

    expect(source).toContain("CREATE OR REPLACE FUNCTION public.get_owner_subscription_status");
    expect(source).toContain("_owner_id <> _actor_id");
    expect(source).toContain("public.has_role(_actor_id, 'admin'::public.app_role)");
    expect(source).toContain("public.has_role(_actor_id, 'editor'::public.app_role)");
  });

  it("removes anonymous RPC execute access while preserving authenticated app flow", () => {
    const source = migrationSource();
    const functions = [
      "public.approve_claim_and_assign_listing(uuid, uuid, uuid)",
      "public.get_listing_contact_for_user(uuid, uuid)",
      "public.get_owner_subscription_status(uuid)",
    ];

    for (const functionName of functions) {
      expect(source).toContain(`REVOKE EXECUTE ON FUNCTION ${functionName} FROM PUBLIC;`);
      expect(source).toContain(`REVOKE EXECUTE ON FUNCTION ${functionName} FROM anon;`);
      expect(source).toContain(`GRANT EXECUTE ON FUNCTION ${functionName} TO authenticated, service_role;`);
    }
  });
});
