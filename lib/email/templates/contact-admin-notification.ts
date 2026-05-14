import type { EmailTemplateContent } from "@/lib/email/email-types";
import { absoluteUrl, renderBaseEmail } from "@/lib/email/templates/base-template";

export interface ContactAdminNotificationInput {
  messageId?: string | null;
  threadId?: string | null;
  senderName: string;
  senderEmail: string;
  phone?: string | null;
  subjectLabel: string;
  message: string;
  listingTitle?: string | null;
  listingUrl?: string | null;
  sourceUrl?: string | null;
  submittedAt: string;
  adminUrl?: string | null;
}

export function contactAdminNotificationTemplate(input: ContactAdminNotificationInput): EmailTemplateContent {
  const subject = `New AlgarveOfficial message - ${input.listingTitle || input.subjectLabel}`;
  const actionUrl = input.adminUrl ? absoluteUrl(input.adminUrl) : absoluteUrl("/admin/inbox");
  const rows: Array<[string, string | null | undefined]> = [
    ["Message ID", input.messageId],
    ["Thread ID", input.threadId],
    ["Sender name", input.senderName],
    ["Sender email", input.senderEmail],
    ["Phone", input.phone],
    ["Subject", input.subjectLabel],
    ["Listing", input.listingTitle],
    ["Listing URL", input.listingUrl],
    ["Source", input.sourceUrl],
    ["Submitted at", input.submittedAt],
  ];
  const { html, text } = renderBaseEmail({
    preview: "New message received through AlgarveOfficial.",
    title: "New AlgarveOfficial Message",
    intro: "A visitor submitted a message through AlgarveOfficial.",
    rows: rows.map(([label, value]) => ({ label, value })),
    body: input.message,
    action: { label: "Open admin inbox", url: actionUrl },
  });

  return { subject, html, text };
}
