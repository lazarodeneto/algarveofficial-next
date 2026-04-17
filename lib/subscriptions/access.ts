// Single source of truth for "does this subscription grant premium access?"
// and "what tier should the listings carry?". Used by webhook handlers,
// reconciliation jobs, and the /api/subscriptions/current endpoint.
//
// Do not duplicate this logic anywhere else in the codebase.

import type { EffectiveTier, SubscriptionRow } from "./types";

// Statuses that grant access. past_due is in here intentionally as a grace
// window — Stripe handles smart retries; if the customer never pays, Stripe
// will eventually emit unpaid or subscription.deleted, which downgrades.
export const ACTIVE_STATES: ReadonlySet<SubscriptionRow["status"]> = new Set([
  "active",
  "trialing",
  "past_due",
] as const);

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

function isPaidTier(tier: SubscriptionRow["tier"] | null | undefined): tier is "verified" | "signature" {
  return tier === "verified" || tier === "signature";
}

function stripeSubscriptionGrantsAccess(sub: SubscriptionRow): boolean {
  // fixed_2026 override: time-bounded one-shot purchase. Access regardless of
  // status as long as end_date is still in the future. Reconciler flips status
  // to "expired" once end_date passes.
  if (sub.plan_type === "fixed_2026") {
    if (!sub.end_date) return false;
    return sub.end_date >= todayDateOnly();
  }

  return ACTIVE_STATES.has(sub.status);
}

export function resolveEffectiveTier(sub: SubscriptionRow | null | undefined): EffectiveTier {
  if (!sub) return "unverified";

  // Admin courtesy/manual override is authoritative.
  if (sub.tier_source === "admin") {
    return isPaidTier(sub.tier) ? sub.tier : "unverified";
  }

  // Stripe-managed subscriptions derive effective tier from active billing state.
  if (!stripeSubscriptionGrantsAccess(sub)) return "unverified";
  return isPaidTier(sub.tier) ? sub.tier : "unverified";
}

export function subscriptionGrantsAccess(sub: SubscriptionRow | null | undefined): boolean {
  if (!sub) return false;
  return resolveEffectiveTier(sub) !== "unverified";
}
