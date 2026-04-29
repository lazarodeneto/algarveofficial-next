export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { getStripeServerClient, getStripeWebhookSecret } from "@/lib/stripe/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logSubscriptionMutation } from "@/lib/subscriptions/audit";
import { applyTierToListings, findByOwner } from "@/lib/subscriptions/db";
import { markEvent, recordStripeEvent } from "@/lib/subscriptions/events";
import { WEBHOOK_HANDLERS } from "@/lib/subscriptions/webhook-handlers";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function POST(request: NextRequest) {
  const stripe = getStripeServerClient();
  const webhookSecret = getStripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe-webhook] signature verification failed", error);
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Server is missing service role configuration." },
      { status: 500 },
    );
  }

  const handler = WEBHOOK_HANDLERS[event.type];
  if (!handler) {
    return NextResponse.json({ received: true });
  }

  try {
    const recorded = await recordStripeEvent(supabase, event);
    if (recorded.alreadyProcessed) {
      return NextResponse.json({ received: true });
    }

    const metadataOwnerId =
      typeof event.data.object === "object" && event.data.object !== null
        ? ((event.data.object as { metadata?: { owner_id?: string | null; userId?: string | null } | null })
            .metadata?.owner_id ??
          (event.data.object as { metadata?: { owner_id?: string | null; userId?: string | null } | null })
            .metadata?.userId ??
          null)
        : null;

    const previousOwnerId = metadataOwnerId;
    const previous = previousOwnerId ? await findByOwner(supabase, previousOwnerId) : null;
    const result = await handler(stripe, supabase, event);
    const ownerId = result.ownerId ?? previousOwnerId;
    const next = ownerId ? await findByOwner(supabase, ownerId) : null;

    await logSubscriptionMutation(supabase, {
      ownerId,
      action: event.type,
      previous,
      next,
      stripeEventId: event.id,
    });

    if (ownerId && next && !result.skipped) {
      await applyTierToListings(supabase, ownerId, next);
    }

    await markEvent(supabase, event.id, result.skipped ? "skipped" : "success");
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe-webhook] processing failed", error);
    try {
      await markEvent(supabase, event.id, "error", errorMessage(error));
    } catch (markError) {
      console.error("[stripe-webhook] failed to mark event error", markError);
    }
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
