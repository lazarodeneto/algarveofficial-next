import { z } from "zod";

import { optionalNullableNumber, optionalNullableString, stringArrayClean } from "./shared";

export const propertyImportSchema = z.object({
  Nome: z.string().min(1),
  URL_slug: optionalNullableString,
  City: z.string().min(1),
  Region: optionalNullableString,
  Country: optionalNullableString,
  category: z.string().min(1),
  property: z.object({
    type: optionalNullableString,
    property_type: optionalNullableString,
    transaction_type: optionalNullableString,
    price_eur: optionalNullableNumber,
    price: optionalNullableNumber,
    bedrooms: optionalNullableNumber,
    bathrooms: optionalNullableNumber,
    living_area_m2: optionalNullableNumber,
    plot_size_m2: optionalNullableNumber,
    plot_area_m2: optionalNullableNumber,
    energy_rating: optionalNullableString,
    energy_certificate: optionalNullableString,
    features: stringArrayClean.optional(),
  }).passthrough(),
  media: z.object({
    featured_image: optionalNullableString,
  }).partial().optional(),
  seo: z.object({
    meta_title: optionalNullableString,
    meta_description: optionalNullableString,
  }).partial().optional(),
}).passthrough();

export type PropertyImportInput = z.infer<typeof propertyImportSchema>;
