// Reconciliation jobs — idempotent, safe to run concurrently or repeatedly.
// Called by app/api/cron/reconcile-subscriptions/route.ts.
//
// Three jobs:
//   A. expireFixed2026   — flip active fixed_2026 rows past end_date to expired
//   B. reconcileRecurring — sync DB state with Stripe for active recurring rows
//   C. expireStaleIncomplete — mark old pending/incomplete rows as incomplete_expired

import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

import type { Database } from "@/integrations/supabase/types";
import { applyTierToListings } from "./db";
import { logSubscriptionMutation } from "./audit";
import type { SubscriptionRow } from "./types";
import { mapStripeSubscriptionStatus } from "./types";

type Supabase = SupabaseClient<Database>;

function rowAs(row: unknown): SubscriptionRow {
  return row as SubscriptionRow;
}

function unixToIso(value: number | null | undefined): string | null {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function unixToDateOnly(value: number | null | undefined): string | null {
  if (!value) return null;
  return new Date(value * 1000).toISOString().slice(0, 10);
}

interface ItemPeriod {
  start: number | null;
  end: number | null;
  priceId: string | null;
}

function firstItemPeriod(sub: Stripe.Subscription): ItemPeriod {
  const item = sub.items?.data?.[0] as
    | (Stripe.SubscriptionItem & { current_period_start?: number; current_period_end?: number })
    | undefined;
  return {
    start: item?.current_period_start ?? null,
    end: item?.current_period_end ?? null,
    priceId: item?.price?.id ?? null,
  };
}

export interface ReconcileResult {
  job: string;
  processed: number;
  changed: number;
  errors: string[];
}

// A. Expire fixed_2026 plans that have passed their end_date.
export async function expireFixed2026(supabase: Supabase): Promise<ReconcileResult> {
  const today = new Date().toISOString().slice(0, 10);
  const result: ReconcileResult = { job: "expireFixed2026", processed: 0, changed: 0, errors: [] };

  const { data: rows, error } = await supabase
    .from("owner_subscriptions")
    .select("*")
    .eq("plan_type" as never, "fixed_2026" as never)
    .eq("status" as never, "active" as never)
    .lt("end_date" as never, today as never);

  if (error) {
    result.errors.push(`fetch error: ${error.message}`);
    return result;
  }

  for (const rawRow of rows ?? []) {
    const row = rowAs(rawRow);
    result.processed++;
    try {
      const nowIso = new Date().toISOString();
      await supabase
        .from("owner_subscriptions")
        .update({ status: "expired", last_event_at: nowIso, updated_at: nowIso } as never)
        .eq("id", row.id);

      const next = { ...row, status: "expired" } as SubscriptionRow;
      await applyTierToListings(supabase, row.owner_id, next);
      await logSubscriptionMutation(supabase, {
        ownerId: row.owner_id,
        action: "reconcile.fixed2026.expired",
        previous: row,
        next,
      });
      result.changed++;
    } catch (e) {
      result.errors.push(`owner ${row.owner_id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return result;
}

// B. Reconcile recurring subscriptions against Stripe — detects webhook drift.
export async function reconcileRecurring(
  stripe: Stripe,
  supabase: Supabase,
): Promise<ReconcileResult> {
  const result: ReconcileResult = { job: "reconcileRecurring", processed: 0, changed: 0, errors: [] };

  const { data: rows, error } = await supabase
    .from("owner_subscriptions")
    .select("*")
    .neq("plan_type" as never, "fixed_2026" as never)
    .not("stripe_subscription_id" as never, "is" as never, null as never)
    .in("status" as never, ["active", "trialing", "past_due"] as never);

  if (error) {
    result.errors.push(`fetch error: ${error.message}`);
    return result;
  }

  for (const rawRow of rows ?? []) {
    const row = rowAs(rawRow);
    if (!row.stripe_subscription_id) continue;
    result.processed++;

    try {
      const stripeSub = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
      const period = firstItemPeriod(stripeSub);
      const stripeStatus = mapStripeSubscriptionStatus(stripeSub.status);

      const needsUpdate =
        stripeStatus !== row.status ||
        (period.end && unixToIso(period.end) !== row.current_period_end) || ((stripeSub.cancel_at_period_end ?? false) !== row.cancel_at_period_end);

      if (!needsUpdate) continue;

      const nowIso = new Date().toISOString();
      const patch = {
        status: stripeStatus,
        current_period_start: unixToIso(period.start),
        current_period_end: unixToIso(period.end),
        end_date: unixToDateOnly(period.end),
        cancel_at_period_end: stripeSub.cancel_at_period_end ?? false,
        last_event_at: nowIso,
        updated_at: nowIso,
      };

      await supabase
        .from("owner_subscriptions")
        .update(patch as never)
        .eq("id", row.id);

      const next = { ...row, ...patch } as SubscriptionRow;
      await applyTierToListings(supabase, row.owner_id, next);
      await logSubscriptionMutation(supabase, {
        ownerId: row.owner_id,
        action: "reconcile.recurring.drift",
        previous: row,
        next,
      });
      result.changed++;
    } catch (e) {
      result.errors.push(`owner ${row.owner_id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return result;
}

// C. Clean up stale pending/incomplete rows older than 24h.
export async function expireStaleIncomplete(supabase: Supabase): Promise<ReconcileResult> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const result: ReconcileResult = { job: "expireStaleIncomplete", processed: 0, changed: 0, errors: [] };

  const { data: rows, error } = await supabase
    .from("owner_subscriptions")
    .select("*")
    .in("status" as never, ["pending", "incomplete"] as never)
    .lt("created_at", cutoff);

  if (error) {
    result.errors.push(`fetch error: ${error.message}`);
    return result;
  }

  for (const rawRow of rows ?? []) {
    const row = rowAs(rawRow);
    result.processed++;
    try {
      const nowIso = new Date().toISOString();
      await supabase
        .from("owner_subscriptions")
        .update({ status: "incomplete_expired", last_event_at: nowIso, updated_at: nowIso } as never)
        .eq("id", row.id);

      const next = { ...row, status: "incomplete_expired" } as SubscriptionRow;
      await logSubscriptionMutation(supabase, {
        ownerId: row.owner_id,
        action: "reconcile.stale.incomplete_expired",
        previous: row,
        next,
      });
      result.changed++;
    } catch (e) {
      result.errors.push(`owner ${row.owner_id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return result;
}
