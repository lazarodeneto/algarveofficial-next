import { z } from "zod";

const optionalInput = (schema: z.ZodType<string>) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, schema.nullable()).optional();

const optionalText = (max: number) => optionalInput(z.string().max(max));
const optionalEmail = optionalInput(z.string().email().max(255));
const optionalUuid = optionalInput(z.string().uuid());

export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(255),
  phone: optionalText(80),
  message: z.string().trim().min(1).max(4000),
  listing_id: optionalUuid,
  listing_title: optionalText(180),
  agent_name: optionalText(160),
  agent_email: optionalEmail,
  visit_type: optionalText(160),
});

export interface EnquiryPayload {
  name: string;
  email: string;
  phone: string | null;
  message: string;
  listing_id: string | null;
  listing_title: string | null;
  agent_name: string | null;
  agent_email: string | null;
  visit_type: string | null;
}

export function normalizeEnquiryPayload(input: z.infer<typeof enquirySchema>): EnquiryPayload {
  return {
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    message: input.message,
    listing_id: input.listing_id ?? null,
    listing_title: input.listing_title ?? null,
    agent_name: input.agent_name ?? null,
    agent_email: input.agent_email ?? null,
    visit_type: input.visit_type ?? null,
  };
}
