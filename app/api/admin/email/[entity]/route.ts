import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  type AdminEmailEntity,
  isAdminEmailEntity,
  resolveAdminEmailTable,
} from "@/lib/admin/email-contract";
import { requireAdminWriteClient } from "@/lib/server/admin-auth";

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

const CONTACT_STATUSES = ["subscribed", "unsubscribed", "bounced", "complained"] as const;
const CAMPAIGN_STATUSES = ["draft", "scheduled", "sending", "sent", "paused", "cancelled"] as const;
const AUTOMATION_STATUSES = ["active", "paused", "draft"] as const;
const AUTOMATION_TRIGGERS = ["signup", "tag_added", "segment_joined", "manual", "date_based"] as const;
const TEMPLATE_CATEGORIES = ["general", "welcome", "newsletter", "promotional", "transactional"] as const;
const SEGMENT_RULE_FIELDS = ["tags", "source", "status"] as const;
const SEGMENT_RULE_OPERATORS = ["contains", "not_contains", "equals", "not_equals"] as const;

const uuidSchema = z.string().trim().uuid();
const emailSchema = z.string().trim().email().max(255).transform((value) => value.toLowerCase());
const nullableEmailSchema = z
  .union([emailSchema, z.literal(""), z.null()])
  .optional()
  .transform((value) => value || null);
const optionalNullableText = (max: number) =>
  z
    .union([z.string().trim().max(max), z.literal(""), z.null()])
    .optional()
    .transform((value) => value || null);
const optionalDateLike = z
  .union([z.string().trim().max(80), z.literal(""), z.null()])
  .optional()
  .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
    message: "Must be a valid date/time value.",
  })
  .transform((value) => value || null);
const stringArraySchema = z.array(z.string().trim().min(1).max(100)).max(100);
const jsonObjectSchema = z.record(z.string(), z.unknown());

function getAllowedSenderDomains() {
  const configured = process.env.RESEND_ALLOWED_SENDER_DOMAINS
    ?? process.env.EMAIL_ALLOWED_SENDER_DOMAINS
    ?? "algarveofficial.com";

  return configured
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedSenderEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;

  return getAllowedSenderDomains().some((allowedDomain) => (
    domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
  ));
}

const senderEmailSchema = emailSchema.refine(isAllowedSenderEmail, {
  message: "Campaign sender must use a verified AlgarveOfficial sending domain.",
});

function containsUnsafeEmailHtml(value: string) {
  return /<\s*script\b/i.test(value) || /\son[a-z]+\s*=/i.test(value) || /javascript\s*:/i.test(value);
}

function hasUnsubscribePlaceholder(value: string | null | undefined) {
  if (!value) return false;
  return /unsubscribe/i.test(value) || /\{\{\s*unsubscribe_url\s*\}\}/i.test(value);
}

const templateBaseSchema = z.object({
  name: z.string().trim().min(1).max(160),
  subject: z.string().trim().min(1).max(240),
  html_content: z.string().trim().min(1).max(200_000).refine((value) => !containsUnsafeEmailHtml(value), {
    message: "Template HTML cannot contain scripts, event handlers, or javascript: URLs.",
  }),
  text_content: optionalNullableText(100_000),
  category: z.enum(TEMPLATE_CATEGORIES).default("general"),
  variables: stringArraySchema.default([]),
  is_active: z.boolean().optional(),
});

function enforceMarketingUnsubscribe(
  value: { category?: string; html_content?: string; text_content?: string | null },
  context: z.RefinementCtx,
) {
  if (
    (value.category === "newsletter" || value.category === "promotional")
    && !hasUnsubscribePlaceholder(value.html_content)
    && !hasUnsubscribePlaceholder(value.text_content)
  ) {
    context.addIssue({
      code: "custom",
      path: ["html_content"],
      message: "Marketing templates must include an unsubscribe link or {{unsubscribe_url}} placeholder.",
    });
  }
}

const templateSchema = templateBaseSchema.strict().superRefine(enforceMarketingUnsubscribe);
const templatePatchSchema = templateBaseSchema.partial().strict().superRefine(enforceMarketingUnsubscribe);

const segmentRuleSchema = z.object({
  field: z.enum(SEGMENT_RULE_FIELDS),
  operator: z.enum(SEGMENT_RULE_OPERATORS),
  value: z.string().trim().min(1).max(160),
}).strict();

const segmentSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: optionalNullableText(1000),
  rules: z.array(segmentRuleSchema).max(50).default([]),
  contact_count: z.number().int().min(0).optional(),
  is_dynamic: z.boolean().default(true),
}).strict();
const segmentPatchSchema = segmentSchema.partial();

const campaignSchema = z.object({
  name: z.string().trim().min(1).max(160),
  subject: z.string().trim().min(1).max(240),
  from_name: z.string().trim().min(1).max(120).default("AlgarveOfficial"),
  from_email: senderEmailSchema,
  reply_to: nullableEmailSchema,
  template_id: uuidSchema.nullable().optional(),
  segment_id: uuidSchema.nullable().optional(),
  scheduled_at: optionalDateLike,
  status: z.enum(CAMPAIGN_STATUSES).default("draft"),
}).strict();
const campaignPatchSchema = campaignSchema.partial();

const contactBaseSchema = z.object({
  email: emailSchema,
  full_name: optionalNullableText(160),
  user_id: uuidSchema.nullable().optional(),
  status: z.enum(CONTACT_STATUSES).default("subscribed"),
  tags: stringArraySchema.default([]),
  preferences: jsonObjectSchema.default({}),
  source: optionalNullableText(120),
  consent_given_at: optionalDateLike,
});

