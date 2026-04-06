import { NextRequest, NextResponse } from "next/server";

import {
  isAdminEmailEntity,
  resolveAdminEmailTable,
} from "@/lib/admin/email-contract";
import { requireAdminWriteClient } from "@/lib/server/admin-auth";

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

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
  return next;
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
  );
  if ("error" in auth) return auth.error;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const payload = (body as Record<string, unknown> | null) ?? null;
  if (!payload || typeof payload !== "object") {
    return errorResponse(400, "INVALID_PAYLOAD", "Missing email payload.");
  }

  const insertPayload = sanitizePayload(payload);
  if (resolved.entity === "templates" || resolved.entity === "segments" || resolved.entity === "campaigns") {
    if (!("created_by" in insertPayload) || insertPayload.created_by === null) {
      insertPayload.created_by = auth.userId;
    }
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

  const updates = sanitizePayload(payload ?? {});
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
