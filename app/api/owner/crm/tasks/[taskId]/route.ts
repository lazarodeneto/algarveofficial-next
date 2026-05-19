import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  assertOwnerContact,
  assertOwnerListing,
  assertOwnerOpportunity,
  crmCatch,
  crmError,
  crmTaskPatchSchema,
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

const paramsSchema = z.object({ taskId: z.string().uuid() });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return crmError(403, "OWNER_REQUIRED", "Owner access required.");

  const rateLimited = await enforceWriteRateLimit({
    request,
    scope: "owner-crm:tasks:update",
    email: auth.email,
    maxAttempts: 90,
    windowSeconds: 60,
  });
  if (rateLimited) return rateLimited;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) return crmError(400, "CRM_TASK_ID_INVALID", "A valid task id is required.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return crmError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsed = crmTaskPatchSchema.safeParse(body);
  if (!parsed.success) return crmError(400, "CRM_TASK_VALIDATION_ERROR", "Invalid task payload.", parsed.error.flatten());

  const client = createServiceRoleClient();
  if (!client) return crmError(503, "SERVICE_UNAVAILABLE", "CRM storage is not configured.");

  try {
    await assertOwnerContact(client as any, auth.userId, parsed.data.contact_id);
    await assertOwnerOpportunity(client as any, auth.userId, parsed.data.opportunity_id);
    await assertOwnerListing(client as any, auth.userId, parsed.data.listing_id);

    const updatePayload: Record<string, unknown> = {};
    if (parsed.data.contact_id !== undefined) updatePayload.contact_id = parsed.data.contact_id ?? null;
    if (parsed.data.opportunity_id !== undefined) updatePayload.opportunity_id = parsed.data.opportunity_id ?? null;
    if (parsed.data.listing_id !== undefined) updatePayload.listing_id = parsed.data.listing_id ?? null;
    if (parsed.data.title !== undefined) updatePayload.title = parsed.data.title;
    if (parsed.data.description !== undefined) updatePayload.description = nullableText(parsed.data.description);
    if (parsed.data.status !== undefined) {
      updatePayload.status = parsed.data.status;
      updatePayload.completed_at = parsed.data.status === "completed" ? new Date().toISOString() : null;
    }
    if (parsed.data.priority !== undefined) updatePayload.priority = parsed.data.priority;
    if (parsed.data.due_at !== undefined) updatePayload.due_at = parsed.data.due_at ?? null;

    const { data, error } = await (client as any)
      .from("crm_tasks")
      .update(updatePayload)
      .eq("id", parsedParams.data.taskId)
      .eq("owner_id", auth.userId)
      .select("*, contact:crm_contacts(id,display_name,email,phone), opportunity:crm_opportunities(id,title,stage), listing:listings(id,name,slug)")
      .maybeSingle();
    if (error) throw error;
    if (!data) return crmError(404, "CRM_TASK_NOT_FOUND", "Task not found.");

    if (parsed.data.status === "completed") {
      await (client as any).from("crm_activity_events").insert({
        owner_id: auth.userId,
        contact_id: data.contact_id,
        opportunity_id: data.opportunity_id,
        listing_id: data.listing_id,
        event_type: "task_completed",
        summary: `Task completed: ${data.title}`,
      });
    }

    return NextResponse.json({ task: toTask(data) }, { headers: privateNoStoreHeaders });
  } catch (error) {
    return crmCatch(error, "CRM_TASK_UPDATE_FAILED", "Failed to update task.");
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return crmError(403, "OWNER_REQUIRED", "Owner access required.");

  const rateLimited = await enforceWriteRateLimit({
    request,
    scope: "owner-crm:tasks:cancel",
    email: auth.email,
    maxAttempts: 50,
    windowSeconds: 60,
  });
  if (rateLimited) return rateLimited;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) return crmError(400, "CRM_TASK_ID_INVALID", "A valid task id is required.");

  const client = createServiceRoleClient();
  if (!client) return crmError(503, "SERVICE_UNAVAILABLE", "CRM storage is not configured.");

  try {
    const { data, error } = await (client as any)
      .from("crm_tasks")
      .update({ status: "cancelled", completed_at: null })
      .eq("id", parsedParams.data.taskId)
      .eq("owner_id", auth.userId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return crmError(404, "CRM_TASK_NOT_FOUND", "Task not found.");
    return NextResponse.json({ ok: true }, { headers: privateNoStoreHeaders });
  } catch (error) {
    return crmCatch(error, "CRM_TASK_CANCEL_FAILED", "Failed to cancel task.");
  }
}
