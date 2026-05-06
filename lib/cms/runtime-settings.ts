import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import {
  CMS_GLOBAL_SETTING_KEYS,
  CMS_PAGE_BUILDER_RUNTIME_KEYS,
} from "@/lib/cms/pageBuilderRegistry";
import { buildCmsSettingsFromDocuments } from "@/lib/cms/runtime-resolver";
import { safeJsonParse } from "@/lib/cms/safe-json";
import { resolveLocaleFromAcceptLanguage } from "@/lib/i18n/config";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createServiceRoleClient } from "@/lib/supabase/service";

export interface RuntimeSettingRow {
  key: string;
  value: string;
  category: string | null;
}

interface FetchCmsRuntimeSettingsOptions {
  requestedKeys?: string[];
  locale?: string;
  includeDraft?: boolean;
}

export class CmsRuntimeGlobalSettingsError extends Error {
  code = "GLOBAL_SETTINGS_READ_FAILED" as const;

  constructor(message: string) {
    super(message);
    this.name = "CmsRuntimeGlobalSettingsError";
  }
}

const CMS_RUNTIME_KEYS = new Set<string>(Object.values(CMS_GLOBAL_SETTING_KEYS));
const JSON_RUNTIME_KEYS = new Set<string>([
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.designTokens,
]);
const CMS_VERSION_BATCH_SIZE = 100;

interface CmsRuntimeDocumentRow {
  id?: number | null;
  page_id: string;
  locale: string;
  doc_type: "page_config" | "text_overrides" | "design_tokens" | "custom_css";
  current_version_id: number | null;
}

interface CmsRuntimeVersionRow {
  id: number;
  document_id?: number | null;
  content: unknown;
}

function isMissingCmsDocumentsColumnError(error: unknown, column: string) {
  if (!error || typeof error !== "object") return false;
  const message = "message" in error ? String((error as { message?: unknown }).message ?? "") : "";
  return message.toLowerCase().includes(`column cms_documents.${column.toLowerCase()} does not exist`);
}

