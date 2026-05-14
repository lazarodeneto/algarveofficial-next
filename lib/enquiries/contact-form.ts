import { z } from "zod";

import {
  ENQUIRY_LIMITS,
  ENQUIRY_VALIDATION_MESSAGES,
  enquirySchema,
  normalizeEnquiryPayload,
  type EnquiryPayload,
} from "./schema";

export const CONTACT_FORM_LIMITS = {
  subjectMax: 180,
  messageMax: ENQUIRY_LIMITS.messageMax,
} as const;

export const CONTACT_FORM_VALIDATION_MESSAGES = {
  ...ENQUIRY_VALIDATION_MESSAGES,
  subjectRequired: "Subject is required.",
  subjectMax: "Subject must be 180 characters or less.",
} as const;

export type ContactFormField = "name" | "email" | "subject" | "message";

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ContactFormFieldErrors = Partial<Record<ContactFormField, string>>;

export type ContactFormValidationResult =
  | { success: true; data: ContactFormData; fieldErrors: ContactFormFieldErrors }
  | { success: false; fieldErrors: ContactFormFieldErrors };

export function buildContactFormMessage(subject: string, message: string) {
  return `Subject: ${subject.trim()}\n\n${message.trim()}`;
}

const contactFormSchema = z.object({
  name: z.string()
    .trim()
    .min(ENQUIRY_LIMITS.nameMin, CONTACT_FORM_VALIDATION_MESSAGES.nameMin)
    .max(ENQUIRY_LIMITS.nameMax, CONTACT_FORM_VALIDATION_MESSAGES.nameMax),
  email: z.string()
    .trim()
    .email(CONTACT_FORM_VALIDATION_MESSAGES.email)
    .max(ENQUIRY_LIMITS.emailMax, CONTACT_FORM_VALIDATION_MESSAGES.emailMax),
  subject: z.string()
    .trim()
    .min(1, CONTACT_FORM_VALIDATION_MESSAGES.subjectRequired)
    .max(CONTACT_FORM_LIMITS.subjectMax, CONTACT_FORM_VALIDATION_MESSAGES.subjectMax),
  message: z.string()
    .trim()
    .min(1, CONTACT_FORM_VALIDATION_MESSAGES.messageRequired),
}).superRefine((data, ctx) => {
  if (buildContactFormMessage(data.subject, data.message).length > CONTACT_FORM_LIMITS.messageMax) {
    ctx.addIssue({
      code: "custom",
      message: CONTACT_FORM_VALIDATION_MESSAGES.messageMax,
      path: ["message"],
    });
  }
});

function firstFieldErrors(flattenedErrors: z.inferFlattenedErrors<typeof contactFormSchema>) {
  const fieldErrors: ContactFormFieldErrors = {};

  for (const field of ["name", "email", "subject", "message"] as const) {
    const message = flattenedErrors.fieldErrors[field]?.[0];
    if (message) fieldErrors[field] = message;
  }

  return fieldErrors;
}

export function validateContactFormData(input: ContactFormData): ContactFormValidationResult {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: firstFieldErrors(parsed.error.flatten()),
    };
  }

  return {
    success: true,
    data: parsed.data,
    fieldErrors: {},
  };
}

export function toContactEnquiryPayload(input: ContactFormData): EnquiryPayload {
  const parsed = contactFormSchema.parse(input);
  const enquiryPayload = enquirySchema.parse({
    name: parsed.name,
    email: parsed.email,
    message: buildContactFormMessage(parsed.subject, parsed.message),
    listing_title: "Website Contact Form",
  });

  return normalizeEnquiryPayload(enquiryPayload);
}
