import type { EmailTemplateContent } from "@/lib/email/email-types";
import { absoluteUrl, renderBaseEmail } from "@/lib/email/templates/base-template";

export interface NewsletterConfirmationInput {
  confirmationUrl: string;
}

export function newsletterConfirmationTemplate(input: NewsletterConfirmationInput): EmailTemplateContent {
  const subject = "Confirm your AlgarveOfficial newsletter subscription";
  const { html, text } = renderBaseEmail({
    preview: "Confirm your AlgarveOfficial newsletter subscription.",
    title: "Confirm your subscription",
    intro: "Please confirm that you want to receive AlgarveOfficial updates. We only add confirmed subscribers to our newsletter list.",
    body: "If you did not request this, you can ignore this email.",
    action: { label: "Confirm subscription", url: absoluteUrl(input.confirmationUrl) },
  });

  return { subject, html, text };
}
