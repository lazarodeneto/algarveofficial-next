import { NextRequest, NextResponse } from "next/server";

import { logAdminMutation } from "@/lib/server/admin-audit-log";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";
import { validatePayload, jsonErrorResponse } from "@/lib/api/api-validation";
import { curatedSectionSchema } from "@/lib/forms/admin-schemas";

function parseString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can manage curated assignments.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin curated-assignment writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const validation = validatePayload(curatedSectionSchema, body, "CURATED");
  if (!validation.success) {
    return jsonErrorResponse(400, validation.error.code, validation.error.message);
  }

  const listingId = parseString(body.listingId);
  const contextType = parseString(body.contextType);
  const contextId = parseString(body.contextId);
  const displayOrder = typeof body.displayOrder === "number" ? body.displayOrder : 0;

  if (!listingId || !contextType) {
    return adminErrorResponse(400, "INVALID_PAYLOAD", "listingId and contextType are required.");
  }

  const { data, error } = await auth.writeClient
    .from("curated_assignments")
    .insert({
      listing_id: listingId,
      context_type: contextType,
      context_id: contextId,
      display_order: displayOrder,
    })
    .select("*")
    .single();

  if (error) {
    return adminErrorResponse(400, "CURATED_ASSIGNMENT_CREATE_FAILED", error.message);
  }

  logAdminMutation({
    userId: auth.userId,
    action: "admin.curated-assignments.create",
    payload: {
      listingId,
      contextType,
      contextId,
      displayOrder,
    },
  });

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can manage curated assignments.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin curated-assignment writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const assignmentId = parseString(body.assignmentId);
  const listingId = parseString(body.listingId);
  const contextType = parseString(body.contextType);
  const contextId = parseString(body.contextId);

  if (!assignmentId && (!listingId || !contextType)) {
    return adminErrorResponse(
      400,
      "INVALID_PAYLOAD",
      "Provide assignmentId or listingId + contextType.",
    );
  }

  let query = auth.writeClient.from("curated_assignments").delete();
  if (assignmentId) {
    query = query.eq("id", assignmentId);
  } else {
    query = query.eq("listing_id", listingId as string).eq("context_type", contextType as string);
    query = contextId ? query.eq("context_id", contextId) : query.is("context_id", null);
  }

  const { data, error } = await query.select("id");
  if (error) {
    return adminErrorResponse(400, "CURATED_ASSIGNMENT_DELETE_FAILED", error.message);
  }

  if (!data || data.length === 0) {
    return adminErrorResponse(404, "CURATED_ASSIGNMENT_NOT_FOUND", "No matching assignment found.");
  }

  logAdminMutation({
    userId: auth.userId,
    action: "admin.curated-assignments.delete",
    payload: {
      assignmentId,
      listingId,
      contextType,
      contextId,
      count: data.length,
    },
  });

  return NextResponse.json({ ok: true, count: data.length });
}
