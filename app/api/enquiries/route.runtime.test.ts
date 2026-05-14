import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  createServiceRoleClient: vi.fn(),
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createServerClient,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { POST as postEnquiryRoute } from "@/app/api/enquiries/route";

function jsonRequest(body: unknown) {
  return new NextRequest("http://localhost/api/enquiries", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof postEnquiryRoute>[0];
}

function invalidJsonRequest(raw: string) {
  return new NextRequest("http://localhost/api/enquiries", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: raw,
  }) as unknown as Parameters<typeof postEnquiryRoute>[0];
}

function validContactPayload() {
  return {
    name: "Test Sender",
    email: "sender@example.com",
    message: "Subject: Availability\n\nHello from the public contact form.",
    listing_title: "Website Contact Form",
  };
}

function makeWriteClient({
  adminData = { user_id: "admin-1" },
  adminError = null,
  threadData = { id: "thread-1" },
  threadError = null,
  messageData = { id: "message-1", created_at: "2026-05-14T12:00:00.000Z" },
  messageError = null,
  contactSettingsData = { forwarding_email: "alerts@algarveofficial.com" },
  contactSettingsError = null,
  outboxError = null,
  triggerError = null,
  outboxHealthData = { open_alerts: [] },
  outboxHealthError = null,
}: {
  adminData?: unknown;
  adminError?: { message: string } | null;
  threadData?: unknown;
  threadError?: { message: string } | null;
  messageData?: unknown;
  messageError?: { message: string } | null;
  contactSettingsData?: unknown;
  contactSettingsError?: { message: string } | null;
  outboxError?: { message: string } | null;
  triggerError?: { message: string } | null;
  outboxHealthData?: unknown;
  outboxHealthError?: { message: string } | null;
} = {}) {
  const adminMaybeSingle = vi.fn().mockResolvedValue({ data: adminData, error: adminError });
  const adminLimit = vi.fn(() => ({ maybeSingle: adminMaybeSingle }));
  const adminOrder = vi.fn(() => ({ limit: adminLimit }));
  const adminEq = vi.fn(() => ({ order: adminOrder }));
  const adminSelect = vi.fn(() => ({ eq: adminEq }));

  const threadSingle = vi.fn().mockResolvedValue({ data: threadData, error: threadError });
  const threadSelectAfterInsert = vi.fn(() => ({ single: threadSingle }));
  const threadInsert = vi.fn(() => ({ select: threadSelectAfterInsert }));

  const messageSingle = vi.fn().mockResolvedValue({ data: messageData, error: messageError });
  const messageSelectAfterInsert = vi.fn(() => ({ single: messageSingle }));
  const messageInsert = vi.fn(() => ({ select: messageSelectAfterInsert }));

  const contactMaybeSingle = vi.fn().mockResolvedValue({
    data: contactSettingsData,
    error: contactSettingsError,
  });
  const contactEq = vi.fn(() => ({ maybeSingle: contactMaybeSingle }));
  const contactSelect = vi.fn(() => ({ eq: contactEq }));

  const outboxInsert = vi.fn().mockResolvedValue({ data: null, error: outboxError });
  const outboxHealthMaybeSingle = vi.fn().mockResolvedValue({
    data: outboxHealthData,
    error: outboxHealthError,
  });
  const outboxHealthSelect = vi.fn(() => ({ maybeSingle: outboxHealthMaybeSingle }));

  const from = vi.fn((table: string) => {
    if (table === "user_roles") {
      return { select: adminSelect };
    }
    if (table === "chat_threads") {
      return { insert: threadInsert };
    }
    if (table === "chat_messages") {
      return { insert: messageInsert };
    }
    if (table === "contact_settings") {
      return { select: contactSelect };
    }
    if (table === "external_outbox") {
      return { insert: outboxInsert };
    }
    if (table === "admin_external_outbox_health") {
      return { select: outboxHealthSelect };
    }
    throw new Error(`Unexpected table ${table}`);
  });

  const rpc = vi.fn().mockResolvedValue({ data: null, error: triggerError });

  return {
    client: { from, rpc },
    spies: {
      from,
      rpc,
      adminSelect,
      adminEq,
      adminOrder,
      adminLimit,
      adminMaybeSingle,
      threadInsert,
      threadSelectAfterInsert,
      threadSingle,
      messageInsert,
      messageSelectAfterInsert,
      messageSingle,
      contactSelect,
      contactEq,
      contactMaybeSingle,
      outboxInsert,
      outboxHealthSelect,
      outboxHealthMaybeSingle,
    },
  };
}

