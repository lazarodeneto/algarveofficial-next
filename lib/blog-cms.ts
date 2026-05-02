import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { CMS_TAGS } from "./golf-cms";

export interface BlogPageConfig {
  hero?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    mediaType?: string;
    imageUrl?: string;
    videoUrl?: string;
    youtubeUrl?: string;
    posterUrl?: string;
    alt?: string;
    ctaPrimary?: string;
    ctaSecondary?: string;
  };
}

async function fetchBlogPageConfig(locale: string): Promise<BlogPageConfig | null> {
  const supabase = createPublicServerClient();
  const { isEnabled: isPreview } = await draftMode();

  let docsQuery = supabase
    .from("cms_documents")
    .select("id, page_id, locale, doc_type, current_version_id, status")
    .eq("page_id", "blog")
    .eq("doc_type", "page_config")
    .in("locale", [locale, "default"])
    .order("locale", { ascending: false });

  if (!isPreview) {
    docsQuery = docsQuery.eq("status", "published");
  }

  const { data: docs, error } = await docsQuery;

  if (error || !docs?.length) return null;

  const bestDoc = docs.find((d: { locale: string }) => d.locale === locale) ?? docs[0];

  if (!bestDoc?.current_version_id) {
    return null;
  }

  if (isPreview) {
    const { data: latestVersion } = await supabase
      .from("cms_document_versions")
      .select("id, content, created_at")
      .eq("document_id", bestDoc.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (latestVersion?.content) {
      return latestVersion.content as BlogPageConfig;
    }
  }

  const { data: version } = await supabase
    .from("cms_document_versions")
    .select("content")
    .eq("id", bestDoc.current_version_id)
    .single();

  if (!version?.content) {
    return null;
  }

  return version.content as BlogPageConfig;
}

export const getBlogPageConfig = unstable_cache(
  fetchBlogPageConfig,
  ["blog-cms"],
  { tags: [CMS_TAGS.blog] }
);