export function normalizeCmsRuntimeLocale(localeRaw?: string | null) {
  const normalized = localeRaw?.trim().toLowerCase().replaceAll("_", "-");
  if (!normalized || normalized === "default") return "default";
  return resolveLocaleFromAcceptLanguage(normalized);
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

function sanitizeRuntimeRows(rows: RuntimeSettingRow[]) {
  return rows.map((row) => {
    if (!JSON_RUNTIME_KEYS.has(row.key)) return row;
    const parsed = safeJsonParse<Record<string, unknown>>(row.value, {}, row.key);
    return {
      ...row,
      value: JSON.stringify(parsed),
    };
  });
}

async function fetchCmsDocumentVersionsInBatches(
  readClient: SupabaseClient<Database>,
  versionIds: number[],
) {
  const versions: CmsRuntimeVersionRow[] = [];

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

async function fetchLatestCmsDocumentVersions(
  readClient: SupabaseClient<Database>,
  documentIds: number[],
) {
  const versions: CmsRuntimeVersionRow[] = [];

  for (const documentId of documentIds) {
    const { data, error } = await readClient
      .from("cms_document_versions" as never)
      .select("id, document_id, content")
      .eq("document_id", documentId as never)
      .order("version", { ascending: false })
      .limit(1);

    if (error) {
      return { data: null, error };
    }

    const latest = ((data as CmsRuntimeVersionRow[] | null) ?? [])[0];
    if (latest) {
      versions.push(latest);
    }
  }

  return { data: versions, error: null };
}

export async function fetchCmsRuntimeSettings({
  requestedKeys = [],
  locale: rawLocale,
  includeDraft = false,
}: FetchCmsRuntimeSettingsOptions = {}): Promise<RuntimeSettingRow[]> {
  const locale = normalizeCmsRuntimeLocale(rawLocale);
  const serviceClient = createServiceRoleClient();
  const readClient: SupabaseClient<Database> =
    serviceClient ??
    createClient<Database>(getSupabasePublicEnv().url, getSupabasePublicEnv().anonKey);

  const uniqueRequestedKeys = [...new Set(requestedKeys.map((value) => value.trim()).filter(Boolean))];
  let globalSettingsQuery = readClient
    .from("global_settings")
    .select("key, value, category")
    .order("key", { ascending: true });

  if (uniqueRequestedKeys.length) {
    globalSettingsQuery = globalSettingsQuery.in("key", uniqueRequestedKeys);
  }

  const { data: globalRows, error: globalError } = await globalSettingsQuery;
  if (globalError) {
    throw new CmsRuntimeGlobalSettingsError(
      globalError.message ?? "Failed to read global settings.",
    );
  }

  const baseRows = (globalRows ?? []) as RuntimeSettingRow[];
  const needsCmsRuntime =
    uniqueRequestedKeys.length === 0 || uniqueRequestedKeys.some((key) => CMS_RUNTIME_KEYS.has(key));
  if (!needsCmsRuntime) {
    return sanitizeRuntimeRows(baseRows);
  }

  const cmsDocTypes = ["page_config", "text_overrides", "design_tokens", "custom_css"];
  const localeCandidates = [...new Set([locale, "default"])];

  const queryCmsDocuments = (includeStatusFilter: boolean) => {
    let query = readClient
      .from("cms_documents" as never)
      .select("id, page_id, locale, doc_type, current_version_id")
      .in("doc_type", cmsDocTypes as never)
      .in("locale", localeCandidates as never);

    if (includeStatusFilter && !includeDraft) {
      query = query.eq("status", "published");
    }

    return query;
  };

  let docsResult = await queryCmsDocuments(true);
  if (docsResult.error && isMissingCmsDocumentsColumnError(docsResult.error, "status")) {
    docsResult = await queryCmsDocuments(false);
  }

  const { data: docs, error: docsError } = docsResult;
  if (docsError) {
    return sanitizeRuntimeRows(baseRows);
  }

  const documentRows = ((docs as CmsRuntimeDocumentRow[] | null) ?? []);
  const currentVersionIds = [
    ...new Set(
      documentRows
        .map((doc) => doc.current_version_id ?? null)
        .filter((value): value is number => typeof value === "number"),
    ),
  ];

  if (!includeDraft && !currentVersionIds.length) {
    return sanitizeRuntimeRows(baseRows);
  }

  const latestDraftVersionResult = includeDraft
    ? await fetchLatestCmsDocumentVersions(
        readClient,
        [
          ...new Set(
            documentRows
              .map((doc) => doc.id ?? null)
              .filter((value): value is number => typeof value === "number"),
          ),
        ],
      )
    : null;

  const currentVersionResult = includeDraft
    ? { data: null, error: null }
    : await fetchCmsDocumentVersionsInBatches(readClient, currentVersionIds);

  if (latestDraftVersionResult?.error || currentVersionResult.error) {
    return sanitizeRuntimeRows(baseRows);
  }

  const draftVersions = latestDraftVersionResult?.data ?? [];
  const draftVersionByDocumentId = new Map(
    draftVersions
      .filter((version) => typeof version.document_id === "number")
      .map((version) => [version.document_id as number, version]),
  );
  const docsForResolver = includeDraft
    ? documentRows.map((doc) => ({
        ...doc,
        current_version_id:
          (typeof doc.id === "number" ? draftVersionByDocumentId.get(doc.id)?.id : null) ??
          doc.current_version_id,
      }))
    : documentRows;
  const versions = includeDraft ? draftVersions : currentVersionResult.data ?? [];

  if (!versions.length) {
    return sanitizeRuntimeRows(baseRows);
  }

  const cmsOverrides = buildCmsSettingsFromDocuments(
    (docsForResolver as Array<{
      page_id: string;
      locale: string;
      doc_type: "page_config" | "text_overrides" | "design_tokens" | "custom_css";
      current_version_id: number | null;
    }>) ?? [],
    versions,
    locale,
  );

  return sanitizeRuntimeRows(mergeSettings(baseRows, cmsOverrides, uniqueRequestedKeys));
}
