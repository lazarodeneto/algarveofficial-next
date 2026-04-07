import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";

export interface CmsRuntimeDocumentRow {
  page_id: string;
  locale: string;
  block_id?: string | null;
  doc_type: "page_config" | "text_overrides" | "design_tokens" | "custom_css";
  current_version_id: number | null;
}

export interface CmsRuntimeVersionRow {
  id: number;
  content: unknown;
}

function parseObjectContent(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function pickBestLocale<T extends { locale: string }>(
  rows: T[],
  locale: string,
) {
  if (!rows.length) return null;
  const exact = rows.find((row) => row.locale === locale);
  if (exact) return exact;
  const fallback = rows.find((row) => row.locale === "default");
  if (fallback) return fallback;
  return rows[0];
}

export function buildCmsSettingsFromDocuments(
  docs: CmsRuntimeDocumentRow[],
  versions: CmsRuntimeVersionRow[],
  locale: string,
) {
  const versionMap = new Map<number, unknown>();
  versions.forEach((row) => versionMap.set(row.id, row.content));

  // Only page-level page_config docs should feed cms_page_configs_v1.
  // Legacy block-level docs (block_id != null) can coexist in cms_documents and must be ignored here.
  const pageConfigDocs = docs.filter(
    (doc) => doc.doc_type === "page_config" && (doc.block_id ?? null) === null,
  );
  const groupedByPage = new Map<string, CmsRuntimeDocumentRow[]>();
  pageConfigDocs.forEach((doc) => {
    const bucket = groupedByPage.get(doc.page_id) ?? [];
    bucket.push(doc);
    groupedByPage.set(doc.page_id, bucket);
  });

  const pageConfigs: Record<string, unknown> = {};
  groupedByPage.forEach((rows, pageId) => {
    const chosen = pickBestLocale(rows, locale);
    if (!chosen?.current_version_id) return;
    pageConfigs[pageId] = parseObjectContent(versionMap.get(chosen.current_version_id));
  });

  const pickGlobalDocContent = (docType: CmsRuntimeDocumentRow["doc_type"]) => {
    const matching = docs.filter(
      (doc) => doc.doc_type === docType && doc.page_id === "__global__",
    );
    const chosen = pickBestLocale(matching, locale);
    if (!chosen?.current_version_id) return {};
    return parseObjectContent(versionMap.get(chosen.current_version_id));
  };

  const textOverrides = pickGlobalDocContent("text_overrides");
  const designTokens = pickGlobalDocContent("design_tokens");
  const customCssContent = pickGlobalDocContent("custom_css");
  const customCss =
    typeof customCssContent.css === "string" ? customCssContent.css : "";

  return {
    [CMS_GLOBAL_SETTING_KEYS.pageConfigs]: JSON.stringify(pageConfigs),
    [CMS_GLOBAL_SETTING_KEYS.textOverrides]: JSON.stringify(textOverrides),
    [CMS_GLOBAL_SETTING_KEYS.designTokens]: JSON.stringify(designTokens),
    [CMS_GLOBAL_SETTING_KEYS.customCss]: customCss,
  } as Record<string, string>;
}
