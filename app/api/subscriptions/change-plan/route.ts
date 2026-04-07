// Plan upgrade / downgrade endpoint. Orchestrates the Stripe API call;
// all DB state changes happen via the customer.subscription.updated webhook.

import { NextRequest, NextResponse } from "next/server";

import { getStripeServerClient } from "@/lib/stripe/server";
import { requireAuthenticatedOwner } from "@/lib/server/owner-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { changePlan } from "@/lib/subscriptions/change-plan";
import { normalizePricingTier } from "@/lib/pricing/pricing-resolver";
import { planTypeFromBillingPeriod } from "@/lib/subscriptions/types";
import { normalizePricingBillingPeriod } from "@/lib/pricing/pricing-resolver";
import type { PaidTier, PlanType } from "@/lib/subscriptions/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripe = getStripeServerClient();
  if (!stripe) {
    return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY." }, { status: 500 });
  }

  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return auth.error;

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Server is missing service role configuration." },
      { status: 500 },
    );
  }

  let body: { tier?: string; billing_period?: string } | null = null;
  try {
    body = (await request.json()) as { tier?: string; billing_period?: string };
  } catch {
    body = null;
  }

  const rawTier = normalizePricingTier(body?.tier ?? "");
  if (rawTier !== "verified" && rawTier !== "signature") {
    return NextResponse.json({ error: "Invalid target tier." }, { status: 400 });
  }
  const targetTier = rawTier as PaidTier;

  const rawBillingPeriod = normalizePricingBillingPeriod(body?.billing_period ?? "");
  if (rawBillingPeriod !== "monthly" && rawBillingPeriod !== "yearly") {
    return NextResponse.json(
      { error: "Invalid billing period. Use monthly or yearly." },
      { status: 400 },
    );
  }
  const targetPlanType = planTypeFromBillingPeriod(rawBillingPeriod) as PlanType;

  const result = await changePlan(stripe, supabase, {
    ownerId: auth.userId,
    targetTier,
    targetPlanType,
  });

  if (!result.ok) {
    const status =
      result.error === "NO_SUBSCRIPTION" || result.error === "NOT_RECURRING" ? 422 : 400;
    return NextResponse.json({ error: result.message, code: result.error }, { status });
  }

  return NextResponse.json({
    ok: true,
    immediate: result.immediate,
    message: result.immediate
      ? "Plan upgraded immediately. Your tier will update within moments."
      : "Plan change scheduled. Your tier will update at the end of the current period.",
  });
}
