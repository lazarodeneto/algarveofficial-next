import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = join(
  process.cwd(),
  "supabase/migrations/20260512165000_harden_security_scan_findings.sql",
);

const source = readFileSync(migrationPath, "utf8");

function businessClaimGrantBlock() {
  return source.match(/GRANT SELECT \([\s\S]*?\) ON public\.business_claims TO authenticated;/)?.[0] ?? "";
}

describe("security scan hardening migration", () => {
  it("limits direct owner listing updates to the featured image columns", () => {
    expect(source).toContain('DROP POLICY IF EXISTS "Owners can update their own listings"');
    expect(source).toContain('DROP POLICY IF EXISTS "Owner update own listings"');
    expect(source).toContain('DROP POLICY IF EXISTS "listings_update_safe"');
    expect(source).toContain('CREATE POLICY "owners_update_listing_featured_image"');
    expect(source).toContain("REVOKE UPDATE ON public.listings FROM anon, authenticated");
    expect(source).toContain("GRANT UPDATE (featured_image_url, updated_at) ON public.listings TO authenticated");
  });

  it("removes direct owner subscription write policies", () => {
    expect(source).toContain('DROP POLICY IF EXISTS "owner_subscriptions_insert_auth"');
    expect(source).toContain('DROP POLICY IF EXISTS "owner_subscriptions_update_auth"');
    expect(source).toContain('DROP POLICY IF EXISTS "owner_subscriptions_delete_auth"');
    expect(source).not.toMatch(/CREATE POLICY "owner_subscriptions_(insert|update|delete)_auth"/);
  });

  it("keeps business claim review metadata out of claimant column grants", () => {
    const grant = businessClaimGrantBlock();

    expect(source).toContain("REVOKE SELECT ON public.business_claims FROM anon, authenticated");
    expect(grant).toContain("listing_id");
    expect(grant).toContain("claimant_user_id");
    expect(grant).toContain("selected_tier");
    expect(grant).toContain("status");
    expect(grant).not.toContain("confidence_score");
    expect(grant).not.toContain("reviewed_by");
    expect(grant).not.toContain("reviewed_at");
    expect(grant).not.toContain("review_note");
    expect(grant).not.toContain("rejection_reason");
  });

  it("restricts media bucket writes to admins and editors", () => {
    expect(source).toContain('DROP POLICY IF EXISTS "Authenticated users can upload media"');
    expect(source).toContain('DROP POLICY IF EXISTS "Authenticated users can update media"');
    expect(source).toContain('DROP POLICY IF EXISTS "Authenticated users can delete media"');
    expect(source).toContain("array_remove(allowed_mime_types, 'image/svg+xml')");
    expect(source).toContain("WITH CHECK (bucket_id = 'media' AND public.is_admin_or_editor(auth.uid()))");
  });

  it("removes trigger-based subscription tier fan-out", () => {
    expect(source).toContain(
      "DROP TRIGGER IF EXISTS sync_listings_on_subscription_change ON public.owner_subscriptions",
    );
    expect(source).toContain("DROP FUNCTION IF EXISTS public.sync_listing_tiers_on_subscription()");
  });
});
