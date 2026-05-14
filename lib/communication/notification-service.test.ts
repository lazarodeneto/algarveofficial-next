import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  notifyAdminNewInboxMessage,
  notifyUserMessageReceived,
} from "@/lib/communication/notification-service";
import { notifyListingStatusChanged } from "@/lib/communication/listing-notifications";
import { sendEmail } from "@/lib/email/send-email";

vi.mock("@/lib/email/email-config", () => ({
  getAdminNotificationRecipients: () => ["admin@example.com"],
  getSiteUrl: () => "https://algarveofficial.com",
}));

vi.mock("@/lib/email/send-email", () => ({
  sendEmail: vi.fn(),
}));

const mockedSendEmail = vi.mocked(sendEmail);

function chain<T>(data: T) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error: null });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  return { select, eq, maybeSingle };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedSendEmail.mockResolvedValue({
    success: true,
    provider: "resend",
    providerEmailId: "email_123",
    error: null,
    skipped: false,
    reason: null,
  });
});

describe("communication notifications", () => {
  it("uses stable idempotency keys for admin inbox notifications", async () => {
    await notifyAdminNewInboxMessage({
      threadId: "thread-1",
      messageId: "11111111-1111-4111-8111-111111111111",
      senderName: "Reader",
      senderEmail: "reader@example.com",
      listingTitle: "Praia",
      messagePreview: "Can I visit tomorrow?",
    });

    expect(mockedSendEmail).toHaveBeenCalledWith(expect.objectContaining({
      idempotencyKey: "admin-inbox/thread-1/new-message/11111111-1111-4111-8111-111111111111",
      replyTo: "reader@example.com",
      templateKey: "internal_message_notification",
    }));
  });

  it("returns a failed result without throwing when email sending fails", async () => {
    mockedSendEmail.mockResolvedValueOnce({
      success: false,
      provider: "resend",
      providerEmailId: null,
      error: "send failed",
      skipped: false,
      reason: null,
    });

    await expect(notifyAdminNewInboxMessage({
      threadId: "thread-2",
      messageId: "22222222-2222-4222-8222-222222222222",
      senderName: "Reader",
      messagePreview: "Message",
    })).resolves.toEqual({ sent: false, skipped: false, reason: "send failed" });
  });

  it("notifies a user reply with the reply idempotency key", async () => {
    const from = vi.fn((table: string) => {
      if (table === "chat_threads") {
        return chain({
          id: "33333333-3333-4333-8333-333333333333",
          listing_id: "44444444-4444-4444-8444-444444444444",
          owner_id: "owner-1",
          viewer_id: null,
          contact_name: "Reader",
          contact_email: "reader@example.com",
        });
      }
      if (table === "listings") {
        return chain({ id: "44444444-4444-4444-8444-444444444444", name: "Praia", slug: "praia" });
      }
      if (table === "profiles") {
        return {
          select: vi.fn(() => ({
            in: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
        };
      }
      throw new Error(`Unexpected table ${table}`);
    });

    await notifyUserMessageReceived({
      client: { from } as never,
      threadId: "33333333-3333-4333-8333-333333333333",
      messageId: "55555555-5555-4555-8555-555555555555",
      messagePreview: "Reply",
    });

    expect(mockedSendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: "reader@example.com",
      idempotencyKey: "admin-inbox/33333333-3333-4333-8333-333333333333/reply/55555555-5555-4555-8555-555555555555",
    }));
  });

  it("skips owner lifecycle notifications when the owner email is missing", async () => {
    const from = vi.fn((table: string) => {
      if (table === "listings") {
        return chain({
          id: "66666666-6666-4666-8666-666666666666",
          name: "Praia",
          slug: "praia",
          owner_id: "owner-1",
          status: "published",
          tier: "verified",
        });
      }
      if (table === "profiles") {
        return chain({ id: "owner-1", email: null, full_name: "Owner" });
      }
      throw new Error(`Unexpected table ${table}`);
    });

    const notification = await notifyListingStatusChanged({
      client: { from } as never,
      listingId: "66666666-6666-4666-8666-666666666666",
      status: "published",
      previousStatus: "pending_review",
    });

    expect(notification).toEqual({ sent: false, skipped: true, reason: "owner_email_missing" });
    expect(mockedSendEmail).not.toHaveBeenCalled();
  });
});
