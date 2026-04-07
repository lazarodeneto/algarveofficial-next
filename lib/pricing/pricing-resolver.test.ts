import { describe, expect, it } from "vitest";

import type { Database } from "@/integrations/supabase/types";
import {
  buildPricingCatalogSnapshot,
  getActivePrice,
  getCurrentPromoPrice,
  getLatestStandardPrice,
  isPricingRowActiveOnDate,
  normalizePricingBillingPeriod,
} from "@/lib/pricing/pricing-resolver";

type PricingRow = Database["public"]["Tables"]["subscription_pricing"]["Row"];

function makeRow(overrides: Partial<PricingRow>): PricingRow {
  return {
    id: overrides.id ?? "row-id",
    tier: overrides.tier ?? "verified",
    billing_period: overrides.billing_period ?? "monthly",
    price: overrides.price ?? 1900,
    price_cents: overrides.price_cents ?? overrides.price ?? 1900,
    currency: overrides.currency ?? "EUR",
    display_price: overrides.display_price ?? "€19",
    note: overrides.note ?? "per month",
    monthly_equivalent: overrides.monthly_equivalent ?? null,
    savings: overrides.savings ?? 0,
    period_length: overrides.period_length ?? null,
    period_unit: overrides.period_unit ?? null,
    period_start_date: overrides.period_start_date ?? null,
    period_end_date: overrides.period_end_date ?? null,
    valid_from: overrides.valid_from ?? null,
    valid_to: overrides.valid_to ?? null,
    is_active: overrides.is_active ?? true,
    created_at: overrides.created_at ?? "2026-04-01T00:00:00.000Z",
    updated_at: overrides.updated_at ?? "2026-04-01T00:00:00.000Z",
  };
}

describe("pricing resolver", () => {
  it("normalizes legacy billing aliases", () => {
    expect(normalizePricingBillingPeriod("annual")).toBe("yearly");
    expect(normalizePricingBillingPeriod("period")).toBe("promo");
    expect(normalizePricingBillingPeriod("monthly")).toBe("monthly");
  });

  it("recognizes active promos by date and status", () => {
    const promo = makeRow({
      billing_period: "promo",
      valid_from: "2026-05-01",
      valid_to: "2026-12-31",
    });

    expect(isPricingRowActiveOnDate(promo, "2026-06-15")).toBe(true);
    expect(isPricingRowActiveOnDate(promo, "2026-04-15")).toBe(false);
    expect(isPricingRowActiveOnDate({ ...promo, is_active: false }, "2026-06-15")).toBe(false);
  });

  it("returns the latest active standard row for monthly/yearly", () => {
    const rows = [
      makeRow({
        id: "old-yearly",
        billing_period: "yearly",
        display_price: "€190",
        price: 19000,
        price_cents: 19000,
        updated_at: "2026-04-01T00:00:00.000Z",
      }),
      makeRow({
        id: "new-yearly",
        billing_period: "yearly",
        display_price: "€180",
        price: 18000,
        price_cents: 18000,
        updated_at: "2026-04-05T00:00:00.000Z",
      }),
    ];

    const result = getLatestStandardPrice(rows, {
      tier: "verified",
      billingPeriod: "yearly",
      date: "2026-04-10",
    });

    expect(result?.id).toBe("new-yearly");
    expect(result?.priceCents).toBe(18000);
  });

  it("returns promo as the active price when promo is live", () => {
    const rows = [
      makeRow({
        id: "monthly",
        billing_period: "monthly",
        price: 1900,
        price_cents: 1900,
        display_price: "€19",
      }),
      makeRow({
        id: "promo",
        billing_period: "promo",
        price: 12000,
        price_cents: 12000,
        display_price: "€120",
        valid_from: "2026-05-01",
        valid_to: "2026-12-31",
      }),
    ];

    const result = getActivePrice(rows, {
      tier: "verified",
      billingPeriod: "monthly",
      date: "2026-06-10",
    });

    expect(result.id).toBe("promo");
    expect(result.billingPeriod).toBe("promo");
    expect(result.requestedBillingPeriod).toBe("monthly");
  });

  it("falls back to the standard row when no promo is active", () => {
    const rows = [
      makeRow({
        id: "monthly",
        billing_period: "monthly",
        price: 1900,
        price_cents: 1900,
      }),
      makeRow({
        id: "promo",
        billing_period: "promo",
        price: 12000,
        price_cents: 12000,
        valid_from: "2026-05-01",
        valid_to: "2026-12-31",
      }),
    ];

    const result = getActivePrice(rows, {
      tier: "verified",
      billingPeriod: "monthly",
      date: "2026-04-10",
    });

    expect(result.id).toBe("monthly");
    expect(result.billingPeriod).toBe("monthly");
  });

  it("builds a tier snapshot with standard and promo rows separated", () => {
    const rows = [
      makeRow({
        id: "verified-monthly",
        tier: "verified",
        billing_period: "monthly",
        price: 1900,
        price_cents: 1900,
      }),
      makeRow({
        id: "verified-yearly",
        tier: "verified",
        billing_period: "yearly",
        price: 19000,
        price_cents: 19000,
        display_price: "€190",
      }),
      makeRow({
        id: "verified-promo",
        tier: "verified",
        billing_period: "promo",
        price: 12000,
        price_cents: 12000,
        display_price: "€120",
        valid_from: "2026-05-01",
        valid_to: "2026-12-31",
      }),
      makeRow({
        id: "signature-monthly",
        tier: "signature",
        billing_period: "monthly",
        price: 19000,
        price_cents: 19000,
        display_price: "€190",
      }),
      makeRow({
        id: "signature-yearly",
        tier: "signature",
        billing_period: "yearly",
        price: 190000,
        price_cents: 190000,
        display_price: "€1,900",
      }),
    ];

    const snapshot = buildPricingCatalogSnapshot(rows, "2026-06-10");

    expect(snapshot.tiers.verified.monthly?.id).toBe("verified-monthly");
    expect(snapshot.tiers.verified.yearly?.id).toBe("verified-yearly");
    expect(snapshot.tiers.verified.promo?.id).toBe("verified-promo");
    expect(snapshot.tiers.verified.currentYearly?.id).toBe("verified-promo");
    expect(snapshot.tiers.unverified.monthly?.priceCents).toBe(0);
  });

  it("returns the current promo row when requested directly", () => {
    const rows = [
      makeRow({
        id: "verified-promo",
        tier: "verified",
        billing_period: "promo",
        price: 12000,
        price_cents: 12000,
        valid_from: "2026-05-01",
        valid_to: "2026-12-31",
      }),
    ];

    const result = getCurrentPromoPrice(rows, { tier: "verified", date: "2026-06-10" });

    expect(result?.id).toBe("verified-promo");
    expect(result?.billingPeriod).toBe("promo");
  });
});
