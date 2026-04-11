import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";
import { resolveLocaleFromAcceptLanguage } from "@/lib/i18n/config";
import { buildCmsSettingsFromDocuments } from "@/lib/cms/runtime-resolver";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createServiceRoleClient } from "@/lib/supabase/service";

interface RuntimeSettingRow {
  key: string;
  value: string;
  category: string | null;
}

const CMS_RUNTIME_KEYS = new Set<string>(Object.values(CMS_GLOBAL_SETTING_KEYS));
const CMS_VERSION_BATCH_SIZE = 100;

function parseRequestedKeys(request: NextRequest) {
  const direct = request.nextUrl.searchParams.getAll("key");
  if (direct.length > 0) {
    return [...new Set(direct.map((value) => value.trim()).filter(Boolean))];
  }

  const csv = request.nextUrl.searchParams.get("keys");
  if (!csv) return [];
  return [...new Set(csv.split(",").map((value) => value.trim()).filter(Boolean))];
}

function parseRequestedLocale(request: NextRequest) {
  const localeRaw = request.nextUrl.searchParams.get("locale")?.trim().toLowerCase().replaceAll("_", "-");
  if (!localeRaw || localeRaw === "default") return "default";
  return resolveLocaleFromAcceptLanguage(localeRaw);
}

function mergeSettings(
  baseRows: RuntimeSettingRow[],
  overrides: Record<string, string>,
  requestedKeys: string[],
) {
  const byKey = new Map<string, RuntimeSettingRow>();
  baseRows.forEach((row) => byKey.set(row.key, row));

  Object.entries(overrides).forEach(([key, value]) => {
    if (requestedKeys.length && !requestedKeys.includes(key)) return;
    const existing = byKey.get(key);
    byKey.set(key, {
      key,
      value,
      category: existing?.category ?? "cms",
    });
  });

  const rows = [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key));
  if (!requestedKeys.length) return rows;
  return rows.filter((row) => requestedKeys.includes(row.key));
}

async function fetchCmsDocumentVersionsInBatches(
  readClient: SupabaseClient<Database>,
  versionIds: number[],
) {
  const versions: Array<{ id: number; content: unknown }> = [];

  for (let index = 0; index < versionIds.length; index += CMS_VERSION_BATCH_SIZE) {
    const batch = versionIds.slice(index, index + CMS_VERSION_BATCH_SIZE);
    const { data, error } = await readClient
      .from("cms_document_versions" as never)
      .select("id, content")
      .in("id", batch as never);

    if (error) {
      return { data: null, error };
    }

    versions.push(...(((data as Array<{ id: number; content: unknown }> | null) ?? [])));
  }

  return { data: versions, error: null };
}

export async function GET(request: NextRequest) {
  const requestedKeys = parseRequestedKeys(request);
  const locale = parseRequestedLocale(request);

  const serviceClient = createServiceRoleClient();
  const readClient: SupabaseClient<Database> =
    serviceClient ??
    createClient<Database>(getSupabasePublicEnv().url, getSupabasePublicEnv().anonKey);

  let globalSettingsQuery = readClient
    .from("global_settings")
    .select("key, value, category")
    .order("key", { ascending: true });

  if (requestedKeys.length) {
    globalSettingsQuery = globalSettingsQuery.in("key", requestedKeys);
  }

  const { data: globalRows, error: globalError } = await globalSettingsQuery;
  if (globalError) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "GLOBAL_SETTINGS_READ_FAILED",
          message: globalError.message || "Failed to read global settings.",
        },
      },
      { status: 500 },
    );
  }

  const needsCmsRuntime =
    requestedKeys.length === 0 || requestedKeys.some((key) => CMS_RUNTIME_KEYS.has(key));
  if (!needsCmsRuntime) {
    return NextResponse.json({
      ok: true,
      data: (globalRows ?? []) as RuntimeSettingRow[],
    });
  }

  const cmsDocTypes = ["page_config", "text_overrides", "design_tokens", "custom_css"];
  const localeCandidates = [...new Set([locale, "default"])];

  const { data: docs, error: docsError } = await readClient
    .from("cms_documents" as never)
    .select("page_id, locale, doc_type, current_version_id")
    .in("doc_type", cmsDocTypes as never)
    .in("locale", localeCandidates as never)
    .eq("status", "published");

  if (docsError) {
    return NextResponse.json({
      ok: true,
      data: (globalRows ?? []) as RuntimeSettingRow[],
    });
  }

  const currentVersionIds = [...new Set(
    ((docs as Array<{ current_version_id?: number | null }> | null) ?? [])
      .map((doc) => doc.current_version_id ?? null)
      .filter((value): value is number => typeof value === "number"),
  )];

  if (!currentVersionIds.length) {
    return NextResponse.json({
      ok: true,
      data: (globalRows ?? []) as RuntimeSettingRow[],
    });
  }

  const { data: versions, error: versionsError } = await fetchCmsDocumentVersionsInBatches(
    readClient,
    currentVersionIds,
  );

  if (versionsError) {
    return NextResponse.json({
      ok: true,
      data: (globalRows ?? []) as RuntimeSettingRow[],
    });
  }

  const cmsOverrides = buildCmsSettingsFromDocuments(
    (docs as Array<{
      page_id: string;
      locale: string;
      doc_type: "page_config" | "text_overrides" | "design_tokens" | "custom_css";
      current_version_id: number | null;
    }>) ?? [],
    (versions as Array<{ id: number; content: unknown }>) ?? [],
    locale,
  );

  const merged = mergeSettings(
    (globalRows ?? []) as RuntimeSettingRow[],
    cmsOverrides,
    requestedKeys,
  );

  return NextResponse.json({
    ok: true,
    data: merged,
  });
}
