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
  const locale = settings.find((s) => typeof s.locale === "string" && s.locale.trim())?.locale?.trim() || "default";

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

async function appendCmsDocumentVersion(
  client: SupabaseClient<Database>,
  write: CmsDocumentWrite,
) {
  const table = client.from("cms_documents" as never);
  let query = table
    .select("id")
    .eq("page_id", write.pageId)
    .eq("locale", write.locale)
    .eq("doc_type", write.docType)
    .eq("status", "published");

  query = write.blockId
    ? query.eq("block_id", write.blockId)
    : query.is("block_id", null);

  const { data: existing, error: lookupError } = await query.maybeSingle();
  if (lookupError) throw lookupError;

  let documentId = (existing as { id?: number } | null)?.id ?? null;
  if (!documentId) {
    const { data: inserted, error: insertDocError } = await client
      .from("cms_documents" as never)
      .insert({
        page_id: write.pageId,
        block_id: write.blockId,
        locale: write.locale,
        doc_type: write.docType,
        status: "published",
      } as never)
      .select("id")
      .single();

    if (insertDocError) throw insertDocError;
    documentId = (inserted as { id: number }).id;
  }

  const { data: latestVersionRow, error: latestVersionError } = await client
    .from("cms_document_versions" as never)
    .select("version")
    .eq("document_id", documentId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestVersionError) throw latestVersionError;
  const nextVersion = ((latestVersionRow as { version?: number } | null)?.version ?? 0) + 1;

  const { data: insertedVersion, error: insertVersionError } = await client
    .from("cms_document_versions" as never)
    .insert({
      document_id: documentId,
      version: nextVersion,
      content: write.content,
    } as never)
    .select("id")
    .single();

  if (insertVersionError) throw insertVersionError;

  const versionId = (insertedVersion as { id: number }).id;
  const { error: updateDocError } = await client
    .from("cms_documents" as never)
    .update({
      current_version_id: versionId,
      updated_at: new Date().toISOString(),
    } as never)
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
