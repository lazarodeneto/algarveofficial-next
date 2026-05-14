import type { EmailTemplateContent } from "@/lib/email/email-types";
import { absoluteUrl, renderBaseEmail } from "@/lib/email/templates/base-template";

export interface OwnerNotificationInput {
  ownerName?: string | null;
  listingTitle: string;
  headline: string;
  message: string;
  status?: string | null;
  actionLabel?: string | null;
  actionUrl?: string | null;
}

export function ownerNotificationTemplate(input: OwnerNotificationInput): EmailTemplateContent {
  const subject = `${input.headline} - ${input.listingTitle}`;
  const greeting = input.ownerName ? `Hi ${input.ownerName}, ` : "";
  const { html, text } = renderBaseEmail({
    preview: input.headline,
    title: input.headline,
    intro: `${greeting}${input.message}`,
    rows: [
      { label: "Listing", value: input.listingTitle },
      { label: "Status", value: input.status },
    ],
    action: input.actionLabel && input.actionUrl
      ? { label: input.actionLabel, url: absoluteUrl(input.actionUrl) }
      : null,
  });

  return { subject, html, text };
}
