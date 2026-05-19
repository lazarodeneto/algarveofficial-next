export const runtime = "nodejs";

/* eslint-disable @typescript-eslint/no-explicit-any, no-console */

import { NextRequest, NextResponse } from "next/server";
import {
  getActivePrice,
  normalizePricingBillingPeriod,
  normalizePricingTier,
  type SubscriptionPricingRow,
} from "@/lib/pricing/pricing-resolver";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getStripeServerClient } from "@/lib/stripe/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  requireAuthenticatedOwner,
  type OwnerAuth,
  type OwnerAuthError,
} from "@/lib/server/owner-auth";
import { findByOwner, findOverlappingActive } from "@/lib/subscriptions/db";
import { planTypeFromBillingPeriod } from "@/lib/subscriptions/types";

type PaidTier = "verified" | "signature";
type BillingPeriod = "monthly" | "yearly" | "promo";
type ListingTier = "unverified" | "verified" | "signature";
type CheckoutSource = "owner" | "claim";

interface CheckoutBody {
  source?: string;
  tier?: string;
  billing_period?: string;
  listing_id?: string;
  claim_id?: string;
}

const TIER_RANK: Record<ListingTier, number> = {
  unverified: 0,
  verified: 1,
  signature: 2,
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeListingTier(value: unknown): ListingTier {
  return value === "verified" || value === "signature" ? value : "unverified";
}

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

function normalizeCheckoutSource(value: unknown): CheckoutSource | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const source = value.trim().toLowerCase();
  if (source === "owner" || source === "claim") return source;
  return null;
}

function isStripePriceId(value: unknown): value is string {
  return typeof value === "string" && /^price_[A-Za-z0-9_]+$/.test(value.trim());
}

function getPricingPriceCents(row: SubscriptionPricingRow | undefined | null) {
  if (!row) return 0;
  if (typeof row.price_cents === "number" && Number.isFinite(row.price_cents)) {
    return row.price_cents;
  }
  return typeof row.price === "number" && Number.isFinite(row.price) ? row.price : 0;
}

function validateResolvedPricingRow({
  pricing,
  resolvedBillingPeriod,
  tier,
  checkoutSource,
}: {
  pricing: SubscriptionPricingRow | undefined;
  resolvedBillingPeriod: BillingPeriod;
  tier: PaidTier;
  checkoutSource: CheckoutSource;
}): { ok: true; stripePriceId: string } | { ok: false; status: number; error: string } {
  if (!pricing) {
    return { ok: false, status: 400, error: "Pricing not found." };
  }

  if (normalizePricingTier(pricing.tier) !== tier) {
    return { ok: false, status: 400, error: "Pricing tier mismatch." };
  }

  if (normalizePricingBillingPeriod(pricing.billing_period as any) !== resolvedBillingPeriod) {
    return { ok: false, status: 400, error: "Pricing period mismatch." };
  }

  if (pricing.is_active !== true) {
    return { ok: false, status: 400, error: "Pricing is not available." };
  }

  if (checkoutSource === "claim" && resolvedBillingPeriod !== "monthly") {
    return { ok: false, status: 400, error: "Claim checkout requires monthly pricing." };
  }

  const currency = typeof pricing.currency === "string" ? pricing.currency.toUpperCase() : "";
  if (currency !== "EUR") {
    return { ok: false, status: 400, error: "Pricing currency is not available." };
  }

  if (getPricingPriceCents(pricing) <= 0) {
    return { ok: false, status: 400, error: "Pricing amount is not available." };
  }

  const stripePriceId = pricing.stripe_price_id?.trim();
  if (!isStripePriceId(stripePriceId)) {
    return { ok: false, status: 500, error: "Pricing configuration error." };
  }

  return { ok: true, stripePriceId };
}

function resolveSiteUrl(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return request.nextUrl.origin;
}

function resolveCheckoutLocalePrefix(request: NextRequest) {
  const referer = request.headers.get("referer");
  if (!referer) return "";

  try {
    const firstSegment = new URL(referer).pathname.split("/").filter(Boolean)[0];
    return SUPPORTED_LOCALES.includes(firstSegment as (typeof SUPPORTED_LOCALES)[number])
      ? `/${firstSegment}`
      : "";
  } catch {
    return "";
  }
}

async function requireAuthenticatedClaimant(): Promise<OwnerAuth | OwnerAuthError> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }

  return {
    userId: data.user.id,
    email: data.user.email ?? null,
  };
}

