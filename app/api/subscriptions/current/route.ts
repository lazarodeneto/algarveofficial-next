// Returns the current subscription state for the authenticated owner. Replaces
// the legacy `check-subscription` Supabase edge function. The frontend uses
// this for tier display, subscribed status, billing portal availability, etc.
//
// Sanitized output: no Stripe internals beyond the customer-facing surface.

import { NextRequest, NextResponse } from "next/server";

import { requireAuthenticatedOwner } from "@/lib/server/owner-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { resolveEffectiveTier, subscriptionGrantsAccess } from "@/lib/subscriptions/access";
import { findByOwner } from "@/lib/subscriptions/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return auth.error;

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Server is missing service role configuration." },
      { status: 500 },
    );
  }

  const sub = await findByOwner(supabase, auth.userId);

  if (!sub) {
    return NextResponse.json({
      subscribed: false,
      tier: "unverified",
      planType: null,
      billingPeriod: null,
      status: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      trialEnd: null,
      endDate: null,
      hasStripeCustomer: false,
    });
  }

  return NextResponse.json({
    subscribed: subscriptionGrantsAccess(sub),
    tier: resolveEffectiveTier(sub),
    planType: sub.plan_type,
    billingPeriod: sub.billing_period,
    status: sub.status,
    currentPeriodStart: sub.current_period_start,
    currentPeriodEnd: sub.current_period_end,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    canceledAt: sub.canceled_at,
    trialEnd: sub.trial_end,
    endDate: sub.end_date,
    hasStripeCustomer: Boolean(sub.stripe_customer_id),
  });
}
