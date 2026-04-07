import { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/integrations/supabase/types";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";
import { resolveLocaleFromAcceptLanguage } from "@/lib/i18n/config";
import { syncCmsDocumentsFromGlobalSettings } from "@/lib/cms/server-persistence";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";

type GlobalSettingInsert = Database["public"]["Tables"]["global_settings"]["Insert"];

interface GlobalSettingsWriteItem {
  key: string;
  value: string;
  category: string | null;
  locale?: string | null;
}

const CMS_SETTING_KEYS: Set<string> = new Set([
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.designTokens,
  CMS_GLOBAL_SETTING_KEYS.customCss,
]);

function normalizePayload(rawBody: unknown): { settings: GlobalSettingsWriteItem[]; locale: string } | null {
  if (!rawBody || typeof rawBody !== "object") return null;
  if (!("settings" in rawBody)) return null;

  const bodyLocaleRaw = "locale" in rawBody ? (rawBody as { locale?: unknown }).locale : null;
  const bodyLocaleString =
    typeof bodyLocaleRaw === "string" ? bodyLocaleRaw.trim().toLowerCase().replaceAll("_", "-") : "";
  const bodyLocale =
    !bodyLocaleString || bodyLocaleString === "default"
      ? "default"
      : resolveLocaleFromAcceptLanguage(bodyLocaleString);

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
    normalized.push({ key, value, category: category || null, locale: bodyLocale });
  }

  return { settings: normalized, locale: bodyLocale };
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can update global settings.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin global settings writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const normalized = normalizePayload(body);
  if (!normalized || normalized.settings.length === 0) {
    return adminErrorResponse(400, "INVALID_PAYLOAD", "Expected a non-empty settings array.");
  }

  const { settings, locale } = normalized;
  const hasCmsSettings = settings.some((setting) => CMS_SETTING_KEYS.has(setting.key));

  const shouldPersistGlobalSettings = locale === "default";
  const dbSettings = shouldPersistGlobalSettings
    ? settings
    : settings.filter((setting) => !CMS_SETTING_KEYS.has(setting.key));

  let data: GlobalSettingsWriteItem[] = [];

  if (dbSettings.length > 0) {
    const payload: GlobalSettingInsert[] = dbSettings.map((setting) => ({
      key: setting.key,
      value: setting.value ?? "",
      category: setting.category ?? null,
      updated_at: new Date().toISOString(),
    }));

    const result = await auth.writeClient
      .from("global_settings")
      .upsert(payload, { onConflict: "key" })
      .select("key, value, category");

    if (result.error) {
      return adminErrorResponse(
        500,
        "GLOBAL_SETTINGS_UPDATE_FAILED",
        result.error.message || "Failed to update settings.",
      );
    }

    data = (result.data ?? []) as GlobalSettingsWriteItem[];
  }

  try {
    await syncCmsDocumentsFromGlobalSettings(
      auth.writeClient,
      settings.map((setting) => ({
        key: setting.key,
        value: setting.value,
        locale: setting.locale,
      })),
    );
  } catch (syncError) {
    console.error("[cms-sync] Failed to mirror global settings into cms_documents:", syncError);
  }

  return NextResponse.json({
    ok: true,
    data,
  });
}