export async function POST(request: NextRequest) {
  let body: CheckoutBody | null = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const claimId = typeof body?.claim_id === "string" ? body.claim_id.trim() : "";
  const listingId = typeof body?.listing_id === "string" ? body.listing_id.trim() : "";
  const rawSource = typeof body?.source === "string" ? body.source.trim() : "";
  const normalizedSource = normalizeCheckoutSource(rawSource);
  const tier = normalizePaidTier(body?.tier);
  const billingPeriod = normalizeCheckoutBillingPeriod(body?.billing_period);

  if (rawSource && !normalizedSource) {
    return NextResponse.json({ error: "Invalid checkout source." }, { status: 400 });
  }

  if (normalizedSource === "owner" && claimId) {
    return NextResponse.json({ error: "Use claim checkout for claim payments." }, { status: 400 });
  }

  const checkoutSource: CheckoutSource = normalizedSource ?? (claimId ? "claim" : "owner");

  if (checkoutSource === "claim" && !claimId) {
    return NextResponse.json({ error: "claim_id is required for claim checkout." }, { status: 400 });
  }

  if (claimId && listingId) {
    return NextResponse.json(
      { error: "Use either claim_id or listing_id for checkout, not both." },
      { status: 400 },
    );
  }

  if (!tier || !billingPeriod) {
    return NextResponse.json({ error: "Invalid pricing selection." }, { status: 400 });
  }

  if (checkoutSource === "claim" && billingPeriod !== "monthly") {
    return NextResponse.json(
      { error: "Claim checkout requires monthly pricing." },
      { status: 400 },
    );
  }

  const auth = checkoutSource === "claim"
    ? await requireAuthenticatedClaimant()
    : await requireAuthenticatedOwner(request);
  if ("error" in auth) return auth.error;

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ error: "Missing service role config." }, { status: 500 });
  }

  const stripe = getStripeServerClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 503 });
  }

  let checkoutClaimId: string | null = null;
  let checkoutListingId: string | null = null;
  let checkoutListingSlug: string | null = null;

  if (checkoutSource === "claim") {
    if (!isUuid(claimId)) {
      return NextResponse.json({ error: "Invalid claim selection." }, { status: 400 });
    }

    const { data: claim, error: claimError } = await supabase
      .from("business_claims")
      .select("id, listing_id, claimant_user_id, selected_tier, status, listing:listings(id, slug)")
      .eq("id", claimId)
      .maybeSingle();

    if (claimError) {
      return NextResponse.json({ error: "Claim validation failed." }, { status: 500 });
    }

    if (!claim) {
      return NextResponse.json({ error: "Claim not found." }, { status: 404 });
    }

    if (claim.claimant_user_id !== auth.userId) {
      return NextResponse.json({ error: "Claim not found for this user." }, { status: 403 });
    }

    if (claim.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending claims can start checkout." },
        { status: 409 },
      );
    }

    if (claim.selected_tier !== tier) {
      return NextResponse.json(
        { error: "Claim tier does not match checkout tier." },
        { status: 409 },
      );
    }

    checkoutClaimId = claim.id;
    checkoutListingId = claim.listing_id;
    const listingRelation = Array.isArray(claim.listing) ? claim.listing[0] : claim.listing;
    checkoutListingSlug =
      typeof listingRelation?.slug === "string" && listingRelation.slug
        ? listingRelation.slug
        : claim.listing_id;
  }

  if (listingId) {
    if (!isUuid(listingId)) {
      return NextResponse.json({ error: "Invalid listing selection." }, { status: 400 });
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, owner_id, claim_status, tier")
      .eq("id", listingId)
      .eq("owner_id", auth.userId)
      .maybeSingle();

    if (listingError) {
      return NextResponse.json({ error: "Listing validation failed." }, { status: 500 });
    }

    if (!listing) {
      return NextResponse.json({ error: "Listing not found for this owner." }, { status: 404 });
    }

    if (listing.claim_status !== "claimed") {
      return NextResponse.json(
        { error: "Only claimed listings can be upgraded." },
        { status: 409 },
      );
    }

    const currentTier = normalizeListingTier(listing.tier);
    if (TIER_RANK[tier] <= TIER_RANK[currentTier]) {
      return NextResponse.json(
        { error: "This listing is already on this tier or higher." },
        { status: 409 },
      );
    }

    checkoutListingId = listing.id;
  }

  const { data: pricingRows, error: pricingError } = await supabase
    .from("subscription_pricing")
    .select("*")
    .eq("tier", tier)
    .eq("is_active", true)
    .limit(20);

  if (pricingError || !pricingRows?.length) {
    return NextResponse.json({ error: "Pricing not found." }, { status: 400 });
  }

  let resolvedPricing;
  try {
    resolvedPricing = getActivePrice(pricingRows as SubscriptionPricingRow[], {
      tier,
      billingPeriod,
    });
  } catch {
    return NextResponse.json({ error: "Pricing not found." }, { status: 400 });
  }

  const pricing = (pricingRows as SubscriptionPricingRow[]).find(
    (row) => row.id === resolvedPricing.id,
  );
  const resolvedBillingPeriod = resolvedPricing.billingPeriod;
  const pricingValidation = validateResolvedPricingRow({
    pricing,
    resolvedBillingPeriod,
    tier,
    checkoutSource,
  });
  if (!pricingValidation.ok) {
    return NextResponse.json(
      { error: pricingValidation.error },
      { status: pricingValidation.status },
    );
  }

  const planType = planTypeFromBillingPeriod(resolvedBillingPeriod);

  let overlap;
  try {
    overlap = await findOverlappingActive(supabase, auth.userId, planType);
  } catch {
    return NextResponse.json({ error: "Overlap validation failed." }, { status: 500 });
  }

  if (overlap) {
    return NextResponse.json({ error: overlap.reason, code: "PLAN_OVERLAP" }, { status: 409 });
  }

  const stripePriceId = pricingValidation.stripePriceId;

  // Reuse existing Stripe customer to avoid duplicates; fall back to pre-filling email.
  let existingCustomerId: string | null = null;
  try {
    const existingSub = await findByOwner(supabase, auth.userId);
    existingCustomerId = existingSub?.stripe_customer_id ?? null;
  } catch (error) {
    console.warn("[checkout] Failed to fetch existing subscription/customer", {
      userId: auth.userId,
      error,
    });
  }

  const sessionMeta = {
    checkout_source: checkoutSource,
    owner_id: auth.userId,
    userId: auth.userId,
    user_id: auth.userId,
    tier,
    target_tier: tier,
    billing_period: resolvedBillingPeriod,
    requested_billing_period: billingPeriod,
    pricing_id: resolvedPricing.id,
    stripe_price_id: stripePriceId,
    ...(checkoutClaimId ? { claim_id: checkoutClaimId } : {}),
    ...(checkoutListingId ? { listing_id: checkoutListingId } : {}),
  };

  const baseUrl = resolveSiteUrl(request);
  const localePrefix = checkoutClaimId
    ? resolveCheckoutLocalePrefix(request) || `/${DEFAULT_LOCALE}`
    : checkoutListingId
    ? resolveCheckoutLocalePrefix(request) || `/${DEFAULT_LOCALE}`
    : resolveCheckoutLocalePrefix(request);
  const checkoutQuery = checkoutListingId && !checkoutClaimId
    ? `?listing_id=${encodeURIComponent(checkoutListingId)}&target_tier=${encodeURIComponent(tier)}`
    : "";
  const claimCheckoutPath = checkoutClaimId
    ? `/claim-business/${encodeURIComponent(checkoutListingSlug ?? checkoutListingId ?? checkoutClaimId)}`
    : "";
  const successUrl = checkoutClaimId
    ? `${baseUrl}${localePrefix}${claimCheckoutPath}?checkout=success`
    : checkoutListingId
      ? `${baseUrl}${localePrefix}/owner/upgrade/success${checkoutQuery}`
      : `${baseUrl}${localePrefix}/owner/membership?success=1`;
  const cancelUrl = checkoutClaimId
    ? `${baseUrl}${localePrefix}${claimCheckoutPath}?checkout=cancel`
    : checkoutListingId
      ? `${baseUrl}${localePrefix}/owner/upgrade/cancel${checkoutQuery}`
      : `${baseUrl}${localePrefix}/owner/membership?canceled=1`;

  const buildSessionParams = (customerId: string | null) => ({
    mode: planType === "fixed_2026" ? ("payment" as const) : ("subscription" as const),
    ...(customerId
      ? { customer: customerId }
      : { customer_email: auth.email ?? undefined }),
    ...(planType === "fixed_2026" && !customerId ? { customer_creation: "always" as const } : {}),
    client_reference_id: auth.userId,
    line_items: [{ price: stripePriceId, quantity: 1 }],
    // Propagate metadata to the subscription object so webhook handlers can
    // resolve owner_id from sub.metadata without a DB fallback.
    ...(planType === "fixed_2026"
      ? { payment_intent_data: { metadata: sessionMeta } }
      : { subscription_data: { metadata: sessionMeta } }),
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: sessionMeta,
  });

  let session;
  try {
    session = await stripe.checkout.sessions.create(buildSessionParams(existingCustomerId));
  } catch (err) {
    // Stale customer ID (e.g. test→live mode switch): retry without it.
    const stripeErr = err as { code?: string; message?: string };
    if (existingCustomerId && stripeErr?.code === "resource_missing") {
      console.warn("[checkout] Stale customer ID, retrying without it:", existingCustomerId);
      try {
        session = await stripe.checkout.sessions.create(buildSessionParams(null));
      } catch (retryErr) {
        console.error("[checkout] Stripe session create failed (retry):", retryErr);
        const msg = (retryErr as { message?: string })?.message ?? "Failed to create checkout session.";
        return NextResponse.json({ error: msg }, { status: 502 });
      }
    } else {
      console.error("[checkout] Stripe session create failed:", err);
      const msg = stripeErr?.message ?? "Failed to create checkout session.";
      return NextResponse.json({ error: msg }, { status: 502 });
    }
  }

  return NextResponse.json({ url: session.url });
}
