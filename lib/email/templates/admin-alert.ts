import type { EmailTemplateContent } from "@/lib/email/email-types";
import { absoluteUrl, renderBaseEmail, type EmailRow } from "@/lib/email/templates/base-template";

export interface AdminAlertInput {
  title: string;
  intro: string;
  rows?: EmailRow[];
  body?: string | null;
  actionLabel?: string | null;
  actionUrl?: string | null;
}

export function adminAlertTemplate(input: AdminAlertInput): EmailTemplateContent {
  const subject = `AlgarveOfficial admin alert - ${input.title}`;
  const { html, text } = renderBaseEmail({
    preview: input.title,
    title: input.title,
    intro: input.intro,
    rows: input.rows,
    body: input.body,
    action: input.actionLabel && input.actionUrl
      ? { label: input.actionLabel, url: absoluteUrl(input.actionUrl) }
      : null,
  });

  return { subject, html, text };
}
