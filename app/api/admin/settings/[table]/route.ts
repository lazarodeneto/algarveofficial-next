import { NextRequest, NextResponse } from "next/server";

import {
  isAdminSettingsTable,
  normalizeAdminSettingsId,
  normalizeAdminSettingsMode,
  sanitizeAdminSettingsUpdates,
} from "@/lib/admin/settings-contract";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";

interface SettingsWriteRequestBody {
  id?: unknown;
  updates?: unknown;
  mode?: unknown;
}

interface SettingsWriteResponse {
  ok: true;
  data: Record<string, unknown> | null;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ table: string }> },
) {
  const { table: rawTable } = await context.params;
  if (!isAdminSettingsTable(rawTable)) {
    return adminErrorResponse(404, "TABLE_NOT_FOUND", "Unknown admin settings table.");
  }

  const table = rawTable;
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can update admin settings.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin settings writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: SettingsWriteRequestBody | null = null;
  try {
    body = (await request.json()) as SettingsWriteRequestBody;
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const updates = sanitizeAdminSettingsUpdates(body?.updates);
  if (!updates) {
    return adminErrorResponse(400, "INVALID_PAYLOAD", "Expected an updates object.");
  }

  const id = normalizeAdminSettingsId(table, body?.id);
  const mode = normalizeAdminSettingsMode(body?.mode);
  const nextPayload = {
    ...updates,
    id,
    updated_at: new Date().toISOString(),
  };

  const tableQuery = auth.writeClient.from(table);

  if (mode === "update") {
    const { data, error } = await tableQuery
      .update(nextPayload)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      return adminErrorResponse(
        500,
        "SETTINGS_UPDATE_FAILED",
        error.message || "Failed to update admin settings.",
      );
    }

    return NextResponse.json({
      ok: true,
      data: data ?? null,
    } satisfies SettingsWriteResponse);
  }

  const { data, error } = await tableQuery
    .upsert(nextPayload, { onConflict: "id" })
    .select("*")
    .maybeSingle();

  if (error) {
    return adminErrorResponse(
      500,
      "SETTINGS_UPSERT_FAILED",
      error.message || "Failed to upsert admin settings.",
    );
  }

  return NextResponse.json({
    ok: true,
    data: data ?? null,
  } satisfies SettingsWriteResponse);
}
