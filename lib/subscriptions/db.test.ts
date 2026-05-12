import { afterEach, describe, expect, it, vi } from "vitest";

import { applyTierToListings } from "@/lib/subscriptions/db";
import type { SubscriptionRow } from "@/lib/subscriptions/types";

afterEach(() => {
  vi.clearAllMocks();
});

function createSupabaseMock(listings: Array<{ id: string; tier: string }>) {
  const eqUpdate = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn(() => ({
    eq: eqUpdate,
  }));

  const eqSelect = vi.fn().mockResolvedValue({
    data: listings,
    error: null,
  });
  const select = vi.fn(() => ({
    eq: eqSelect,
  }));

  const from = vi.fn((table: string) => {
    if (table !== "listings") {
      throw new Error(`Unexpected table ${table}`);
    }

    return {
      select,
      update,
    };
  });

  return {
    supabase: { from } as never,
    spies: { from, select, eqSelect, update, eqUpdate },
  };
}

function createTargetListingSupabaseMock(listing: { id: string; tier: string; claim_status: string } | null) {
  const selectChain = {
    eq: vi.fn(() => selectChain),
    maybeSingle: vi.fn().mockResolvedValue({ data: listing, error: null }),
  };
  const select = vi.fn(() => selectChain);

  let updateEqCount = 0;
  const updateChain = {
    eq: vi.fn(() => {
      updateEqCount += 1;
      return updateEqCount >= 3 ? Promise.resolve({ error: null }) : updateChain;
    }),
  };
  const update = vi.fn(() => updateChain);

  const from = vi.fn((table: string) => {
    if (table !== "listings") {
      throw new Error(`Unexpected table ${table}`);
    }

    return {
      select,
      update,
    };
  });

  return {
    supabase: { from } as never,
    spies: { from, select, selectChain, update, updateChain },
  };
}

describe("applyTierToListings", () => {
  it("sets owner listings to signature when an active signature subscription is present", async () => {
    const { supabase, spies } = createSupabaseMock([
      { id: "listing-1", tier: "verified" },
      { id: "listing-2", tier: "unverified" },
    ]);

    const subscription: SubscriptionRow = {
      id: "sub-1",
      owner_id: "owner-1",
      tier: "signature",
      tier_source: "stripe",
      plan_type: "monthly",
      billing_period: "monthly",
      status: "active",
      stripe_customer_id: "cus_1",
      stripe_subscription_id: "sub_stripe_1",
      stripe_price_id: "price_1",
      stripe_checkout_session_id: "cs_1",
      stripe_payment_intent_id: null,
      current_period_start: "2026-04-01T00:00:00.000Z",
      current_period_end: "2026-05-01T00:00:00.000Z",
      cancel_at_period_end: false,
      canceled_at: null,
      trial_end: null,
      start_date: "2026-04-01",
      end_date: "2026-05-01",
      price_cents: 29900,
      currency: "EUR",
      last_event_at: "2026-04-13T09:00:00.000Z",
      created_at: "2026-04-01T00:00:00.000Z",
      updated_at: "2026-04-13T09:00:00.000Z",
    };

    const result = await applyTierToListings(supabase, "owner-1", subscription);

    expect(result).toEqual({ updated: 2, tier: "signature" });
    expect(spies.update).toHaveBeenCalledWith({ tier: "signature" });
    expect(spies.eqUpdate).toHaveBeenCalledWith("owner_id", "owner-1");
  });

  it("sets only the paid claimed listing when listing_id is provided", async () => {
    const { supabase, spies } = createTargetListingSupabaseMock({
      id: "listing-1",
      tier: "unverified",
      claim_status: "claimed",
    });

    const subscription: SubscriptionRow = {
      id: "sub-1",
      owner_id: "owner-1",
      tier: "verified",
      tier_source: "stripe",
      plan_type: "monthly",
      billing_period: "monthly",
      status: "active",
      stripe_customer_id: "cus_1",
      stripe_subscription_id: "sub_stripe_1",
      stripe_price_id: "price_1",
      stripe_checkout_session_id: "cs_1",
      stripe_payment_intent_id: null,
      current_period_start: "2026-04-01T00:00:00.000Z",
      current_period_end: "2026-05-01T00:00:00.000Z",
      cancel_at_period_end: false,
      canceled_at: null,
      trial_end: null,
      start_date: "2026-04-01",
      end_date: "2026-05-01",
      price_cents: 1900,
      currency: "EUR",
      last_event_at: "2026-04-13T09:00:00.000Z",
      created_at: "2026-04-01T00:00:00.000Z",
      updated_at: "2026-04-13T09:00:00.000Z",
    };

    const result = await applyTierToListings(supabase, "owner-1", subscription, "listing-1");

    expect(result).toEqual({ updated: 1, tier: "verified" });
    expect(spies.update).toHaveBeenCalledWith({ tier: "verified" });
    expect(spies.selectChain.eq).toHaveBeenCalledWith("id", "listing-1");
    expect(spies.selectChain.eq).toHaveBeenCalledWith("owner_id", "owner-1");
    expect(spies.updateChain.eq).toHaveBeenCalledWith("id", "listing-1");
    expect(spies.updateChain.eq).toHaveBeenCalledWith("owner_id", "owner-1");
    expect(spies.updateChain.eq).toHaveBeenCalledWith("claim_status", "claimed");
  });
});
