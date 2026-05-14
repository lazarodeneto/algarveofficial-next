import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  createServiceRoleClient: vi.fn(),
  verify: vi.fn(),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

vi.mock("@/lib/email/resend-client", () => ({
  getResendClient: () => ({
    webhooks: {
      verify: mocks.verify,
    },
  }),
}));

import { POST as resendWebhook } from "@/app/api/webhooks/resend/route";

function webhookRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/webhooks/resend", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "svix-id": "evt_123",
      "svix-timestamp": "1",
      "svix-signature": "sig",
      ...headers,
    },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof resendWebhook>[0];
}

function makeClient() {
  const receiptInsert = vi.fn().mockResolvedValue({ data: null, error: null });
  const eventMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const eventLimit = vi.fn(() => ({ maybeSingle: eventMaybeSingle }));
  const eventEq = vi.fn(() => ({ limit: eventLimit }));
  const eventSelect = vi.fn(() => ({ eq: eventEq }));
  const eventInsert = vi.fn().mockResolvedValue({ data: null, error: null });
  const subscriberUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null });
  const subscriberUpdate = vi.fn(() => ({ eq: subscriberUpdateEq }));

  const from = vi.fn((table: string) => {
    if (table === "webhook_event_receipts") return { insert: receiptInsert };
    if (table === "transactional_email_events") return { select: eventSelect, insert: eventInsert, update: vi.fn(() => ({ eq: vi.fn() })) };
    if (table === "email_subscribers") return { update: subscriberUpdate };
    throw new Error(`Unexpected table ${table}`);
  });

  return {
    client: { from },
    spies: { from, receiptInsert, eventInsert, subscriberUpdate },
  };
}

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("Resend webhook route", () => {
  it("rejects invalid signatures", async () => {
    vi.stubEnv("RESEND_WEBHOOK_SECRET", "whsec_test");
    mocks.verify.mockImplementation(() => {
      throw new Error("invalid signature");
    });

    const response = await resendWebhook(webhookRequest({ type: "email.delivered" }));

    expect(response.status).toBe(401);
    expect(mocks.createServiceRoleClient).not.toHaveBeenCalled();
  });

  it("rejects missing signatures before any database work", async () => {
    vi.stubEnv("RESEND_WEBHOOK_SECRET", "whsec_test");
    mocks.verify.mockImplementation(() => {
      throw new Error("missing signature");
    });

    const response = await resendWebhook(webhookRequest(
      { type: "email.delivered" },
      { "svix-signature": "" },
    ));

    expect(response.status).toBe(401);
    expect(mocks.verify).toHaveBeenCalled();
    expect(mocks.createServiceRoleClient).not.toHaveBeenCalled();
  });

  it("fails closed when the webhook secret is missing", async () => {
    vi.stubEnv("RESEND_WEBHOOK_SECRET", "");

    const response = await resendWebhook(webhookRequest({ type: "email.delivered" }));

    expect(response.status).toBe(401);
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(mocks.createServiceRoleClient).not.toHaveBeenCalled();
  });

  it("stores a valid event and updates bounced subscriber state", async () => {
    vi.stubEnv("RESEND_WEBHOOK_SECRET", "whsec_test");
    const event = {
      type: "email.bounced",
      created_at: "2026-05-14T12:00:00.000Z",
      data: {
        email_id: "email_123",
        to: ["reader@example.com"],
        subject: "Newsletter",
        bounce: { message: "Mailbox unavailable" },
      },
    };
    mocks.verify.mockReturnValue(event);
    const client = makeClient();
    mocks.createServiceRoleClient.mockReturnValue(client.client);

    const response = await resendWebhook(webhookRequest(event));

    expect(response.status).toBe(200);
    expect(client.spies.receiptInsert).toHaveBeenCalledWith(expect.objectContaining({
      provider: "resend",
      event_id: "evt_123",
      event_type: "email.bounced",
    }));
    expect(client.spies.eventInsert).toHaveBeenCalledWith(expect.objectContaining({
      provider_email_id: "email_123",
      status: "bounced",
    }));
    expect(client.spies.subscriberUpdate).toHaveBeenCalledWith(expect.objectContaining({
      status: "bounced",
      is_subscribed: false,
    }));
  });

  it("ignores duplicate webhook receipts idempotently", async () => {
    vi.stubEnv("RESEND_WEBHOOK_SECRET", "whsec_test");
    const event = {
      type: "email.delivered",
      created_at: "2026-05-14T12:00:00.000Z",
      data: {
        email_id: "email_duplicate",
        to: ["reader@example.com"],
      },
    };
    mocks.verify.mockReturnValue(event);
    const client = makeClient();
    client.spies.receiptInsert.mockResolvedValueOnce({
      data: null,
      error: { code: "23505", message: "duplicate key" },
    });
    mocks.createServiceRoleClient.mockReturnValue(client.client);

    const response = await resendWebhook(webhookRequest(event));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, duplicate: true });
    expect(client.spies.eventInsert).not.toHaveBeenCalled();
    expect(client.spies.subscriberUpdate).not.toHaveBeenCalled();
  });
});
