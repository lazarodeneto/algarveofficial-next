import { createPublicServerClient } from "@/lib/supabase/public-server";

export interface CmsPageConfig {
  hero?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function getCmsPageConfig(pageId: string, locale: string): Promise<CmsPageConfig | null> {
  const supabase = createPublicServerClient();

  const { data: docs, error } = await supabase
    .from("cms_page_configs_v1")
    .select("page_id, locale, current_version_id")
    .eq("page_id", pageId)
    .eq("doc_type", "page_config")
    .is("block_id", null)
    .in("locale", [locale, "default"])
    .order("locale", { ascending: false });

  if (error || !docs?.length) {
    return null;
  }

  const bestDoc = docs.find((d: { locale: string }) => d.locale === locale) ?? docs[0];

  if (!bestDoc?.current_version_id) {
    return null;
  }

  const { data: version } = await supabase
    .from("cms_page_config_versions")
    .select("content")
    .eq("id", bestDoc.current_version_id)
    .single();

  if (!version?.content) {
    return null;
  }

  return version.content as CmsPageConfig;
}
