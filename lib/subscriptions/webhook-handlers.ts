// Stripe webhook event handlers — one per event type. Each handler is pure
// dispatch logic: it does not handle idempotency, audit, or tier application
// (those are wrapped by the dispatch in app/api/stripe/webhook/route.ts).
//
// IMPORTANT: in API version 2026-03-25.dahlia, current_period_start and
// current_period_end live on SubscriptionItem, not Subscription. We always
// read them via firstItemPeriod().

import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

import type { Database } from "@/integrations/supabase/types";
import { normalizePricingTier } from "@/lib/pricing/pricing-resolver";

import { findByCheckoutSession, findByOwner, findByStripeSub, upsertSubscription } from "./db";
import {
  type PlanType,
  type SubscriptionStatus,
  type EffectiveTier,
  mapStripeSubscriptionStatus,
  planTypeFromBillingPeriod,
} from "./types";

type Supabase = SupabaseClient<Database>;

interface PricingLookup {
  id: string;
  tier: string;
  billing_period: string;
  stripe_price_id: string | null;
  price_cents: number;
  currency: string;
  valid_to: string | null;
}

// ---------- helpers ----------

function getMetadataOwnerId(
  metadata: { owner_id?: string | null; userId?: string | null } | null | undefined,
): string | null {
  return metadata?.owner_id ?? metadata?.userId ?? null;
}

