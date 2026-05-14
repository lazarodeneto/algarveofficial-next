import { Resend } from "resend";

import { getEmailConfig } from "@/lib/email/email-config";

let cachedApiKey: string | null = null;
let cachedClient: Resend | null = null;

export function isEmailConfigured() {
  const config = getEmailConfig();
  return Boolean(config.resendApiKey && config.fromEmail && config.replyToEmail);
}

export function getResendClient() {
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "test") {
    throw new Error("Resend client is server-side only.");
  }

  const { resendApiKey } = getEmailConfig();
  if (!resendApiKey) {
    throw new Error("Resend is not configured.");
  }

  if (!cachedClient || cachedApiKey !== resendApiKey) {
    cachedClient = new Resend(resendApiKey);
    cachedApiKey = resendApiKey;
  }

  return cachedClient;
}
