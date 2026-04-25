import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";

interface GlobalSettingWriteItem {
  key: string;
  value: string;
  locale?: string | null;
}

type CmsDocType = "page_config" | "text_overrides" | "design_tokens" | "custom_css";

interface CmsDocumentWrite {
  pageId: string;
  blockId: string | null;
  locale: string;
  docType: CmsDocType;
  content: Record<string, unknown>;
}

interface CmsDocumentsCapabilities {
  blockKey: "block_id" | "block_scope" | null;
  hasStatus: boolean;
}

let cachedCmsDocumentsCapabilities: CmsDocumentsCapabilities | null = null;

function isMissingCmsDocumentsColumnError(error: unknown, column: string) {
  if (!error || typeof error !== "object") return false;
  const message = "message" in error ? String((error as { message?: unknown }).message ?? "") : "";
  return message.toLowerCase().includes(`column cms_documents.${column.toLowerCase()} does not exist`);
}

async function detectCmsDocumentsCapabilities(
  client: SupabaseClient<Database>,
): Promise<CmsDocumentsCapabilities> {
  if (cachedCmsDocumentsCapabilities) {
    return cachedCmsDocumentsCapabilities;
  }

  const statusProbe = await client.from("cms_documents" as never).select("id, status").limit(1);
  let hasStatus = true;
  if (statusProbe.error) {
    if (isMissingCmsDocumentsColumnError(statusProbe.error, "status")) {
      hasStatus = false;
    } else {
      throw statusProbe.error;
    }
  }

  const blockIdProbe = await client.from("cms_documents" as never).select("id, block_id").limit(1);
  let blockKey: CmsDocumentsCapabilities["blockKey"] = "block_id";
  if (blockIdProbe.error) {
    if (isMissingCmsDocumentsColumnError(blockIdProbe.error, "block_id")) {
      const blockScopeProbe = await client
        .from("cms_documents" as never)
        .select("id, block_scope")
        .limit(1);

      if (blockScopeProbe.error) {
        if (isMissingCmsDocumentsColumnError(blockScopeProbe.error, "block_scope")) {
          blockKey = null;
        } else {
          throw blockScopeProbe.error;
        }
      } else {
        blockKey = "block_scope";
      }
    } else {
      throw blockIdProbe.error;
    }
  }

  cachedCmsDocumentsCapabilities = {
    blockKey,
    hasStatus,
  };

  return cachedCmsDocumentsCapabilities;
}

function parseJsonObject(raw: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function buildCmsWritesFromGlobalSettings(settings: GlobalSettingWriteItem[]): CmsDocumentWrite[] {
  const writes: CmsDocumentWrite[] = [];
  const locale = settings.find((s) => typeof s.locale === "string" && s.locale.trim())?.locale?.trim() ?? "default";

  const pageConfigs = settings.find((s) => s.key === CMS_GLOBAL_SETTING_KEYS.pageConfigs)?.value;
  if (pageConfigs) {
    const parsed = parseJsonObject(pageConfigs);
    if (parsed) {
      Object.entries(parsed).forEach(([pageId, content]) => {
        writes.push({
          pageId,
          blockId: null,
          locale,
          docType: "page_config",
          content:
            content && typeof content === "object" && !Array.isArray(content)
              ? (content as Record<string, unknown>)
              : {},
        });
      });
    }
  }

  const textOverrides = settings.find((s) => s.key === CMS_GLOBAL_SETTING_KEYS.textOverrides)?.value;
  if (textOverrides) {
    writes.push({
      pageId: "__global__",
      blockId: null,
      locale,
      docType: "text_overrides",
      content: parseJsonObject(textOverrides) ?? {},
    });
  }

  const designTokens = settings.find((s) => s.key === CMS_GLOBAL_SETTING_KEYS.designTokens)?.value;
  if (designTokens) {
    writes.push({
      pageId: "__global__",
      blockId: null,
      locale,
      docType: "design_tokens",
      content: parseJsonObject(designTokens) ?? {},
    });
  }

  const customCss = settings.find((s) => s.key === CMS_GLOBAL_SETTING_KEYS.customCss)?.value;
  if (typeof customCss === "string") {
    writes.push({
      pageId: "__global__",
      blockId: null,
      locale,
      docType: "custom_css",
      content: { css: customCss },
    });
  }

  return writes;
}

export function deepMergeContent(
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...existing };

  for (const [key, value] of Object.entries(incoming)) {
    if (value === null || value === undefined) {
      continue;
    }
    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      value !== null &&
      existing[key] &&
      typeof existing[key] === "object" &&
      !Array.isArray(existing[key])
    ) {
      result[key] = deepMergeContent(
        existing[key] as Record<string, unknown>,
        value as Record<string, unknown>,
      );
    } else {
      result[key] = value;
    }
  }

  return result;
}

