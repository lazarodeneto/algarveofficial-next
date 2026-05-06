import { NextRequest, NextResponse } from "next/server";

import {
  type AdminTaxonomyEntity,
  isAdminTaxonomyEntity,
  resolveAdminTaxonomyTable,
} from "@/lib/admin/taxonomy-contract";
import { requireAdminWriteClient } from "@/lib/server/admin-auth";
import { validatePayload, jsonErrorResponse } from "@/lib/api/api-validation";
import { taxonomyItemSchema, taxonomyUpdateSchema } from "@/lib/forms/admin-schemas";

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

async function resolveEntity(context: { params: Promise<{ entity: string }> }) {
  const { entity } = await context.params;
  if (!isAdminTaxonomyEntity(entity)) {
    return { error: errorResponse(404, "ENTITY_NOT_FOUND", "Unknown taxonomy entity.") };
  }
  return { entity, table: resolveAdminTaxonomyTable(entity) };
}

function sanitizeUpdates(input: Record<string, unknown>) {
  const updates = { ...input };
  delete updates.id;
  delete updates.created_at;
  delete updates.updated_at;
  return updates;
}

const TAXONOMY_WRITABLE_FIELDS: Record<AdminTaxonomyEntity, Set<string>> = {
  categories: new Set([
    "name",
    "slug",
    "description",
    "short_description",
    "image_url",
    "fallback_image_url",
    "icon",
    "display_order",
    "is_active",
    "is_featured",
    "meta_title",
    "meta_description",
    "template_fields",
  ]),
  cities: new Set([
    "name",
    "slug",
    "description",
    "short_description",
    "image_url",
    "hero_image_url",
    "display_order",
    "is_active",
    "is_featured",
    "latitude",
    "longitude",
    "meta_title",
    "meta_description",
  ]),
  regions: new Set([
    "name",
    "slug",
    "description",
    "short_description",
    "image_url",
    "hero_image_url",
    "display_order",
    "is_active",
    "is_featured",
    "is_visible_destinations",
    "meta_title",
    "meta_description",
  ]),
};

function filterWritableFields(entity: AdminTaxonomyEntity, input: Record<string, unknown>) {
  const allowedFields = TAXONOMY_WRITABLE_FIELDS[entity];
  return Object.fromEntries(
    Object.entries(input).filter(([key]) => allowedFields.has(key)),
  );
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ entity: string }> },
) {
  const resolved = await resolveEntity(context);
  if ("error" in resolved) return resolved.error;

  const auth = await requireAdminWriteClient(
    request,
    "Only admins can create taxonomy items.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin taxonomy writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const validation = validatePayload(taxonomyItemSchema, body, "TAXONOMY");
  if (!validation.success) {
    return jsonErrorResponse(400, validation.error.code, validation.error.message);
  }

  const { data: existing, error: existingError } = await auth.writeClient
    .from(resolved.table)
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1);

  if (existingError) {
    return errorResponse(
      500,
      "TAXONOMY_CREATE_FAILED",
      existingError.message || "Failed to create taxonomy item.",
    );
  }

  const maxOrder =
    ((existing as Array<{ display_order?: number | null }> | null)?.[0]?.display_order ?? 0);

  const insertPayload = filterWritableFields(
    resolved.entity,
    sanitizeUpdates(validation.data as Record<string, unknown>),
  );

  if (!("display_order" in insertPayload)) {
    insertPayload.display_order = maxOrder + 1;
  }

  if (!("is_active" in insertPayload)) {
    insertPayload.is_active = true;
  }

  const { data, error } = await auth.writeClient
    .from(resolved.table)
    .insert(insertPayload as never)
    .select("*")
    .single();

  if (error) {
    return errorResponse(
      500,
      "TAXONOMY_CREATE_FAILED",
      error.message || "Failed to create taxonomy item.",
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
    "Only admins can update taxonomy items.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin taxonomy writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const payload = body as Record<string, unknown>;
  const id = typeof payload?.id === "string" ? payload.id.trim() : "";
  if (!id) {
    return errorResponse(400, "INVALID_ITEM_ID", "Taxonomy item id is required.");
  }

  const validation = validatePayload(taxonomyUpdateSchema, body, "TAXONOMY");
  if (!validation.success) {
    return jsonErrorResponse(400, validation.error.code, validation.error.message);
  }

  const updates = filterWritableFields(
    resolved.entity,
    sanitizeUpdates({ ...validation.data, id }),
  );

  if (Object.keys(updates).length === 0) {
    return errorResponse(400, "INVALID_PAYLOAD", "No writable taxonomy fields were provided.");
  }

  const { data, error } = await auth.writeClient
    .from(resolved.table)
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return errorResponse(
      500,
      "TAXONOMY_UPDATE_FAILED",
      error.message || "Failed to update taxonomy item.",
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
    "Only admins can delete taxonomy items.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin taxonomy writes.",
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
    return errorResponse(400, "INVALID_ITEM_ID", "Taxonomy item id is required.");
  }

  const { error } = await auth.writeClient
    .from(resolved.table)
    .delete()
    .eq("id", id);

  if (error) {
    return errorResponse(
      500,
      "TAXONOMY_DELETE_FAILED",
      error.message || "Failed to delete taxonomy item.",
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
    "Only admins can reorder taxonomy items.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin taxonomy writes.",
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
      .from(resolved.table)
      .update({ display_order: index + 1 })
      .eq("id", id);

    if (error) {
      return errorResponse(
        500,
        "TAXONOMY_REORDER_FAILED",
        error.message || "Failed to reorder taxonomy items.",
      );
    }
  }

  return NextResponse.json({ ok: true });
}
