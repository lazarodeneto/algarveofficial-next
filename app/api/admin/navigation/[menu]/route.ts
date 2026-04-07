import { NextRequest, NextResponse } from "next/server";

import {
  isAdminNavigationMenu,
  resolveNavigationTable,
} from "@/lib/admin/navigation-contract";
import { requireAdminWriteClient } from "@/lib/server/admin-auth";

interface MenuItemCreatePayload {
  name: string;
  href: string;
  icon: string;
  translation_key?: string | null;
  open_in_new_tab?: boolean;
  is_active?: boolean;
}

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

async function getTableFromParams(context: { params: Promise<{ menu: string }> }) {
  const { menu } = await context.params;
  if (!isAdminNavigationMenu(menu)) {
    return { error: errorResponse(404, "MENU_NOT_FOUND", "Unknown admin navigation menu.") };
  }
  return { table: resolveNavigationTable(menu) };
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ menu: string }> },
) {
  const tableResolved = await getTableFromParams(context);
  if ("error" in tableResolved) return tableResolved.error;

  const auth = await requireAdminWriteClient(
    request,
    "Only admins can create navigation menu items.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin navigation writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const payload = body as Partial<MenuItemCreatePayload> | null;
  if (!payload || typeof payload !== "object") {
    return errorResponse(400, "INVALID_PAYLOAD", "Missing menu item payload.");
  }

  if (
    typeof payload.name !== "string" ||
    typeof payload.href !== "string" ||
    typeof payload.icon !== "string"
  ) {
    return errorResponse(400, "INVALID_MENU_ITEM", "name, href, and icon are required.");
  }

  const { data: existing, error: existingError } = await auth.writeClient
    .from(tableResolved.table as never)
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1);

  if (existingError) {
    return errorResponse(
      500,
      "NAVIGATION_CREATE_FAILED",
      existingError.message || "Failed to create menu item.",
    );
  }

  const maxOrder =
    ((existing as Array<{ display_order?: number | null }> | null)?.[0]?.display_order ?? 0);

  const { data, error } = await auth.writeClient
    .from(tableResolved.table as never)
    .insert({
      name: payload.name.trim(),
      href: payload.href.trim(),
      icon: payload.icon.trim(),
      translation_key:
        typeof payload.translation_key === "string" ? payload.translation_key.trim() : null,
      open_in_new_tab: Boolean(payload.open_in_new_tab),
      is_active: payload.is_active ?? true,
      display_order: maxOrder + 1,
    } as never)
    .select("*")
    .single();

  if (error) {
    return errorResponse(
      500,
      "NAVIGATION_CREATE_FAILED",
      error.message || "Failed to create menu item.",
    );
  }

  return NextResponse.json({ ok: true, data });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ menu: string }> },
) {
  const tableResolved = await getTableFromParams(context);
  if ("error" in tableResolved) return tableResolved.error;

  const auth = await requireAdminWriteClient(
    request,
    "Only admins can update navigation menu items.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin navigation writes.",
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
    return errorResponse(400, "INVALID_MENU_ITEM_ID", "Menu item id is required.");
  }

  const updates = { ...payload };
  delete updates.id;
  delete updates.created_at;

  const { data, error } = await auth.writeClient
    .from(tableResolved.table as never)
    .update(updates as never)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return errorResponse(
      500,
      "NAVIGATION_UPDATE_FAILED",
      error.message || "Failed to update menu item.",
    );
  }

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ menu: string }> },
) {
  const tableResolved = await getTableFromParams(context);
  if ("error" in tableResolved) return tableResolved.error;

  const auth = await requireAdminWriteClient(
    request,
    "Only admins can delete navigation menu items.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin navigation writes.",
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
    return errorResponse(400, "INVALID_MENU_ITEM_ID", "Menu item id is required.");
  }

  const { error } = await auth.writeClient
    .from(tableResolved.table as never)
    .delete()
    .eq("id", id);

  if (error) {
    return errorResponse(
      500,
      "NAVIGATION_DELETE_FAILED",
      error.message || "Failed to delete menu item.",
    );
  }

  return NextResponse.json({ ok: true });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ menu: string }> },
) {
  const tableResolved = await getTableFromParams(context);
  if ("error" in tableResolved) return tableResolved.error;

  const auth = await requireAdminWriteClient(
    request,
    "Only admins can reorder navigation menu items.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin navigation writes.",
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
      .from(tableResolved.table as never)
      .update({ display_order: index + 1 } as never)
      .eq("id", id);

    if (error) {
      return errorResponse(
        500,
        "NAVIGATION_REORDER_FAILED",
        error.message || "Failed to reorder menu items.",
      );
    }
  }

  return NextResponse.json({ ok: true });
}
