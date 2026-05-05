/* eslint-disable no-console */
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { requireAdminReadClient } from "@/lib/server/admin-auth";

type CmsDocType = "page_config" | "text_overrides" | "design_tokens" | "custom_css";
const VALID_DOC_TYPES = new Set<CmsDocType>([
  "page_config",
  "text_overrides",
  "design_tokens",
  "custom_css",
]);

function errorResponse(
  status: number,
  code: string,
  message: string,
  requestId: string,
) {
  return NextResponse.json(
    { ok: false, error: { code, message, request_id: requestId } },
    { status },
  );
}

function parseBoolean(value: string | null) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function parseBoundedInt(value: string | null, fallback: number, min: number, max: number) {
  const raw = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(raw)) return fallback;
  return Math.min(Math.max(raw, min), max);
}

export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  const auth = await requireAdminReadClient(request);
  if ("error" in auth) return auth.error;

  const pageId = request.nextUrl.searchParams.get("page_id")?.trim() ?? "";
  const locale = request.nextUrl.searchParams.get("locale")?.trim() ?? "";
  const docTypeRaw = request.nextUrl.searchParams.get("doc_type")?.trim() ?? "";
  const includeVersions = parseBoolean(request.nextUrl.searchParams.get("include_versions"));
  const limit = parseBoundedInt(request.nextUrl.searchParams.get("limit"), 50, 1, 200);
  const offset = parseBoundedInt(request.nextUrl.searchParams.get("offset"), 0, 0, 10_000);
  const versionLimit = parseBoundedInt(
    request.nextUrl.searchParams.get("version_limit"),
    10,
    1,
    50,
  );

  if (docTypeRaw && !VALID_DOC_TYPES.has(docTypeRaw as CmsDocType)) {
    return errorResponse(400, "INVALID_DOC_TYPE", "Unsupported cms doc_type.", requestId);
  }

  let query = auth.readClient
    .from("cms_documents" as never)
    .select("id, page_id, locale, doc_type, status, current_version_id, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (pageId) query = query.eq("page_id", pageId);
  if (locale) query = query.eq("locale", locale);
  if (docTypeRaw) query = query.eq("doc_type", docTypeRaw);

  const { data, error } = await query;
  if (error) {
    console.error("[admin-cms-documents] document read failed", {
      request_id: requestId,
      page_id: pageId ?? null,
      locale: locale ?? null,
      doc_type: docTypeRaw ?? null,
      include_versions: includeVersions,
      offset,
      limit,
      version_limit: versionLimit,
      error: error.message,
    });
    return errorResponse(
      500,
      "CMS_DOCUMENTS_READ_FAILED",
      error.message || "Failed to read CMS documents.",
      requestId,
    );
  }

  const docs = (data ?? []) as Array<{
    id: number;
    page_id: string;
    locale: string;
    doc_type: CmsDocType;
    status: string;
    current_version_id: number | null;
    created_at: string;
    updated_at: string;
  }>;

  if (!includeVersions || docs.length === 0) {
    return NextResponse.json({
      ok: true,
      data: docs,
      meta: {
        request_id: requestId,
        offset,
        limit,
        version_limit: includeVersions ? versionLimit : 0,
        returned: docs.length,
      },
    });
  }

  const versionsByDoc = new Map<number, unknown[]>();
  for (const doc of docs) {
    const { data: versionRows, error: versionsError } = await auth.readClient
      .from("cms_document_versions" as never)
      .select("id, document_id, version, content, created_at, created_by")
      .eq("document_id", doc.id as never)
      .order("version", { ascending: false })
      .limit(versionLimit);

    if (versionsError) {
      console.error("[admin-cms-documents] version read failed", {
        request_id: requestId,
        page_id: pageId ?? null,
        locale: locale ?? null,
        doc_type: docTypeRaw ?? null,
        include_versions: includeVersions,
        offset,
        limit,
        version_limit: versionLimit,
        document_id: doc.id,
        error: versionsError.message,
      });
      return errorResponse(
        500,
        "CMS_DOCUMENT_VERSIONS_READ_FAILED",
        versionsError.message || "Failed to read CMS document versions.",
        requestId,
      );
    }

    versionsByDoc.set(doc.id, (versionRows as unknown[]) ?? []);
  }

  const withVersions = docs.map((doc) => ({
    ...doc,
    versions: versionsByDoc.get(doc.id) ?? [],
  }));

  return NextResponse.json({
    ok: true,
    data: withVersions,
    meta: {
      request_id: requestId,
      offset,
      limit,
      version_limit: versionLimit,
      returned: withVersions.length,
    },
  });
}
