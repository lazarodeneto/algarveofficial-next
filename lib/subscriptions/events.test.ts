import { describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

import { recordStripeEvent } from "@/lib/subscriptions/events";

function makeEvent(overrides: Partial<Stripe.Event> = {}): Stripe.Event {
  return {
    id: "evt_test",
    object: "event",
    api_version: "2026-03-25.dahlia",
    created: 1710000000,
    data: { object: {} },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type: "invoice.paid",
    ...overrides,
  } as Stripe.Event;
}

function makeSupabaseMock(options: {
  insertError?: unknown;
  selectData?: { result?: string } | null;
  selectError?: unknown;
} = {}) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: options.selectData ?? null,
    error: options.selectError ?? null,
  });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const insert = vi.fn().mockResolvedValue({ error: options.insertError ?? null });
  const from = vi.fn(() => ({ insert, select }));

  return {
    supabase: { from } as never,
    spies: { from, insert, select, eq, maybeSingle },
  };
}

describe("stripe webhook event recording", () => {
  it("claims a new event by inserting a pending idempotency row", async () => {
    const { supabase, spies } = makeSupabaseMock();

    const result = await recordStripeEvent(supabase, makeEvent());

    expect(result).toEqual({ alreadyProcessed: false, previousResult: null });
    expect(spies.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_id: "evt_test",
        type: "invoice.paid",
        result: "pending",
      }),
    );
    expect(spies.select).not.toHaveBeenCalled();
  });

  it("short-circuits a duplicate event only after confirming the unique event row", async () => {
    const { supabase } = makeSupabaseMock({
      insertError: { code: "23505", message: "duplicate key value violates unique constraint" },
      selectData: { result: "success" },
    });

    const result = await recordStripeEvent(supabase, makeEvent({ id: "evt_duplicate" }));

    expect(result).toEqual({ alreadyProcessed: true, previousResult: "success" });
  });

  it("fails closed when the idempotency insert fails for a non-unique database error", async () => {
    const { supabase, spies } = makeSupabaseMock({
      insertError: { code: "42501", message: "permission denied for table stripe_webhook_events" },
    });

    await expect(recordStripeEvent(supabase, makeEvent())).rejects.toMatchObject({
      code: "42501",
    });
    expect(spies.select).not.toHaveBeenCalled();
  });
});
