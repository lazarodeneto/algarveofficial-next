import { afterEach, describe, expect, it, vi } from "vitest";

import { applyAdminTierOverride, upsertSubscription } from "@/lib/subscriptions/db";
import type { SubscriptionRow } from "@/lib/subscriptions/types";

function makeExisting(overrides: Partial<SubscriptionRow> = {}): SubscriptionRow {
  return {
    id: "sub-existing-1",
    owner_id: "owner-1",
    tier: "signature",
    tier_source: "admin",
    plan_type: "yearly",
    billing_period: "yearly",
    status: "active",
    stripe_customer_id: "cus_existing",
    stripe_subscription_id: "sub_existing",
    stripe_price_id: "price_existing",
    stripe_checkout_session_id: null,
    stripe_payment_intent_id: null,
    current_period_start: "2026-01-01T00:00:00.000Z",
    current_period_end: "2027-01-01T00:00:00.000Z",
    cancel_at_period_end: false,
    canceled_at: null,
    trial_end: null,
    start_date: "2026-01-01",
    end_date: "2027-01-01",
    price_cents: 29900,
    currency: "EUR",
    last_event_at: "2026-04-17T09:00:00.000Z",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-04-17T09:00:00.000Z",
    ...overrides,
  };
}

function createOwnerSubscriptionSupabaseMock(rows: Array<SubscriptionRow | null>) {
  const selectMaybeSingle = vi.fn();
  for (const row of rows) {
    selectMaybeSingle.mockResolvedValueOnce({ data: row, error: null });
  }

  const updateEq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn(() => ({
    eq: updateEq,
  }));

  const insert = vi.fn().mockResolvedValue({ error: null });

  const from = vi.fn((table: string) => {
    if (table !== "owner_subscriptions") {
      throw new Error(`Unexpected table ${table}`);
    }

    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              maybeSingle: selectMaybeSingle,
            })),
          })),
        })),
      })),
      update,
      insert,
    };
  });

  return {
    supabase: { from } as never,
    spies: { from, update, updateEq, insert, selectMaybeSingle },
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("upsertSubscription admin authority guard", () => {
  it("does not let Stripe payload overwrite admin tier", async () => {
    const existing = makeExisting({ tier: "signature", tier_source: "admin" });
    const { supabase, spies } = createOwnerSubscriptionSupabaseMock([existing]);

    await upsertSubscription(
      supabase,
      "owner-1",
      {
        tier: "unverified",
        tier_source: "stripe",
        status: "canceled",
      },
      { allowStale: true, eventCreatedAt: 1_711_000_000 },
    );

    const patch = spies.update.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(patch.status).toBe("canceled");
    expect(patch.tier_source).toBe("admin");
    expect(patch.tier).toBeUndefined();
  });

  it("defaults new Stripe-owned rows to tier_source=stripe", async () => {
    const { supabase, spies } = createOwnerSubscriptionSupabaseMock([null]);

    await upsertSubscription(
      supabase,
      "owner-new",
      {
        tier: "verified",
        status: "pending",
      },
      { eventCreatedAt: 1_711_000_100 },
    );

    const insertRow = spies.insert.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(insertRow.tier_source).toBe("stripe");
    expect(insertRow.tier).toBe("verified");
  });

  it("admin override helper sets tier_source=admin", async () => {
    const existing = makeExisting({ tier_source: "stripe", tier: "verified", plan_type: "yearly" });
    const { supabase, spies } = createOwnerSubscriptionSupabaseMock([existing, existing]);

    await applyAdminTierOverride(supabase, "owner-1", "signature");

    const patch = spies.update.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(patch.tier).toBe("signature");
    expect(patch.tier_source).toBe("admin");
    expect(patch.plan_type).toBeUndefined();
  });
});
