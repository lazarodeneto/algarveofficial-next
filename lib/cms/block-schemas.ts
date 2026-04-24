import { z } from "zod";

export const CmsHeroSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  mediaType: z.enum(["image", "video", "youtube"]).default("image"),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  posterUrl: z.string().optional(),
  alt: z.string().optional(),
  badge: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  ctaPrimary: z.string().optional(),
  ctaSecondary: z.string().optional(),
});

export type CmsHeroSettings = z.infer<typeof CmsHeroSettingsSchema>;

export const CmsBlockSettingsSchema = z.record(z.string(), z.unknown());

export type CmsBlockSettings = z.infer<typeof CmsBlockSettingsSchema>;

export const CmsBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  enabled: z.boolean().default(true),
  order: z.number().default(0),
  settings: CmsBlockSettingsSchema.optional(),
});

export type CmsBlock = z.infer<typeof CmsBlockSchema>;

export const CmsPageConfigSchema = z.object({
  hero: CmsHeroSettingsSchema.optional(),
  blocks: z.array(CmsBlockSchema).default([]),
  meta: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
});

export type CmsPageConfig = z.infer<typeof CmsPageConfigSchema>;

export const SUPPORTED_BLOCK_TYPES = [
  "hero",
  "featured-listings",
  "categories-grid",
  "cities-grid",
  "cta",
  "editorial-text",
  "image-gallery",
  "faq",
  "courses-grid",
  "golf-leaderboard",
  "regions-grid",
] as const;

export type SupportedBlockType = (typeof SUPPORTED_BLOCK_TYPES)[number];

export function isSupportedBlockType(type: string): type is SupportedBlockType {
  return SUPPORTED_BLOCK_TYPES.includes(type as SupportedBlockType);
}

export function getDefaultBlockSettings(
  type: SupportedBlockType
): CmsBlockSettings {
  switch (type) {
    case "featured-listings":
      return {
        title: "Featured Listings",
        subtitle: "Curated recommendations",
        layout: "grid",
        limit: 6,
      };
    case "categories-grid":
      return {
        title: "Browse by Category",
        subtitle: "Find exactly what you need",
        layout: "grid",
      };
    case "cities-grid":
      return {
        title: "Explore by City",
        subtitle: "Discover locations",
        layout: "cards",
      };
    case "cta":
      return {
        title: "Ready to get started?",
        description: "Take the first step toward your perfect property",
        primaryLabel: "Contact Us",
        primaryHref: "/contact",
        secondaryLabel: "Learn More",
        secondaryHref: "/about-us",
      };
    case "editorial-text":
      return {
        content: "",
        alignment: "center",
      };
    case "image-gallery":
      return {
        title: "Gallery",
        images: [],
        layout: "masonry",
      };
    case "faq":
      return {
        title: "Frequently Asked Questions",
        items: [],
      };
    case "courses-grid":
      return {
        title: "All Golf Courses",
        limit: 12,
      };
    case "golf-leaderboard":
      return {};
    case "regions-grid":
      return {
        title: "Golf Regions",
        subtitle: "Explore by region",
      };
    default:
      return {};
  }
}