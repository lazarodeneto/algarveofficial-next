/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { deepMergeContent } from "@/lib/cms/server-persistence";
import {
  CMS_PAGE_DEFINITION_MAP,
  getCmsPageRegistryMeta,
  isCmsPageEditableInFullBuilder,
} from "@/lib/cms/pageBuilderRegistry";
import {
  adminErrorResponse,
  requireAdminWriteClient,
} from "@/lib/server/admin-auth";

type DocumentId = string | number;

interface CmsDocumentRow {
  id: DocumentId;
  page_id: string;
  locale: string;
  doc_type: "page_config";
  status?: string | null;
  current_version_id?: DocumentId | null;
  updated_at?: string | null;
}

interface CmsDocumentVersionRow {
  id: DocumentId;
  document_id: DocumentId;
  version: number;
  content: Record<string, unknown>;
  is_published: boolean;
  created_at: string;
}

interface FetchDocumentVersionsResult {
  data: CmsDocumentVersionRow[] | null;
  error: unknown;
  hasIsPublishedColumn: boolean;
}

type PageConfigAction = "save_draft" | "publish";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") return "";
  return "message" in error ? String((error as { message?: unknown }).message ?? "") : "";
}

function isMissingCmsDocumentsColumnError(error: unknown, column: string) {
  const message = getErrorMessage(error).toLowerCase();
  const normalizedColumn = column.toLowerCase();
  return (
    message.includes(`column cms_documents.${normalizedColumn} does not exist`) ||
    message.includes(`could not find the '${normalizedColumn}' column of 'cms_documents'`)
  );
}

function isMissingCmsDocumentVersionsColumnError(error: unknown, column: string) {
  const message = getErrorMessage(error).toLowerCase();
  const normalizedColumn = column.toLowerCase();
  return (
    message.includes(`column cms_document_versions.${normalizedColumn} does not exist`) ||
    message.includes(`could not find the '${normalizedColumn}' column of 'cms_document_versions'`)
  );
}

function isDuplicateRowError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes("duplicate key") || message.includes("unique constraint");
}

function asDocumentRow(value: unknown): CmsDocumentRow | null {
  if (!isRecord(value)) return null;
  const id = value.id as DocumentId | undefined;
  const pageId = value.page_id;
  const locale = value.locale;
  const docType = value.doc_type;

  if ((typeof id !== "string" && typeof id !== "number") || typeof pageId !== "string" || typeof locale !== "string" || docType !== "page_config") {
    return null;
  }

  return {
    id,
    page_id: pageId,
    locale,
    doc_type: "page_config",
    status: typeof value.status === "string" ? value.status : null,
    current_version_id:
      typeof value.current_version_id === "string" || typeof value.current_version_id === "number"
        ? (value.current_version_id as DocumentId)
        : null,
    updated_at: typeof value.updated_at === "string" ? value.updated_at : null,
  };
}

function asVersionRows(
  rows: unknown,
  options?: { hasIsPublishedColumn?: boolean },
): CmsDocumentVersionRow[] {
  if (!Array.isArray(rows)) return [];
  const hasIsPublishedColumn = options?.hasIsPublishedColumn !== false;

  return rows
    .map((row) => {
      if (!isRecord(row)) return null;

      const id = row.id as DocumentId | undefined;
      const documentId = row.document_id as DocumentId | undefined;
      const version = Number(row.version ?? 0);

      if (
        (typeof id !== "string" && typeof id !== "number") ||
        (typeof documentId !== "string" && typeof documentId !== "number") ||
        !Number.isFinite(version)
      ) {
        return null;
      }

      return {
        id,
        document_id: documentId,
        version,
        content: isRecord(row.content) ? row.content : {},
        is_published: hasIsPublishedColumn
          ? typeof row.is_published === "boolean"
          : false,
        created_at: typeof row.created_at === "string" ? row.created_at : "",
      } satisfies CmsDocumentVersionRow;
    })
    .filter((row): row is CmsDocumentVersionRow => row !== null);
}

function sameId(left: DocumentId | null | undefined, right: DocumentId | null | undefined) {
  if (left === null || left === undefined || right === null || right === undefined) {
    return false;
  }
  return String(left) === String(right);
}

