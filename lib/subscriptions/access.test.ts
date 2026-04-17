import { describe, expect, it } from "vitest";

import { resolveEffectiveTier, subscriptionGrantsAccess } from "@/lib/subscriptions/access";
import type { SubscriptionRow } from "@/lib/subscriptions/types";

function makeSubscription(overrides: Partial<SubscriptionRow> = {}): SubscriptionRow {
  return {
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
    ...overrides,
  };
}

describe("subscription access authority", () => {
  it("keeps admin override tier even when Stripe status is canceled", () => {
    const sub = makeSubscription({
      tier_source: "admin",
      tier: "signature",
      status: "canceled",
    });

    expect(resolveEffectiveTier(sub)).toBe("signature");
    expect(subscriptionGrantsAccess(sub)).toBe(true);
  });

  it("returns unverified when admin override tier is unverified", () => {
    const sub = makeSubscription({
      tier_source: "admin",
      tier: "unverified",
      status: "active",
    });

    expect(resolveEffectiveTier(sub)).toBe("unverified");
    expect(subscriptionGrantsAccess(sub)).toBe(false);
  });

  it("downgrades Stripe-managed canceled subscriptions to unverified", () => {
    const sub = makeSubscription({
      tier_source: "stripe",
      tier: "signature",
      status: "canceled",
    });

    expect(resolveEffectiveTier(sub)).toBe("unverified");
    expect(subscriptionGrantsAccess(sub)).toBe(false);
  });

  it("keeps paid tier for Stripe-managed active subscriptions", () => {
    const sub = makeSubscription({
      tier_source: "stripe",
      tier: "verified",
      status: "active",
    });

    expect(resolveEffectiveTier(sub)).toBe("verified");
    expect(subscriptionGrantsAccess(sub)).toBe(true);
  });
});
