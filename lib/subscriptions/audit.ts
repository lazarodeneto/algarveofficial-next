// Subscription mutation audit log.
//
// Logs prev/next state for every lifecycle change. Sanitized — no client_secret,
// no card data, no full Stripe payloads. Use only structured fields from the
// SubscriptionRow shape.

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

import type { SubscriptionRow } from "./types";

type Supabase = SupabaseClient<Database>;

const SAFE_FIELDS: ReadonlyArray<keyof SubscriptionRow> = [
  "id",
  "tier",
  "plan_type",
  "billing_period",
  "status",
  "stripe_customer_id",
  "stripe_subscription_id",
  "stripe_price_id",
  "current_period_start",
  "current_period_end",
  "cancel_at_period_end",
  "canceled_at",
  "trial_end",
  "start_date",
  "end_date",
  "price_cents",
  "currency",
];

function sanitize(sub: SubscriptionRow | null | undefined): Record<string, unknown> | null {
  if (!sub) return null;
  const out: Record<string, unknown> = {};
  for (const key of SAFE_FIELDS) {
    out[key] = sub[key] ?? null;
  }
  return out;
}

export interface AuditEntry {
  ownerId: string | null;
  action: string;
  previous: SubscriptionRow | null;
  next: SubscriptionRow | null;
  stripeEventId?: string | null;
}

export async function logSubscriptionMutation(
  supabase: Supabase,
  entry: AuditEntry,
): Promise<void> {
  const { error } = await supabase.from("subscription_audit_log" as never).insert({
    owner_id: entry.ownerId,
    action: entry.action,
    previous_state: sanitize(entry.previous),
    new_state: sanitize(entry.next),
    stripe_event_id: entry.stripeEventId ?? null,
  } as never);

  if (error) {
    // Audit failures must not break the lifecycle. Log and continue.
    // eslint-disable-next-line no-console
    console.error("[subscription audit] failed to log mutation", error);
  }
}