function isKnownPageId(pageId: string) {
  return Boolean(CMS_PAGE_DEFINITION_MAP[pageId]);
}

function getRevalidatablePath(pageId: string, locale: string) {
  const path = CMS_PAGE_DEFINITION_MAP[pageId]?.path;
  if (!path || path.includes(":")) return null;
  const normalizedPath = path === "/" ? "" : path;
  return locale && locale !== "default" ? `/${locale}${normalizedPath}` : normalizedPath || "/";
}

async function fetchPageConfigDocument(client: any, pageId: string, locale: string) {
  const baseQuery = client
    .from("cms_documents" as never)
    .select("*")
    .eq("page_id", pageId as never)
    .eq("locale", locale as never)
    .eq("doc_type", "page_config" as never);

  const withBlockScope = await (baseQuery
    .eq("block_scope", "__page__" as never)
    .maybeSingle() as Promise<{ data: unknown; error: unknown }>);

  if (!withBlockScope.error) {
    return {
      data: asDocumentRow(withBlockScope.data),
      error: null,
    };
  }

  if (!isMissingCmsDocumentsColumnError(withBlockScope.error, "block_scope")) {
    return {
      data: null,
      error: withBlockScope.error,
    };
  }

  const withBlockId = await (baseQuery
    .is("block_id", null as never)
    .maybeSingle() as Promise<{ data: unknown; error: unknown }>);

  if (!withBlockId.error) {
    return {
      data: asDocumentRow(withBlockId.data),
      error: null,
    };
  }

  if (!isMissingCmsDocumentsColumnError(withBlockId.error, "block_id")) {
    return {
      data: null,
      error: withBlockId.error,
    };
  }

  const withoutBlockColumn = await (client
    .from("cms_documents" as never)
    .select("*")
    .eq("page_id", pageId as never)
    .eq("locale", locale as never)
    .eq("doc_type", "page_config" as never)
    .maybeSingle() as Promise<{ data: unknown; error: unknown }>);

  return {
    data: asDocumentRow(withoutBlockColumn.data),
    error: withoutBlockColumn.error,
  };
}

async function fetchDocumentVersions(client: any, documentId: DocumentId): Promise<FetchDocumentVersionsResult> {
  const withPublishedFlag = await (client
    .from("cms_document_versions" as never)
    .select("id, document_id, version, content, is_published, created_at")
    .eq("document_id", documentId as never)
    .order("version", { ascending: false })
    .limit(200) as Promise<{ data: unknown; error: unknown }>);

  if (!withPublishedFlag.error) {
    return {
      data: asVersionRows(withPublishedFlag.data, { hasIsPublishedColumn: true }),
      error: null,
      hasIsPublishedColumn: true,
    };
  }

  if (!isMissingCmsDocumentVersionsColumnError(withPublishedFlag.error, "is_published")) {
    return {
      data: null,
      error: withPublishedFlag.error,
      hasIsPublishedColumn: true,
    };
  }

  const withoutPublishedFlag = await (client
    .from("cms_document_versions" as never)
    .select("id, document_id, version, content, created_at")
    .eq("document_id", documentId as never)
    .order("version", { ascending: false })
    .limit(200) as Promise<{ data: unknown; error: unknown }>);

  if (withoutPublishedFlag.error) {
    return {
      data: null,
      error: withoutPublishedFlag.error,
      hasIsPublishedColumn: false,
    };
  }

  return {
    data: asVersionRows(withoutPublishedFlag.data, { hasIsPublishedColumn: false }),
    error: null,
    hasIsPublishedColumn: false,
  };
}

function pickLatestVersions(
  versions: CmsDocumentVersionRow[],
  currentVersionId?: DocumentId | null,
) {
  const latestDraft = versions[0] ?? null;
  let latestPublished = versions.find((version) => version.is_published) ?? null;

  if (!latestPublished && currentVersionId !== null && currentVersionId !== undefined) {
    latestPublished =
      versions.find((version) => sameId(version.id, currentVersionId)) ?? null;
  }

  return {
    latestDraft,
    latestPublished,
  };
}

