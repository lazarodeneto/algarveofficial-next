import { z } from "zod";

export const TEE_TIME_STATUSES = ["new", "contacted", "sent_to_course", "closed"] as const;

export const TEE_TIME_PERIODS = ["Morning", "Midday", "Afternoon", "Flexible"] as const;

export const teeTimeRequestSchema = z
  .object({
    course_id: z.string().uuid().optional().nullable(),
    listing_id: z.string().uuid().optional().nullable(),
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().max(40).optional().nullable(),
    preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    preferred_time: z.enum(TEE_TIME_PERIODS).optional().nullable(),
    players: z.number().int().min(1).max(8).optional().nullable(),
    handicap: z.string().trim().max(80).optional().nullable(),
    message: z.string().trim().max(1500).optional().nullable(),
  })
  .refine((value) => Boolean(value.course_id || value.listing_id), {
    message: "course_id or listing_id is required.",
    path: ["course_id"],
  });

export const teeTimeStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(TEE_TIME_STATUSES),
});

export type TeeTimeRequestInput = z.infer<typeof teeTimeRequestSchema>;
export type TeeTimeStatusInput = z.infer<typeof teeTimeStatusSchema>;
