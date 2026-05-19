import { NextRequest, NextResponse } from "next/server";

import {
  assertOwnerContact,
  assertOwnerListing,
  assertOwnerOpportunity,
  assertOwnerThread,
  crmActivityWriteSchema,
  crmCatch,
  crmError,
  crmListQuerySchema,
  nullableText,
  privateNoStoreHeaders,
  toActivity,
} from "@/lib/owner-crm/server";
import { requireAuthenticatedOwner } from "@/lib/server/owner-auth";
import { enforceWriteRateLimit } from "@/lib/server/write-rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return crmError(403, "OWNER_REQUIRED", "Owner access required.");

  const parsed = crmListQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) return crmError(400, "CRM_ACTIVITY_QUERY_INVALID", "Invalid activity query.", parsed.error.flatten());

  const client = createServiceRoleClient();
  if (!client) return crmError(503, "SERVICE_UNAVAILABLE", "CRM storage is not configured.");

  try {
    let query = (client as any)
      .from("crm_activity_events")
      .select("*, contact:crm_contacts(id,display_name,email), opportunity:crm_opportunities(id,title,stage), listing:listings(id,name,slug)")
      .eq("owner_id", auth.userId)
      .order("occurred_at", { ascending: false })
      .limit(parsed.data.limit);
    if (parsed.data.contact_id) query = query.eq("contact_id", parsed.data.contact_id);
    if (parsed.data.listing_id) query = query.eq("listing_id", parsed.data.listing_id);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ activities: (data ?? []).map(toActivity) }, { headers: privateNoStoreHeaders });
  } catch (error) {
    return crmCatch(error, "CRM_ACTIVITIES_FAILED", "Failed to load CRM activities.");
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return crmError(403, "OWNER_REQUIRED", "Owner access required.");

  const rateLimited = await enforceWriteRateLimit({
    request,
    scope: "owner-crm:activities:create",
    email: auth.email,
    maxAttempts: 50,
    windowSeconds: 60,
  });
  if (rateLimited) return rateLimited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return crmError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsed = crmActivityWriteSchema.safeParse(body);
  if (!parsed.success) return crmError(400, "CRM_ACTIVITY_VALIDATION_ERROR", "Invalid activity payload.", parsed.error.flatten());
  if (parsed.data.event_type !== "manual_note") {
    return crmError(400, "CRM_ACTIVITY_TYPE_UNSUPPORTED", "Owner-created activity must be a manual note.");
  }

  const client = createServiceRoleClient();
  if (!client) return crmError(503, "SERVICE_UNAVAILABLE", "CRM storage is not configured.");

  try {
    await assertOwnerContact(client as any, auth.userId, parsed.data.contact_id);
    await assertOwnerOpportunity(client as any, auth.userId, parsed.data.opportunity_id);
    await assertOwnerListing(client as any, auth.userId, parsed.data.listing_id);
    await assertOwnerThread(client as any, auth.userId, parsed.data.thread_id);

    const { data, error } = await (client as any)
      .from("crm_activity_events")
      .insert({
        owner_id: auth.userId,
        contact_id: parsed.data.contact_id ?? null,
        opportunity_id: parsed.data.opportunity_id ?? null,
        listing_id: parsed.data.listing_id ?? null,
        thread_id: parsed.data.thread_id ?? null,
        event_type: "manual_note",
        source_table: nullableText(parsed.data.source_table),
        source_record_id: nullableText(parsed.data.source_record_id),
        summary: parsed.data.summary,
        occurred_at: parsed.data.occurred_at ?? new Date().toISOString(),
        metadata: parsed.data.metadata,
      })
      .select("*, contact:crm_contacts(id,display_name,email), opportunity:crm_opportunities(id,title,stage), listing:listings(id,name,slug)")
      .single();
    if (error) throw error;
    return NextResponse.json({ activity: toActivity(data) }, { status: 201, headers: privateNoStoreHeaders });
  } catch (error) {
    return crmCatch(error, "CRM_ACTIVITY_CREATE_FAILED", "Failed to create CRM activity.");
  }
}
