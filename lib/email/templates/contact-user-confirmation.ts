import type { EmailTemplateContent } from "@/lib/email/email-types";
import { absoluteUrl, renderBaseEmail } from "@/lib/email/templates/base-template";

export interface ContactUserConfirmationInput {
  name: string;
  subjectLabel: string;
  listingTitle?: string | null;
}

export function contactUserConfirmationTemplate(input: ContactUserConfirmationInput): EmailTemplateContent {
  const subject = "We received your AlgarveOfficial message";
  const { html, text } = renderBaseEmail({
    preview: "Your message has been received by AlgarveOfficial.",
    title: "Your message was received",
    intro: `Hello ${input.name}, thank you for contacting AlgarveOfficial. Your message has been received by our team.`,
    rows: [
      { label: "Subject", value: input.subjectLabel },
      { label: "Listing", value: input.listingTitle },
    ],
    action: { label: "Visit AlgarveOfficial", url: absoluteUrl("/") },
  });

  return { subject, html, text };
}