function unixToIso(value: number | null | undefined): string | null {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function unixToDateOnly(value: number | null | undefined): string | null {
  if (!value) return null;
  return new Date(value * 1000).toISOString().slice(0, 10);
}

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

function asPaidTier(value: unknown): EffectiveTier | null {
  if (typeof value !== "string") return null;
  const tier = normalizePricingTier(value);
  if (tier === "verified" || tier === "signature") return tier;
  return null;
}

interface ItemPeriod {
  start: number | null;
  end: number | null;
  priceId: string | null;
}

function firstItemPeriod(sub: Stripe.Subscription | undefined | null): ItemPeriod {
  const item = sub?.items?.data?.[0] as
    | (Stripe.SubscriptionItem & { current_period_start?: number; current_period_end?: number })
    | undefined;
  return {
    start: item?.current_period_start ?? null,
    end: item?.current_period_end ?? null,
    priceId: item?.price?.id ?? null,
  };
}

async function findPricingByStripePriceId(
  supabase: Supabase,
  stripePriceId: string,
): Promise<PricingLookup | null> {
  const { data, error } = await supabase
    .from("subscription_pricing")
    .select("id, tier, billing_period, stripe_price_id, price_cents, currency, valid_to")
    .eq("stripe_price_id", stripePriceId)
    .maybeSingle();
  if (error) throw error;
  return (data as PricingLookup | null) ?? null;
}

async function findPricingById(
  supabase: Supabase,
  pricingId: string,
): Promise<PricingLookup | null> {
  const { data, error } = await supabase
    .from("subscription_pricing")
    .select("id, tier, billing_period, stripe_price_id, price_cents, currency, valid_to")
    .eq("id", pricingId)
    .maybeSingle();
  if (error) throw error;
  return (data as PricingLookup | null) ?? null;
}

// Resolve owner_id from a subscription/invoice via metadata, then DB lookup,
// then customer fallback.
async function resolveOwnerId(
  supabase: Supabase,
  metadataUserId: string | null,
  stripeSubscriptionId: string | null,
  stripeCustomerId: string | null,
): Promise<string | null> {
  if (metadataUserId) return metadataUserId;
  if (stripeSubscriptionId) {
    const row = await findByStripeSub(supabase, stripeSubscriptionId);
    if (row) return row.owner_id;
  }
  if (stripeCustomerId) {
    const { data, error } = await supabase
      .from("owner_subscriptions")
      .select("owner_id")
      .eq("stripe_customer_id", stripeCustomerId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (data?.owner_id) return data.owner_id;
  }
  return null;
}

interface HandlerResult {
  ownerId: string | null;
  skipped?: boolean;
}

// ---------- handlers ----------

export async function handleCheckoutCompleted(
  stripe: Stripe,
  supabase: Supabase,
  event: Stripe.Event,
): Promise<HandlerResult> {
  const session = event.data.object as Stripe.Checkout.Session;
  if (session.mode !== "subscription") return { ownerId: null, skipped: true };
  const ownerId = getMetadataOwnerId(session.metadata);
  if (!ownerId) return { ownerId: null };

  const pricingId = session.metadata?.pricing_id ?? null;
  const pricing = pricingId ? await findPricingById(supabase, pricingId) : null;
  const tier = asPaidTier(pricing?.tier ?? session.metadata?.tier ?? null);
  const billingPeriod = pricing?.billing_period ?? session.metadata?.billing_period ?? null;
  if (!tier || !billingPeriod) return { ownerId };

  const planType = planTypeFromBillingPeriod(billingPeriod);
  const customerId = typeof session.customer === "string" ? session.customer : null;
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;

  // fixed_2026: one-shot payment, immediately active. End date from pricing valid_to.
  if (planType === "fixed_2026") {
    const endDate = pricing?.valid_to ?? "2026-12-31";
    await upsertSubscription(
      supabase,
      ownerId,
      {
        tier,
        tier_source: "stripe",
        plan_type: "fixed_2026",
        billing_period: "promo",
        status: "active",
        stripe_customer_id: customerId,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        stripe_price_id: pricing?.stripe_price_id ?? null,
        price_cents: pricing?.price_cents ?? null,
        currency: pricing?.currency ?? "EUR",
        start_date: todayDateOnly(),
        end_date: endDate,
      },
      { eventCreatedAt: event.created },
    );
    return { ownerId };
  }

  // Recurring: write a `pending` placeholder + IDs. customer.subscription.created
  // is the authoritative writer of status/tier/period. Stale-event guard prevents
  // this from clobbering an established subscription.
  await upsertSubscription(
    supabase,
    ownerId,
    {
      tier,
      tier_source: "stripe",
      plan_type: planType as PlanType,
      billing_period: billingPeriod as "monthly" | "yearly",
      status: "pending",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_checkout_session_id: session.id,
      stripe_price_id: pricing?.stripe_price_id ?? null,
      price_cents: pricing?.price_cents ?? null,
      currency: pricing?.currency ?? "EUR",
      start_date: todayDateOnly(),
    },
    { eventCreatedAt: event.created },
  );

  return { ownerId };
}

export async function handleSubscriptionCreatedOrUpdated(
  _stripe: Stripe,
  supabase: Supabase,
  event: Stripe.Event,
): Promise<HandlerResult> {
  const sub = event.data.object as Stripe.Subscription;
  const customerId = typeof sub.customer === "string" ? sub.customer : null;
  const ownerId = await resolveOwnerId(
    supabase,
    getMetadataOwnerId(sub.metadata),
    sub.id,
    customerId,
  );
  if (!ownerId) return { ownerId: null };

  const period = firstItemPeriod(sub);
  const stripePriceId = period.priceId;
  if (!stripePriceId) return { ownerId };

  const pricing = await findPricingByStripePriceId(supabase, stripePriceId);
  const tier = asPaidTier(pricing?.tier ?? null);
  const billingPeriod = pricing?.billing_period ?? null;
  if (!tier || !billingPeriod) {
    console.warn(`[webhook] ${event.type}: no pricing row for stripe_price_id=${stripePriceId}; owner=${ownerId} sub state unchanged`);
    return { ownerId };
  }

  const planType = planTypeFromBillingPeriod(billingPeriod);
  const status = mapStripeSubscriptionStatus(sub.status);

  await upsertSubscription(
    supabase,
    ownerId,
    {
      tier,
      tier_source: "stripe",
      plan_type: planType,
      billing_period: billingPeriod as "monthly" | "yearly" | "promo",
      status,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      stripe_price_id: stripePriceId,
      price_cents: pricing?.price_cents ?? null,
      currency: pricing?.currency ?? "EUR",
      current_period_start: unixToIso(period.start),
      current_period_end: unixToIso(period.end),
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      canceled_at: unixToIso(sub.canceled_at ?? null),
      trial_end: unixToIso(sub.trial_end ?? null),
      end_date: unixToDateOnly(period.end),
    },
    { eventCreatedAt: event.created },
  );

  return { ownerId };
}

export async function handleSubscriptionDeleted(
  _stripe: Stripe,
  supabase: Supabase,
  event: Stripe.Event,
): Promise<HandlerResult> {
  const sub = event.data.object as Stripe.Subscription;
  const customerId = typeof sub.customer === "string" ? sub.customer : null;
  const ownerId = await resolveOwnerId(
    supabase,
    getMetadataOwnerId(sub.metadata),
    sub.id,
    customerId,
  );
  if (!ownerId) return { ownerId: null };

  const canceledAtIso = unixToIso(sub.canceled_at ?? sub.ended_at ?? null) ?? new Date().toISOString();
  await upsertSubscription(
    supabase,
    ownerId,
    {
      status: "canceled" satisfies SubscriptionStatus,
      tier: "unverified",
      tier_source: "stripe",
      cancel_at_period_end: false,
      canceled_at: canceledAtIso,
      end_date: canceledAtIso.slice(0, 10),
    },
    { eventCreatedAt: event.created },
  );

  return { ownerId };
}

export async function handleInvoicePaid(
  stripe: Stripe,
  supabase: Supabase,
  event: Stripe.Event,
): Promise<HandlerResult> {
  const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
  const stripeSubscriptionId =
    typeof invoice.subscription === "string" ? invoice.subscription : null;
  const customerId = typeof invoice.customer === "string" ? invoice.customer : null;

  if (!stripeSubscriptionId) {
    // One-shot payments (fixed_2026) don't carry an invoice subscription. Nothing to update.
    return { ownerId: null };
  }

  const sub = (await stripe.subscriptions.retrieve(stripeSubscriptionId)) as Stripe.Subscription;
  const ownerId = await resolveOwnerId(
    supabase,
    getMetadataOwnerId(sub.metadata),
    sub.id,
    customerId,
  );
  if (!ownerId) return { ownerId: null };

  const period = firstItemPeriod(sub);
  const stripePriceId = period.priceId;
  if (!stripePriceId) return { ownerId };

  const pricing = await findPricingByStripePriceId(supabase, stripePriceId);
  const tier = asPaidTier(pricing?.tier ?? null);
  const billingPeriod = pricing?.billing_period ?? null;
  if (!tier || !billingPeriod) {
    console.warn(`[webhook] invoice.paid: no pricing row for stripe_price_id=${stripePriceId}; owner=${ownerId} sub state unchanged`);
    return { ownerId };
  }

  const planType = planTypeFromBillingPeriod(billingPeriod);
  const status = mapStripeSubscriptionStatus(sub.status);

  await upsertSubscription(
    supabase,
    ownerId,
    {
      tier,
      tier_source: "stripe",
      plan_type: planType,
      billing_period: billingPeriod as "monthly" | "yearly",
      status,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      stripe_price_id: stripePriceId,
      price_cents: pricing?.price_cents ?? null,
      currency: pricing?.currency ?? "EUR",
      current_period_start: unixToIso(period.start),
      current_period_end: unixToIso(period.end),
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      end_date: unixToDateOnly(period.end),
    },
    { eventCreatedAt: event.created },
  );

  return { ownerId };
}

export async function handleInvoicePaymentFailed(
  stripe: Stripe,
  supabase: Supabase,
  event: Stripe.Event,
): Promise<HandlerResult> {
  const invoice = event.data.object as Stripe.Invoice & {
    subscription?: string | null;
    next_payment_attempt?: number | null;
  };
  const stripeSubscriptionId =
    typeof invoice.subscription === "string" ? invoice.subscription : null;
  const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
  if (!stripeSubscriptionId) return { ownerId: null };

  const sub = (await stripe.subscriptions.retrieve(stripeSubscriptionId)) as Stripe.Subscription;
  const ownerId = await resolveOwnerId(
    supabase,
    getMetadataOwnerId(sub.metadata),
    sub.id,
    customerId,
  );
  if (!ownerId) return { ownerId: null };

  // Trust Stripe's mapped status: past_due during retries, unpaid after final attempt.
  const status = mapStripeSubscriptionStatus(sub.status);

  await upsertSubscription(
    supabase,
    ownerId,
    {
      status,
      tier_source: "stripe",
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
    },
    { eventCreatedAt: event.created },
  );

  return { ownerId };
}

export async function handleCheckoutExpired(
  _stripe: Stripe,
  supabase: Supabase,
  event: Stripe.Event,
): Promise<HandlerResult> {
  const session = event.data.object as Stripe.Checkout.Session;
  const existing = await findByCheckoutSession(supabase, session.id);
  if (!existing) return { ownerId: null };

  // Only flip to incomplete_expired if we still have a pending row for this session.
  if (existing.status !== "pending" && existing.status !== "incomplete") {
    return { ownerId: existing.owner_id, skipped: true };
  }

  await upsertSubscription(
    supabase,
    existing.owner_id,
    { status: "incomplete_expired", tier_source: "stripe" },
    { eventCreatedAt: event.created },
  );
  return { ownerId: existing.owner_id };
}

// trial_will_end and invoice.finalized are audit-only — no state change.
export async function handleTrialWillEnd(
  _stripe: Stripe,
  supabase: Supabase,
  event: Stripe.Event,
): Promise<HandlerResult> {
  const sub = event.data.object as Stripe.Subscription;
  const customerId = typeof sub.customer === "string" ? sub.customer : null;
  const ownerId = await resolveOwnerId(
    supabase,
    getMetadataOwnerId(sub.metadata),
    sub.id,
    customerId,
  );
  return { ownerId };
}

export async function handleInvoiceFinalized(
  _stripe: Stripe,
  supabase: Supabase,
  event: Stripe.Event,
): Promise<HandlerResult> {
  const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
  const stripeSubscriptionId =
    typeof invoice.subscription === "string" ? invoice.subscription : null;
  const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
  const ownerId = await resolveOwnerId(supabase, null, stripeSubscriptionId, customerId);
  return { ownerId };
}

// Public dispatch table consumed by app/api/stripe/webhook/route.ts.
export type WebhookHandler = (
  stripe: Stripe,
  supabase: Supabase,
  event: Stripe.Event,
) => Promise<HandlerResult>;

export const WEBHOOK_HANDLERS: Record<string, WebhookHandler> = {
  "checkout.session.completed": handleCheckoutCompleted,
  "checkout.session.expired": handleCheckoutExpired,
  "customer.subscription.created": handleSubscriptionCreatedOrUpdated,
  "customer.subscription.updated": handleSubscriptionCreatedOrUpdated,
  "customer.subscription.deleted": handleSubscriptionDeleted,
  "customer.subscription.trial_will_end": handleTrialWillEnd,
  "invoice.paid": handleInvoicePaid,
  "invoice.payment_succeeded": handleInvoicePaid,
  "invoice.payment_failed": handleInvoicePaymentFailed,
  "invoice.finalized": handleInvoiceFinalized,
};

// Re-export for convenience.
export { findByOwner };
