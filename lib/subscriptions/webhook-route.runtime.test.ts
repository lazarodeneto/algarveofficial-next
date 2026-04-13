import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  createServiceRoleClient: vi.fn(),
  getStripeServerClient: vi.fn(),
  getStripeWebhookSecret: vi.fn(),
  applyTierToListings: vi.fn(),
  findByOwner: vi.fn(),
  logSubscriptionMutation: vi.fn(),
  markEvent: vi.fn(),
  recordStripeEvent: vi.fn(),
  handler: vi.fn(),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

vi.mock("@/lib/stripe/server", () => ({
  getStripeServerClient: mocks.getStripeServerClient,
  getStripeWebhookSecret: mocks.getStripeWebhookSecret,
}));

vi.mock("@/lib/subscriptions/db", () => ({
  applyTierToListings: mocks.applyTierToListings,
  findByOwner: mocks.findByOwner,
}));

vi.mock("@/lib/subscriptions/audit", () => ({
  logSubscriptionMutation: mocks.logSubscriptionMutation,
}));

vi.mock("@/lib/subscriptions/events", () => ({
  markEvent: mocks.markEvent,
  recordStripeEvent: mocks.recordStripeEvent,
}));

vi.mock("@/lib/subscriptions/webhook-handlers", () => ({
  WEBHOOK_HANDLERS: {
    "invoice.paid": mocks.handler,
  },
}));

import { POST as postWebhookRoute } from "@/app/api/stripe/webhook/route";

function webhookRequest(body = "{}") {
  return new NextRequest("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers: {
      "stripe-signature": "test-signature",
    },
    body,
  }) as unknown as Parameters<typeof postWebhookRoute>[0];
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("stripe webhook route runtime", () => {
  it("applies listing tiers using the true before/after subscription state", async () => {
    const event = {
      id: "evt_test_1",
      type: "invoice.paid",
      created: 1710000000,
      data: {
        object: {
          metadata: {
            owner_id: "owner-1",
          },
        },
      },
    };

    const previous = { owner_id: "owner-1", tier: "verified", status: "active" };
    const next = { owner_id: "owner-1", tier: "signature", status: "active" };

    mocks.getStripeServerClient.mockReturnValue({
      webhooks: {
        constructEvent: vi.fn().mockReturnValue(event),
      },
    });
    mocks.getStripeWebhookSecret.mockReturnValue("whsec_test");
    mocks.createServiceRoleClient.mockReturnValue({} as never);
    mocks.recordStripeEvent.mockResolvedValue({
      alreadyProcessed: false,
      previousResult: null,
    });
    mocks.handler.mockResolvedValue({ ownerId: "owner-1" });
    mocks.findByOwner.mockResolvedValueOnce(previous as never).mockResolvedValueOnce(next as never);

    const response = await postWebhookRoute(webhookRequest());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ received: true });
    expect(mocks.applyTierToListings).toHaveBeenCalledWith(expect.anything(), "owner-1", next);
    expect(mocks.logSubscriptionMutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ownerId: "owner-1",
        action: "invoice.paid",
        previous,
        next,
        stripeEventId: "evt_test_1",
      }),
    );
    expect(mocks.markEvent).toHaveBeenCalledWith(expect.anything(), "evt_test_1", "success");
  });
});
