export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { normalizePricingBillingPeriod, normalizePricingTier } from "@/lib/pricing/pricing-resolver";
import { requireAuthenticatedOwner } from "@/lib/server/owner-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getStripeServerClient } from "@/lib/stripe/server";
import { findOverlappingActive } from "@/lib/subscriptions/db";
import { planTypeFromBillingPeriod } from "@/lib/subscriptions/types";

type PaidTier = "verified" | "signature";
type BillingPeriod = "monthly" | "yearly" | "promo";

function normalizePaidTier(value: unknown): PaidTier | null {
  if (typeof value !== "string") return null;
  const tier = normalizePricingTier(value);
  if (tier === "verified" || tier === "signature") return tier;
  return null;
}

function normalizeCheckoutBillingPeriod(value: unknown): BillingPeriod | null {
  const period = normalizePricingBillingPeriod(value as any);
  if (period === "monthly" || period === "yearly" || period === "promo") return period;
  return null;
}

function resolveSiteUrl(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  const stripe = getStripeServerClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured." },
      { status: 503 }
    );
  }

  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return auth.error;

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Missing service role config." },
      { status: 500 }
    );
  }

  let body: { tier?: string; billing_period?: string } | null = null;

  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const tier = normalizePaidTier(body?.tier);
  const billingPeriod = normalizeCheckoutBillingPeriod(body?.billing_period);

  if (!tier || !billingPeriod) {
    return NextResponse.json(
      { error: "Invalid pricing selection." },
      { status: 400 }
    );
  }

  const planType = planTypeFromBillingPeriod(billingPeriod);

  let overlap;
  try {
    overlap = await findOverlappingActive(supabase, auth.userId, planType);
  } catch (err) {
    return NextResponse.json(
      { error: "Overlap validation failed." },
      { status: 500 }
    );
  }

  if (overlap) {
    return NextResponse.json(
      { error: overlap.reason, code: "PLAN_OVERLAP" },
      { status: 409 }
    );
  }

  const { data: pricingRows, error: pricingError } = await supabase
    .from("subscription_pricing")
    .select("*")
    .eq("tier", tier)
    .eq("billing_period", billingPeriod)
    .eq("is_active", true)
    .limit(1);

  if (pricingError || !pricingRows?.length) {
    return NextResponse.json(
      { error: "Pricing not found." },
      { status: 400 }
    );
  }

  const pricing = pricingRows[0];

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: pricing.stripe_price_id, quantity: 1 }],
    success_url: `${resolveSiteUrl(request)}/dashboard?success=1`,
    cancel_url: `${resolveSiteUrl(request)}/dashboard?canceled=1`,
    metadata: {
      owner_id: auth.userId,
      tier,
      billing_period: billingPeriod,
    },
  });

  return NextResponse.json({ url: session.url });
}
