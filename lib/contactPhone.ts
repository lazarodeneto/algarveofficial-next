export const PRIMARY_WHATSAPP_NUMBER = "+351927071708";

const LEGACY_WHATSAPP_NUMBERS = new Set([
  "351123456789",
  "+351123456789",
  "351910000000",
  "+351910000000",
  "351912345678",
  "+351912345678",
]);

export function normalizePublicWhatsAppNumber(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return PRIMARY_WHATSAPP_NUMBER;

  return LEGACY_WHATSAPP_NUMBERS.has(trimmed) ? PRIMARY_WHATSAPP_NUMBER : trimmed;
}

export function toWhatsAppDigits(value: string | null | undefined) {
  return normalizePublicWhatsAppNumber(value).replace(/\D/g, "");
}
