import "server-only";

import * as Sentry from "@sentry/nextjs";

import type {
  ClaimPricingTier,
  ClaimTierPricingDetails,
  ClaimTierPricingOption,
} from "@/lib/claims/claim-pricing-types";
import {
  buildPricingCatalogSnapshot,
  type PricingBillingPeriod,
  type PricingCatalogSnapshot,
  type ResolvedPrice,
  type SubscriptionPricingRow,
} from "@/lib/pricing/pricing-resolver";
import { createServiceRoleClient } from "@/lib/supabase/service";

const PAID_TIERS = ["verified", "signature"] as const;

function readTx(tx: Record<string, string>, key: string, fallback: string) {
  const value = tx[key];
  return value && value.trim().length > 0 ? value : fallback;
}

function getCadenceLabel(tx: Record<string, string>, billingPeriod: PricingBillingPeriod | null) {
  switch (billingPeriod) {
    case "monthly":
      return readTx(tx, "claimBusinessSearch.pricing.monthlyCadence", "/month");
    case "yearly":
      return readTx(tx, "claimBusinessSearch.pricing.yearlyCadence", "/year");
    case "promo":
      return readTx(tx, "claimBusinessSearch.pricing.promoCadence", "campaign rate");
    default:
      return "";
  }
}

function getTierPriceOptions(snapshot: PricingCatalogSnapshot, tier: Exclude<ClaimPricingTier, "free">) {
  const tierSnapshot = snapshot.tiers[tier];
  const candidates = [
    tierSnapshot.currentMonthly ??
    tierSnapshot.monthly ??
    null,
    tierSnapshot.currentYearly ??
    tierSnapshot.yearly ??
    null,
    tierSnapshot.promo,
  ];
  const seen = new Set<string>();

  return candidates.filter((price): price is ResolvedPrice => {
    if (!price) return false;
    const key = price.id || `${price.billingPeriod}:${price.displayPrice}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildPricingOption(
  tx: Record<string, string>,
  price: ResolvedPrice,
): ClaimTierPricingOption {
  const supportingLabel = price.monthlyEquivalent
    ? readTx(
        tx,
        "claimBusinessSearch.pricing.monthlyEquivalent",
        "{{price}} monthly equivalent",
      ).replace("{{price}}", price.monthlyEquivalent)
    : price.note;

  return {
    billingPeriod: price.billingPeriod,
    priceLabel: price.displayPrice,
    cadenceLabel: getCadenceLabel(tx, price.billingPeriod),
    supportingLabel,
  };
}

function buildPaidTierPricingDetail(
  tx: Record<string, string>,
  tier: Exclude<ClaimPricingTier, "free">,
  prices: ResolvedPrice[],
): ClaimTierPricingDetails["verified"] {
  const options = prices.map((price) => buildPricingOption(tx, price));
  const primaryOption = options[0] ?? null;

  if (!primaryOption) {
    const keyPrefix = `claimBusinessPartnership.tiers.${tier}`;
    return {
      priceLabel: readTx(tx, `${keyPrefix}.price`, tier === "verified" ? "€19" : "€190"),
      cadenceLabel: readTx(tx, `${keyPrefix}.priceNote`, "/month"),
      supportingLabel: readTx(
        tx,
        "claimBusinessSearch.pricing.unavailableNote",
        "Secure checkout uses the configured Stripe subscription price.",
      ),
      billingPeriod: null,
      checkoutBillingPeriod: null,
      options: [],
    };
  }

  return {
    priceLabel: primaryOption.priceLabel,
    cadenceLabel: primaryOption.cadenceLabel,
    supportingLabel: primaryOption.supportingLabel,
    billingPeriod: primaryOption.billingPeriod,
    checkoutBillingPeriod: primaryOption.billingPeriod,
    options,
  };
}

export async function getClaimPricingSnapshot(): Promise<PricingCatalogSnapshot> {
  const emptySnapshot = buildPricingCatalogSnapshot([]);
  const supabase = createServiceRoleClient();
  if (!supabase) return emptySnapshot;

  const { data, error } = await supabase
    .from("subscription_pricing")
    .select("*")
    .in("tier", [...PAID_TIERS])
    .order("created_at", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    Sentry.captureException(error, {
      tags: {
        feature: "business-claim-pricing",
      },
    });
    return emptySnapshot;
  }

  return buildPricingCatalogSnapshot((data ?? []) as SubscriptionPricingRow[]);
}

export function buildClaimTierPricingDetails(
  snapshot: PricingCatalogSnapshot,
  tx: Record<string, string>,
): ClaimTierPricingDetails {
  return {
    free: {
      priceLabel: readTx(tx, "claimBusinessPartnership.tiers.unverified.price", "Free"),
      cadenceLabel: readTx(tx, "claimBusinessPartnership.tiers.unverified.priceNote", "basic"),
      supportingLabel: readTx(tx, "claimBusinessSearch.pricing.freeNote", "Always free"),
      billingPeriod: null,
      checkoutBillingPeriod: null,
      options: [],
    },
    verified: buildPaidTierPricingDetail(tx, "verified", getTierPriceOptions(snapshot, "verified")),
    signature: buildPaidTierPricingDetail(tx, "signature", getTierPriceOptions(snapshot, "signature")),
  };
}
