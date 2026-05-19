import { NextResponse } from "next/server";
import { z } from "zod";

export const crmStageValues = ["new_lead", "contacted", "planning", "booked", "won", "lost"] as const;
export const crmTaskStatusValues = ["open", "completed", "cancelled"] as const;
export const crmTaskPriorityValues = ["low", "normal", "high", "urgent"] as const;
export const crmActivityTypeValues = [
  "message_received",
  "message_sent",
  "whatsapp_clicked",
  "inquiry_submitted",
  "listing_viewed",
  "listing_saved",
  "task_created",
  "task_completed",
  "opportunity_stage_changed",
  "manual_note",
  "billing_event",
  "listing_change_request",
] as const;

const optionalUuid = z.string().uuid().optional().nullable();
const metadataSchema = z.record(z.string(), z.unknown()).optional().default({});

export const crmContactWriteSchema = z.object({
  primary_listing_id: optionalUuid,
  display_name: z.string().trim().max(160).optional().nullable(),
  first_name: z.string().trim().max(100).optional().nullable(),
  last_name: z.string().trim().max(100).optional().nullable(),
  company_name: z.string().trim().max(160).optional().nullable(),
  email: z.string().trim().email().optional().nullable().or(z.literal("")),
  phone: z.string().trim().max(80).optional().nullable(),
  country_code: z.string().trim().max(12).optional().nullable(),
  source: z.string().trim().max(80).optional().default("manual"),
  status: z.enum(["active", "archived"]).optional().default("active"),
  metadata: metadataSchema,
});

export const crmContactPatchSchema = crmContactWriteSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one contact field is required.",
});

export const crmOpportunityWriteSchema = z.object({
  contact_id: z.string().uuid(),
  listing_id: optionalUuid,
  thread_id: optionalUuid,
  stage: z.enum(crmStageValues).optional().default("new_lead"),
  title: z.string().trim().max(200).optional().nullable(),
  estimated_value_cents: z.number().int().min(0).optional().nullable(),
  currency: z.string().trim().length(3).optional().default("EUR"),
  probability: z.number().int().min(0).max(100).optional().nullable(),
  expected_close_at: z.string().date().optional().nullable(),
  lost_reason: z.string().trim().max(500).optional().nullable(),
  metadata: metadataSchema,
});

export const crmOpportunityPatchSchema = crmOpportunityWriteSchema.omit({ contact_id: true }).partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one opportunity field is required." },
);

export const crmTaskWriteSchema = z.object({
  contact_id: optionalUuid,
  opportunity_id: optionalUuid,
  listing_id: optionalUuid,
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(crmTaskStatusValues).optional().default("open"),
  priority: z.enum(crmTaskPriorityValues).optional().default("normal"),
  due_at: z.string().datetime().optional().nullable(),
});

export const crmTaskPatchSchema = crmTaskWriteSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one task field is required.",
});

export const crmActivityWriteSchema = z.object({
  contact_id: optionalUuid,
  opportunity_id: optionalUuid,
  listing_id: optionalUuid,
  thread_id: optionalUuid,
  event_type: z.enum(crmActivityTypeValues).optional().default("manual_note"),
  source_table: z.string().trim().max(120).optional().nullable(),
  source_record_id: z.string().trim().max(240).optional().nullable(),
  summary: z.string().trim().min(1).max(1000),
  occurred_at: z.string().datetime().optional().nullable(),
  metadata: metadataSchema,
});

