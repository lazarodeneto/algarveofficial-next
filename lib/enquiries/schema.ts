import { z } from "zod";

const optionalInput = (schema: z.ZodType<string>) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, schema.nullable()).optional();

export const ENQUIRY_LIMITS = {
  nameMin: 2,
  nameMax: 160,
  emailMax: 255,
  phoneMax: 80,
  messageMin: 1,
  messageMax: 4000,
  listingTitleMax: 180,
  agentNameMax: 160,
  visitTypeMax: 160,
} as const;

export const ENQUIRY_VALIDATION_MESSAGES = {
  nameMin: "Name must be at least 2 characters.",
  nameMax: "Name must be 160 characters or less.",
  email: "Enter a valid email address.",
  emailMax: "Email must be 255 characters or less.",
  phoneMax: "Phone must be 80 characters or less.",
  messageRequired: "Message is required.",
  messageMax: "Message must be 4000 characters or less.",
  listingId: "Listing ID must be a valid UUID.",
  listingTitleMax: "Listing title must be 180 characters or less.",
  agentNameMax: "Agent name must be 160 characters or less.",
  visitTypeMax: "Visit context must be 160 characters or less.",
} as const;

const optionalText = (max: number, message: string) =>
  optionalInput(z.string().max(max, message));
const optionalEmail = optionalInput(
  z.string()
    .email(ENQUIRY_VALIDATION_MESSAGES.email)
    .max(ENQUIRY_LIMITS.emailMax, ENQUIRY_VALIDATION_MESSAGES.emailMax),
);

export const enquirySchema = z.object({
  name: z.string()
    .trim()
    .min(ENQUIRY_LIMITS.nameMin, ENQUIRY_VALIDATION_MESSAGES.nameMin)
    .max(ENQUIRY_LIMITS.nameMax, ENQUIRY_VALIDATION_MESSAGES.nameMax),
  email: z.string()
    .trim()
    .email(ENQUIRY_VALIDATION_MESSAGES.email)
    .max(ENQUIRY_LIMITS.emailMax, ENQUIRY_VALIDATION_MESSAGES.emailMax),
  phone: optionalText(ENQUIRY_LIMITS.phoneMax, ENQUIRY_VALIDATION_MESSAGES.phoneMax),
  message: z.string()
    .trim()
    .min(ENQUIRY_LIMITS.messageMin, ENQUIRY_VALIDATION_MESSAGES.messageRequired)
    .max(ENQUIRY_LIMITS.messageMax, ENQUIRY_VALIDATION_MESSAGES.messageMax),
  listing_id: optionalInput(z.string().uuid(ENQUIRY_VALIDATION_MESSAGES.listingId)),
  listing_title: optionalText(ENQUIRY_LIMITS.listingTitleMax, ENQUIRY_VALIDATION_MESSAGES.listingTitleMax),
  agent_name: optionalText(ENQUIRY_LIMITS.agentNameMax, ENQUIRY_VALIDATION_MESSAGES.agentNameMax),
  agent_email: optionalEmail,
  visit_type: optionalText(ENQUIRY_LIMITS.visitTypeMax, ENQUIRY_VALIDATION_MESSAGES.visitTypeMax),
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
