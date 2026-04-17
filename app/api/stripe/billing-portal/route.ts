export const runtime = "nodejs";
export const runtime = "nodejs";
// Stripe Billing Portal session creator. Resolves the customer ID from the
// owner's subscription row (DB lookup, not frontend input) and returns a URL
// the client can open in a new tab. Users can update payment method, cancel,
// view invoices, and manage billing details from there.

import { NextRequest, NextResponse } from "next/server";

import { getStripeServerClient } from "@/lib/stripe/server";
import { requireAuthenticatedOwner } from "@/lib/server/owner-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { findByOwner } from "@/lib/subscriptions/db";

export const runtime = "nodejs";

function resolveSiteUrl(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return request.nextUrl.origin;
}

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

  const sub = await findByOwner(supabase, auth.userId);
  if (!sub?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe customer found. Subscribe first to manage billing." },
      { status: 404 },
    );
  }

  const siteUrl = resolveSiteUrl(request);
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${siteUrl}/owner/membership`,
  });

  return NextResponse.json({ url: session.url });
}