function enforceSubscribedConsent(
  value: { status?: string; consent_given_at?: string | null },
  context: z.RefinementCtx,
) {
  if (value.status === "subscribed" && !value.consent_given_at) {
    context.addIssue({
      code: "custom",
      path: ["consent_given_at"],
      message: "Subscribed marketing contacts require a recorded consent timestamp.",
    });
  }
}

const contactSchema = contactBaseSchema.strict().superRefine(enforceSubscribedConsent);
const contactPatchSchema = contactBaseSchema.partial().strict().superRefine(enforceSubscribedConsent);

const automationSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: optionalNullableText(1000),
  trigger_type: z.enum(AUTOMATION_TRIGGERS),
  trigger_config: jsonObjectSchema.default({}),
  steps: z.array(z.unknown()).max(100).default([]),
  status: z.enum(AUTOMATION_STATUSES).default("draft"),
}).strict();
const automationPatchSchema = automationSchema.partial();

const entityCreateSchemas = {
  templates: templateSchema,
  segments: segmentSchema,
  campaigns: campaignSchema,
  contacts: contactSchema,
  automations: automationSchema,
} as const;

const entityPatchSchemas = {
  templates: templatePatchSchema,
  segments: segmentPatchSchema,
  campaigns: campaignPatchSchema,
  contacts: contactPatchSchema,
  automations: automationPatchSchema,
} as const;

async function resolveEntity(context: { params: Promise<{ entity: string }> }) {
  const { entity } = await context.params;
  if (!isAdminEmailEntity(entity)) {
    return { error: errorResponse(404, "ENTITY_NOT_FOUND", "Unknown email admin entity.") };
  }
  return { entity, table: resolveAdminEmailTable(entity) };
}

function sanitizePayload(payload: Record<string, unknown>) {
  const next = { ...payload };
  delete next.id;
  delete next.created_at;
  delete next.updated_at;
  delete next.created_by;
  return next;
}

function validatePayload(
  entity: AdminEmailEntity,
  payload: Record<string, unknown>,
  method: "POST" | "PATCH",
) {
  const schema = method === "PATCH" ? entityPatchSchemas[entity] : entityCreateSchemas[entity];
  const result = schema.safeParse(payload);

  if (result.success) {
    return { payload: result.data as Record<string, unknown> };
  }

  return {
    error: errorResponse(
      400,
      "EMAIL_PAYLOAD_VALIDATION_ERROR",
      result.error.issues[0]?.message || "Invalid email admin payload.",
    ),
  };
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ entity: string }> },
) {
  const resolved = await resolveEntity(context);
  if ("error" in resolved) return resolved.error;

  const auth = await requireAdminWriteClient(
    request,
    "Only admins can create email admin records.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin email writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const payload = (body as Record<string, unknown> | null) ?? null;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return errorResponse(400, "INVALID_PAYLOAD", "Missing email payload.");
  }

  const sanitizedPayload = sanitizePayload(payload);
  const validation = validatePayload(resolved.entity, sanitizedPayload, "POST");
  if ("error" in validation) return validation.error;

  const insertPayload = validation.payload;
  if (
    resolved.entity === "templates" ||
    resolved.entity === "segments" ||
    resolved.entity === "campaigns"
  ) {
    insertPayload.created_by = auth.userId;
  }

  const { data, error } = await auth.writeClient
    .from(resolved.table as never)
    .insert(insertPayload as never)
    .select("*")
    .single();

  if (error) {
    return errorResponse(500, "EMAIL_CREATE_FAILED", error.message || "Failed to create email record.");
  }

  return NextResponse.json({ ok: true, data });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ entity: string }> },
) {
  const resolved = await resolveEntity(context);
  if ("error" in resolved) return resolved.error;

  const auth = await requireAdminWriteClient(
    request,
    "Only admins can update email admin records.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin email writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const payload = (body as Record<string, unknown> | null) ?? null;
  const id = typeof payload?.id === "string" ? payload.id.trim() : "";
  if (!id) {
    return errorResponse(400, "INVALID_ITEM_ID", "Email record id is required.");
  }

  const sanitizedPayload = sanitizePayload(payload ?? {});
  const validation = validatePayload(resolved.entity, sanitizedPayload, "PATCH");
  if ("error" in validation) return validation.error;

  const updates = validation.payload;
  const { data, error } = await auth.writeClient
    .from(resolved.table as never)
    .update(updates as never)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return errorResponse(500, "EMAIL_UPDATE_FAILED", error.message || "Failed to update email record.");
  }

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ entity: string }> },
) {
  const resolved = await resolveEntity(context);
  if ("error" in resolved) return resolved.error;

  const auth = await requireAdminWriteClient(
    request,
    "Only admins can delete email admin records.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin email writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const id = typeof (body as { id?: unknown })?.id === "string"
    ? ((body as { id: string }).id.trim())
    : "";
  if (!id) {
    return errorResponse(400, "INVALID_ITEM_ID", "Email record id is required.");
  }

  const { error } = await auth.writeClient
    .from(resolved.table as never)
    .delete()
    .eq("id", id);

  if (error) {
    return errorResponse(500, "EMAIL_DELETE_FAILED", error.message || "Failed to delete email record.");
  }

  return NextResponse.json({ ok: true });
}
