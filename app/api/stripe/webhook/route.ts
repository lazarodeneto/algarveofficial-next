import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  
  try {
    const body = await request.json();
    const eventId = body.id as string;
    const eventType = body.type as string;

    // Only process checkout completed events
    if (eventType !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    // IDEMPOTENCY: Check if already processed
    const { data: existingEvent } = await supabase
      .from("stripe_events_processed")
      .select("id")
      .eq("id", eventId)
      .single();

    if (existingEvent) {
      console.log(`[stripe-webhook] Event ${eventId} already processed, skipping`);
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    const data = body.data?.object ?? {};
    const { listingId, contextType, contextValue, position, pricePaid } = data.metadata ?? {};

    if (!listingId || !contextType || !contextValue || !position) {
      console.error("[stripe-webhook] Missing metadata");
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    // Call atomic confirmation with validation
    const { data: confirmResult, error: confirmError } = await supabase.rpc(
      "confirm_slot_with_validation",
      {
        p_listing_id: listingId,
        p_context_type: contextType,
        p_context_value: contextValue,
        p_position: parseInt(position, 10),
        p_received_price: pricePaid ? parseInt(pricePaid, 10) : 0,
        p_stripe_event_id: eventId,
      }
    );

    if (confirmError || !confirmResult) {
      console.error("[stripe-webhook] Slot confirmation failed:", confirmError);
      return NextResponse.json({ 
        error: "Slot validation failed" 
      }, { status: 409 });
    }

    // Mark subscription as active
    await supabase
      .from("listing_subscriptions")
      .upsert({
        listing_id: listingId,
        status: "active",
        stripe_subscription_id: data.subscription,
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      });

    // Record processed event for idempotency
    await supabase
      .from("stripe_events_processed")
      .insert({
        id: eventId,
        event_type: eventType,
      });

    console.log(`[stripe-webhook] Successfully processed event ${eventId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[stripe-webhook] Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}