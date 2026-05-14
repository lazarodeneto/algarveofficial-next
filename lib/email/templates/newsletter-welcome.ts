import type { EmailTemplateContent } from "@/lib/email/email-types";
import { absoluteUrl, renderBaseEmail } from "@/lib/email/templates/base-template";

export interface NewsletterWelcomeInput {
  preferencesUrl?: string | null;
  unsubscribeUrl?: string | null;
}

export function newsletterWelcomeTemplate(input: NewsletterWelcomeInput): EmailTemplateContent {
  const subject = "Welcome to AlgarveOfficial";
  const preferencesUrl = input.preferencesUrl ? absoluteUrl(input.preferencesUrl) : null;
  const unsubscribeUrl = input.unsubscribeUrl ? absoluteUrl(input.unsubscribeUrl) : null;
  const links = [
    preferencesUrl ? `Manage your newsletter preferences: ${preferencesUrl}` : null,
    unsubscribeUrl ? `Unsubscribe from newsletter updates: ${unsubscribeUrl}` : null,
  ].filter(Boolean).join("\n");

  const { html, text } = renderBaseEmail({
    preview: "Your AlgarveOfficial newsletter subscription is confirmed.",
    title: "You are subscribed",
    intro: "Your AlgarveOfficial newsletter subscription is confirmed. You will receive curated Algarve updates, listings, and local insights from us.",
    body: links
      ? links
      : "You can unsubscribe from future marketing emails using the unsubscribe link included in newsletter messages.",
    action: preferencesUrl ? { label: "Manage preferences", url: preferencesUrl } : null,
  });

  return { subject, html, text };
}
