/**
 * lib/forms/schema.ts
 *
 * Zod validation schemas for all admin forms.
 *
 * Each schema describes the exact shape of the FORM state (not the DB row).
 * Use `z.infer<typeof schema>` for full type safety.
 */

import { z } from "zod";
import { isValidExternalUrlInput, normalizeExternalUrlForStorage } from "@/lib/url-input";

// ─── Shared primitives ────────────────────────────────────────────────────────

/** Accepts "" (empty input) or a valid email. */
const optionalEmail = z.string().email("Invalid email address").or(z.literal(""));

/** Accepts "" (empty input) or a valid URL. */
const optionalUrl = z
  .union([z.string().trim(), z.literal("")])
  .refine((value) => value === "" || isValidExternalUrlInput(value), "Invalid URL")
  .transform((value) => (value === "" ? "" : normalizeExternalUrlForStorage(value) ?? value));

// ─── Listing — Basics step ───────────────────────────────────────────────────

export const listingFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  short_description: z
    .string()
    .min(1, "Short description is required")
    .max(300, "Must be 300 characters or less"),
  full_description:   z.string().nullable().default(null),
  category_id:        z.string().min(1, "Category is required"),
  city_id:            z.string().min(1, "City is required"),
  premium_region_id:   z.string().optional(),
  tier:               z.enum(["unverified", "verified", "signature"]).default("unverified"),
  published_status:   z
    .enum(["draft", "pending_review", "published", "rejected", "archived"])
    .default("draft"),
  is_curated:         z.boolean().default(false),
  tags:               z.array(z.string()).default([]),
});

export type ListingFormValues = z.infer<typeof listingFormSchema>;

// ─── Listing — Contact step ──────────────────────────────────────────────────

export const contactFormSchema = z.object({
  phone:            z.string().optional(),
  email:            optionalEmail.optional(),
  website:          optionalUrl.optional(),
  // Social links — all optional URLs
  instagram:        optionalUrl.optional(),
  facebook:         optionalUrl.optional(),
  linkedin:         optionalUrl.optional(),
  youtube:          optionalUrl.optional(),
  twitter:          optionalUrl.optional(),
  tiktok:           optionalUrl.optional(),
  whatsapp:         optionalUrl.optional(),
  telegram:         optionalUrl.optional(),
  google_business:  optionalUrl.optional(),
  // Location
  address:          z.string().optional(),
  postcode:         z.string().optional(),
  lat:              z.number().min(-90).max(90).nullable().default(null),
  lng:              z.number().min(-180).max(180).nullable().default(null),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

// ─── Listing — Publishing step ───────────────────────────────────────────────

export const publishingFormSchema = z.object({
  tier:             z.enum(["unverified", "verified", "signature"]).default("unverified"),
  published_status: z
    .enum(["draft", "pending_review", "published", "rejected", "archived"])
    .default("draft"),
  owner_id:         z.string().optional(),
  is_curated:       z.boolean().default(false),
});

export type PublishingFormValues = z.infer<typeof publishingFormSchema>;

// ─── SEO panel ───────────────────────────────────────────────────────────────

export const seoFormSchema = z.object({
  meta_title:       z.string().max(60, "Keep under 60 characters").nullable().default(null),
  meta_description: z.string().max(160, "Keep under 160 characters").nullable().default(null),
  og_title:         z.string().nullable().default(null),
  og_description:   z.string().nullable().default(null),
  og_image:         z.string().nullable().default(null),
  canonical_url:    z.string().nullable().default(null),
  focus_keywords:   z.string().nullable().default(null),
  no_index:         z.boolean().default(false),
  no_follow:        z.boolean().default(false),
});

export type SeoFormValues = z.infer<typeof seoFormSchema>;

// ─── Dynamic / details step ──────────────────────────────────────────────────

export const detailsFormSchema = z.record(z.string(), z.unknown());

export type DetailsFormValues = z.infer<typeof detailsFormSchema>;

// ─── Media step ──────────────────────────────────────────────────────────────

export const mediaFormSchema = z.object({
  images: z.array(
    z.object({
      id:          z.string().optional(),
      url:         z.string(),
      alt:         z.string().optional(),
      is_featured: z.boolean().default(false),
      order:       z.number().default(0),
    }),
  ),
});

export type MediaFormValues = z.infer<typeof mediaFormSchema>;

// ─── Shared field schemas (compose into forms) ────────────────────────────────

export const fieldSchemas = {
  requiredString:   z.string().min(1),
  optionalString:   z.string().optional(),
  nullableString:   z.string().nullable(),
  requiredNumber:   z.number(),
  nullableNumber:   z.number().nullable(),
  requiredBoolean:  z.boolean(),
  optionalBoolean:  z.boolean().optional(),
  optionalEmail,
  optionalUrl,
} as const;
