import { NextResponse } from "next/server";

import {
  buildPricingCatalogSnapshot,
  type SubscriptionPricingRow,
} from "@/lib/pricing/pricing-resolver";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function GET() {
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
          message: "Failed to load pricing.",
        },
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    ...buildPricingCatalogSnapshot((data ?? []) as SubscriptionPricingRow[]),
  });
}
