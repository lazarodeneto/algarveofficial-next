import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  assertOwnerListing,
  crmCatch,
  crmContactPatchSchema,
  crmError,
  nullableText,
  normalizeEmail,
  normalizePhone,
  privateNoStoreHeaders,
  toContact,
} from "@/lib/owner-crm/server";
import { requireAuthenticatedOwner } from "@/lib/server/owner-auth";
import { enforceWriteRateLimit } from "@/lib/server/write-rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const paramsSchema = z.object({ contactId: z.string().uuid() });

export async function GET(request: NextRequest, { params }: { params: Promise<{ contactId: string }> }) {
  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return crmError(403, "OWNER_REQUIRED", "Owner access required.");

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) return crmError(400, "CRM_CONTACT_ID_INVALID", "A valid contact id is required.");

  const client = createServiceRoleClient();
  if (!client) return crmError(503, "SERVICE_UNAVAILABLE", "CRM storage is not configured.");

  try {
    const { data, error } = await (client as any)
      .from("crm_contacts")
      .select("*, listing:listings!crm_contacts_primary_listing_id_fkey(id,name,slug,featured_image_url)")
      .eq("id", parsedParams.data.contactId)
      .eq("owner_id", auth.userId)
      .is("archived_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!data) return crmError(404, "CRM_CONTACT_NOT_FOUND", "Contact not found.");
    return NextResponse.json({ contact: toContact(data) }, { headers: privateNoStoreHeaders });
  } catch (error) {
    return crmCatch(error, "CRM_CONTACT_LOOKUP_FAILED", "Failed to load contact.");
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ contactId: string }> }) {
  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return crmError(403, "OWNER_REQUIRED", "Owner access required.");

  const rateLimited = await enforceWriteRateLimit({
    request,
    scope: "owner-crm:contacts:update",
    email: auth.email,
    maxAttempts: 60,
    windowSeconds: 60,
  });
  if (rateLimited) return rateLimited;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) return crmError(400, "CRM_CONTACT_ID_INVALID", "A valid contact id is required.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return crmError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsed = crmContactPatchSchema.safeParse(body);
  if (!parsed.success) return crmError(400, "CRM_CONTACT_VALIDATION_ERROR", "Invalid contact payload.", parsed.error.flatten());

  const client = createServiceRoleClient();
  if (!client) return crmError(503, "SERVICE_UNAVAILABLE", "CRM storage is not configured.");

  try {
    await assertOwnerListing(client as any, auth.userId, parsed.data.primary_listing_id);
    const updatePayload: Record<string, unknown> = {};
    if (parsed.data.primary_listing_id !== undefined) updatePayload.primary_listing_id = parsed.data.primary_listing_id ?? null;
    if (parsed.data.display_name !== undefined) updatePayload.display_name = nullableText(parsed.data.display_name);
    if (parsed.data.first_name !== undefined) updatePayload.first_name = nullableText(parsed.data.first_name);
    if (parsed.data.last_name !== undefined) updatePayload.last_name = nullableText(parsed.data.last_name);
    if (parsed.data.company_name !== undefined) updatePayload.company_name = nullableText(parsed.data.company_name);
    if (parsed.data.email !== undefined) {
      updatePayload.email = nullableText(parsed.data.email);
      updatePayload.normalized_email = normalizeEmail(parsed.data.email);
    }
    if (parsed.data.phone !== undefined) {
      updatePayload.phone = nullableText(parsed.data.phone);
      updatePayload.normalized_phone = normalizePhone(parsed.data.phone);
    }
    if (parsed.data.country_code !== undefined) updatePayload.country_code = nullableText(parsed.data.country_code);
    if (parsed.data.source !== undefined) updatePayload.source = nullableText(parsed.data.source) ?? "manual";
    if (parsed.data.status !== undefined) updatePayload.status = parsed.data.status;
    if (parsed.data.metadata !== undefined) updatePayload.metadata = parsed.data.metadata;

    const { data, error } = await (client as any)
      .from("crm_contacts")
      .update(updatePayload)
      .eq("id", parsedParams.data.contactId)
      .eq("owner_id", auth.userId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!data) return crmError(404, "CRM_CONTACT_NOT_FOUND", "Contact not found.");
    return NextResponse.json({ contact: toContact(data) }, { headers: privateNoStoreHeaders });
  } catch (error) {
    return crmCatch(error, "CRM_CONTACT_UPDATE_FAILED", "Failed to update contact.");
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ contactId: string }> }) {
  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return crmError(403, "OWNER_REQUIRED", "Owner access required.");

  const rateLimited = await enforceWriteRateLimit({
    request,
    scope: "owner-crm:contacts:archive",
    email: auth.email,
    maxAttempts: 30,
    windowSeconds: 60,
  });
  if (rateLimited) return rateLimited;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) return crmError(400, "CRM_CONTACT_ID_INVALID", "A valid contact id is required.");

  const client = createServiceRoleClient();
  if (!client) return crmError(503, "SERVICE_UNAVAILABLE", "CRM storage is not configured.");

  try {
    const { data, error } = await (client as any)
      .from("crm_contacts")
      .update({ archived_at: new Date().toISOString(), status: "archived" })
      .eq("id", parsedParams.data.contactId)
      .eq("owner_id", auth.userId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return crmError(404, "CRM_CONTACT_NOT_FOUND", "Contact not found.");
    return NextResponse.json({ ok: true }, { headers: privateNoStoreHeaders });
  } catch (error) {
    return crmCatch(error, "CRM_CONTACT_ARCHIVE_FAILED", "Failed to archive contact.");
  }
}
