import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  emailsSend: vi.fn(),
  recordEmailAttempt: vi.fn(),
  recordEmailFailure: vi.fn(),
  recordEmailSkipped: vi.fn(),
  recordEmailSuccess: vi.fn(),
}));

vi.mock("@/lib/email/resend-client", () => ({
  getResendClient: () => ({
    emails: {
      send: mocks.emailsSend,
    },
  }),
}));

vi.mock("@/lib/email/email-events", () => ({
  recordEmailAttempt: mocks.recordEmailAttempt,
  recordEmailFailure: mocks.recordEmailFailure,
  recordEmailSkipped: mocks.recordEmailSkipped,
  recordEmailSuccess: mocks.recordEmailSuccess,
}));

import { sendEmail } from "@/lib/email/send-email";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

function configureEmailEnv() {
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  vi.stubEnv("RESEND_FROM_EMAIL", "hello@algarveofficial.test");
  vi.stubEnv("RESEND_FROM_NAME", "AlgarveOfficial");
  vi.stubEnv("RESEND_REPLY_TO_EMAIL", "support@algarveofficial.test");
  vi.stubEnv("ADMIN_NOTIFICATION_EMAILS", "admin@algarveofficial.test");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://algarveofficial.test");
}

describe("sendEmail", () => {
  it("rejects invalid recipients before calling Resend", async () => {
    configureEmailEnv();

    const result = await sendEmail({
      to: "not-an-email",
      subject: "Invalid recipient",
      html: "<p>Hello</p>",
      text: "Hello",
      templateKey: "admin_alert",
      relatedEntityType: "system",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Email recipient is invalid.");
    expect(mocks.emailsSend).not.toHaveBeenCalled();
    expect(mocks.recordEmailFailure).toHaveBeenCalled();
  });

  it("does not throw at import or send time when Resend is missing in development", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("RESEND_FROM_EMAIL", "hello@algarveofficial.test");
    vi.stubEnv("RESEND_FROM_NAME", "AlgarveOfficial");
    vi.stubEnv("RESEND_REPLY_TO_EMAIL", "support@algarveofficial.test");
    vi.stubEnv("ADMIN_NOTIFICATION_EMAILS", "admin@algarveofficial.test");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://algarveofficial.test");

    const result = await sendEmail({
      to: "admin@algarveofficial.test",
      subject: "Skipped email",
      html: "<p>Hello</p>",
      text: "Hello",
      templateKey: "admin_alert",
      relatedEntityType: "system",
    });

    expect(result.skipped).toBe(true);
    expect(result.reason).toBe("email_not_configured");
    expect(mocks.emailsSend).not.toHaveBeenCalled();
    expect(mocks.recordEmailSkipped).toHaveBeenCalled();
  });
});
