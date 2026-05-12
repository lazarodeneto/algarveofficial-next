import { afterEach, describe, expect, it, vi } from "vitest";

import {
  BUSINESS_CLAIM_EMAIL_WARNINGS,
  type BusinessClaimEmailContext,
  notifyBusinessClaimReview,
  notifyBusinessClaimSubmitted,
} from "./business-claim-email";

function claimContext(overrides: Partial<BusinessClaimEmailContext> = {}): BusinessClaimEmailContext {
  return {
    claimId: "claim-123",
    listingId: "listing-123",
    businessName: "Atlantic Bistro",
    businessSlug: "atlantic-bistro",
    claimantName: "Maria Santos",
    claimantEmail: "maria@atlantic.example",
    selectedTier: "verified",
    status: "pending",
    createdAt: "2026-05-11T10:00:00.000Z",
    ...overrides,
  };
}

function makeEmailClient({
  contactSettingsData = { forwarding_email: "claims@algarveofficial.com" },
  contactSettingsError = null,
  outboxError = null,
  triggerError = null,
  outboxHealthData = { open_alerts: [] },
  outboxHealthError = null,
}: {
  contactSettingsData?: unknown;
  contactSettingsError?: { message: string } | null;
  outboxError?: { message: string; code?: string } | null;
  triggerError?: { message: string } | null;
  outboxHealthData?: unknown;
  outboxHealthError?: { message: string } | null;
} = {}) {
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
      contactSelect,
      contactEq,
      contactMaybeSingle,
      outboxInsert,
      outboxHealthSelect,
      outboxHealthMaybeSingle,
    },
  };
}

function insertedPayloads(outboxInsert: ReturnType<typeof vi.fn>) {
  return outboxInsert.mock.calls.map(([inserted]) => inserted as {
    idempotency_key: string;
    payload: {
      to: string[];
      subject: string;
      html: string;
      text: string;
      reply_to: string;
    };
  });
}

afterEach(() => {
  vi.clearAllMocks();
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.EMAIL_FROM;
  delete process.env.EMAIL_REPLY_TO;
  delete process.env.RESEND_TRANSACTIONAL_FROM;
});

describe("business claim email notifications", () => {
  it("queues claimant and admin emails when a claim is submitted", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://algarveofficial.test";
    const emailClient = makeEmailClient();

    const warnings = await notifyBusinessClaimSubmitted(
      emailClient.client as never,
      claimContext(),
    );

    expect(warnings).toEqual([]);
    expect(emailClient.spies.outboxInsert).toHaveBeenCalledTimes(2);
    expect(emailClient.spies.rpc).toHaveBeenCalledWith("trigger_process_outbox");

    const [claimantEmail, adminEmail] = insertedPayloads(emailClient.spies.outboxInsert);

    expect(claimantEmail).toEqual(
      expect.objectContaining({
        idempotency_key: "business-claim:claim-123:submitted-claimant",
        payload: expect.objectContaining({
          to: ["maria@atlantic.example"],
          subject: "We received your AlgarveOfficial business claim",
          reply_to: "info@algarveofficial.com",
        }),
      }),
    );
    expect(claimantEmail.payload.text).toContain("Business: Atlantic Bistro");
    expect(claimantEmail.payload.text).toContain("Claim reference: claim-123");
    expect(claimantEmail.payload.text).toContain("Selected tier: Verified Business");
    expect(claimantEmail.payload.text).toContain("Status: pending");
    expect(claimantEmail.payload.text).not.toContain("/admin/business-claims");
    expect(claimantEmail.payload.text).not.toContain("/owner/listings");

    expect(adminEmail).toEqual(
      expect.objectContaining({
        idempotency_key: "business-claim:claim-123:submitted-admin",
        payload: expect.objectContaining({
          to: ["claims@algarveofficial.com"],
          subject: "New business claim submitted",
          reply_to: "maria@atlantic.example",
        }),
      }),
    );
    expect(adminEmail.payload.text).toContain("Review claim: https://algarveofficial.test/admin/business-claims/claim-123");
  });

  it("queues approved claimant email with owner dashboard next step", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://algarveofficial.test";
    const emailClient = makeEmailClient();

    const warnings = await notifyBusinessClaimReview(
      emailClient.client as never,
      claimContext({ status: "approved" }),
    );

    expect(warnings).toEqual([]);
    expect(emailClient.spies.outboxInsert).toHaveBeenCalledTimes(1);
    const [approvedEmail] = insertedPayloads(emailClient.spies.outboxInsert);

    expect(approvedEmail).toEqual(
      expect.objectContaining({
        idempotency_key: "business-claim:claim-123:approved-claimant",
        payload: expect.objectContaining({
          to: ["maria@atlantic.example"],
          subject: "Your AlgarveOfficial business claim was approved",
        }),
      }),
    );
    expect(approvedEmail.payload.text).toContain("Status: approved");
    expect(approvedEmail.payload.text).toContain("Open owner dashboard: https://algarveofficial.test/owner/listings");
  });

  it("returns warnings instead of throwing when email enqueue fails", async () => {
    const emailClient = makeEmailClient({
      outboxError: { message: "outbox unavailable" },
    });

    const warnings = await notifyBusinessClaimReview(
      emailClient.client as never,
      claimContext({ status: "rejected", rejectionReason: "Could not verify ownership." }),
    );

    expect(warnings).toEqual([BUSINESS_CLAIM_EMAIL_WARNINGS.enqueueFailed]);
    expect(emailClient.spies.rpc).not.toHaveBeenCalled();
  });

  it("does not queue review emails for non-final status changes", async () => {
    const emailClient = makeEmailClient();

    const warnings = await notifyBusinessClaimReview(
      emailClient.client as never,
      claimContext({ status: "disputed" }),
    );

    expect(warnings).toEqual([]);
    expect(emailClient.spies.outboxInsert).not.toHaveBeenCalled();
    expect(emailClient.spies.rpc).not.toHaveBeenCalled();
  });
});
