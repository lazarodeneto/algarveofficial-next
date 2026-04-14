// Stripe webhook event idempotency.
//
// On every webhook delivery we attempt to insert into stripe_webhook_events
// keyed on event.id. If the row already exists with result='success' or
// 'skipped', we short-circuit. If it exists with result='pending' (meaning a
// previous attempt crashed before completion), we re-process. After dispatch
// completes, the handler updates the row with the final result via markEvent.

import { createHash } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

import type { Database } from "@/integrations/supabase/types";

type Supabase = SupabaseClient<Database>;

export type EventResult = "pending" | "success" | "error" | "skipped";

export interface RecordedEvent {
  alreadyProcessed: boolean;
  previousResult: EventResult | null;
}

function hashPayload(event: Stripe.Event): string {
  const json = JSON.stringify(event);
  return createHash("sha256").update(json).digest("hex");
}

export async function recordStripeEvent(
  supabase: Supabase,
  event: Stripe.Event,
): Promise<RecordedEvent> {
  const payloadHash = hashPayload(event);

  // Try to claim the event by inserting. If a row already exists, fall back
  // to a select to inspect its result.
  const { error: insertError } = await supabase
    .from("stripe_webhook_events" as never)
    .insert({
      event_id: event.id,
      type: event.type,
      payload_hash: payloadHash,
      result: "pending",
    } as never);

  if (!insertError) {
    return { alreadyProcessed: false, previousResult: null };
  }

  // Unique violation: row exists. Read it.
  const { data, error: selectError } = await supabase
    .from("stripe_webhook_events" as never)
    .select("result")
    .eq("event_id" as never, event.id as never)
    .maybeSingle();

  if (selectError) throw selectError;

  const previousResult = ((data as { result?: EventResult } | null)?.result ?? null) as EventResult | null;

  // success/skipped → done. error/pending → re-process (retry).
  const alreadyProcessed = previousResult === "success" || previousResult === "skipped";
  return { alreadyProcessed, previousResult };
}

export async function markEvent(
  supabase: Supabase,
  eventId: string,
  result: EventResult,
  error?: string | null,
): Promise<void> {
  const { error: updateError } = await supabase
    .from("stripe_webhook_events" as never)
    .update({
      result,
      processed_at: new Date().toISOString(),
      error: error ?? null,
    } as never)
    .eq("event_id" as never, eventId as never);

  if (updateError) throw updateError;
}
