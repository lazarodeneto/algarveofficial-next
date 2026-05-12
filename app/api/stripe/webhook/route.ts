export const runtime = "nodejs";

/* eslint-disable no-console */

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

function getObjectMetadata(
  event: { data?: { object?: unknown } },
): { owner_id?: string | null; userId?: string | null; listing_id?: string | null } | null {
  if (typeof event.data?.object !== "object" || event.data.object === null) return null;
  const metadata = (event.data.object as {
    metadata?: {
      owner_id?: string | null;
      userId?: string | null;
      listing_id?: string | null;
    } | null;
  }).metadata;
  return metadata ?? null;
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

    const metadata = getObjectMetadata(event);
    const metadataOwnerId = metadata?.owner_id ?? metadata?.userId ?? null;
    const metadataListingId = metadata?.listing_id?.trim() || null;

    const previousOwnerId = metadataOwnerId;
    const previous = previousOwnerId ? await findByOwner(supabase, previousOwnerId) : null;
    const result = await handler(stripe, supabase, event);
    const ownerId = result.ownerId ?? previousOwnerId;
    const listingId = result.listingId ?? metadataListingId;
    const next = ownerId ? await findByOwner(supabase, ownerId) : null;

    await logSubscriptionMutation(supabase, {
      ownerId,
      action: event.type,
      previous,
      next,
      stripeEventId: event.id,
    });

    if (ownerId && next && !result.skipped) {
      if (listingId) {
        await applyTierToListings(supabase, ownerId, next, listingId);
      } else {
        await applyTierToListings(supabase, ownerId, next);
      }
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