async function ensurePageConfigDocument(
  client: any,
  pageId: string,
  locale: string,
  userId: string,
) {
  const found = await fetchPageConfigDocument(client, pageId, locale);
  if (found.error) return { data: null, error: found.error };
  if (found.data) return { data: found.data, error: null };

  const basePayload: Record<string, unknown> = {
    page_id: pageId,
    locale,
    doc_type: "page_config",
  };

  const candidatePayloads: Record<string, unknown>[] = [
    { ...basePayload, block_scope: "__page__", status: "draft", created_by: userId },
    { ...basePayload, block_scope: "__page__", status: "draft" },
    { ...basePayload, block_scope: "__page__" },
    { ...basePayload, block_id: null, status: "draft", created_by: userId },
    { ...basePayload, block_id: null, status: "draft" },
    { ...basePayload, block_id: null },
    { ...basePayload, status: "draft", created_by: userId },
    { ...basePayload, status: "draft" },
    { ...basePayload },
  ];

  let lastError: unknown = null;

  for (const payload of candidatePayloads) {
    const inserted = await (client
      .from("cms_documents" as never)
      .insert(payload as never)
      .select("*")
      .single() as Promise<{ data: unknown; error: unknown }>);

    if (!inserted.error) {
      const insertedRow = asDocumentRow(inserted.data);
      if (insertedRow) {
        return {
          data: insertedRow,
          error: null,
        };
      }
    }

    if (isDuplicateRowError(inserted.error)) {
      const retry = await fetchPageConfigDocument(client, pageId, locale);
      if (!retry.error && retry.data) {
        return { data: retry.data, error: null };
      }
    }

    lastError = inserted.error;
  }

  const retry = await fetchPageConfigDocument(client, pageId, locale);
  if (!retry.error && retry.data) {
    return { data: retry.data, error: null };
  }

  return { data: null, error: retry.error ?? lastError };
}

async function insertDocumentVersion(params: {
  client: any;
  documentId: DocumentId;
  nextVersion: number;
  mergedContent: Record<string, unknown>;
  userId: string;
  hasIsPublishedColumn: boolean;
}) {
  const {
    client,
    documentId,
    nextVersion,
    mergedContent,
    userId,
    hasIsPublishedColumn,
  } = params;

  const basePayload: Record<string, unknown> = {
    document_id: documentId,
    version: nextVersion,
    content: mergedContent,
  };

  const candidatePayloads: Record<string, unknown>[] = hasIsPublishedColumn
    ? [
        { ...basePayload, is_published: false, note: "Saved draft from Admin Page Builder", created_by: userId },
        { ...basePayload, is_published: false, created_by: userId },
        { ...basePayload, is_published: false },
        { ...basePayload },
      ]
    : [
        { ...basePayload, note: "Saved draft from Admin Page Builder", created_by: userId },
        { ...basePayload, created_by: userId },
        { ...basePayload },
      ];

  const selectColumns = hasIsPublishedColumn
    ? "id, document_id, version, content, is_published, created_at"
    : "id, document_id, version, content, created_at";

  let lastError: unknown = null;

  for (const payload of candidatePayloads) {
    const inserted = await (client
      .from("cms_document_versions" as never)
      .insert(payload as never)
      .select(selectColumns)
      .single() as Promise<{ data: unknown; error: unknown }>);

    if (!inserted.error) {
      const rows = asVersionRows(inserted.data ? [inserted.data] : [], {
        hasIsPublishedColumn,
      });
      if (rows[0]) {
        return { data: rows[0], error: null };
      }
    }

    lastError = inserted.error;
  }

  return { data: null, error: lastError };
}

async function updateDocumentWithFallback(
  client: any,
  documentId: DocumentId,
  updates: Record<string, unknown>,
) {
  const payload = { ...updates };

  while (Object.keys(payload).length > 0) {
    const updateResult = await (client
      .from("cms_documents" as never)
      .update(payload as never)
      .eq("id", documentId as never) as Promise<{ error: unknown }>);

    if (!updateResult.error) {
      return { error: null };
    }

    const removableColumns = Object.keys(payload).filter((column) =>
      isMissingCmsDocumentsColumnError(updateResult.error, column),
    );

    if (removableColumns.length === 0) {
      return { error: updateResult.error };
    }

    removableColumns.forEach((column) => {
      delete payload[column];
    });
  }

  return { error: null };
}

