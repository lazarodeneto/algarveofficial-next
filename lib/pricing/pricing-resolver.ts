import type { Database } from "@/integrations/supabase/types";

export type PricingTier = "unverified" | "verified" | "signature";
export type PaidPricingTier = Exclude<PricingTier, "unverified">;
export type PricingBillingPeriod = "monthly" | "yearly" | "promo";
export type PricingBillingPeriodInput =
  | PricingBillingPeriod
  | "annual"
  | "period"
  | string;

export type SubscriptionPricingRow =
  Database["public"]["Tables"]["subscription_pricing"]["Row"];

export interface ResolvedPrice {
  id: string;
  tier: PricingTier;
  billingPeriod: PricingBillingPeriod;
  requestedBillingPeriod: PricingBillingPeriod;
  priceCents: number;
  currency: string;
  displayPrice: string;
  note: string;
  validFrom: string | null;
  validTo: string | null;
  isActive: boolean;
  monthlyEquivalent: string | null;
  savings: number | null;
  source: "db" | "free";
}

export interface TierPricingSnapshot {
  tier: PricingTier;
  monthly: ResolvedPrice | null;
  yearly: ResolvedPrice | null;
  promo: ResolvedPrice | null;
  currentMonthly: ResolvedPrice | null;
  currentYearly: ResolvedPrice | null;
}

export interface PricingCatalogSnapshot {
  generatedAt: string;
  tiers: Record<PricingTier, TierPricingSnapshot>;
}

const FREE_TIER_NOTE = "Always free";

function toDateKey(value: Date | string | undefined) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function compareDateOnly(left: string, right: string) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function getRowTimestamp(row: Pick<SubscriptionPricingRow, "created_at" | "updated_at">) {
  return new Date(row.updated_at ?? row.created_at ?? 0).getTime();
}

function sortRowsNewestFirst(rows: SubscriptionPricingRow[]) {
  return [...rows].sort((left, right) => getRowTimestamp(right) - getRowTimestamp(left));
}

export function normalizePricingBillingPeriod(
  billingPeriod: string | null | undefined,
): PricingBillingPeriod | null {
  if (!billingPeriod) return null;

  switch (billingPeriod.toLowerCase()) {
    case "monthly":
      return "monthly";
    case "yearly":
    case "annual":
      return "yearly";
    case "promo":
    case "period":
      return "promo";
    default:
      return null;
  }
}

export function normalizePricingTier(
  tier: string | null | undefined,
): PricingTier | null {
  if (!tier) return null;
  switch (tier.toLowerCase()) {
    case "unverified":
      return "unverified";
    case "verified":
      return "verified";
    case "signature":
      return "signature";
    default:
      return null;
  }
}

export function isPricingRowActiveOnDate(
  row: SubscriptionPricingRow,
  date: Date | string = new Date(),
) {
  if (row.is_active === false) return false;

  const day = toDateKey(date);
  if (!day) return false;

  const normalizedBillingPeriod = normalizePricingBillingPeriod(row.billing_period);
  if (normalizedBillingPeriod !== "promo") {
    return true;
  }

  if (!row.valid_from || !row.valid_to) {
    return false;
  }

  return (
    compareDateOnly(day, row.valid_from) >= 0 &&
    compareDateOnly(day, row.valid_to) <= 0
  );
}

function getPriceCents(row: SubscriptionPricingRow) {
  if (typeof row.price_cents === "number" && !Number.isNaN(row.price_cents)) {
    return row.price_cents;
  }

  return row.price ?? 0;
}

function buildResolvedPriceFromRow(
  row: SubscriptionPricingRow,
  requestedBillingPeriod: PricingBillingPeriod,
): ResolvedPrice {
  return {
    id: row.id,
    tier: (normalizePricingTier(row.tier) ?? "verified") as PricingTier,
    billingPeriod: normalizePricingBillingPeriod(row.billing_period) ?? requestedBillingPeriod,
    requestedBillingPeriod,
    priceCents: getPriceCents(row),
    currency: row.currency ?? "EUR",
    displayPrice: row.display_price,
    note: row.note,
    validFrom: row.valid_from,
    validTo: row.valid_to,
    isActive: row.is_active,
    monthlyEquivalent: row.monthly_equivalent,
    savings: row.savings,
    source: "db",
  };
}

function buildFreeResolvedPrice(requestedBillingPeriod: PricingBillingPeriod): ResolvedPrice {
  return {
    id: "unverified-free",
    tier: "unverified",
    billingPeriod: requestedBillingPeriod,
    requestedBillingPeriod,
    priceCents: 0,
    currency: "EUR",
    displayPrice: "€0",
    note: FREE_TIER_NOTE,
    validFrom: null,
    validTo: null,
    isActive: true,
    monthlyEquivalent: null,
    savings: 0,
    source: "free",
  };
}

function filterRowsForTier(
  rows: SubscriptionPricingRow[],
  tier: PaidPricingTier,
) {
  return rows.filter((row) => normalizePricingTier(row.tier) === tier);
}

