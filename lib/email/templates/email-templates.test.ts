import { describe, expect, it, vi, afterEach } from "vitest";

import { adminAlertTemplate } from "@/lib/email/templates/admin-alert";
import { claimAdminNotificationTemplate } from "@/lib/email/templates/claim-admin-notification";
import { claimUserConfirmationTemplate } from "@/lib/email/templates/claim-user-confirmation";
import { contactAdminNotificationTemplate } from "@/lib/email/templates/contact-admin-notification";
import { contactUserConfirmationTemplate } from "@/lib/email/templates/contact-user-confirmation";
import { internalMessageNotificationTemplate } from "@/lib/email/templates/internal-message-notification";
import { newsletterConfirmationTemplate } from "@/lib/email/templates/newsletter-confirmation";
import { newsletterWelcomeTemplate } from "@/lib/email/templates/newsletter-welcome";
import { ownerNotificationTemplate } from "@/lib/email/templates/owner-notification";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("email templates", () => {
  it("render html and plain-text content", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://algarveofficial.test");

    const templates = [
      contactAdminNotificationTemplate({
        senderName: "Maria",
        senderEmail: "maria@example.com",
        subjectLabel: "Availability",
        message: "Hello",
        submittedAt: "2026-05-14T10:00:00.000Z",
      }),
      contactUserConfirmationTemplate({
        name: "Maria",
        subjectLabel: "Availability",
      }),
      claimAdminNotificationTemplate({
        claimId: "claim-1",
        requestType: "Claim Existing Business",
        businessName: "Atlantic Bistro",
        claimantName: "Maria",
        claimantEmail: "maria@example.com",
      }),
      claimUserConfirmationTemplate({
        claimantName: "Maria",
        businessName: "Atlantic Bistro",
        claimId: "claim-1",
      }),
      internalMessageNotificationTemplate({
        senderName: "Maria",
        messagePreview: "Hello",
      }),
      ownerNotificationTemplate({
        listingTitle: "Atlantic Bistro",
        headline: "Listing update",
        message: "Your listing changed.",
      }),
      adminAlertTemplate({
        title: "System notice",
        intro: "A check needs attention.",
      }),
      newsletterConfirmationTemplate({
        confirmationUrl: "/api/newsletter/confirm?token=test",
      }),
      newsletterWelcomeTemplate({
        preferencesUrl: "/newsletter/preferences?token=test",
        unsubscribeUrl: "/api/newsletter/unsubscribe?token=test",
      }),
    ];

    for (const template of templates) {
      expect(template.subject).toBeTruthy();
      expect(template.html).toContain("AlgarveOfficial");
      expect(template.html).toContain("You are receiving this email");
      expect(template.text).toContain("AlgarveOfficial");
    }
  });

  it("includes preference and unsubscribe links in the newsletter welcome template", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://algarveofficial.test");

    const template = newsletterWelcomeTemplate({
      preferencesUrl: "/newsletter/preferences?token=test",
      unsubscribeUrl: "/api/newsletter/unsubscribe?token=test",
    });

    expect(template.html).toContain("https://algarveofficial.test/newsletter/preferences?token=test");
    expect(template.html).toContain("https://algarveofficial.test/api/newsletter/unsubscribe?token=test");
    expect(template.text).toContain("Manage your newsletter preferences");
    expect(template.text).toContain("Unsubscribe from newsletter updates");
  });
});
