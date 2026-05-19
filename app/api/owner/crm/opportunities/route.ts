import { NextRequest, NextResponse } from "next/server";

import {
  assertOwnerContact,
  assertOwnerListing,
  assertOwnerThread,
  crmCatch,
  crmError,
  crmListQuerySchema,
  crmOpportunityWriteSchema,
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

export async function GET(request: NextRequest) {
  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return crmError(403, "OWNER_REQUIRED", "Owner access required.");

  const parsed = crmListQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) return crmError(400, "CRM_OPPORTUNITY_QUERY_INVALID", "Invalid opportunity query.", parsed.error.flatten());

  const client = createServiceRoleClient();
  if (!client) return crmError(503, "SERVICE_UNAVAILABLE", "CRM storage is not configured.");

  try {
    let query = (client as any)
      .from("crm_opportunities")
      .select("*, contact:crm_contacts(id,display_name,email,phone), listing:listings(id,name,slug,featured_image_url)")
      .eq("owner_id", auth.userId)
      .order("updated_at", { ascending: false })
      .limit(parsed.data.limit);
    if (parsed.data.stage) query = query.eq("stage", parsed.data.stage);
    if (parsed.data.contact_id) query = query.eq("contact_id", parsed.data.contact_id);
    if (parsed.data.listing_id) query = query.eq("listing_id", parsed.data.listing_id);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ opportunities: (data ?? []).map(toOpportunity) }, { headers: privateNoStoreHeaders });
  } catch (error) {
    return crmCatch(error, "CRM_OPPORTUNITIES_FAILED", "Failed to load opportunities.");
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return crmError(403, "OWNER_REQUIRED", "Owner access required.");

  const rateLimited = await enforceWriteRateLimit({
    request,
    scope: "owner-crm:opportunities:create",
    email: auth.email,
    maxAttempts: 40,
    windowSeconds: 60,
  });
  if (rateLimited) return rateLimited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return crmError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsed = crmOpportunityWriteSchema.safeParse(body);
  if (!parsed.success) return crmError(400, "CRM_OPPORTUNITY_VALIDATION_ERROR", "Invalid opportunity payload.", parsed.error.flatten());

  const client = createServiceRoleClient();
  if (!client) return crmError(503, "SERVICE_UNAVAILABLE", "CRM storage is not configured.");

  try {
    await assertOwnerContact(client as any, auth.userId, parsed.data.contact_id);
    await assertOwnerListing(client as any, auth.userId, parsed.data.listing_id);
    await assertOwnerThread(client as any, auth.userId, parsed.data.thread_id);

    const now = new Date().toISOString();
    const stage = parsed.data.stage;
    const { data, error } = await (client as any)
      .from("crm_opportunities")
      .insert({
        owner_id: auth.userId,
        contact_id: parsed.data.contact_id,
        listing_id: parsed.data.listing_id ?? null,
        thread_id: parsed.data.thread_id ?? null,
        stage,
        title: nullableText(parsed.data.title),
        estimated_value_cents: parsed.data.estimated_value_cents ?? null,
        currency: parsed.data.currency,
        probability: parsed.data.probability ?? null,
        expected_close_at: parsed.data.expected_close_at ?? null,
        won_at: stage === "won" ? now : null,
        lost_at: stage === "lost" ? now : null,
        lost_reason: nullableText(parsed.data.lost_reason),
        metadata: parsed.data.metadata,
      })
      .select("*, contact:crm_contacts(id,display_name,email,phone), listing:listings(id,name,slug,featured_image_url)")
      .single();
    if (error) throw error;
    return NextResponse.json({ opportunity: toOpportunity(data) }, { status: 201, headers: privateNoStoreHeaders });
  } catch (error) {
    return crmCatch(error, "CRM_OPPORTUNITY_CREATE_FAILED", "Failed to create opportunity.");
  }
}
