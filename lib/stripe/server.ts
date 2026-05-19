import Stripe from "stripe";

// Pinned API version. Update intentionally — never let the SDK silently default.
export const STRIPE_API_VERSION = "2026-03-25.dahlia" as const;

let cachedClient: Stripe | null = null;

export function getStripeServerClient(): Stripe | null {
  if (cachedClient) return cachedClient;
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  cachedClient = new Stripe(key, {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
    appInfo: {
      name: "ALGARVEOFFICIAL.COM",
      url: "https://algarveofficial.com",
    },
  });
  return cachedClient;
}

export function requireStripeServerClient(): Stripe {
  const client = getStripeServerClient();
  if (!client) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }
  return client;
}

export function getStripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null;
}

export function getStripeSecretKeyMode(): "live" | "test" | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  if (key.startsWith("sk_live_")) return "live";
  if (key.startsWith("sk_test_")) return "test";
  return null;
}
