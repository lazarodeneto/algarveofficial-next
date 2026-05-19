import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  assertOwnerListing,
  assertOwnerThread,
  crmCatch,
  crmError,
  crmOpportunityPatchSchema,
  nullableText,
  privateNoStoreHeaders,
  toOpportunity,
} from "@/lib/owner-crm/server";
import { requireAuthenticatedOwner } from "@/lib/server/owner-auth";
import { enforceWriteRateLimit } from "@/lib/server/write-rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const paramsSchema = z.object({ opportunityId: z.string().uuid() });

export async function GET(request: NextRequest, { params }: { params: Promise<{ opportunityId: string }> }) {
  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return crmError(403, "OWNER_REQUIRED", "Owner access required.");

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) return crmError(400, "CRM_OPPORTUNITY_ID_INVALID", "A valid opportunity id is required.");

  const client = createServiceRoleClient();
  if (!client) return crmError(503, "SERVICE_UNAVAILABLE", "CRM storage is not configured.");

  try {
    const { data, error } = await (client as any)
      .from("crm_opportunities")
      .select("*, contact:crm_contacts(id,display_name,email,phone), listing:listings(id,name,slug,featured_image_url)")
      .eq("id", parsedParams.data.opportunityId)
      .eq("owner_id", auth.userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return crmError(404, "CRM_OPPORTUNITY_NOT_FOUND", "Opportunity not found.");
    return NextResponse.json({ opportunity: toOpportunity(data) }, { headers: privateNoStoreHeaders });
  } catch (error) {
    return crmCatch(error, "CRM_OPPORTUNITY_LOOKUP_FAILED", "Failed to load opportunity.");
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ opportunityId: string }> }) {
  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return crmError(403, "OWNER_REQUIRED", "Owner access required.");

  const rateLimited = await enforceWriteRateLimit({
    request,
    scope: "owner-crm:opportunities:update",
    email: auth.email,
    maxAttempts: 90,
    windowSeconds: 60,
  });
  if (rateLimited) return rateLimited;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) return crmError(400, "CRM_OPPORTUNITY_ID_INVALID", "A valid opportunity id is required.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return crmError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsed = crmOpportunityPatchSchema.safeParse(body);
  if (!parsed.success) return crmError(400, "CRM_OPPORTUNITY_VALIDATION_ERROR", "Invalid opportunity payload.", parsed.error.flatten());

  const client = createServiceRoleClient();
  if (!client) return crmError(503, "SERVICE_UNAVAILABLE", "CRM storage is not configured.");

  try {
    await assertOwnerListing(client as any, auth.userId, parsed.data.listing_id);
    await assertOwnerThread(client as any, auth.userId, parsed.data.thread_id);

    const updatePayload: Record<string, unknown> = {};
    if (parsed.data.listing_id !== undefined) updatePayload.listing_id = parsed.data.listing_id ?? null;
    if (parsed.data.thread_id !== undefined) updatePayload.thread_id = parsed.data.thread_id ?? null;
    if (parsed.data.stage !== undefined) {
      updatePayload.stage = parsed.data.stage;
      updatePayload.won_at = parsed.data.stage === "won" ? new Date().toISOString() : null;
      updatePayload.lost_at = parsed.data.stage === "lost" ? new Date().toISOString() : null;
    }
    if (parsed.data.title !== undefined) updatePayload.title = nullableText(parsed.data.title);
    if (parsed.data.estimated_value_cents !== undefined) updatePayload.estimated_value_cents = parsed.data.estimated_value_cents ?? null;
    if (parsed.data.currency !== undefined) updatePayload.currency = parsed.data.currency;
    if (parsed.data.probability !== undefined) updatePayload.probability = parsed.data.probability ?? null;
    if (parsed.data.expected_close_at !== undefined) updatePayload.expected_close_at = parsed.data.expected_close_at ?? null;
    if (parsed.data.lost_reason !== undefined) updatePayload.lost_reason = nullableText(parsed.data.lost_reason);
    if (parsed.data.metadata !== undefined) updatePayload.metadata = parsed.data.metadata;

    const { data, error } = await (client as any)
      .from("crm_opportunities")
      .update(updatePayload)
      .eq("id", parsedParams.data.opportunityId)
      .eq("owner_id", auth.userId)
      .select("*, contact:crm_contacts(id,display_name,email,phone), listing:listings(id,name,slug,featured_image_url)")
      .maybeSingle();
    if (error) throw error;
    if (!data) return crmError(404, "CRM_OPPORTUNITY_NOT_FOUND", "Opportunity not found.");

    if (parsed.data.stage !== undefined) {
      await (client as any).from("crm_activity_events").insert({
        owner_id: auth.userId,
        contact_id: data.contact_id,
        opportunity_id: data.id,
        listing_id: data.listing_id,
        thread_id: data.thread_id,
        event_type: "opportunity_stage_changed",
        summary: `Opportunity moved to ${parsed.data.stage.replace(/_/g, " ")}`,
      });
    }

    return NextResponse.json({ opportunity: toOpportunity(data) }, { headers: privateNoStoreHeaders });
  } catch (error) {
    return crmCatch(error, "CRM_OPPORTUNITY_UPDATE_FAILED", "Failed to update opportunity.");
  }
}
