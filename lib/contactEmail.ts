export const PRIMARY_CONTACT_EMAIL = "info@algarveofficial.com";

const LEGACY_PUBLIC_EMAILS = new Set([
  "hello@algarveofficial.com",
  "support@algarveofficial.com",
  "concierge@algarveofficial.com",
  "legal@algarveofficial.com",
  "privacy@algarveofficial.com",
  "admin@algarveofficial.com",
]);

export function normalizePublicContactEmail(value: string | null | undefined) {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed) return PRIMARY_CONTACT_EMAIL;

  return LEGACY_PUBLIC_EMAILS.has(trimmed) ? PRIMARY_CONTACT_EMAIL : trimmed;
}
