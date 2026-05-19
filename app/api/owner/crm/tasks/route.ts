import { NextRequest, NextResponse } from "next/server";

import {
  assertOwnerContact,
  assertOwnerListing,
  assertOwnerOpportunity,
  crmCatch,
  crmError,
  crmListQuerySchema,
  crmTaskWriteSchema,
  nullableText,
  privateNoStoreHeaders,
  toTask,
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
  if (!parsed.success) return crmError(400, "CRM_TASK_QUERY_INVALID", "Invalid task query.", parsed.error.flatten());

  const client = createServiceRoleClient();
  if (!client) return crmError(503, "SERVICE_UNAVAILABLE", "CRM storage is not configured.");

  try {
    let query = (client as any)
      .from("crm_tasks")
      .select("*, contact:crm_contacts(id,display_name,email,phone), opportunity:crm_opportunities(id,title,stage), listing:listings(id,name,slug)")
      .eq("owner_id", auth.userId)
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(parsed.data.limit);
    if (parsed.data.status) query = query.eq("status", parsed.data.status);
    if (parsed.data.contact_id) query = query.eq("contact_id", parsed.data.contact_id);
    if (parsed.data.listing_id) query = query.eq("listing_id", parsed.data.listing_id);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ tasks: (data ?? []).map(toTask) }, { headers: privateNoStoreHeaders });
  } catch (error) {
    return crmCatch(error, "CRM_TASKS_FAILED", "Failed to load tasks.");
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return crmError(403, "OWNER_REQUIRED", "Owner access required.");

  const rateLimited = await enforceWriteRateLimit({
    request,
    scope: "owner-crm:tasks:create",
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

  const parsed = crmTaskWriteSchema.safeParse(body);
  if (!parsed.success) return crmError(400, "CRM_TASK_VALIDATION_ERROR", "Invalid task payload.", parsed.error.flatten());

  const client = createServiceRoleClient();
  if (!client) return crmError(503, "SERVICE_UNAVAILABLE", "CRM storage is not configured.");

  try {
    await assertOwnerContact(client as any, auth.userId, parsed.data.contact_id);
    await assertOwnerOpportunity(client as any, auth.userId, parsed.data.opportunity_id);
    await assertOwnerListing(client as any, auth.userId, parsed.data.listing_id);

    const { data, error } = await (client as any)
      .from("crm_tasks")
      .insert({
        owner_id: auth.userId,
        contact_id: parsed.data.contact_id ?? null,
        opportunity_id: parsed.data.opportunity_id ?? null,
        listing_id: parsed.data.listing_id ?? null,
        title: parsed.data.title,
        description: nullableText(parsed.data.description),
        status: parsed.data.status,
        priority: parsed.data.priority,
        due_at: parsed.data.due_at ?? null,
        completed_at: parsed.data.status === "completed" ? new Date().toISOString() : null,
      })
      .select("*, contact:crm_contacts(id,display_name,email,phone), opportunity:crm_opportunities(id,title,stage), listing:listings(id,name,slug)")
      .single();
    if (error) throw error;

    await (client as any).from("crm_activity_events").insert({
      owner_id: auth.userId,
      contact_id: data.contact_id,
      opportunity_id: data.opportunity_id,
      listing_id: data.listing_id,
      event_type: "task_created",
      summary: `Task created: ${data.title}`,
    });

    return NextResponse.json({ task: toTask(data) }, { status: 201, headers: privateNoStoreHeaders });
  } catch (error) {
    return crmCatch(error, "CRM_TASK_CREATE_FAILED", "Failed to create task.");
  }
}
