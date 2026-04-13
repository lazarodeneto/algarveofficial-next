import { NextRequest, NextResponse } from "next/server";
import { normalizePricingBillingPeriod, normalizePricingTier } from "@/lib/pricing/pricing-resolver";
import { requireAuthenticatedOwner } from "@/lib/server/owner-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getStripeServerClient } from "@/lib/stripe/server";
import { INVOICE_DESCRIPTION, STATEMENT_DESCRIPTOR } from "@/lib/stripe/branding";
import { findOverlappingActive } from "@/lib/subscriptions/db";
import { planTypeFromBillingPeriod } from "@/lib/subscriptions/types";

export const runtime = "nodejs";

type PaidTier = "verified" | "signature";
type BillingPeriod = "monthly" | "yearly" | "promo";

function normalizePaidTier(value: unknown): PaidTier | null {
  if (typeof value !== "string") return null;
  const tier = normalizePricingTier(value);
  if (tier === "verified" || tier === "signature") return tier;
  return null;
}

function normalizeCheckoutBillingPeriod(value: unknown): BillingPeriod | null {
  if (typeof value !== "string") return null;
  const period = normalizePricingBillingPeriod(value);
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
      {
        error: "Stripe checkout is unavailable because STRIPE_SECRET_KEY is not configured on the server.",
        code: "STRIPE_SECRET_KEY_MISSING",
      },
      { status: 503 },
    );
  }

  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return auth.error;

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server is missing service role configuration." }, { status: 500 });
  }

  let body: { tier?: string; billing_period?: string } | null = null;
  try {
    body = (await request.json()) as { tier?: string; billing_period?: string };
  } catch {
    body = null;
  }

  const tier = normalizePaidTier(body?.tier);
  const billingPeriod = normalizeCheckoutBillingPeriod(body?.billing_period);

  if (!tier || !billingPeriod) {
    return NextResponse.json({ error: "Invalid pricing selection." }, { status: 400 });
  }

  const planType = planTypeFromBillingPeriod(billingPeriod);

  // Overlap guard: prevent buying a recurring plan while a fixed_2026 is in force,
  // and vice versa. Resolves the most common double-charge / state-confusion path.
  const overlap = await findOverlappingActive(supabase, auth.userId, planType);
  if (overlap) {
    return NextResponse.json(
      {
        error: overlap.reason,
        code: "PLAN_OVERLAP",
      },
      { status: 409 },
    );
  }

  const { data: pricingRows, error: pricingError } = await supabase
    .from("subscription_pricing")
    .select("id, tier, billing_period, stripe_price_id, is_active, valid_from, valid_to, price_cents, currency")
    .eq("tier", tier)
    .eq("billing_period", billingPeriod)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(1);

  if (pricingError) {
    return NextResponse.json({ error: "Failed to resolve pricing." }, { status: 500 });
  }

  const pricing = pricingRows?.[0];
  if (!pricing?.stripe_price_id) {
    return NextResponse.json(
      { error: "No Stripe price mapping found for the selected pricing row." },
      { status: 400 },
    );
  }

  if (billingPeriod === "promo") {
    if (!pricing.valid_from || !pricing.valid_to) {
      return NextResponse.json({ error: "Promo pricing is missing validity dates." }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);
    if (today < pricing.valid_from || today > pricing.valid_to) {
      return NextResponse.json({ error: "Promo pricing is not active." }, { status: 400 });
    }
  }

  const siteUrl = resolveSiteUrl(request);
  const successUrl = `${siteUrl}/owner/membership?success=true`;
  const cancelUrl = `${siteUrl}/owner/membership?canceled=true`;
  const mode = billingPeriod === "promo" ? "payment" : "subscription";

  const baseMetadata = {
    userId: auth.userId,
    owner_id: auth.userId,
    tier,
    billing_period: billingPeriod,
    plan_type: planType,
    pricing_id: pricing.id,
    price_cents: String(pricing.price_cents),
    currency: pricing.currency ?? "EUR",
  };

  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: [{ price: pricing.stripe_price_id, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: auth.userId,
    metadata: baseMetadata,
    ...(mode === "subscription"
      ? {
          subscription_data: {
            description: INVOICE_DESCRIPTION,
            metadata: baseMetadata,
          },
        }
      : {
          payment_intent_data: {
            description: INVOICE_DESCRIPTION,
            statement_descriptor: STATEMENT_DESCRIPTOR,
            metadata: baseMetadata,
          },
        }),
  });

  return NextResponse.json({
    url: session.url,
  });
}
