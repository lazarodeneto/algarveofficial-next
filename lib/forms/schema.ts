/**
 * lib/forms/schema.ts
 *
 * Zod validation schemas for forms.
 */

import { z } from "zod";

export const listingFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  short_description: z
    .string()
    .min(1, "Short description is required")
    .max(300, "Short description must be 300 characters or less"),
  full_description: z.string().nullable(),
  category_id: z.string().min(1, "Category is required"),
  city_id: z.string().min(1, "City is required"),
  luxury_region_id: z.string().optional(),
  tier: z.enum(["unverified", "verified", "signature"]).default("unverified"),
  published_status: z
    .enum(["draft", "pending_review", "published", "rejected", "archived"])
    .default("draft"),
  is_curated: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export type ListingFormValues = z.infer<typeof listingFormSchema>;

export const contactFormSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").or(z.literal("")),
  website: z.string().url("Invalid URL").or(z.literal("")),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  youtube: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  postcode: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const detailsFormSchema = z.record(z.string(), z.unknown());

export type DetailsFormValues = z.infer<typeof detailsFormSchema>;

export const mediaFormSchema = z.object({
  images: z.array(
    z.object({
      id: z.string().optional(),
      url: z.string(),
      alt: z.string().optional(),
      is_featured: z.boolean().default(false),
      order: z.number().default(0),
    })
  ),
});

export type MediaFormValues = z.infer<typeof mediaFormSchema>;

export const formFieldSchemas = {
  string: z.string(),
  stringOptional: z.string().optional(),
  stringNullable: z.string().nullable(),
  number: z.number(),
  numberNullable: z.number().nullable(),
  boolean: z.boolean(),
  booleanOptional: z.boolean().optional(),
} as const;

export function createOptionalStringSchema() {
  return z.string().optional();
}

export function createNullableStringSchema() {
  return z.string().nullable();
}

export function createNumberSchema() {
  return z.number();
}

export function createNumberNullableSchema() {
  return z.number().nullable();
}

export function createBooleanSchema() {
  return z.boolean();
}