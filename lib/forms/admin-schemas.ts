import { z } from "zod";

// ──────────────────────────────────────────────────────────────────────────────
// TAXONOMY (cities, categories, regions)
// ──────────────────────────────────────────────────────────────────────────────

export const taxonomyItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  display_order: z.number().int().optional(),
  is_visible_destinations: z.boolean().optional(),
  is_visible_directory: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export const taxonomyUpdateSchema = taxonomyItemSchema.partial();

export type TaxonomyItem = z.infer<typeof taxonomyItemSchema>;
export type TaxonomyUpdate = z.infer<typeof taxonomyUpdateSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// MEDIA LIBRARY
// ──────────────────────────────────────────────────────────────────────────────

export const mediaItemSchema = z.object({
  file_name: z.string().min(1, "file_name is required"),
  file_url: z.string().url("Valid URL required"),
  file_type: z.enum(["image", "video"]),
  file_size: z.number().int().positive().optional(),
  mime_type: z.string().optional(),
  alt_text: z.string().nullable().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export type MediaItem = z.infer<typeof mediaItemSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// NAVIGATION / FOOTER
// ──────────────────────────────────────────────────────────────────────────────

export const navItemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().min(1, "URL is required"),
  open_in_new_tab: z.boolean().optional(),
  display_order: z.number().int().optional(),
  is_visible: z.boolean().optional(),
  parent_id: z.string().uuid().nullable().optional(),
});

export const footerItemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().nullable().optional(),
  display_order: z.number().int().optional(),
  is_visible: z.boolean().optional(),
});

export type NavItem = z.infer<typeof navItemSchema>;
export type FooterItem = z.infer<typeof footerItemSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// PRICING / PROMOTIONS
// ──────────────────────────────────────────────────────────────────────────────

export const pricingTierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().nullable().optional(),
  monthly_price_cents: z.number().int().min(0),
  yearly_price_cents: z.number().int().min(0),
  display_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
  features: z.array(z.string()).optional(),
});

export const promotionSchema = z.object({
  code: z.string().min(1, "Code is required").max(50),
  description: z.string().nullable().optional(),
  discount_percent: z.number().int().min(0).max(100),
  max_uses: z.number().int().positive().nullable().optional(),
  starts_at: z.string().optional(),
  expires_at: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type PricingTier = z.infer<typeof pricingTierSchema>;
export type Promotion = z.infer<typeof promotionSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// LISTINGS BULK OPERATIONS
// ──────────────────────────────────────────────────────────────────────────────

export const bulkTierUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "At least one ID required"),
  tier: z.enum(["unverified", "verified", "signature"]),
});

export const bulkStatusUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "At least one ID required"),
  status: z.enum(["published", "draft", "archived"]),
});

export type BulkTierUpdate = z.infer<typeof bulkTierUpdateSchema>;
export type BulkStatusUpdate = z.infer<typeof bulkStatusUpdateSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// SETTINGS
// ──────────────────────────────────────────────────────────────────────────────

export const settingSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
  description: z.string().nullable().optional(),
});

export type Setting = z.infer<typeof settingSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// CMS DOCUMENTS
// ──────────────────────────────────────────────────────────────────────────────

export const cmsDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().nullable().optional(),
  doc_type: z.enum(["page", "post", "faq", "legal"]),
  is_published: z.boolean().optional(),
  published_at: z.string().nullable().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
});

export type CmsDocument = z.infer<typeof cmsDocumentSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// CURATED ASSIGNMENTS
// ──────────────────────────────────────────────────────────────────────────────

export const curatedAssignmentSchema = z.object({
  listing_id: z.string().uuid(),
  curated_section_id: z.string().uuid(),
  display_order: z.number().int().optional(),
  is_featured: z.boolean().optional(),
});

export const curatedSectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().nullable().optional(),
  display_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export type CuratedAssignment = z.infer<typeof curatedAssignmentSchema>;
export type CuratedSection = z.infer<typeof curatedSectionSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// EMAIL TEMPLATES
// ──────────────────────────────────────────────────────────────────────────────

export const emailTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  category: z.enum(["transactional", "marketing", "automation"]),
  is_active: z.boolean().optional(),
});

export type EmailTemplate = z.infer<typeof emailTemplateSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// GLOBAL SETTINGS
// ──────────────────────────────────────────────────────────────────────────────

export const globalSettingsSchema = z.record(z.string(), z.unknown());

// ──────────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT
// ──────────────────────────────────────────────────────────────────────────────

export const userUpdateSchema = z.object({
  fullName: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  role: z.enum(["admin", "editor", "owner", "viewer_logged"]).optional(),
});

export type UserUpdate = z.infer<typeof userUpdateSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// LISTING SINGLE UPDATE
// ──────────────────────────────────────────────────────────────────────────────

export const listingUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  short_description: z.string().min(1).optional(),
  full_description: z.string().nullable().optional(),
  category_id: z.string().min(1).optional(),
  city_id: z.string().min(1).optional(),
  luxury_region_id: z.string().optional(),
  tier: z.enum(["unverified", "verified", "signature"]).optional(),
  status: z.enum(["draft", "pending_review", "published", "rejected", "archived"]).optional(),
  is_curated: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  website: z.string().url().nullable().optional(),
  address: z.string().nullable().optional(),
  postcode: z.string().nullable().optional(),
  instagram: z.string().url().nullable().optional(),
  facebook: z.string().url().nullable().optional(),
  linkedin: z.string().url().nullable().optional(),
  youtube: z.string().url().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  google_business: z.string().url().nullable().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  og_title: z.string().nullable().optional(),
  og_description: z.string().nullable().optional(),
  og_image: z.string().url().nullable().optional(),
  canonical_url: z.string().url().nullable().optional(),
  focus_keywords: z.string().nullable().optional(),
  no_index: z.boolean().optional(),
  no_follow: z.boolean().optional(),
  admin_notes: z.string().nullable().optional(),
});

export type ListingUpdate = z.infer<typeof listingUpdateSchema>;