import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  createServiceRoleClient: vi.fn(),
}));

vi.mock("@/lib/server/admin-auth", () => ({
  adminErrorResponse: (status: number, code: string, message: string) =>
    NextResponse.json({ ok: false, error: { code, message } }, { status }),
  requireAdminSession: mocks.requireAdminSession,
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

import { GET } from "@/app/api/admin/communications/route";

function request(path = "http://localhost/api/admin/communications") {
  return new NextRequest(path) as unknown as Parameters<typeof GET>[0];
}

function terminal<T>(data: T) {
  return {
    order: vi.fn(() => ({
      limit: vi.fn().mockResolvedValue({ data, error: null }),
    })),
    limit: vi.fn().mockResolvedValue({ data, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
  };
}

function tableQuery(table: string, selectColumns: string) {
  if (table === "transactional_email_events") {
    const data = [{
      id: "event-1",
      provider: "resend",
      provider_email_id: "email_1",
      template_key: "owner_notification",
      recipient: "owner@example.com",
      subject: "Status",
      related_entity_type: "listing",
      related_entity_id: "11111111-1111-4111-8111-111111111111",
      status: "failed",
      error_message: "Mailbox unavailable",
      created_at: "2026-05-14T12:00:00.000Z",
    }];
    return {
      eq: vi.fn(() => tableQuery(table, selectColumns)),
      in: vi.fn(() => terminal(data)),
      order: vi.fn(() => ({
        limit: vi.fn().mockResolvedValue({ data, error: null }),
      })),
    };
  }

  if (table === "webhook_event_receipts") {
    return {
      eq: vi.fn(() => terminal([{
        id: "receipt-1",
        provider: "resend",
        event_id: "evt_1",
        event_type: "email.bounced",
        received_at: "2026-05-14T12:00:00.000Z",
        created_at: "2026-05-14T12:00:00.000Z",
      }])),
    };
  }

  if (table === "email_subscribers") {
    if (selectColumns.includes("id, email")) {
      return {
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({
            data: [{
              id: "subscriber-1",
              email: "reader@example.com",
              status: "subscribed",
              resend_sync_status: "synced",
              created_at: "2026-05-14T12:00:00.000Z",
              confirmed_at: "2026-05-14T12:01:00.000Z",
              unsubscribed_at: null,
            }],
            error: null,
          }),
        })),
      };
    }
    return {
      limit: vi.fn().mockResolvedValue({ data: [{ status: "subscribed" }, { status: "pending" }], error: null }),
    };
  }

  if (table === "external_outbox") {
    return {
      limit: vi.fn().mockResolvedValue({ data: [{ status: "queued" }, { status: "sent" }], error: null }),
    };
  }

  if (table === "admin_external_outbox_health") {
    return {
      maybeSingle: vi.fn().mockResolvedValue({ data: { open_alerts: [{ alert_key: "worker_liveness" }] }, error: null }),
    };
  }

  throw new Error(`Unexpected table ${table}`);
}

function makeClient() {
  return {
    from: vi.fn((table: string) => ({
      select: vi.fn((columns: string) => tableQuery(table, columns)),
    })),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("admin communications API", () => {
  it("rejects non-admin access", async () => {
    mocks.requireAdminSession.mockResolvedValue({
      error: NextResponse.json({ ok: false }, { status: 401 }),
    });

    const response = await GET(request());

    expect(response.status).toBe(401);
    expect(mocks.createServiceRoleClient).not.toHaveBeenCalled();
  });

  it("returns sanitized communication diagnostics for admins", async () => {
    mocks.requireAdminSession.mockResolvedValue({
      userId: "admin-1",
      role: "admin",
      userClient: makeClient(),
    });
    mocks.createServiceRoleClient.mockReturnValue(makeClient());

    const response = await GET(request());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.emailEvents[0].recipient).toBe("ow***@example.com");
    expect(body.newsletter.recentSubscribers[0].email).toBe("re***@example.com");
    expect(body.webhookReceipts[0]).toEqual(expect.objectContaining({
      eventType: "email.bounced",
    }));
    expect(body.externalOutbox.openAlertCount).toBe(1);
  });
});
