import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();
const RLS_MIGRATION_PATH = join(
  REPO_ROOT,
  "supabase/migrations/20260511210000_harden_business_claim_rls.sql",
);
const CLAIM_REVIEW_RPC_PATH = join(
  REPO_ROOT,
  "supabase/migrations/20260511193000_sync_business_claim_tier_to_listing.sql",
);
const CHANGE_REVIEW_RPC_PATH = join(
  REPO_ROOT,
  "supabase/migrations/20260511190000_add_listing_change_request_review_rpc.sql",
);

function readMigration(path: string) {
  return readFileSync(path, "utf8");
}

describe("business claim security migrations", () => {
  it("forces public claim submissions through the API path", () => {
    const source = readMigration(RLS_MIGRATION_PATH);

    expect(source).toContain('DROP POLICY IF EXISTS "business_claims_insert_own"');
    expect(source).toContain('CREATE POLICY "business_claims_no_direct_claimant_insert"');
    expect(source).toContain("WITH CHECK (false)");
    expect(source).toContain("Claim submissions are handled by /api/business-claims");
  });

  it("keeps owner change request inserts pending and owner-scoped", () => {
    const source = readMigration(RLS_MIGRATION_PATH);

    expect(source).toContain('CREATE POLICY "listing_change_requests_insert_own_pending_claimed_listing"');
    expect(source).toContain("owner_id = auth.uid()");
    expect(source).toContain("status = 'pending'::public.listing_change_request_status");
    expect(source).toContain("reviewed_by IS NULL");
    expect(source).toContain("listings.owner_id = auth.uid()");
    expect(source).toContain("listings.claim_status = 'claimed'::public.listing_claim_status");
  });

  it("keeps admin review RPCs admin-only and without public execute access", () => {
    const claimRpc = readMigration(CLAIM_REVIEW_RPC_PATH);
    const changeRpc = readMigration(CHANGE_REVIEW_RPC_PATH);

    expect(claimRpc).toContain("public.has_role(_actor_id, 'admin'::public.app_role)");
    expect(changeRpc).toContain("public.has_role(_actor_id, 'admin'::public.app_role)");

    expect(claimRpc).toContain(
      "REVOKE EXECUTE ON FUNCTION public.admin_review_business_claim(uuid, text, text, boolean) FROM PUBLIC;",
    );
    expect(claimRpc).toContain(
      "REVOKE EXECUTE ON FUNCTION public.admin_review_business_claim(uuid, text, text, boolean) FROM anon;",
    );
    expect(changeRpc).toContain(
      "REVOKE EXECUTE ON FUNCTION public.admin_review_listing_change_request(uuid, text, text) FROM PUBLIC;",
    );
    expect(changeRpc).toContain(
      "REVOKE EXECUTE ON FUNCTION public.admin_review_listing_change_request(uuid, text, text) FROM anon;",
    );
  });
});
