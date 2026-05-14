import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_BYTES = 32;
const CONFIRMATION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
let warnedDevelopmentSecret = false;

function getNewsletterTokenSecret() {
  const secret = process.env.NEWSLETTER_TOKEN_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEWSLETTER_TOKEN_SECRET is required for newsletter token verification.");
  }

  if (!warnedDevelopmentSecret && process.env.NODE_ENV !== "test") {
    warnedDevelopmentSecret = true;
    console.warn("[newsletter] NEWSLETTER_TOKEN_SECRET is missing; using development-only token secret.");
  }

  return "development-only-newsletter-token-secret";
}

export function createNewsletterToken() {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashNewsletterToken(token: string) {
  return createHmac("sha256", getNewsletterTokenSecret())
    .update(token)
    .digest("hex");
}

export function verifyNewsletterToken(token: string, expectedHash: string) {
  const actual = Buffer.from(hashNewsletterToken(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createConfirmationToken() {
  const token = createNewsletterToken();
  return {
    token,
    tokenHash: hashNewsletterToken(token),
  };
}

export function createUnsubscribeToken() {
  const token = createNewsletterToken();
  return {
    token,
    tokenHash: hashNewsletterToken(token),
  };
}

export function isConfirmationTokenExpired(sentAt: string | null | undefined) {
  if (!sentAt) return true;
  const timestamp = Date.parse(sentAt);
  if (!Number.isFinite(timestamp)) return true;
  return Date.now() - timestamp > CONFIRMATION_MAX_AGE_MS;
}