export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can read CMS page config.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for CMS page config reads.",
    },
  );
  if ("error" in auth) return auth.error;

  const pageId = request.nextUrl.searchParams.get("page_id")?.trim() ?? "";
  const locale = request.nextUrl.searchParams.get("locale")?.trim() ?? "default";

  if (!pageId) {
    return adminErrorResponse(400, "INVALID_PAGE_ID", "Missing required page_id.");
  }

  if (!isKnownPageId(pageId)) {
    return adminErrorResponse(400, "UNKNOWN_PAGE_ID", `Unknown CMS page_id "${pageId}".`);
  }

  const docResult = await fetchPageConfigDocument(auth.writeClient as never, pageId, locale);
  if (docResult.error) {
    console.error("[admin-cms-page-config] document lookup failed", {
      request_id: requestId,
      page_id: pageId,
      locale,
      error: getErrorMessage(docResult.error) || String(docResult.error),
    });
    return adminErrorResponse(
      500,
      "CMS_DOCUMENT_LOOKUP_FAILED",
      getErrorMessage(docResult.error) || "Failed to query cms_documents.",
    );
  }

  if (!docResult.data) {
    return NextResponse.json({
      ok: true,
      data: {
        page_id: pageId,
        locale,
        document_id: null,
        content: {},
        latest_draft_version: null,
        latest_published_version: null,
      },
    });
  }

  const versionsResult = await fetchDocumentVersions(auth.writeClient as never, docResult.data.id);
  if (versionsResult.error) {
    console.error("[admin-cms-page-config] versions lookup failed", {
      request_id: requestId,
      page_id: pageId,
      locale,
      document_id: docResult.data.id,
      error: getErrorMessage(versionsResult.error) || String(versionsResult.error),
    });
    return adminErrorResponse(
      500,
      "CMS_DOCUMENT_VERSIONS_LOOKUP_FAILED",
      getErrorMessage(versionsResult.error) || "Failed to query cms_document_versions.",
    );
  }

  const versions = versionsResult.data ?? [];
  const { latestDraft, latestPublished } = pickLatestVersions(
    versions,
    docResult.data.current_version_id,
  );

  return NextResponse.json({
    ok: true,
    data: {
      page_id: pageId,
      locale,
      document_id: docResult.data.id,
      content: latestDraft?.content ?? latestPublished?.content ?? {},
      latest_draft_version: latestDraft?.version ?? null,
      latest_published_version: latestPublished?.version ?? null,
      latest_draft_version_id: latestDraft?.id ?? null,
      latest_published_version_id: latestPublished?.id ?? null,
    },
  });
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can update CMS page config.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for CMS page config writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  if (!isRecord(body)) {
    return adminErrorResponse(400, "INVALID_PAYLOAD", "Request body must be an object.");
  }

  const action = (body.action as string | undefined)?.trim() as PageConfigAction | undefined;
  const pageId = (body.page_id as string | undefined)?.trim() ?? "";
  const locale = (body.locale as string | undefined)?.trim() ?? "default";

  if (!action || (action !== "save_draft" && action !== "publish")) {
    return adminErrorResponse(
      400,
      "INVALID_ACTION",
      "action must be either save_draft or publish.",
    );
  }

  if (!pageId) {
    return adminErrorResponse(400, "INVALID_PAGE_ID", "Missing required page_id.");
  }

  if (!isKnownPageId(pageId)) {
    return adminErrorResponse(400, "UNKNOWN_PAGE_ID", `Unknown CMS page_id "${pageId}".`);
  }

  if (!isCmsPageEditableInFullBuilder(pageId)) {
    const meta = getCmsPageRegistryMeta(pageId);
    return adminErrorResponse(
      400,
      "CMS_PAGE_NOT_EDITABLE",
      `CMS page_id "${pageId}" is ${meta.status} in Full Page Builder. Public renderer: ${meta.publicRenderer}`,
    );
  }

  const docResult = await ensurePageConfigDocument(auth.writeClient as never, pageId, locale, auth.userId);
  if (docResult.error || !docResult.data) {
    console.error("[admin-cms-page-config] ensure document failed", {
      request_id: requestId,
      action,
      page_id: pageId,
      locale,
      error: getErrorMessage(docResult.error) || String(docResult.error),
    });
    return adminErrorResponse(
      500,
      "CMS_DOCUMENT_ENSURE_FAILED",
      getErrorMessage(docResult.error) || "Failed to create/read cms_documents row.",
    );
  }

  const document = docResult.data;
  const versionsResult = await fetchDocumentVersions(auth.writeClient as never, document.id);
  if (versionsResult.error) {
    return adminErrorResponse(
      500,
      "CMS_DOCUMENT_VERSIONS_LOOKUP_FAILED",
      getErrorMessage(versionsResult.error) || "Failed to query cms_document_versions.",
    );
  }

  const versions = versionsResult.data ?? [];
  const latestVersion = versions[0] ?? null;

  if (action === "save_draft") {
    const incomingContent = isRecord(body.content) ? body.content : {};
    const mergedContent = deepMergeContent(latestVersion?.content ?? {}, incomingContent);
    const nextVersion = (latestVersion?.version ?? 0) + 1;

    const insertedVersionResult = await insertDocumentVersion({
      client: auth.writeClient,
      documentId: document.id,
      nextVersion,
      mergedContent,
      userId: auth.userId,
      hasIsPublishedColumn: versionsResult.hasIsPublishedColumn,
    });

    if (insertedVersionResult.error || !insertedVersionResult.data) {
      return adminErrorResponse(
        500,
        "CMS_DOCUMENT_VERSION_INSERT_FAILED",
        getErrorMessage(insertedVersionResult.error) || "Failed to insert draft version.",
      );
    }

    const insertedVersion = insertedVersionResult.data;
    const hasPublished =
      versions.some((version) => version.is_published) ||
      versions.some((version) => sameId(version.id, document.current_version_id));

    const updateDocResult = await updateDocumentWithFallback(
      auth.writeClient,
      document.id,
      {
        updated_at: new Date().toISOString(),
        status: hasPublished ? "published" : "draft",
      },
    );

    if (updateDocResult.error) {
      return adminErrorResponse(
        500,
        "CMS_DOCUMENT_UPDATE_FAILED",
        getErrorMessage(updateDocResult.error) || "Failed to update cms_documents.",
      );
    }

    const nextVersions = [insertedVersion, ...versions];
    const { latestPublished } = pickLatestVersions(nextVersions, document.current_version_id);

    return NextResponse.json({
      ok: true,
      data: {
        page_id: pageId,
        locale,
        document_id: document.id,
        content: insertedVersion.content,
        latest_draft_version: insertedVersion.version,
        latest_published_version: latestPublished?.version ?? null,
      },
    });
  }

  if (!latestVersion) {
    return adminErrorResponse(
      400,
      "CMS_PUBLISH_MISSING_DRAFT",
      "Cannot publish because no draft version exists yet.",
    );
  }

  if (versionsResult.hasIsPublishedColumn && !latestVersion.is_published) {
    const markPublishedResult = await auth.writeClient
      .from("cms_document_versions" as never)
      .update({ is_published: true } as never)
      .eq("id", latestVersion.id as never);
    const markPublishedError = (markPublishedResult as { error?: unknown }).error;

    if (markPublishedError) {
      return adminErrorResponse(
        500,
        "CMS_VERSION_PUBLISH_UPDATE_FAILED",
        getErrorMessage(markPublishedError) || "Failed to mark version as published.",
      );
    }
  }

  const publishDocResult = await updateDocumentWithFallback(
    auth.writeClient,
    document.id,
    {
      current_version_id: latestVersion.id,
      status: "published",
      updated_at: new Date().toISOString(),
    },
  );

  if (publishDocResult.error) {
    return adminErrorResponse(
      500,
      "CMS_DOCUMENT_PUBLISH_FAILED",
      getErrorMessage(publishDocResult.error) || "Failed to publish cms_documents row.",
    );
  }

  revalidateTag(`cms:${pageId}`, "max");
  const pathToRevalidate = getRevalidatablePath(pageId, locale);
  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate);
  }

  return NextResponse.json({
    ok: true,
    data: {
      page_id: pageId,
      locale,
      document_id: document.id,
      content: latestVersion.content,
      latest_draft_version: latestVersion.version,
      latest_published_version: latestVersion.version,
    },
  });
}
