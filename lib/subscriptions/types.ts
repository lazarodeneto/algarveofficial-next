// Canonical lifecycle types. The DB has these as untyped strings (with CHECK constraints),
// so consumers should narrow via these unions instead of using raw strings.

export const SUBSCRIPTION_STATUSES = [
  "pending",
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "canceled",
  "expired",
  "incomplete",
  "incomplete_expired",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const PLAN_TYPES = ["monthly", "yearly", "fixed_2026"] as const;
export type PlanType = (typeof PLAN_TYPES)[number];
export const TIER_SOURCES = ["stripe", "admin"] as const;
export type TierSource = (typeof TIER_SOURCES)[number];

export type EffectiveTier = "unverified" | "verified" | "signature";
export type PaidTier = "verified" | "signature";

// Lifecycle-aware shape of an owner_subscriptions row. Mirrors the DB after
// migration 013. Generated Supabase types lag behind the migration; cast at boundaries.
export interface SubscriptionRow {
  id: string;
  owner_id: string;
  tier: EffectiveTier;
  tier_source: TierSource;
  plan_type: PlanType;
  billing_period: "monthly" | "yearly" | "promo";
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_end: string | null;
  start_date: string | null;
  end_date: string | null;
  price_cents: number | null;
  currency: string | null;
  last_event_at: string | null;
  created_at: string;
  updated_at: string;
}

export function isSubscriptionStatus(value: unknown): value is SubscriptionStatus {
  return typeof value === "string" && (SUBSCRIPTION_STATUSES as readonly string[]).includes(value);
}

export function isPlanType(value: unknown): value is PlanType {
  return typeof value === "string" && (PLAN_TYPES as readonly string[]).includes(value);
}

// Map Stripe subscription status -> internal status.
export function mapStripeSubscriptionStatus(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case "incomplete":
      return "incomplete";
    case "incomplete_expired":
      return "incomplete_expired";
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "unpaid":
      return "unpaid";
    case "canceled":
      return "canceled";
    case "paused":
      // Treat paused as access-blocking grace, same as past_due.
      return "past_due";
    default:
      return "incomplete";
  }
}

// billing_period (DB pricing convention) <-> plan_type (lifecycle convention)
export function planTypeFromBillingPeriod(billingPeriod: string): PlanType {
  if (billingPeriod === "promo") return "fixed_2026";
  if (billingPeriod === "monthly") return "monthly";
  if (billingPeriod === "yearly") return "yearly";
  return "monthly";
}

export function billingPeriodFromPlanType(planType: PlanType): "monthly" | "yearly" | "promo" {
  if (planType === "fixed_2026") return "promo";
  return planType;
}
