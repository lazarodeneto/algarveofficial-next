import { NextRequest, NextResponse } from "next/server";

import {
  buildPricingCatalogSnapshot,
  getActivePrice,
  normalizePricingBillingPeriod,
  normalizePricingTier,
  type SubscriptionPricingRow,
} from "@/lib/pricing/pricing-resolver";
import { createServiceRoleClient } from "@/lib/supabase/service";

function normalizeRequestDate(value: string | null) {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
}

export async function GET(request: NextRequest) {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "SERVER_MISCONFIGURED",
          message: "Pricing service is unavailable.",
        },
      },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from("subscription_pricing")
    .select("*")
    .in("tier", ["verified", "signature"])
    .order("created_at", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "PRICING_READ_FAILED",
          message: "Failed to load current pricing.",
        },
      },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as SubscriptionPricingRow[];
  const searchParams = request.nextUrl.searchParams;
  const tier = normalizePricingTier(searchParams.get("tier"));
  const billingPeriod = normalizePricingBillingPeriod(searchParams.get("billingPeriod"));
  const date = normalizeRequestDate(searchParams.get("date"));

  if (tier && billingPeriod) {
    try {
      return NextResponse.json({
        ok: true,
        generatedAt: new Date(date).toISOString(),
        price: getActivePrice(rows, { tier, billingPeriod, date }),
      });
    } catch (resolverError) {
      const message =
        resolverError instanceof Error
          ? resolverError.message
          : "No current pricing is available for the requested tier.";

      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "PRICING_NOT_FOUND",
            message,
          },
        },
        { status: 404 },
      );
    }
  }

  const snapshot = buildPricingCatalogSnapshot(rows, date);
  return NextResponse.json({
    ok: true,
    generatedAt: snapshot.generatedAt,
    tiers: {
      unverified: {
        monthly: snapshot.tiers.unverified.currentMonthly,
        yearly: snapshot.tiers.unverified.currentYearly,
        promo: null,
      },
      verified: {
        monthly: snapshot.tiers.verified.currentMonthly,
        yearly: snapshot.tiers.verified.currentYearly,
        promo: snapshot.tiers.verified.promo,
      },
      signature: {
        monthly: snapshot.tiers.signature.currentMonthly,
        yearly: snapshot.tiers.signature.currentYearly,
        promo: snapshot.tiers.signature.promo,
      },
    },
  });
}
