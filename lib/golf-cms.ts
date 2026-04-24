import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { createPublicServerClient } from "@/lib/supabase/public-server";

export const CMS_TAGS = {
  golf: "cms:golf",
  blog: "cms:blog",
} as const;

export type CmsTag = (typeof CMS_TAGS)[keyof typeof CMS_TAGS];

export interface GolfCmsPageConfig {
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
    ctaCourses?: string;
    ctaLeaderboard?: string;
  };
  blocks?: Array<{
    id: string;
    type: string;
    enabled?: boolean;
    order?: number;
    settings?: Record<string, unknown>;
  }>;
  featuredCourses?: {
    enabled: boolean;
  };
  courseTools?: {
    enabled: boolean;
  };
  leaderboard?: {
    enabled: boolean;
  };
  cta?: {
    enabled: boolean;
  };
}

async function fetchGolfCmsPageConfig(locale: string): Promise<GolfCmsPageConfig | null> {
  const supabase = createPublicServerClient();
  const { isEnabled: isPreview } = await draftMode();

  console.log("[CMS DEBUG] Fetching golf config, locale:", locale, "preview:", isPreview);

  let docsQuery = supabase
    .from("cms_documents")
    .select("id, page_id, locale, doc_type, current_version_id, status")
    .eq("page_id", "golf")
    .eq("doc_type", "page_config")
    .in("locale", [locale, "default"])
    .order("locale", { ascending: false });

  if (!isPreview) {
    docsQuery = docsQuery.eq("status", "published");
  }

  const { data: docs, error } = await docsQuery;

  console.log("[CMS DEBUG] Docs query result:", { count: docs?.length, error, preview: isPreview });

  if (error || !docs?.length) {
    console.log("[CMS DEBUG] No docs found for golf page");
    return null;
  }

  const bestDoc = docs.find((d: { locale: string }) => d.locale === locale) ?? docs[0];
  console.log("[CMS DEBUG] Best doc:", bestDoc);

  if (!bestDoc?.current_version_id) {
    console.log("[CMS DEBUG] No current_version_id");
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
      console.log("[CMS DEBUG] Preview version content");
      return latestVersion.content as GolfCmsPageConfig;
    }
  }

  const { data: version } = await supabase
    .from("cms_document_versions")
    .select("content")
    .eq("id", bestDoc.current_version_id)
    .single();

  console.log("[CMS DEBUG] Version content:", version);

  if (!version?.content) {
    return null;
  }

  return version.content as GolfCmsPageConfig;
}

export const getGolfCmsPageConfig = unstable_cache(
  fetchGolfCmsPageConfig,
  ["golf-cms"],
  { tags: [CMS_TAGS.golf] }
);