import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";

import { createPublicServerClient } from "@/lib/supabase/public-server";
import { createServiceRoleClient } from "@/lib/supabase/service";

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

interface CmsDocumentRow {
  id: string;
  locale: string;
  current_version_id: string | null;
}

interface CmsDocumentVersionRow {
  id: string;
  version: number;
  content: Record<string, unknown>;
  is_published: boolean;
}

function createCmsReadClient() {
  const service = createServiceRoleClient();
  return (service ?? createPublicServerClient()) as any;
}

function isMissingCmsDocumentVersionsColumnError(error: unknown, column: string) {
  if (!error || typeof error !== "object") return false;
  const message = "message" in error ? String((error as { message?: unknown }).message ?? "") : "";
  return message.toLowerCase().includes(`column cms_document_versions.${column.toLowerCase()} does not exist`);
}

async function fetchLatestVersionForDocument(
  documentId: string,
  isPreview: boolean,
  publishedVersionId: string | null,
): Promise<CmsDocumentVersionRow | null> {
  const supabase: any = createCmsReadClient();

  if (isPreview) {
    const withPublishedFlag = await supabase
      .from("cms_document_versions" as never)
      .select("id, version, content, is_published")
      .eq("document_id", documentId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!withPublishedFlag.error) {
      return (withPublishedFlag.data as CmsDocumentVersionRow | null) ?? null;
    }

    if (!isMissingCmsDocumentVersionsColumnError(withPublishedFlag.error, "is_published")) {
      return null;
    }

    const latestFallback = await supabase
      .from("cms_document_versions" as never)
      .select("id, version, content")
      .eq("document_id", documentId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestFallback.error || !latestFallback.data) {
      return null;
    }

    return {
      ...(latestFallback.data as Omit<CmsDocumentVersionRow, "is_published">),
      is_published: false,
    };
  }

  const withPublishedFlag = await supabase
    .from("cms_document_versions" as never)
    .select("id, version, content, is_published")
    .eq("document_id", documentId)
    .eq("is_published", true)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!withPublishedFlag.error) {
    return (withPublishedFlag.data as CmsDocumentVersionRow | null) ?? null;
  }

  if (!isMissingCmsDocumentVersionsColumnError(withPublishedFlag.error, "is_published")) {
    return null;
  }

  if (!publishedVersionId) {
    return null;
  }

  const publishedByPointer = await supabase
    .from("cms_document_versions" as never)
    .select("id, version, content")
    .eq("document_id", documentId)
    .eq("id", publishedVersionId)
    .maybeSingle();

  if (publishedByPointer.error || !publishedByPointer.data) {
    return null;
  }

  return {
    ...((publishedByPointer.data as unknown) as Omit<CmsDocumentVersionRow, "is_published">),
    is_published: true,
  };
}

async function fetchGolfCmsPageConfigByMode(
  locale: string,
  isPreview: boolean,
): Promise<GolfCmsPageConfig | null> {
  const supabase: any = createCmsReadClient();

  const { data: docs, error } = await supabase
    .from("cms_documents" as never)
    .select("id, locale, current_version_id")
    .eq("page_id", "golf")
    .eq("doc_type", "page_config")
    .in("locale", [locale, "default"]);

  if (error || !docs?.length) {
    return null;
  }

  const orderedDocs = [...((docs as unknown) as CmsDocumentRow[])].sort((a, b) => {
    if (a.locale === locale && b.locale !== locale) return -1;
    if (b.locale === locale && a.locale !== locale) return 1;
    if (a.locale === "default" && b.locale !== "default") return -1;
    if (b.locale === "default" && a.locale !== "default") return 1;
    return 0;
  });

  for (const doc of orderedDocs) {
    const version = await fetchLatestVersionForDocument(
      doc.id,
      isPreview,
      doc.current_version_id,
    );
    if (!version?.content) continue;
    return version.content as GolfCmsPageConfig;
  }

  return null;
}

const getCachedGolfCmsPageConfig = unstable_cache(
  async (locale: string) => fetchGolfCmsPageConfigByMode(locale, false),
  ["golf-cms"],
  { tags: [CMS_TAGS.golf] },
);

export async function getGolfCmsPageConfig(locale: string): Promise<GolfCmsPageConfig | null> {
  const { isEnabled: isPreview } = await draftMode();
  if (isPreview) {
    return fetchGolfCmsPageConfigByMode(locale, true);
  }

  if (process.env.NODE_ENV === "development") {
    return fetchGolfCmsPageConfigByMode(locale, false);
  }

  return getCachedGolfCmsPageConfig(locale);
}
