import { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/integrations/supabase/types";
import { syncCmsDocumentsFromGlobalSettings } from "@/lib/cms/server-persistence";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";

type GlobalSettingInsert = Database["public"]["Tables"]["global_settings"]["Insert"];

interface GlobalSettingsWriteItem {
  key: string;
  value: string;
  category: string | null;
}

function normalizePayload(rawBody: unknown): GlobalSettingsWriteItem[] | null {
  if (!rawBody || typeof rawBody !== "object") return null;
  if (!("settings" in rawBody)) return null;

  const settings = (rawBody as { settings?: unknown }).settings;
  if (!Array.isArray(settings)) return null;

  const normalized: GlobalSettingsWriteItem[] = [];

  for (const entry of settings) {
    if (!entry || typeof entry !== "object") return null;

    const key = "key" in entry ? String((entry as { key: unknown }).key ?? "").trim() : "";
    const value = "value" in entry ? String((entry as { value: unknown }).value ?? "") : "";
    const categoryRaw = "category" in entry ? (entry as { category: unknown }).category : null;
    const category =
      categoryRaw === null || categoryRaw === undefined
        ? null
        : typeof categoryRaw === "string"
          ? categoryRaw.trim()
          : String(categoryRaw);

    if (!key) return null;
    normalized.push({ key, value, category: category || null });
  }

  return normalized;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(request);
  if ("error" in auth) return auth.error;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const settings = normalizePayload(body);
  if (!settings || settings.length === 0) {
    return adminErrorResponse(400, "INVALID_PAYLOAD", "Expected a non-empty settings array.");
  }

  const payload: GlobalSettingInsert[] = settings.map((setting) => ({
    key: setting.key,
    value: setting.value ?? "",
    category: setting.category ?? null,
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await auth.writeClient
    .from("global_settings")
    .upsert(payload, { onConflict: "key" })
    .select("key, value, category");

  if (error) {
    return adminErrorResponse(
      500,
      "GLOBAL_SETTINGS_UPDATE_FAILED",
      error.message || "Failed to update settings.",
    );
  }

  try {
    await syncCmsDocumentsFromGlobalSettings(
      auth.writeClient,
      settings.map((setting) => ({
        key: setting.key,
        value: setting.value,
      })),
    );
  } catch (syncError) {
    console.error("[cms-sync] Failed to mirror global settings into cms_documents:", syncError);
  }

  return NextResponse.json({
    ok: true,
    data: (data ?? []) as GlobalSettingsWriteItem[],
  });
}