function getLatestMatchingRow(
  rows: SubscriptionPricingRow[],
  tier: PaidPricingTier,
  billingPeriod: PricingBillingPeriod,
  date: Date | string = new Date(),
) {
  return sortRowsNewestFirst(
    filterRowsForTier(rows, tier).filter((row) => {
      return (
        normalizePricingBillingPeriod(row.billing_period) === billingPeriod &&
        isPricingRowActiveOnDate(row, date)
      );
    }),
  )[0] ?? null;
}

export function getLatestStandardPrice(
  rows: SubscriptionPricingRow[],
  args: {
    tier: PricingTier;
    billingPeriod: PricingBillingPeriodInput;
    date?: Date | string;
  },
): ResolvedPrice | null {
  const tier = normalizePricingTier(args.tier);
  const billingPeriod = normalizePricingBillingPeriod(args.billingPeriod);

  if (!tier || !billingPeriod) return null;
  if (tier === "unverified") {
    return buildFreeResolvedPrice(billingPeriod === "promo" ? "yearly" : billingPeriod);
  }
  if (billingPeriod === "promo") {
    return null;
  }

  const row = getLatestMatchingRow(rows, tier, billingPeriod, args.date);
  return row ? buildResolvedPriceFromRow(row, billingPeriod) : null;
}

export function getCurrentPromoPrice(
  rows: SubscriptionPricingRow[],
  args: {
    tier: PricingTier;
    date?: Date | string;
  },
): ResolvedPrice | null {
  const tier = normalizePricingTier(args.tier);
  if (!tier || tier === "unverified") return null;

  const row = getLatestMatchingRow(rows, tier, "promo", args.date);
  return row ? buildResolvedPriceFromRow(row, "promo") : null;
}

export function getActivePrice(
  rows: SubscriptionPricingRow[],
  args: {
    tier: PricingTier;
    billingPeriod: PricingBillingPeriodInput;
    date?: Date | string;
  },
): ResolvedPrice {
  const tier = normalizePricingTier(args.tier);
  const requestedBillingPeriod = normalizePricingBillingPeriod(args.billingPeriod);

  if (!tier) {
    throw new Error(`Invalid pricing tier: ${String(args.tier)}`);
  }

  if (!requestedBillingPeriod) {
    throw new Error(`Invalid billing period: ${String(args.billingPeriod)}`);
  }

  if (tier === "unverified") {
    return buildFreeResolvedPrice(requestedBillingPeriod === "promo" ? "yearly" : requestedBillingPeriod);
  }

  const promoRow = getLatestMatchingRow(rows, tier, "promo", args.date);
  if (promoRow) {
    return buildResolvedPriceFromRow(promoRow, requestedBillingPeriod);
  }

  if (requestedBillingPeriod === "promo") {
    throw new Error(`No active promo pricing found for ${tier}.`);
  }

  const standardRow = getLatestMatchingRow(rows, tier, requestedBillingPeriod, args.date);
  if (!standardRow) {
    throw new Error(`No active ${requestedBillingPeriod} pricing found for ${tier}.`);
  }

  return buildResolvedPriceFromRow(standardRow, requestedBillingPeriod);
}

export function buildPricingCatalogSnapshot(
  rows: SubscriptionPricingRow[],
  date: Date | string = new Date(),
): PricingCatalogSnapshot {
  const verifiedMonthly = getLatestStandardPrice(rows, {
    tier: "verified",
    billingPeriod: "monthly",
    date,
  });
  const verifiedYearly = getLatestStandardPrice(rows, {
    tier: "verified",
    billingPeriod: "yearly",
    date,
  });
  const verifiedPromo = getCurrentPromoPrice(rows, { tier: "verified", date });

  const signatureMonthly = getLatestStandardPrice(rows, {
    tier: "signature",
    billingPeriod: "monthly",
    date,
  });
  const signatureYearly = getLatestStandardPrice(rows, {
    tier: "signature",
    billingPeriod: "yearly",
    date,
  });
  const signaturePromo = getCurrentPromoPrice(rows, { tier: "signature", date });

  return {
    generatedAt: new Date(date).toISOString(),
    tiers: {
      unverified: {
        tier: "unverified",
        monthly: buildFreeResolvedPrice("monthly"),
        yearly: buildFreeResolvedPrice("yearly"),
        promo: null,
        currentMonthly: buildFreeResolvedPrice("monthly"),
        currentYearly: buildFreeResolvedPrice("yearly"),
      },
      verified: {
        tier: "verified",
        monthly: verifiedMonthly,
        yearly: verifiedYearly,
        promo: verifiedPromo,
        currentMonthly: verifiedMonthly ? getActivePrice(rows, { tier: "verified", billingPeriod: "monthly", date }) : null,
        currentYearly: verifiedYearly ? getActivePrice(rows, { tier: "verified", billingPeriod: "yearly", date }) : null,
      },
      signature: {
        tier: "signature",
        monthly: signatureMonthly,
        yearly: signatureYearly,
        promo: signaturePromo,
        currentMonthly: signatureMonthly ? getActivePrice(rows, { tier: "signature", billingPeriod: "monthly", date }) : null,
        currentYearly: signatureYearly ? getActivePrice(rows, { tier: "signature", billingPeriod: "yearly", date }) : null,
      },
    },
  };
}
