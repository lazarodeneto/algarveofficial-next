import { z } from "zod";

import {
  optionalNullableBoolean,
  optionalNullableNumber,
  optionalNullableString,
  requiredPositiveInt,
} from "./shared";

const optionalTeeNumbers = z.union([
  optionalNullableNumber,
  z.object({
    white: optionalNullableNumber,
    yellow: optionalNullableNumber,
    red: optionalNullableNumber,
  }),
]);

export const golfScorecardRowSchema = z.object({
  hole: requiredPositiveInt,
  par: requiredPositiveInt,
  hcp: optionalNullableNumber,
  white: optionalNullableNumber,
  yellow: optionalNullableNumber,
  red: optionalNullableNumber,
});

export const golfImportSchema = z.object({
  Nome: z.string().min(1),
  URL_slug: optionalNullableString,
  City: z.string().min(1),
  Region: optionalNullableString,
  Country: optionalNullableString,
  category: z.literal("golf"),
  location: z.object({
    address: optionalNullableString,
    latitude: optionalNullableNumber,
    longitude: optionalNullableNumber,
  }).partial().optional(),
  golf: z.object({
    course_type: optionalNullableString,
    holes: requiredPositiveInt,
    par: requiredPositiveInt,
    slope: optionalTeeNumbers.optional(),
    course_rating: optionalTeeNumbers.optional(),
    length_meters: optionalTeeNumbers.optional(),
    designer: optionalNullableString,
    year_opened: optionalNullableNumber,
    opened_year: optionalNullableNumber,
    last_renovation: optionalNullableNumber,
    layout_type: optionalNullableString,
    difficulty: optionalNullableString,
    is_tournament_course: optionalNullableBoolean,
    is_signature: optionalNullableBoolean,
  }),
  facilities: z.record(z.string(), optionalNullableBoolean).optional(),
  access: z.object({
    type: optionalNullableString,
    allows_visitors: optionalNullableBoolean,
    membership_required: optionalNullableBoolean,
  }).partial().optional(),
  positioning: z.record(z.string(), z.unknown()).optional(),
  media: z.object({
    featured_image: optionalNullableString,
    gallery: z.array(z.string()).optional().nullable(),
  }).partial().optional(),
  seo: z.object({
    meta_title: optionalNullableString,
    meta_description: optionalNullableString,
  }).partial().optional(),
  scorecard: z.array(golfScorecardRowSchema).nullable().optional(),
}).passthrough();

export type GolfImportInput = z.infer<typeof golfImportSchema>;
