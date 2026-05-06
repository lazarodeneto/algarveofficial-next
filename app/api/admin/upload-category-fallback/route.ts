import { NextRequest, NextResponse } from "next/server";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";

export const runtime = "nodejs";

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(request, "Only admins can upload category fallbacks.", {
    requireServiceRole: true,
    missingServiceRoleMessage:
      "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin category fallback uploads.",
    auditAction: "admin.categories.upload-fallback",
  });
  if ("error" in auth) return auth.error;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return adminErrorResponse(400, "INVALID_FORM_DATA", "Request body must be valid form data.");
  }

  const file = formData.get("file") as File | null;
  const categoryId = formData.get("categoryId") as string | null;

  if (!file || !categoryId) {
    return adminErrorResponse(400, "MISSING_FIELDS", "file and categoryId are required.");
  }

  if (!file.type.startsWith("image/")) {
    return adminErrorResponse(400, "INVALID_FILE_TYPE", "File must be an image.");
  }

  if (file.size > 2 * 1024 * 1024) {
    return adminErrorResponse(400, "FILE_TOO_LARGE", "File must be less than 2MB.");
  }

  const normalizedMimeType = file.type.toLowerCase();
  const extension = MIME_EXTENSION_MAP[normalizedMimeType];
  if (!extension) {
    return adminErrorResponse(400, "UNSUPPORTED_IMAGE_TYPE", "Unsupported image type.");
  }

  const writeClient = auth.writeClient;

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileName = `category-fallbacks/${categoryId}.${extension}`;

  const { error: uploadError } = await writeClient.storage
    .from("listing-images")
    .upload(fileName, fileBuffer, {
      upsert: true,
      contentType: normalizedMimeType,
    });

  if (uploadError) {
    return adminErrorResponse(500, "UPLOAD_FAILED", uploadError.message);
  }

  const { data: publicData } = writeClient.storage.from("listing-images").getPublicUrl(fileName);
  const publicUrl = publicData.publicUrl;

  const { error: updateError } = await writeClient
    .from("categories")
    .update({ fallback_image_url: publicUrl } as never)
    .eq("id", categoryId);

  if (updateError) {
    const columnMissing = updateError.message.toLowerCase().includes("fallback_image_url");
    return adminErrorResponse(
      500,
      columnMissing ? "CATEGORY_FALLBACK_COLUMN_MISSING" : "CATEGORY_FALLBACK_UPDATE_FAILED",
      columnMissing ? "Database column fallback_image_url is missing." : updateError.message,
    );
  }

  return NextResponse.json({ ok: true, url: publicUrl });
}
