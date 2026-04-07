/**
 * Stripe billing type aliases used by owner subscription flows.
 * Stripe price IDs must be read from the database (`subscription_pricing.stripe_price_id`)
 * and never hardcoded in frontend code.
 */

export type SubscriptionTier = "verified" | "signature";
export type BillingPeriod = "monthly" | "annual";

export function normalizeBillingPeriodForPricing(
  billingPeriod: BillingPeriod,
): "monthly" | "yearly" {
  return billingPeriod === "annual" ? "yearly" : "monthly";
}
