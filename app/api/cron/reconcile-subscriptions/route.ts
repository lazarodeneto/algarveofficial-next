// Reconciliation cron endpoint. Protected by x-cron-secret header.
// Schedule via Vercel Cron (vercel.json) or an external scheduler.
// Recommended frequency: every 15 minutes (or per-business preference).
//
// Example vercel.json entry:
//   { "path": "/api/cron/reconcile-subscriptions", "schedule": "*/15 * * * *" }
//
// Set CRON_SECRET to a strong random string and add it to Vercel env vars.

import { NextRequest, NextResponse } from "next/server";

import { getStripeServerClient } from "@/lib/stripe/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  expireFixed2026,
  expireStaleIncomplete,
  reconcileRecurring,
} from "@/lib/subscriptions/reconciliation";

export const runtime = "nodejs";

function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) return false;
  const incoming = request.headers.get("x-cron-secret");
  return incoming === cronSecret;
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const stripe = getStripeServerClient();
  const supabase = createServiceRoleClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Server is missing service role configuration." },
      { status: 500 },
    );
  }

  const results = await Promise.allSettled([
    expireFixed2026(supabase),
    expireStaleIncomplete(supabase),
    // reconcileRecurring needs Stripe client
    stripe ? reconcileRecurring(stripe, supabase) : Promise.resolve({
      job: "reconcileRecurring",
      processed: 0,
      changed: 0,
      errors: ["STRIPE_SECRET_KEY not configured"],
    }),
  ]);

  const report = results.map((r) =>
    r.status === "fulfilled" ? r.value : { job: "unknown", error: String(r.reason) },
  );

  const hasErrors = report.some((r) => "errors" in r && (r as { errors: string[] }).errors.length > 0);

  return NextResponse.json(
    { ok: true, results: report },
    { status: hasErrors ? 207 : 200 },
  );
}
