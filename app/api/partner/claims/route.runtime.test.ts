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

import { POST as postPartnerClaimRoute } from "@/app/api/partner/claims/route";

function jsonRequest(body: unknown) {
  return new NextRequest("http://localhost/api/partner/claims", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof postPartnerClaimRoute>[0];
}

function invalidJsonRequest(raw: string) {
  return new NextRequest("http://localhost/api/partner/claims", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: raw,
  }) as unknown as Parameters<typeof postPartnerClaimRoute>[0];
}

function validPayload() {
  return {
    requestType: "new-listing",
    businessName: "Golden Beach Resort",
    businessWebsite: "https://golden-beach.example",
    contactName: "Maria Santos",
    email: "maria@golden-beach.example",
    phone: "+351912345678",
    message: "We want to join the platform and increase direct qualified leads.",
  };
}

function makeWriteClient({
  claimData = { id: "claim-1", status: "pending", created_at: "2026-04-18T10:00:00.000Z" },
  claimError = null,
  contactSettingsData = { forwarding_email: "alerts@algarveofficial.com" },
  contactSettingsError = null,
  outboxError = null,
  triggerError = null,
  outboxHealthData = { open_alerts: [] },
  outboxHealthError = null,
}: {
  claimData?: unknown;
  claimError?: { message: string } | null;
  contactSettingsData?: unknown;
  contactSettingsError?: { message: string } | null;
  outboxError?: { message: string } | null;
  triggerError?: { message: string } | null;
  outboxHealthData?: unknown;
  outboxHealthError?: { message: string } | null;
} = {}) {
  const claimSingle = vi.fn().mockResolvedValue({ data: claimData, error: claimError });
  const claimSelect = vi.fn(() => ({ single: claimSingle }));
  const claimInsert = vi.fn(() => ({ select: claimSelect }));

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
    if (table === "listing_claims") {
      return { insert: claimInsert };
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
      claimInsert,
      claimSelect,
      claimSingle,
      contactSelect,
      contactEq,
      contactMaybeSingle,
      outboxInsert,
      outboxHealthSelect,
      outboxHealthMaybeSingle,
    },
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("partner claim route runtime", () => {
  it("returns 400 for invalid JSON", async () => {
    const response = await postPartnerClaimRoute(invalidJsonRequest("{invalid"));
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

  it("returns 400 for invalid payload", async () => {
    const response = await postPartnerClaimRoute(jsonRequest({ requestType: "new-listing" }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ code: "PARTNER_CLAIM_VALIDATION_ERROR" }),
      }),
    );
    expect(mocks.createServiceRoleClient).not.toHaveBeenCalled();
  });

  it("returns 503 when service-role client is unavailable", async () => {
    mocks.createServiceRoleClient.mockReturnValue(null);

    const response = await postPartnerClaimRoute(jsonRequest(validPayload()));
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload).toEqual(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ code: "SERVICE_ROLE_NOT_CONFIGURED" }),
      }),
    );
    expect(mocks.createServerClient).not.toHaveBeenCalled();
  });

  it("inserts a claim, enqueues outbox email alert, and triggers immediate processing", async () => {
    const writeClient = makeWriteClient();
    mocks.createServiceRoleClient.mockReturnValue(writeClient.client);
    const getUser = vi.fn().mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
    mocks.createServerClient.mockResolvedValue({ auth: { getUser } });

    const response = await postPartnerClaimRoute(jsonRequest(validPayload()));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({ id: "claim-1", status: "pending" }),
      }),
    );
    expect(writeClient.spies.from).toHaveBeenCalledWith("listing_claims");
    expect(writeClient.spies.from).toHaveBeenCalledWith("contact_settings");
    expect(writeClient.spies.from).toHaveBeenCalledWith("external_outbox");
    expect(writeClient.spies.from).toHaveBeenCalledWith("admin_external_outbox_health");
    expect(writeClient.spies.claimInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        request_type: "new-listing",
        business_name: "Golden Beach Resort",
        user_id: "user-123",
        status: "pending",
      }),
    );
    expect(writeClient.spies.outboxInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "resend",
        operation: "resend.send_email",
        source: "partner-claim-alert",
        idempotency_key: "partner-claim-alert:claim-1",
        payload: expect.objectContaining({
          to: ["alerts@algarveofficial.com"],
          subject: expect.stringContaining("Golden Beach Resort"),
          reply_to: "maria@golden-beach.example",
        }),
      }),
    );
    expect(writeClient.spies.rpc).toHaveBeenCalledWith("trigger_process_outbox");
  });

  it("falls back to null user id when auth resolution fails", async () => {
    const writeClient = makeWriteClient();
    mocks.createServiceRoleClient.mockReturnValue(writeClient.client);
    mocks.createServerClient.mockRejectedValue(new Error("auth unavailable"));

    const response = await postPartnerClaimRoute(jsonRequest(validPayload()));

    expect(response.status).toBe(201);
    expect(writeClient.spies.claimInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: null,
      }),
    );
  });

  it("returns 500 when insert fails", async () => {
    const writeClient = makeWriteClient({
      claimData: null,
      claimError: { message: "new row violates row-level security policy" },
    });
    mocks.createServiceRoleClient.mockReturnValue(writeClient.client);
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });

    const response = await postPartnerClaimRoute(jsonRequest(validPayload()));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({
          code: "PARTNER_CLAIM_INSERT_FAILED",
          message: "new row violates row-level security policy",
        }),
      }),
    );
    expect(writeClient.spies.from).toHaveBeenCalledWith("listing_claims");
    expect(writeClient.spies.from).not.toHaveBeenCalledWith("external_outbox");
    expect(writeClient.spies.rpc).not.toHaveBeenCalled();
  });

  it("returns warning when outbox enqueue fails but still creates the claim", async () => {
    const writeClient = makeWriteClient({
      outboxError: { message: "failed to enqueue" },
    });
    mocks.createServiceRoleClient.mockReturnValue(writeClient.client);
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });

    const response = await postPartnerClaimRoute(jsonRequest(validPayload()));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual(
      expect.objectContaining({
        ok: true,
        warnings: ["partner_claim_alert_enqueue_failed"],
      }),
    );
    expect(writeClient.spies.rpc).not.toHaveBeenCalled();
  });

  it("returns warning when immediate outbox trigger fails", async () => {
    const writeClient = makeWriteClient({
      triggerError: { message: "rpc failed" },
    });
    mocks.createServiceRoleClient.mockReturnValue(writeClient.client);
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });

    const response = await postPartnerClaimRoute(jsonRequest(validPayload()));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual(
      expect.objectContaining({
        ok: true,
        warnings: ["partner_claim_alert_trigger_failed"],
      }),
    );
    expect(writeClient.spies.outboxInsert).toHaveBeenCalledOnce();
    expect(writeClient.spies.rpc).toHaveBeenCalledWith("trigger_process_outbox");
  });

  it("falls back to primary contact email when forwarding email lookup fails", async () => {
    const writeClient = makeWriteClient({
      contactSettingsError: { message: "lookup failed" },
    });
    mocks.createServiceRoleClient.mockReturnValue(writeClient.client);
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });

    const response = await postPartnerClaimRoute(jsonRequest(validPayload()));

    expect(response.status).toBe(201);
    expect(writeClient.spies.outboxInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          to: ["info@algarveofficial.com"],
        }),
      }),
    );
  });

  it("returns warning when outbox worker health is currently unavailable", async () => {
    const writeClient = makeWriteClient({
      outboxHealthData: {
        open_alerts: [{ alert_key: "worker_secret_missing" }],
      },
    });
    mocks.createServiceRoleClient.mockReturnValue(writeClient.client);
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });

    const response = await postPartnerClaimRoute(jsonRequest(validPayload()));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual(
      expect.objectContaining({
        ok: true,
        warnings: ["partner_claim_alert_outbox_worker_unhealthy"],
      }),
    );
  });
});
