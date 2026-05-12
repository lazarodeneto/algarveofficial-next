import { Buffer } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";

import {
  buildCmsHeroUploadPath,
  CMS_MEDIA_BUCKET,
  isCmsHeroUploadTarget,
  validateCmsHeroUploadFile,
} from "@/lib/cms/media-upload";
import {
  isCmsPageEditableInFullBuilder,
  isKnownCmsPageId,
} from "@/lib/cms/pageBuilderRegistry";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can upload CMS page media.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for CMS media uploads.",
      auditAction: "admin.cms.media-upload",
    },
  );
  if ("error" in auth) return auth.error;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return adminErrorResponse(400, "INVALID_FORM_DATA", "Request body must be valid form data.");
  }

  const file = formData.get("file");
  const pageId = String(formData.get("pageId") ?? "").trim();
  const target = String(formData.get("target") ?? "").trim();

  if (!(file instanceof File)) {
    return adminErrorResponse(400, "MISSING_FILE", "A media file is required.");
  }

  if (!pageId || !isKnownCmsPageId(pageId)) {
    return adminErrorResponse(400, "UNKNOWN_PAGE_ID", `Unknown CMS page_id "${pageId}".`);
  }

  if (!isCmsPageEditableInFullBuilder(pageId)) {
    return adminErrorResponse(
      400,
      "CMS_PAGE_NOT_EDITABLE",
      `CMS page_id "${pageId}" is not editable in Full Page Builder.`,
    );
  }

  if (!isCmsHeroUploadTarget(target)) {
    return adminErrorResponse(400, "INVALID_UPLOAD_TARGET", "Upload target must be image, poster, or video.");
  }

  const validation = validateCmsHeroUploadFile({
    target,
    contentType: file.type,
    fileName: file.name,
    size: file.size,
  });

  if (!validation.ok) {
    return adminErrorResponse(400, validation.code, validation.message);
  }

  const path = buildCmsHeroUploadPath({
    pageId,
    target,
    fileName: file.name,
    extension: validation.extension,
  });
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await auth.writeClient.storage
    .from(CMS_MEDIA_BUCKET)
    .upload(path, buffer, {
      cacheControl: "31536000",
      contentType: validation.contentType,
      upsert: false,
    });

  if (uploadError) {
    return adminErrorResponse(
      500,
      "CMS_MEDIA_UPLOAD_FAILED",
      uploadError.message || "Failed to upload CMS media.",
    );
  }

  const { data } = auth.writeClient.storage.from(CMS_MEDIA_BUCKET).getPublicUrl(path);

  return NextResponse.json({
    ok: true,
    data: {
      bucket: CMS_MEDIA_BUCKET,
      path,
      publicUrl: data.publicUrl,
      url: data.publicUrl,
      contentType: validation.contentType,
      mediaType: target,
      target,
    },
  });
}
