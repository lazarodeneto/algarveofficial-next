import { NextRequest, NextResponse } from "next/server";

import {
  isAdminFooterEntity,
  resolveAdminFooterTable,
} from "@/lib/admin/footer-contract";
import { requireAdminWriteClient } from "@/lib/server/admin-auth";

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

async function resolveEntity(context: { params: Promise<{ entity: string }> }) {
  const { entity } = await context.params;
  if (!isAdminFooterEntity(entity)) {
    return { error: errorResponse(404, "ENTITY_NOT_FOUND", "Unknown admin footer entity.") };
  }
  return { entity, table: resolveAdminFooterTable(entity) };
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ entity: string }> },
) {
  const resolved = await resolveEntity(context);
  if ("error" in resolved) return resolved.error;

  const auth = await requireAdminWriteClient(
    request,
    "Only admins can create footer items.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin footer writes.",
    },
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
    return errorResponse(400, "INVALID_PAYLOAD", "Missing footer payload.");
  }

  if (resolved.entity === "sections") {
    if (typeof payload.title !== "string" || typeof payload.slug !== "string") {
      return errorResponse(400, "INVALID_SECTION", "title and slug are required.");
    }
  } else if (resolved.entity === "links") {
    if (
      typeof payload.section_id !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.href !== "string"
    ) {
      return errorResponse(400, "INVALID_LINK", "section_id, name, and href are required.");
    }
  }

  let orderQuery = auth.writeClient
    .from(resolved.table as never)
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1);

  if (resolved.entity === "links" && typeof payload.section_id === "string") {
    orderQuery = orderQuery.eq("section_id", payload.section_id);
  }

  const { data: existing, error: existingError } = await orderQuery;
  if (existingError) {
    return errorResponse(
      500,
      "FOOTER_CREATE_FAILED",
      existingError.message || "Failed to create footer item.",
    );
  }

  const maxOrder =
    ((existing as Array<{ display_order?: number | null }> | null)?.[0]?.display_order ?? 0);

  const insertPayload = {
    ...payload,
    display_order: maxOrder + 1,
    ...(resolved.entity === "links"
      ? { icon: typeof payload.icon === "string" ? payload.icon : "Link" }
      : {}),
  };

  const { data, error } = await auth.writeClient
    .from(resolved.table as never)
    .insert(insertPayload as never)
    .select("*")
    .single();

  if (error) {
    return errorResponse(
      500,
      "FOOTER_CREATE_FAILED",
      error.message || "Failed to create footer item.",
    );
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
    "Only admins can update footer items.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin footer writes.",
    },
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
    return errorResponse(400, "INVALID_ITEM_ID", "Footer item id is required.");
  }

  const updates = { ...payload };
  delete updates.id;
  delete updates.created_at;

  const { data, error } = await auth.writeClient
    .from(resolved.table as never)
    .update(updates as never)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return errorResponse(
      500,
      "FOOTER_UPDATE_FAILED",
      error.message || "Failed to update footer item.",
    );
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
    "Only admins can delete footer items.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin footer writes.",
    },
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
    return errorResponse(400, "INVALID_ITEM_ID", "Footer item id is required.");
  }

  const { error } = await auth.writeClient
    .from(resolved.table as never)
    .delete()
    .eq("id", id);

  if (error) {
    return errorResponse(
      500,
      "FOOTER_DELETE_FAILED",
      error.message || "Failed to delete footer item.",
    );
  }

  return NextResponse.json({ ok: true });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ entity: string }> },
) {
  const resolved = await resolveEntity(context);
  if ("error" in resolved) return resolved.error;

  const auth = await requireAdminWriteClient(
    request,
    "Only admins can reorder footer items.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin footer writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const orderedIds = Array.isArray((body as { orderedIds?: unknown })?.orderedIds)
    ? ((body as { orderedIds: unknown[] }).orderedIds.filter(
        (entry): entry is string => typeof entry === "string" && entry.trim().length > 0,
      ))
    : [];

  if (!orderedIds.length) {
    return errorResponse(400, "INVALID_ORDER", "orderedIds must be a non-empty string array.");
  }

  for (let index = 0; index < orderedIds.length; index += 1) {
    const id = orderedIds[index];
    const { error } = await auth.writeClient
      .from(resolved.table as never)
      .update({ display_order: index + 1 } as never)
      .eq("id", id);

    if (error) {
      return errorResponse(
        500,
        "FOOTER_REORDER_FAILED",
        error.message || "Failed to reorder footer items.",
      );
    }
  }

  return NextResponse.json({ ok: true });
}
