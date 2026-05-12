import type { Json } from "@/integrations/supabase/types";

export const LISTING_CHANGE_REQUEST_STATUSES = ["pending", "approved", "rejected"] as const;

export const LISTING_CHANGE_REQUEST_FIELDS = [
  "name",
  "short_description",
  "description",
  "contact_phone",
  "contact_email",
  "website_url",
  "address",
  "opening_hours",
  "instagram_url",
  "facebook_url",
  "twitter_url",
  "youtube_url",
  "linkedin_url",
  "tiktok_url",
  "featured_image_url",
] as const;

export type ListingChangeRequestStatus = (typeof LISTING_CHANGE_REQUEST_STATUSES)[number];
export type ListingChangeRequestField = (typeof LISTING_CHANGE_REQUEST_FIELDS)[number];

export const LISTING_CHANGE_REQUEST_FIELD_LABELS: Record<ListingChangeRequestField, string> = {
  name: "Business name",
  short_description: "Short description",
  description: "Full description",
  contact_phone: "Phone",
  contact_email: "Email",
  website_url: "Website",
  address: "Address",
  opening_hours: "Opening hours",
  instagram_url: "Instagram",
  facebook_url: "Facebook",
  twitter_url: "X / Twitter",
  youtube_url: "YouTube",
  linkedin_url: "LinkedIn",
  tiktok_url: "TikTok",
  featured_image_url: "Featured image",
};

const URL_FIELDS = new Set<ListingChangeRequestField>([
  "website_url",
  "instagram_url",
  "facebook_url",
  "twitter_url",
  "youtube_url",
  "linkedin_url",
  "tiktok_url",
  "featured_image_url",
]);

const TEXT_LIMITS: Partial<Record<ListingChangeRequestField, number>> = {
  name: 160,
  short_description: 500,
  description: 5000,
  contact_phone: 50,
  contact_email: 320,
  website_url: 2048,
  address: 1000,
  opening_hours: 2000,
  instagram_url: 2048,
  facebook_url: 2048,
  twitter_url: 2048,
  youtube_url: 2048,
  linkedin_url: 2048,
  tiktok_url: 2048,
  featured_image_url: 2048,
};

export function isListingChangeRequestField(value: string): value is ListingChangeRequestField {
  return LISTING_CHANGE_REQUEST_FIELDS.includes(value as ListingChangeRequestField);
}

export function jsonToPlainText(value: Json | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isSafeRelativePath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") && !/[\s<>]/.test(value);
}

export function validateListingChangeRequestValue(
  fieldName: string,
  requestedValue: Json | null | undefined,
): { ok: true; value: string | null } | { ok: false; message: string } {
  if (!isListingChangeRequestField(fieldName)) {
    return { ok: false, message: "Unsupported listing field." };
  }

  const value = jsonToPlainText(requestedValue)?.trim() || null;
  const limit = TEXT_LIMITS[fieldName] ?? 5000;

  if (value && value.length > limit) {
    return { ok: false, message: `${LISTING_CHANGE_REQUEST_FIELD_LABELS[fieldName]} is too long.` };
  }

  if (fieldName === "contact_email" && value) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      return { ok: false, message: "Requested email is not valid." };
    }
  }

  if (fieldName === "contact_phone" && value) {
    const phonePattern = /^[0-9+().\s-]{5,50}$/;
    if (!phonePattern.test(value)) {
      return { ok: false, message: "Requested phone number is not valid." };
    }
  }

  if (URL_FIELDS.has(fieldName) && value && !isHttpUrl(value) && !isSafeRelativePath(value)) {
    return { ok: false, message: "Requested URL must be an http(s) URL or a safe site path." };
  }

  return { ok: true, value };
}