export const crmListQuerySchema = z.object({
  search: z.string().trim().max(120).optional().nullable(),
  listing_id: z.string().uuid().optional().nullable(),
  contact_id: z.string().uuid().optional().nullable(),
  stage: z.enum(crmStageValues).optional().nullable(),
  status: z.string().trim().max(40).optional().nullable(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export function crmErrorPayload(code: string, message: string, details?: unknown) {
  return {
    error: {
      code,
      message,
      details: details ?? null,
    },
  };
}

export function crmError(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json(crmErrorPayload(code, message, details), { status });
}

export const privateNoStoreHeaders = { "Cache-Control": "private, no-store" };

export function normalizeEmail(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized || null;
}

export function normalizePhone(value: string | null | undefined) {
  const normalized = value?.trim().replace(/[^0-9+]/g, "");
  return normalized || null;
}

export function nullableText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized || null;
}

export async function assertOwnerListing(client: any, ownerId: string, listingId: string | null | undefined) {
  if (!listingId) return;
  const { data, error } = await client
    .from("listings")
    .select("id")
    .eq("id", listingId)
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw Object.assign(new Error("Listing does not belong to this owner."), { status: 403, code: "LISTING_FORBIDDEN" });
}

export async function assertOwnerContact(client: any, ownerId: string, contactId: string | null | undefined) {
  if (!contactId) return;
  const { data, error } = await client
    .from("crm_contacts")
    .select("id")
    .eq("id", contactId)
    .eq("owner_id", ownerId)
    .is("archived_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw Object.assign(new Error("Contact does not belong to this owner."), { status: 403, code: "CONTACT_FORBIDDEN" });
}

export async function assertOwnerOpportunity(client: any, ownerId: string, opportunityId: string | null | undefined) {
  if (!opportunityId) return;
  const { data, error } = await client
    .from("crm_opportunities")
    .select("id")
    .eq("id", opportunityId)
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    throw Object.assign(new Error("Opportunity does not belong to this owner."), {
      status: 403,
      code: "OPPORTUNITY_FORBIDDEN",
    });
  }
}

export async function assertOwnerThread(client: any, ownerId: string, threadId: string | null | undefined) {
  if (!threadId) return;
  const { data, error } = await client
    .from("chat_threads")
    .select("id")
    .eq("id", threadId)
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw Object.assign(new Error("Thread does not belong to this owner."), { status: 403, code: "THREAD_FORBIDDEN" });
}

export function crmCatch(error: unknown, fallbackCode: string, fallbackMessage: string) {
  const typed = error as { status?: number; code?: string; message?: string };
  return crmError(typed.status ?? 500, typed.code ?? fallbackCode, typed.message ?? fallbackMessage);
}

export function toContact(row: any) {
  return {
    id: row.id,
    owner_id: row.owner_id,
    viewer_id: row.viewer_id,
    primary_listing_id: row.primary_listing_id,
    display_name: row.display_name,
    first_name: row.first_name,
    last_name: row.last_name,
    company_name: row.company_name,
    email: row.email,
    phone: row.phone,
    country_code: row.country_code,
    source: row.source,
    status: row.status,
    last_contacted_at: row.last_contacted_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    archived_at: row.archived_at,
    metadata: row.metadata ?? {},
    listing: row.listing ?? null,
  };
}

export function toOpportunity(row: any) {
  return {
    id: row.id,
    owner_id: row.owner_id,
    contact_id: row.contact_id,
    listing_id: row.listing_id,
    thread_id: row.thread_id,
    stage: row.stage,
    title: row.title,
    estimated_value_cents: row.estimated_value_cents,
    currency: row.currency ?? "EUR",
    probability: row.probability,
    expected_close_at: row.expected_close_at,
    won_at: row.won_at,
    lost_at: row.lost_at,
    lost_reason: row.lost_reason,
    created_at: row.created_at,
    updated_at: row.updated_at,
    metadata: row.metadata ?? {},
    contact: row.contact ?? null,
    listing: row.listing ?? null,
  };
}

export function toTask(row: any) {
  return {
    id: row.id,
    owner_id: row.owner_id,
    contact_id: row.contact_id,
    opportunity_id: row.opportunity_id,
    listing_id: row.listing_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    due_at: row.due_at,
    completed_at: row.completed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    contact: row.contact ?? null,
    opportunity: row.opportunity ?? null,
    listing: row.listing ?? null,
  };
}

export function toActivity(row: any) {
  return {
    id: row.id,
    owner_id: row.owner_id,
    contact_id: row.contact_id,
    opportunity_id: row.opportunity_id,
    listing_id: row.listing_id,
    thread_id: row.thread_id,
    event_type: row.event_type,
    source_table: row.source_table,
    source_record_id: row.source_record_id,
    summary: row.summary,
    occurred_at: row.occurred_at,
    created_at: row.created_at,
    metadata: row.metadata ?? {},
    contact: row.contact ?? null,
    opportunity: row.opportunity ?? null,
    listing: row.listing ?? null,
  };
}