function mockGuestAuth() {
  mocks.createServerClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("enquiry route runtime", () => {
  it("returns 400 for invalid JSON", async () => {
    const response = await postEnquiryRoute(invalidJsonRequest("{invalid"));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ code: "INVALID_JSON" }),
      }),
    );
    expect(mocks.createServiceRoleClient).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid contact payload", async () => {
    const response = await postEnquiryRoute(jsonRequest({ email: "not-an-email" }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ code: "INVALID_ENQUIRY" }),
      }),
    );
    expect(mocks.createServiceRoleClient).not.toHaveBeenCalled();
  });

  it("stores the public contact message and queues a forwarding email when direct email is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const writeClient = makeWriteClient();
    mocks.createServiceRoleClient.mockReturnValue(writeClient.client);
    mockGuestAuth();

    const response = await postEnquiryRoute(jsonRequest(validContactPayload()));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual({
      ok: true,
      data: {
        threadId: "thread-1",
        messageId: "message-1",
      },
      warnings: [],
    });
    expect(writeClient.spies.threadInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        listing_id: null,
        owner_id: "admin-1",
        viewer_id: null,
        contact_name: "Test Sender",
        contact_email: "sender@example.com",
        status: "active",
      }),
    );
    expect(writeClient.spies.messageInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        thread_id: "thread-1",
        sender_type: "viewer",
        direction: "inbound",
        body_text: expect.stringContaining("Hello from the public contact form."),
        recipient_id: "admin-1",
        delivery_status: "delivered",
      }),
    );
    expect(writeClient.spies.outboxInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "resend",
        operation: "resend.send_email",
        source: "public-message-forward",
        idempotency_key: "public-message-forward:message-1",
        payload: expect.objectContaining({
          to: ["alerts@algarveofficial.com", "lazaro@deneto.ch"],
          from: "AlgarveOfficial <info@algarveofficial.com>",
          subject: expect.stringContaining("Website Contact Form"),
          reply_to: "sender@example.com",
        }),
      }),
    );
    expect(writeClient.spies.rpc).toHaveBeenCalledWith("trigger_process_outbox");
  });

  it("sends the forwarding email directly with Resend when RESEND_API_KEY is configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-resend-key");
    vi.stubEnv("EMAIL_FROM", "AlgarveOfficial <info@algarveofficial.com>");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const writeClient = makeWriteClient();
    mocks.createServiceRoleClient.mockReturnValue(writeClient.client);
    mockGuestAuth();

    const response = await postEnquiryRoute(jsonRequest(validContactPayload()));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.warnings).toEqual([]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-resend-key",
          "Content-Type": "application/json",
          "Idempotency-Key": "public-message-forward:message-1",
        }),
        body: expect.stringContaining("sender@example.com"),
      }),
    );
    expect(writeClient.spies.outboxInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "public-message-forward",
        idempotency_key: "public-message-forward:message-1",
        status: "sent",
        attempts: 1,
      }),
    );
    expect(writeClient.spies.rpc).not.toHaveBeenCalled();
    expect(writeClient.spies.from).not.toHaveBeenCalledWith("admin_external_outbox_health");
  });

  it("keeps the saved message successful but reports an internal warning when outbox delivery is unhealthy", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const writeClient = makeWriteClient({
      outboxHealthData: {
        open_alerts: [
          { alert_key: "worker_secret_missing", severity: "critical" },
        ],
      },
    });
    mocks.createServiceRoleClient.mockReturnValue(writeClient.client);
    mockGuestAuth();

    const response = await postEnquiryRoute(jsonRequest(validContactPayload()));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual(
      expect.objectContaining({
        ok: true,
        data: {
          threadId: "thread-1",
          messageId: "message-1",
        },
        warnings: ["email_delivery_failed"],
      }),
    );
    expect(writeClient.spies.outboxInsert).toHaveBeenCalledOnce();
    expect(writeClient.spies.rpc).toHaveBeenCalledWith("trigger_process_outbox");
  });
});
