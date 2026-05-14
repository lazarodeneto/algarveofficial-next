export type EmailTemplateKey =
  | "contact_admin_notification"
  | "contact_user_confirmation"
  | "claim_admin_notification"
  | "claim_user_confirmation"
  | "internal_message_notification"
  | "owner_notification"
  | "admin_alert"
  | "newsletter_confirmation"
  | "newsletter_welcome";

export type EmailRelatedEntityType =
  | "enquiry"
  | "contact_message"
  | "business_claim"
  | "listing_claim"
  | "listing"
  | "owner"
  | "newsletter_subscriber"
  | "admin_inbox"
  | "system";

export interface EmailTag {
  name: string;
  value: string;
}

export interface SendEmailInput {
  to: string | string[];
  cc?: string | string[] | null;
  bcc?: string | string[] | null;
  replyTo?: string | string[] | null;
  from?: string | null;
  subject: string;
  html: string;
  text: string;
  templateKey: EmailTemplateKey;
  relatedEntityType?: EmailRelatedEntityType | null;
  relatedEntityId?: string | null;
  idempotencyKey?: string | null;
  metadata?: Record<string, unknown> | null;
  tags?: EmailTag[] | null;
  allowSkip?: boolean;
}

export interface SendEmailResult {
  success: boolean;
  provider: "resend";
  providerEmailId: string | null;
  error: string | null;
  skipped: boolean;
  reason: string | null;
}

export interface EmailTemplateContent {
  subject: string;
  html: string;
  text: string;
}
