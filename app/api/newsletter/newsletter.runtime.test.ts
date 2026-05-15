import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { hashNewsletterToken } from "@/lib/newsletter/newsletter-tokens";

const mocks = vi.hoisted(() => ({
  createServiceRoleClient: vi.fn(),
  sendEmail: vi.fn(),
  syncNewsletterSubscriberToResend: vi.fn(),
  markNewsletterContactUnsubscribed: vi.fn(),
  updateNewsletterTopicSubscription: vi.fn(),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

vi.mock("@/lib/email/send-email", () => ({
  sendEmail: mocks.sendEmail,
}));

vi.mock("@/lib/email/resend-contacts", () => ({
  syncNewsletterSubscriberToResend: mocks.syncNewsletterSubscriberToResend,
  markNewsletterContactUnsubscribed: mocks.markNewsletterContactUnsubscribed,
  updateNewsletterTopicSubscription: mocks.updateNewsletterTopicSubscription,
}));

import { POST as subscribeNewsletter } from "@/app/api/newsletter/subscribe/route";
import { GET as confirmNewsletter } from "@/app/api/newsletter/confirm/route";
import {
  GET as getNewsletterPreferences,
  POST as updateNewsletterPreferences,
} from "@/app/api/newsletter/preferences/route";
import { GET as unsubscribeNewsletter } from "@/app/api/newsletter/unsubscribe/route";

function jsonRequest(body: unknown) {
  return new NextRequest("http://localhost/api/newsletter/subscribe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof subscribeNewsletter>[0];
}

function getRequest(path: string) {
  return new NextRequest(`http://localhost${path}`) as unknown as Parameters<typeof confirmNewsletter>[0];
}

function makeClient(options: {
  lookupSubscriber?: unknown;
  confirmSubscriber?: unknown;
  unsubscribeSubscriber?: unknown;
} = {}) {
  const rateMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const rateEq2 = vi.fn(() => ({ maybeSingle: rateMaybeSingle }));
  const rateEq1 = vi.fn(() => ({ eq: rateEq2 }));
  const rateSelect = vi.fn(() => ({ eq: rateEq1 }));
  const rateUpsert = vi.fn().mockResolvedValue({ data: null, error: null });

  const subscriberLookupMaybeSingle = vi.fn().mockResolvedValue({
    data: options.lookupSubscriber ?? null,
    error: null,
  });
  const subscriberEq = vi.fn(() => ({ maybeSingle: subscriberLookupMaybeSingle }));
  const subscriberSelect = vi.fn(() => ({ eq: subscriberEq }));

  const subscriberSingle = vi.fn().mockResolvedValue({
    data: {
      id: "subscriber-1",
      email: "reader@example.com",
      full_name: null,
      status: "pending",
      is_subscribed: false,
      confirmation_token_hash: "hash",
      unsubscribe_token_hash: "unsub-hash",
      last_confirmation_sent_at: "2026-05-14T12:00:00.000Z",
      created_at: "2026-05-14T12:00:00.000Z",
    },
    error: null,
  });
  const subscriberSelectAfterWrite = vi.fn(() => ({ single: subscriberSingle }));
  const subscriberInsert = vi.fn(() => ({ select: subscriberSelectAfterWrite }));
  const subscriberUpdate = vi.fn(() => ({
    eq: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({
          data: options.confirmSubscriber ?? {
            id: "subscriber-1",
            email: "reader@example.com",
            full_name: null,
            status: "subscribed",
            confirmation_token_hash: null,
            unsubscribe_token_hash: "unsub-hash",
            last_confirmation_sent_at: "2026-05-14T12:00:00.000Z",
            locale: "en",
            source: "newsletter",
            confirmed_at: "2026-05-14T12:05:00.000Z",
            welcome_sent_at: null,
          },
          error: null,
        }),
      })),
    })),
  }));

  const from = vi.fn((table: string) => {
    if (table === "communication_rate_limits") {
      return { select: rateSelect, upsert: rateUpsert };
    }
    if (table === "email_subscribers") {
      return {
        select: (columns?: string) => {
          if (columns === "id, email") {
            return {
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: options.unsubscribeSubscriber ?? { id: "subscriber-1", email: "reader@example.com" },
                  error: null,
                }),
              })),
            };
          }
          if (columns?.includes("confirmation_token_hash")) {
            return {
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: options.confirmSubscriber ?? null,
                  error: null,
                }),
              })),
            };
          }
          return subscriberSelect(columns);
        },
        insert: subscriberInsert,
        update: subscriberUpdate,
      };
    }
    throw new Error(`Unexpected table ${table}`);
  });

  return {
    client: { from },
    spies: { from, subscriberInsert, subscriberUpdate, rateUpsert },
  };
}

