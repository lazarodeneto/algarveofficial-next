const DEFAULT_SITE_URL = "https://algarveofficial.com";
const DEFAULT_FROM_NAME = "AlgarveOfficial";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface EmailConfig {
  resendApiKey: string | null;
  fromEmail: string | null;
  fromName: string;
  replyToEmail: string | null;
  resendAudienceId: string | null;
  resendNewsletterSegmentId: string | null;
  resendNewsletterTopicId: string | null;
  resendWebhookSecret: string | null;
  adminNotificationEmails: string[];
  contactNotificationEmails: string[];
  claimNotificationEmails: string[];
  siteUrl: string;
  isProduction: boolean;
  issues: string[];
}

interface ParsedSender {
  name: string | null;
  email: string | null;
}

function readEnv(name: string) {
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "test") {
    throw new Error("Email configuration is server-side only.");
  }

  return process.env[name]?.trim() || null;
}

function isValidEmail(value: string | null | undefined): value is string {
  return Boolean(value && EMAIL_PATTERN.test(value));
}

function parseSenderAddress(value: string | null): ParsedSender {
  if (!value) return { name: null, email: null };

  const bracketMatch = value.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);
  if (bracketMatch) {
    const name = bracketMatch[1]?.trim().replace(/^"|"$/g, "") || null;
    const email = bracketMatch[2]?.trim().toLowerCase() || null;
    return { name, email: isValidEmail(email) ? email : null };
  }

  const normalized = value.trim().toLowerCase();
  return { name: null, email: isValidEmail(normalized) ? normalized : null };
}

function parseEmailList(value: string | null): string[] {
  if (!value) return [];
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(isValidEmail),
    ),
  );
}

function normalizeSiteUrl(value: string | null, issues: string[]) {
  if (!value) {
    issues.push("NEXT_PUBLIC_SITE_URL is missing.");
    return DEFAULT_SITE_URL;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      issues.push("NEXT_PUBLIC_SITE_URL must use http or https.");
      return DEFAULT_SITE_URL;
    }
    return url.toString().replace(/\/+$/, "");
  } catch {
    issues.push("NEXT_PUBLIC_SITE_URL must be an absolute URL.");
    return DEFAULT_SITE_URL;
  }
}

function formatNamedEmail(name: string, email: string) {
  const safeName = name.replace(/[<>"]/g, "").trim() || DEFAULT_FROM_NAME;
  return `${safeName} <${email}>`;
}

function buildConfig(): EmailConfig {
  const issues: string[] = [];
  const isProduction = process.env.NODE_ENV === "production";
  const resendApiKey = readEnv("RESEND_API_KEY");
  const canonicalFromEmail = readEnv("RESEND_FROM_EMAIL");
  const legacyFrom = parseSenderAddress(
    readEnv("RESEND_TRANSACTIONAL_FROM") ?? readEnv("EMAIL_FROM"),
  );
  const fromEmail = isValidEmail(canonicalFromEmail)
    ? canonicalFromEmail.toLowerCase()
    : legacyFrom.email;

  if (!fromEmail) {
    issues.push("RESEND_FROM_EMAIL is missing or invalid.");
  }

  const fromName = readEnv("RESEND_FROM_NAME") ?? legacyFrom.name ?? DEFAULT_FROM_NAME;
  const canonicalReplyTo = readEnv("RESEND_REPLY_TO_EMAIL");
  const legacyReplyTo = parseSenderAddress(readEnv("EMAIL_REPLY_TO")).email;
  const replyToEmail = isValidEmail(canonicalReplyTo)
    ? canonicalReplyTo.toLowerCase()
    : legacyReplyTo;

  if (!replyToEmail) {
    issues.push("RESEND_REPLY_TO_EMAIL is missing or invalid.");
  }

  if (!resendApiKey) {
    issues.push("RESEND_API_KEY is missing.");
  }

  const adminNotificationEmails = parseEmailList(readEnv("ADMIN_NOTIFICATION_EMAILS"));
  const contactNotificationEmails = parseEmailList(readEnv("CONTACT_NOTIFICATION_EMAIL"));
  const claimNotificationEmails = parseEmailList(readEnv("CLAIM_NOTIFICATION_EMAIL"));

  if (adminNotificationEmails.length === 0) {
    issues.push("ADMIN_NOTIFICATION_EMAILS is missing or invalid.");
  }

  return {
    resendApiKey,
    fromEmail,
    fromName,
    replyToEmail,
    resendAudienceId: readEnv("RESEND_AUDIENCE_ID"),
    resendNewsletterSegmentId: readEnv("RESEND_NEWSLETTER_SEGMENT_ID"),
    resendNewsletterTopicId: readEnv("RESEND_NEWSLETTER_TOPIC_ID"),
    resendWebhookSecret: readEnv("RESEND_WEBHOOK_SECRET"),
    adminNotificationEmails,
    contactNotificationEmails,
    claimNotificationEmails,
    siteUrl: normalizeSiteUrl(readEnv("NEXT_PUBLIC_SITE_URL"), issues),
    isProduction,
    issues,
  };
}

export function getEmailConfig(): EmailConfig {
  return buildConfig();
}

export function getDefaultFrom() {
  const config = getEmailConfig();
  if (!config.fromEmail) return null;
  return formatNamedEmail(config.fromName, config.fromEmail);
}

export function getDefaultReplyTo() {
  return getEmailConfig().replyToEmail;
}

export function getAdminNotificationRecipients() {
  return getEmailConfig().adminNotificationEmails;
}

export function getContactNotificationRecipients() {
  const config = getEmailConfig();
  return config.contactNotificationEmails.length > 0
    ? config.contactNotificationEmails
    : config.adminNotificationEmails;
}

export function getClaimNotificationRecipients() {
  const config = getEmailConfig();
  return config.claimNotificationEmails.length > 0
    ? config.claimNotificationEmails
    : config.adminNotificationEmails;
}

export function getSiteUrl() {
  return getEmailConfig().siteUrl;
}

export function isAllowedSenderAddress(value: string) {
  const parsed = parseSenderAddress(value);
  const config = getEmailConfig();
  const allowedDomain = config.fromEmail?.split("@")[1];
  const senderDomain = parsed.email?.split("@")[1];
  return Boolean(parsed.email && allowedDomain && senderDomain === allowedDomain);
}

export function normalizeEmailAddress(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase() || null;
  return isValidEmail(normalized) ? normalized : null;
}
