import { NextRequest, NextResponse } from "next/server";

import { requireAdminReadClient } from "@/lib/server/admin-auth";

type CmsDocType = "page_config" | "text_overrides" | "design_tokens" | "custom_css";
const VALID_DOC_TYPES = new Set<CmsDocType>([
  "page_config",
  "text_overrides",
  "design_tokens",
  "custom_css",
]);

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

function parseBoolean(value: string | null) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminReadClient(
    request,
    "Only admins can query CMS documents.",
  );
  if ("error" in auth) return auth.error;

  const pageId = request.nextUrl.searchParams.get("page_id")?.trim() ?? "";
  const locale = request.nextUrl.searchParams.get("locale")?.trim() ?? "";
  const docTypeRaw = request.nextUrl.searchParams.get("doc_type")?.trim() ?? "";
  const includeVersions = parseBoolean(request.nextUrl.searchParams.get("include_versions"));
  const limitRaw = Number.parseInt(request.nextUrl.searchParams.get("limit") ?? "50", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;

  if (docTypeRaw && !VALID_DOC_TYPES.has(docTypeRaw as CmsDocType)) {
    return errorResponse(400, "INVALID_DOC_TYPE", "Unsupported cms doc_type.");
  }

  let query = auth.readClient
    .from("cms_documents" as never)
    .select("id, page_id, block_id, locale, doc_type, status, current_version_id, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (pageId) query = query.eq("page_id", pageId);
  if (locale) query = query.eq("locale", locale);
  if (docTypeRaw) query = query.eq("doc_type", docTypeRaw);

  const { data, error } = await query;
  if (error) {
    return errorResponse(
      500,
      "CMS_DOCUMENTS_READ_FAILED",
      error.message || "Failed to read CMS documents.",
    );
  }

  const docs = (data ?? []) as Array<{
    id: number;
    page_id: string;
    block_id: string | null;
    locale: string;
    doc_type: CmsDocType;
    status: string;
    current_version_id: number | null;
    created_at: string;
    updated_at: string;
  }>;

  if (!includeVersions || docs.length === 0) {
    return NextResponse.json({ ok: true, data: docs });
  }

  const docIds = docs.map((doc) => doc.id);
  const { data: versionRows, error: versionsError } = await auth.readClient
    .from("cms_document_versions" as never)
    .select("id, document_id, version, content, created_at, created_by")
    .in("document_id", docIds as never)
    .order("version", { ascending: false });

  if (versionsError) {
    return errorResponse(
      500,
      "CMS_DOCUMENT_VERSIONS_READ_FAILED",
      versionsError.message || "Failed to read CMS document versions.",
    );
  }

  const versionsByDoc = new Map<number, unknown[]>();
  ((versionRows as Array<{ document_id: number }> | null) ?? []).forEach((row) => {
    const bucket = versionsByDoc.get(row.document_id) ?? [];
    bucket.push(row as unknown);
    versionsByDoc.set(row.document_id, bucket);
  });

  const withVersions = docs.map((doc) => ({
    ...doc,
    versions: versionsByDoc.get(doc.id) ?? [],
  }));

  return NextResponse.json({ ok: true, data: withVersions });
}
