export const runtime = "nodejs";
// Stripe webhook entry point. Idempotent dispatch with audit logging and
// automatic tier application. Sequence:
//   1. Verify signature
//   2. recordStripeEvent (PK insert) → short-circuit on previously processed
//   3. Look up previous owner_subscriptions row
//   4. Dispatch to per-event handler
//   5. Look up next row and apply tier to listings
//   6. Audit log + markEvent('success')
// On failure, markEvent('error') and return 500 so Stripe retries.

import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { createServiceRoleClient } from "@/lib/supabase/service";
import { getStripeServerClient, getStripeWebhookSecret } from "@/lib/stripe/server";
import { logSubscriptionMutation } from "@/lib/subscriptions/audit";
import { applyTierToListings, findByOwner } from "@/lib/subscriptions/db";
import { markEvent, recordStripeEvent } from "@/lib/subscriptions/events";
import { WEBHOOK_HANDLERS } from "@/lib/subscriptions/webhook-handlers";


export async function POST(request: NextRequest) {
  const stripe = getStripeServerClient();
  const webhookSecret = getStripeWebhookSecret();
  const supabase = createServiceRoleClient();

  if (!stripe || !webhookSecret || !supabase) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Idempotency claim. Returns alreadyProcessed=true if a previous attempt
  // already finished with success/skipped. error/pending is treated as a retry.
  let recorded;
  try {
    recorded = await recordStripeEvent(supabase, event);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to record event.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (recorded.alreadyProcessed) {
    return NextResponse.json({ received: true, deduped: true });
  }

  const handler = WEBHOOK_HANDLERS[event.type];
  if (!handler) {
    // Unknown event types are still recorded (so the row exists for inspection)
    // but marked skipped so we don't retry indefinitely.
    await markEvent(supabase, event.id, "skipped", `Unhandled event type: ${event.type}`);
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    const previousByOwner = new Map<string, Awaited<ReturnType<typeof findByOwner>>>();
    const getPrevious = async (ownerId: string) => {
      if (previousByOwner.has(ownerId)) {
        return previousByOwner.get(ownerId) ?? null;
      }
      const previous = await findByOwner(supabase, ownerId);
      previousByOwner.set(ownerId, previous);
      return previous;
    };

    // Capture the current row before the handler mutates it so audit logging
    // and tier application can compare the true before/after state.
    const previousOwnerId = (() => {
      const object = event.data.object as {
        metadata?: { userId?: string | null; owner_id?: string | null } | null;
      };
      return object?.metadata?.owner_id ?? object?.metadata?.userId ?? null;
    })();
    if (previousOwnerId) {
      await getPrevious(previousOwnerId);
    }

    const result = await handler(stripe, supabase, event);
    const ownerId = result.ownerId;

    if (ownerId) {
      // Re-read the row after the handler wrote, then apply tier and audit.
      const previous = await getPrevious(ownerId);
      const next = await findByOwner(supabase, ownerId);

      if (next && !result.skipped) {
        await applyTierToListings(supabase, ownerId, next);
      }

      await logSubscriptionMutation(supabase, {
        ownerId,
        action: event.type,
        previous,
        next,
        stripeEventId: event.id,
      });
    }

    await markEvent(supabase, event.id, result.skipped ? "skipped" : "success");
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    try {
      await markEvent(supabase, event.id, "error", message);
    } catch {
      // swallow secondary failure; primary error is what matters
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