async function appendCmsDocumentVersion(
  client: SupabaseClient<Database>,
  write: CmsDocumentWrite,
) {
  const capabilities = await detectCmsDocumentsCapabilities(client);
  const table = client.from("cms_documents" as never);
  let query = table
    .select("id")
    .eq("page_id", write.pageId)
    .eq("locale", write.locale)
    .eq("doc_type", write.docType);

  if (capabilities.blockKey === "block_id") {
    query = write.blockId
      ? query.eq("block_id", write.blockId)
      : query.is("block_id", null);
  } else if (capabilities.blockKey === "block_scope") {
    query = query.eq("block_scope", write.blockId ?? "__page__");
  }

  const { data: existing, error: lookupError } = await query.maybeSingle();
  if (lookupError) throw lookupError;

  let documentId = (existing as { id?: number } | null)?.id ?? null;
  if (!documentId) {
    const insertPayload: Record<string, unknown> = {
      page_id: write.pageId,
      locale: write.locale,
      doc_type: write.docType,
    };

    if (capabilities.blockKey === "block_id") {
      insertPayload.block_id = write.blockId;
    } else if (capabilities.blockKey === "block_scope") {
      insertPayload.block_scope = write.blockId ?? "__page__";
    }

    if (capabilities.hasStatus) {
      insertPayload.status = "published";
    }

    const { data: inserted, error: insertDocError } = await client
      .from("cms_documents" as never)
      .insert(insertPayload as never)
      .select("id")
      .single();

    if (insertDocError) throw insertDocError;
    documentId = (inserted as { id: number }).id;
  }

  const { data: latestVersionRow, error: latestVersionError } = await client
    .from("cms_document_versions" as never)
    .select("version, content")
    .eq("document_id", documentId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestVersionError) throw latestVersionError;
  const nextVersion = ((latestVersionRow as { version?: number } | null)?.version ?? 0) + 1;

  const existingContent = (latestVersionRow as { content?: Record<string, unknown> } | null)?.content ?? {};
  const newContent = write.content ?? {};
  const mergedContent = deepMergeContent(existingContent, newContent);

  const { data: insertedVersion, error: insertVersionError } = await client
    .from("cms_document_versions" as never)
    .insert({
      document_id: documentId,
      version: nextVersion,
      content: mergedContent,
    } as never)
    .select("id")
    .single();

  if (insertVersionError) throw insertVersionError;

  const versionId = (insertedVersion as { id: number }).id;
  const updatePayload: Record<string, unknown> = {
    current_version_id: versionId,
    updated_at: new Date().toISOString(),
  };

  if (capabilities.hasStatus) {
    updatePayload.status = "published";
  }

  const { error: updateDocError } = await client
    .from("cms_documents" as never)
    .update(updatePayload as never)
    .eq("id", documentId);

  if (updateDocError) throw updateDocError;
}

export async function syncCmsDocumentsFromGlobalSettings(
  client: SupabaseClient<Database>,
  settings: GlobalSettingWriteItem[],
) {
  const writes = buildCmsWritesFromGlobalSettings(settings);
  for (const write of writes) {
    await appendCmsDocumentVersion(client, write);
  }
}
