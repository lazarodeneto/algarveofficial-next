import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const unsafeGuardMigration = readFileSync(
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260515124500_guard_paid_claim_tiers_with_subscription.sql",
  ),
  "utf8",
);

const adminApprovalMigration = readFileSync(
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260519161000_guard_paid_claim_approval_subscription.sql",
  ),
  "utf8",
);

const tierSourceMigration = readFileSync(
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260417170000_add_owner_subscription_tier_source.sql",
  ),
  "utf8",
);

describe("paid business claim tier guard migration", () => {
  it("removes the unsafe listings trigger instead of creating a downgrade trigger", () => {
    expect(unsafeGuardMigration).toContain("DROP TRIGGER IF EXISTS guard_paid_business_claim_listing_tier");
    expect(unsafeGuardMigration).toContain("DROP FUNCTION IF EXISTS public.guard_paid_business_claim_listing_tier()");
    expect(unsafeGuardMigration).not.toMatch(/CREATE\s+TRIGGER[\s\S]+ON\s+public\.listings/i);
    expect(unsafeGuardMigration).not.toMatch(/AFTER\s+INSERT\s+OR\s+UPDATE[\s\S]+ON\s+public\.listings/i);
  });

  it("cannot downgrade approved Verified or Signature claims from unrelated listing updates", () => {
    expect(unsafeGuardMigration).not.toContain("UPDATE public.listings");
    expect(unsafeGuardMigration).not.toContain("owner_subscriptions");
    expect(unsafeGuardMigration).not.toContain("_allowed_listing_tier");
    expect(unsafeGuardMigration).not.toContain("'unverified'::public.listing_tier");
  });

  it("keeps admin claim approval as the explicit source of claim tier assignment", () => {
    expect(adminApprovalMigration).toContain("tier = _approved_listing_tier");
    expect(adminApprovalMigration).toContain(
      "WHEN 'signature'::public.business_claim_tier THEN 'signature'::public.listing_tier",
    );
    expect(adminApprovalMigration).toContain(
      "WHEN 'verified'::public.business_claim_tier THEN 'verified'::public.listing_tier",
    );
  });

  it("requires active Stripe-backed subscription state before approving paid claim tiers", () => {
    expect(adminApprovalMigration).toContain("FROM public.owner_subscriptions os");
    expect(adminApprovalMigration).toContain("os.tier_source = 'stripe'");
    expect(adminApprovalMigration).toContain("os.status IN ('active', 'trialing', 'past_due')");
    expect(adminApprovalMigration).toContain("os.plan_type = 'fixed_2026'");
    expect(adminApprovalMigration).toContain("os.end_date >= current_date");
    expect(adminApprovalMigration).toContain("IF _selected_tier_rank > 0 THEN");
    expect(adminApprovalMigration).toContain("COALESCE(_subscription_tier_rank, 0) < _selected_tier_rank");
    expect(adminApprovalMigration).toContain(
      "Active paid Stripe subscription is required before approving this paid tier claim",
    );
  });

  it("does not alter admin/courtesy subscription tier-source protections", () => {
    expect(unsafeGuardMigration).not.toContain("tier_source");
    expect(tierSourceMigration).toContain("CHECK (tier_source IN ('stripe', 'admin'))");
  });
});