beforeEach(() => {
  mocks.sendEmail.mockResolvedValue({
    success: true,
    provider: "resend",
    providerEmailId: "email-1",
    error: null,
    skipped: false,
    reason: null,
  });
  mocks.syncNewsletterSubscriberToResend.mockResolvedValue({
    success: true,
    skipped: false,
    providerContactId: "contact-1",
    status: "synced",
    reason: null,
  });
  mocks.markNewsletterContactUnsubscribed.mockResolvedValue({
    success: true,
    skipped: false,
    providerContactId: "contact-1",
    status: "synced",
    reason: null,
  });
  mocks.updateNewsletterTopicSubscription.mockResolvedValue({
    success: true,
    skipped: false,
    providerContactId: "contact-1",
    status: "synced",
    reason: null,
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("newsletter API routes", () => {
  it("validates newsletter email input", async () => {
    const response = await subscribeNewsletter(jsonRequest({ email: "bad" }));
    expect(response.status).toBe(400);
    expect(mocks.createServiceRoleClient).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("creates a pending subscriber and sends a generic confirmation response", async () => {
    vi.stubEnv("NEWSLETTER_TOKEN_SECRET", "test-newsletter-secret");
    const client = makeClient();
    mocks.createServiceRoleClient.mockReturnValue(client.client);

    const response = await subscribeNewsletter(jsonRequest({
      email: "Reader@Example.com",
      source: "footer",
      submittedAt: Date.now() - 2000,
    }));
    const payload = await response.json();

    expect(response.status).toBe(202);
    expect(payload.message).toContain("If this email can be subscribed");
    expect(client.spies.subscriberInsert).toHaveBeenCalledWith(expect.objectContaining({
      email: "reader@example.com",
      is_subscribed: false,
      status: "pending",
    }));
    expect(mocks.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      templateKey: "newsletter_confirmation",
      to: "reader@example.com",
    }));
    expect(mocks.syncNewsletterSubscriberToResend).not.toHaveBeenCalled();
  });

  it("does not re-enter double opt-in for failed suppressed subscribers", async () => {
    vi.stubEnv("NEWSLETTER_TOKEN_SECRET", "test-newsletter-secret");
    const client = makeClient({
      confirmSubscriber: {
        id: "subscriber-1",
        email: "reader@example.com",
        full_name: null,
        status: "failed",
        is_subscribed: false,
        confirmation_token_hash: null,
        unsubscribe_token_hash: "unsub-hash",
        last_confirmation_sent_at: null,
        created_at: "2026-05-14T12:00:00.000Z",
      },
    });
    mocks.createServiceRoleClient.mockReturnValue(client.client);

    const response = await subscribeNewsletter(jsonRequest({
      email: "reader@example.com",
      submittedAt: Date.now() - 2000,
    }));
    const payload = await response.json();

    expect(response.status).toBe(202);
    expect(payload.message).toContain("If this email can be subscribed");
    expect(client.spies.subscriberInsert).not.toHaveBeenCalled();
    expect(client.spies.subscriberUpdate).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
    expect(mocks.syncNewsletterSubscriberToResend).not.toHaveBeenCalled();
  });

  it("confirms a pending subscriber and syncs only after confirmation", async () => {
    vi.stubEnv("NEWSLETTER_TOKEN_SECRET", "test-newsletter-secret");
    const token = "confirm-token";
    const client = makeClient({
      confirmSubscriber: {
        id: "subscriber-1",
        email: "reader@example.com",
        full_name: null,
        status: "pending",
        confirmation_token_hash: hashNewsletterToken(token),
        unsubscribe_token_hash: "unsubscribe-hash",
        last_confirmation_sent_at: new Date().toISOString(),
        locale: "en",
        source: "newsletter",
        confirmed_at: null,
        welcome_sent_at: null,
      },
    });
    mocks.createServiceRoleClient.mockReturnValue(client.client);

    const response = await confirmNewsletter(getRequest(`/api/newsletter/confirm?token=${token}`));

    expect(response.status).toBe(200);
    expect(mocks.syncNewsletterSubscriberToResend).toHaveBeenCalled();
    expect(mocks.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      templateKey: "newsletter_welcome",
    }));
  });

  it("unsubscribes through a signed token", async () => {
    vi.stubEnv("NEWSLETTER_TOKEN_SECRET", "test-newsletter-secret");
    const client = makeClient();
    mocks.createServiceRoleClient.mockReturnValue(client.client);

    const response = await unsubscribeNewsletter(getRequest("/api/newsletter/unsubscribe?token=unsub-token"));

    expect(response.status).toBe(200);
    expect(client.spies.subscriberUpdate).toHaveBeenCalled();
    expect(mocks.markNewsletterContactUnsubscribed).toHaveBeenCalledWith("reader@example.com");
  });

  it("returns a safe error for an invalid preference token", async () => {
    vi.stubEnv("NEWSLETTER_TOKEN_SECRET", "test-newsletter-secret");
    const client = makeClient({ lookupSubscriber: null });
    mocks.createServiceRoleClient.mockReturnValue(client.client);

    const response = await getNewsletterPreferences(getRequest("/api/newsletter/preferences?token=missing-token"));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual(expect.objectContaining({
      ok: false,
      status: "invalid",
    }));
    expect(JSON.stringify(payload)).not.toContain("reader@example.com");
  });

  it("loads safe preference state for a valid token without exposing the email", async () => {
    vi.stubEnv("NEWSLETTER_TOKEN_SECRET", "test-newsletter-secret");
    const client = makeClient({
      lookupSubscriber: {
        id: "subscriber-1",
        email: "reader@example.com",
        full_name: null,
        status: "subscribed",
        is_subscribed: true,
        confirmed_at: "2026-05-14T12:00:00.000Z",
        locale: "en",
        source: "newsletter",
      },
    });
    mocks.createServiceRoleClient.mockReturnValue(client.client);

    const response = await getNewsletterPreferences(getRequest("/api/newsletter/preferences?token=valid-preference-token"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual(expect.objectContaining({
      ok: true,
      status: "subscribed",
    }));
    expect(JSON.stringify(payload)).not.toContain("reader@example.com");
  });

  it("updates local subscriber state and Resend Topic when preferences unsubscribe", async () => {
    vi.stubEnv("NEWSLETTER_TOKEN_SECRET", "test-newsletter-secret");
    const client = makeClient({
      lookupSubscriber: {
        id: "subscriber-1",
        email: "reader@example.com",
        full_name: null,
        status: "subscribed",
        is_subscribed: true,
        confirmed_at: "2026-05-14T12:00:00.000Z",
        locale: "en",
        source: "newsletter",
      },
    });
    mocks.createServiceRoleClient.mockReturnValue(client.client);

    const response = await updateNewsletterPreferences(new NextRequest("http://localhost/api/newsletter/preferences", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: "valid-preference-token", action: "unsubscribe" }),
    }) as unknown as Parameters<typeof updateNewsletterPreferences>[0]);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.status).toBe("unsubscribed");
    expect(client.spies.subscriberUpdate).toHaveBeenCalledWith(expect.objectContaining({
      status: "unsubscribed",
      is_subscribed: false,
    }));
    expect(mocks.updateNewsletterTopicSubscription).toHaveBeenCalledWith("reader@example.com", "opt_out");
  });

  it("re-subscribes through preferences only for locally allowed subscribers", async () => {
    vi.stubEnv("NEWSLETTER_TOKEN_SECRET", "test-newsletter-secret");
    const client = makeClient({
      lookupSubscriber: {
        id: "subscriber-1",
        email: "reader@example.com",
        full_name: null,
        status: "unsubscribed",
        is_subscribed: false,
        confirmed_at: "2026-05-14T12:00:00.000Z",
        locale: "en",
        source: "newsletter",
      },
      confirmSubscriber: {
        id: "subscriber-1",
        email: "reader@example.com",
        full_name: null,
        status: "subscribed",
        is_subscribed: true,
        confirmed_at: "2026-05-14T12:00:00.000Z",
        locale: "en",
        source: "newsletter",
      },
    });
    mocks.createServiceRoleClient.mockReturnValue(client.client);

    const response = await updateNewsletterPreferences(new NextRequest("http://localhost/api/newsletter/preferences", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: "valid-preference-token", action: "subscribe" }),
    }) as unknown as Parameters<typeof updateNewsletterPreferences>[0]);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.status).toBe("subscribed");
    expect(mocks.syncNewsletterSubscriberToResend).toHaveBeenCalledWith(expect.objectContaining({
      subscriber: expect.objectContaining({ email: "reader@example.com" }),
    }));
  });
});
