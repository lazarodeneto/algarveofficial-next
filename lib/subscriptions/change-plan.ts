// Plan change orchestration. Pure Stripe — does NOT touch the DB. The DB is
// updated only via customer.subscription.updated webhook, which keeps Stripe
// as the single source of truth and avoids race-with-webhook bugs.
//
// Policy:
//   - Upgrades (verified -> signature OR monthly -> yearly): immediate, with
//     proration. Customer is charged the prorated difference now.
//   - Downgrades (signature -> verified OR yearly -> monthly): take effect
//     at the end of the current period. No proration; customer keeps the
//     higher tier until the period naturally rolls over.

import type Stripe from "stripe";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

import { findByOwner } from "./db";
import type { PaidTier, PlanType } from "./types";

type Supabase = SupabaseClient<Database>;

export interface ChangePlanRequest {
  ownerId: string;
  targetTier: PaidTier;
  targetPlanType: PlanType;
}

export type ChangePlanError =
  | "NO_SUBSCRIPTION"
  | "NOT_RECURRING"
  | "MISSING_PRICE_MAPPING"
  | "SAME_PLAN"
  | "INVALID_TARGET";

export interface ChangePlanResult {
  ok: boolean;
  error?: ChangePlanError;
  message?: string;
  immediate?: boolean;
}

const TIER_RANK: Record<PaidTier, number> = { verified: 1, signature: 2 };
const PLAN_RANK: Record<"monthly" | "yearly", number> = { monthly: 1, yearly: 2 };

function isUpgrade(
  currentTier: PaidTier,
  currentPlanType: "monthly" | "yearly",
  targetTier: PaidTier,
  targetPlanType: "monthly" | "yearly",
): boolean {
  if (TIER_RANK[targetTier] > TIER_RANK[currentTier]) return true;
  if (TIER_RANK[targetTier] < TIER_RANK[currentTier]) return false;
  // Same tier: monthly -> yearly is an upgrade.
  return PLAN_RANK[targetPlanType] > PLAN_RANK[currentPlanType];
}

async function resolveTargetStripePriceId(
  supabase: Supabase,
  targetTier: PaidTier,
  targetPlanType: "monthly" | "yearly",
): Promise<string | null> {
  const { data, error } = await supabase
    .from("subscription_pricing")
    .select("stripe_price_id")
    .eq("tier", targetTier)
    .eq("billing_period", targetPlanType)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as { stripe_price_id: string | null } | null)?.stripe_price_id ?? null;
}

export async function changePlan(
  stripe: Stripe,
  supabase: Supabase,
  req: ChangePlanRequest,
): Promise<ChangePlanResult> {
  if (req.targetPlanType === "fixed_2026") {
    return { ok: false, error: "INVALID_TARGET", message: "Cannot change to fixed_2026 via plan change." };
  }

  const sub = await findByOwner(supabase, req.ownerId);
  if (!sub) {
    return { ok: false, error: "NO_SUBSCRIPTION", message: "No subscription on file." };
  }
  if (!sub.stripe_subscription_id || sub.plan_type === "fixed_2026") {
    return {
      ok: false,
      error: "NOT_RECURRING",
      message: "Plan changes are only supported for recurring subscriptions.",
    };
  }
  if (sub.tier === "unverified") {
    return { ok: false, error: "INVALID_TARGET", message: "No paid plan to change from." };
  }

  const currentTier = sub.tier as PaidTier;
  const currentPlanType = sub.plan_type as "monthly" | "yearly";
  const targetPlanType = req.targetPlanType as "monthly" | "yearly";

  if (currentTier === req.targetTier && currentPlanType === targetPlanType) {
    return { ok: false, error: "SAME_PLAN", message: "Already on this plan." };
  }

  const newPriceId = await resolveTargetStripePriceId(supabase, req.targetTier, targetPlanType);
  if (!newPriceId) {
    return {
      ok: false,
      error: "MISSING_PRICE_MAPPING",
      message: "Target plan has no Stripe price mapping.",
    };
  }

  let stripeSub: Awaited<ReturnType<typeof stripe.subscriptions.retrieve>>;
  try {
    stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
  } catch (err) {
    const msg = (err as { message?: string })?.message ?? "Failed to retrieve subscription.";
    return { ok: false, error: "NO_SUBSCRIPTION", message: msg };
  }

  const itemId = stripeSub.items.data[0]?.id;
  if (!itemId) {
    return { ok: false, error: "NOT_RECURRING", message: "Subscription has no items." };
  }

  const upgrade = isUpgrade(currentTier, currentPlanType, req.targetTier, targetPlanType);

  try {
    if (upgrade) {
      // Immediate, with proration. Stripe charges the prorated difference now.
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        items: [{ id: itemId, price: newPriceId }],
        proration_behavior: "create_prorations",
        payment_behavior: "error_if_incomplete",
      });
      return { ok: true, immediate: true };
    }

    // Downgrade: deferred to next period boundary. No proration. The current
    // item is replaced but anchored to the existing billing cycle, so the
    // customer keeps the current (higher) tier until the natural period rollover.
    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      items: [{ id: itemId, price: newPriceId }],
      proration_behavior: "none",
      billing_cycle_anchor: "unchanged",
    });
    return { ok: true, immediate: false };
  } catch (err) {
    const msg = (err as { message?: string })?.message ?? "Failed to update subscription.";
    return { ok: false, error: "NO_SUBSCRIPTION", message: msg };
  }
}
