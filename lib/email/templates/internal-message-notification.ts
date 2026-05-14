import type { EmailTemplateContent } from "@/lib/email/email-types";
import { absoluteUrl, renderBaseEmail } from "@/lib/email/templates/base-template";

export interface InternalMessageNotificationInput {
  recipientName?: string | null;
  senderName: string;
  senderEmail?: string | null;
  listingTitle?: string | null;
  messagePreview: string;
  threadUrl?: string | null;
  submittedAt?: string | null;
}

export function internalMessageNotificationTemplate(input: InternalMessageNotificationInput): EmailTemplateContent {
  const subject = input.listingTitle
    ? `New message about ${input.listingTitle}`
    : "New AlgarveOfficial message";
  const greeting = input.recipientName ? `Hi ${input.recipientName}, ` : "";
  const { html, text } = renderBaseEmail({
    preview: "A new message is waiting in AlgarveOfficial.",
    title: "New message received",
    intro: `${greeting}${input.senderName} sent a new message through AlgarveOfficial.`,
    rows: [
      { label: "Sender", value: input.senderName },
      { label: "Sender email", value: input.senderEmail },
      { label: "Listing", value: input.listingTitle },
      { label: "Submitted at", value: input.submittedAt },
    ],
    body: input.messagePreview,
    action: input.threadUrl ? { label: "Open message", url: absoluteUrl(input.threadUrl) } : null,
  });

  return { subject, html, text };
}
