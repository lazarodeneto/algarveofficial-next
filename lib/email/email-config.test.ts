import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getAdminNotificationRecipients,
  getDefaultFrom,
  getDefaultReplyTo,
  getEmailConfig,
  getSiteUrl,
} from "@/lib/email/email-config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("email config", () => {
  it("parses comma-separated admin notification recipients", () => {
    vi.stubEnv("ADMIN_NOTIFICATION_EMAILS", "ops@example.com, owner@example.com, invalid, ops@example.com");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://algarveofficial.test");

    expect(getAdminNotificationRecipients()).toEqual([
      "ops@example.com",
      "owner@example.com",
    ]);
  });

  it("prefers canonical Resend sender and reply-to values over legacy aliases", () => {
    vi.stubEnv("RESEND_FROM_EMAIL", "canonical@example.com");
    vi.stubEnv("RESEND_FROM_NAME", "AlgarveOfficial");
    vi.stubEnv("RESEND_REPLY_TO_EMAIL", "reply@example.com");
    vi.stubEnv("EMAIL_FROM", "Legacy <legacy@example.com>");
    vi.stubEnv("EMAIL_REPLY_TO", "legacy-reply@example.com");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://algarveofficial.test/");

    const config = getEmailConfig();

    expect(config.fromEmail).toBe("canonical@example.com");
    expect(config.replyToEmail).toBe("reply@example.com");
    expect(getDefaultFrom()).toBe("AlgarveOfficial <canonical@example.com>");
    expect(getDefaultReplyTo()).toBe("reply@example.com");
    expect(getSiteUrl()).toBe("https://algarveofficial.test");
  });
});
