import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import type { Database } from "@/integrations/supabase/types";
import { normalizePricingBillingPeriod, normalizePricingTier } from "@/lib/pricing/pricing-resolver";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

type PaidTier = "verified" | "signature";
type StripeSubscriptionLite = {
  id?: string;
  customer?: string | null;
  metadata?: Record<string, string>;
  current_period_end?: number;
  canceled_at?: number | null;
  ended_at?: number | null;
  items?: {
    data?: Array<{
      price?: { id?: string | null } | null;
    }>;
  };
};
type StripeInvoiceLite = {
  subscription?: string | null;
  customer?: string | null;
  lines?: {
    data?: Array<{
      price?: { id?: string | null } | null;
    }>;
  };
};

function getStripeClient() {
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeKey) return null;
  return new Stripe(stripeKey);
}

function getWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null;
}

function toDateOnly(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function unixToIso(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function normalizePaidTier(value: unknown): PaidTier | null {
  if (typeof value !== "string") return null;
  const tier = normalizePricingTier(value);
  if (tier === "verified" || tier === "signature") return tier;
  return null;
}

async function findOwnerIdBySubscription(
  supabase: ReturnType<typeof createServiceRoleClient>,
  stripeSubscriptionId: string,
) {
  const { data, error } = await supabase!
    .from("owner_subscriptions")
    .select("owner_id")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.owner_id ?? null;
}

async function findOwnerIdByCustomer(
  supabase: ReturnType<typeof createServiceRoleClient>,
  stripeCustomerId: string,
) {
  const { data, error } = await supabase!
    .from("owner_subscriptions")
    .select("owner_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.owner_id ?? null;
}

async function findPricingById(
  supabase: ReturnType<typeof createServiceRoleClient>,
  pricingId: string,
) {
  const { data, error } = await supabase!
    .from("subscription_pricing")
    .select("id, tier, billing_period, stripe_price_id, price_cents, currency, valid_to")
    .eq("id", pricingId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function findPricingByStripePriceId(
  supabase: ReturnType<typeof createServiceRoleClient>,
  stripePriceId: string,
) {
  const { data, error } = await supabase!
    .from("subscription_pricing")
    .select("id, tier, billing_period, stripe_price_id, price_cents, currency, valid_to")
    .eq("stripe_price_id", stripePriceId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function upsertOwnerSubscription(
  supabase: ReturnType<typeof createServiceRoleClient>,
  ownerId: string,
  payload: Database["public"]["Tables"]["owner_subscriptions"]["Update"],
) {
  const { data: existing, error: lookupError } = await supabase!
    .from("owner_subscriptions")
    .select("id")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lookupError) throw lookupError;

  if (existing?.id) {
    const { error } = await supabase!
      .from("owner_subscriptions")
      .update(payload)
      .eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const insertPayload: Database["public"]["Tables"]["owner_subscriptions"]["Insert"] = {
    id: randomUUID(),
    owner_id: ownerId,
    billing_period: payload.billing_period ?? "monthly",
    tier: payload.tier ?? "unverified",
    status: payload.status ?? "active",
    stripe_customer_id: payload.stripe_customer_id ?? null,
    stripe_subscription_id: payload.stripe_subscription_id ?? null,
    current_period_end: payload.current_period_end ?? null,
    price_cents: payload.price_cents ?? null,
    currency: payload.currency ?? "EUR",
    start_date: payload.start_date ?? toDateOnly(new Date().toISOString()),
    end_date: payload.end_date ?? null,
    stripe_price_id: payload.stripe_price_id ?? null,
  };

  const { error: insertError } = await supabase!.from("owner_subscriptions").insert(insertPayload);
  if (insertError) throw insertError;
  return insertPayload.id;
}

async function updateListingsTier(
  supabase: ReturnType<typeof createServiceRoleClient>,
  ownerId: string,
  tier: Database["public"]["Enums"]["listing_tier"],
) {
  const { error } = await supabase!
    .from("listings")
    .update({ tier })
    .eq("owner_id", ownerId);

  if (error) throw error;
}

async function handleCheckoutCompleted(
  stripe: Stripe,
  supabase: ReturnType<typeof createServiceRoleClient>,
  session: Stripe.Checkout.Session,
) {
  const ownerId = session.metadata?.userId ?? null;
  if (!ownerId) return;

  const pricingId = session.metadata?.pricing_id ?? null;
  const pricing = pricingId ? await findPricingById(supabase, pricingId) : null;
  const tier = normalizePaidTier(pricing?.tier ?? session.metadata?.tier);
  const billingPeriod = normalizePricingBillingPeriod(pricing?.billing_period ?? session.metadata?.billing_period);

  if (!tier || !billingPeriod) return;

  let currentPeriodEndIso: string | null = null;
  if (typeof session.subscription === "string") {
    const stripeSubscription = (await stripe.subscriptions.retrieve(
      session.subscription,
    )) as unknown as StripeSubscriptionLite;
    currentPeriodEndIso = unixToIso(stripeSubscription.current_period_end);
  }

  const nowIso = new Date().toISOString();
  await upsertOwnerSubscription(supabase, ownerId, {
    tier,
    billing_period: billingPeriod,
    status: "active",
    stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
    stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
    stripe_price_id: pricing?.stripe_price_id ?? null,
    price_cents: pricing?.price_cents ?? null,
    currency: pricing?.currency ?? "EUR",
    start_date: toDateOnly(nowIso),
    end_date: billingPeriod === "promo" ? toDateOnly(pricing?.valid_to ?? null) : toDateOnly(currentPeriodEndIso),
    current_period_end: currentPeriodEndIso,
  });

  await updateListingsTier(supabase, ownerId, tier);
}

async function handleInvoicePaymentSucceeded(
  stripe: Stripe,
  supabase: ReturnType<typeof createServiceRoleClient>,
  invoice: Stripe.Invoice,
) {
  const invoiceLite = invoice as unknown as StripeInvoiceLite;
  const stripeSubscriptionId =
    typeof invoiceLite.subscription === "string" ? invoiceLite.subscription : null;
  const stripeCustomerId = typeof invoiceLite.customer === "string" ? invoiceLite.customer : null;

  let stripeSubscription: StripeSubscriptionLite | null = null;
  if (stripeSubscriptionId) {
    stripeSubscription = (await stripe.subscriptions.retrieve(
      stripeSubscriptionId,
    )) as unknown as StripeSubscriptionLite;
  }

  const ownerIdFromMetadata = stripeSubscription?.metadata?.userId ?? null;
  const ownerId =
    ownerIdFromMetadata ||
    (stripeSubscriptionId ? await findOwnerIdBySubscription(supabase, stripeSubscriptionId) : null) ||
    (stripeCustomerId ? await findOwnerIdByCustomer(supabase, stripeCustomerId) : null);

  if (!ownerId) return;

  const linePriceId =
    invoiceLite.lines?.data?.find((line) => line.price?.id)?.price?.id ??
    stripeSubscription?.items?.data?.[0]?.price?.id ??
    null;

  if (!linePriceId) return;

  const pricing = await findPricingByStripePriceId(supabase, linePriceId);
  const tier = normalizePaidTier(pricing?.tier);
  const billingPeriod = normalizePricingBillingPeriod(pricing?.billing_period);
  if (!tier || !billingPeriod) return;

  const currentPeriodEndIso = unixToIso(stripeSubscription?.current_period_end);
  await upsertOwnerSubscription(supabase, ownerId, {
    tier,
    billing_period: billingPeriod,
    status: "active",
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    stripe_price_id: linePriceId,
    price_cents: pricing?.price_cents ?? null,
    currency: pricing?.currency ?? "EUR",
    start_date: toDateOnly(new Date().toISOString()),
    end_date: billingPeriod === "promo" ? toDateOnly(pricing?.valid_to ?? null) : toDateOnly(currentPeriodEndIso),
    current_period_end: currentPeriodEndIso,
  });

  await updateListingsTier(supabase, ownerId, tier);
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createServiceRoleClient>,
  subscription: Stripe.Subscription,
) {
  const subscriptionLite = subscription as unknown as StripeSubscriptionLite;
  const stripeSubscriptionId = subscription.id;
  const stripeCustomerId =
    typeof subscriptionLite.customer === "string" ? subscriptionLite.customer : null;
  const ownerId =
    subscriptionLite.metadata?.userId ||
    (await findOwnerIdBySubscription(supabase, stripeSubscriptionId)) ||
    (stripeCustomerId ? await findOwnerIdByCustomer(supabase, stripeCustomerId) : null);

  if (!ownerId) return;

  const canceledAtIso = unixToIso(
    subscriptionLite.canceled_at ?? subscriptionLite.ended_at ?? null,
  );
  await upsertOwnerSubscription(supabase, ownerId, {
    status: "canceled",
    tier: "unverified",
    billing_period: "monthly",
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    current_period_end: canceledAtIso,
    end_date: toDateOnly(canceledAtIso),
    stripe_price_id: null,
    price_cents: null,
    currency: "EUR",
  });

  await updateListingsTier(supabase, ownerId, "unverified");
}

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = getWebhookSecret();
  const supabase = createServiceRoleClient();

  if (!stripe || !webhookSecret || !supabase) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(stripe, supabase, event.data.object as Stripe.Checkout.Session);
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(stripe, supabase, event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(supabase, event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
