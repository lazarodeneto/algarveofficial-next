import { z } from "zod";

import { optionalNullableString, stringArrayClean } from "./shared";

export const conciergeImportSchema = z.object({
  Nome: z.string().min(1),
  URL_slug: optionalNullableString,
  City: z.string().min(1),
  Region: optionalNullableString,
  Country: optionalNullableString,
  category: z.literal("concierge-services"),
  listing: z.object({
    type: optionalNullableString,
    subcategory: optionalNullableString,
  }).partial().optional(),
  details: z.object({
    title: optionalNullableString,
    description: optionalNullableString,
    target: optionalNullableString,
    price_range: optionalNullableString,
  }).partial().optional(),
  features: stringArrayClean.optional(),
  relations: z.record(z.string(), z.unknown()).optional(),
  media: z.object({
    featured_image: optionalNullableString,
  }).partial().optional(),
  seo: z.object({
    meta_title: optionalNullableString,
    meta_description: optionalNullableString,
  }).partial().optional(),
}).passthrough().superRefine((value, ctx) => {
  const type = value.listing?.type;
  const subcategory = value.listing?.subcategory;
  const title = value.details?.title;

  if (type && type !== "service") {
    ctx.addIssue({
      code: "custom",
      path: ["listing", "type"],
      message: "listing.type must be service.",
    });
  }

  if (!subcategory && !title) {
    ctx.addIssue({
      code: "custom",
      path: ["listing", "subcategory"],
      message: "listing.subcategory or details.title is required.",
    });
  }
});

export type ConciergeImportInput = z.infer<typeof conciergeImportSchema>;
