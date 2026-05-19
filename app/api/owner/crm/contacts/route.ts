import { NextRequest, NextResponse } from "next/server";

import { crmCatch, crmContactWriteSchema, crmError, crmListQuerySchema, nullableText, normalizeEmail, normalizePhone, privateNoStoreHeaders, toContact, assertOwnerListing } from "@/lib/owner-crm/server";
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
  if (!parsed.success) return crmError(400, "CRM_CONTACT_QUERY_INVALID", "Invalid contact query.", parsed.error.flatten());

  const client = createServiceRoleClient();
  if (!client) return crmError(503, "SERVICE_UNAVAILABLE", "CRM storage is not configured.");

  try {
    let query = (client as any)
      .from("crm_contacts")
      .select("*, listing:listings!crm_contacts_primary_listing_id_fkey(id,name,slug,featured_image_url)")
      .eq("owner_id", auth.userId)
      .is("archived_at", null)
      .order("updated_at", { ascending: false })
      .limit(parsed.data.limit);

    if (parsed.data.search) {
      const search = parsed.data.search.replace(/[%,]/g, "");
      query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,company_name.ilike.%${search}%`);
    }
    if (parsed.data.listing_id) query = query.eq("primary_listing_id", parsed.data.listing_id);
    if (parsed.data.status) query = query.eq("status", parsed.data.status);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ contacts: (data ?? []).map(toContact) }, { headers: privateNoStoreHeaders });
  } catch (error) {
    return crmCatch(error, "CRM_CONTACTS_FAILED", "Failed to load contacts.");
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticatedOwner(request);
  if ("error" in auth) return crmError(403, "OWNER_REQUIRED", "Owner access required.");

  const rateLimited = await enforceWriteRateLimit({
    request,
    scope: "owner-crm:contacts:create",
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

  const parsed = crmContactWriteSchema.safeParse(body);
  if (!parsed.success) return crmError(400, "CRM_CONTACT_VALIDATION_ERROR", "Invalid contact payload.", parsed.error.flatten());

  const client = createServiceRoleClient();
  if (!client) return crmError(503, "SERVICE_UNAVAILABLE", "CRM storage is not configured.");

  try {
    await assertOwnerListing(client as any, auth.userId, parsed.data.primary_listing_id);

    const { data, error } = await (client as any)
      .from("crm_contacts")
      .insert({
        owner_id: auth.userId,
        primary_listing_id: parsed.data.primary_listing_id ?? null,
        display_name: nullableText(parsed.data.display_name),
        first_name: nullableText(parsed.data.first_name),
        last_name: nullableText(parsed.data.last_name),
        company_name: nullableText(parsed.data.company_name),
        email: nullableText(parsed.data.email),
        normalized_email: normalizeEmail(parsed.data.email),
        phone: nullableText(parsed.data.phone),
        normalized_phone: normalizePhone(parsed.data.phone),
        country_code: nullableText(parsed.data.country_code),
        source: nullableText(parsed.data.source) ?? "manual",
        status: parsed.data.status,
        metadata: parsed.data.metadata,
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ contact: toContact(data) }, { status: 201, headers: privateNoStoreHeaders });
  } catch (error) {
    return crmCatch(error, "CRM_CONTACT_CREATE_FAILED", "Failed to create contact.");
  }
}
