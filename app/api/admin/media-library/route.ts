import { NextRequest, NextResponse } from "next/server";

import { requireAdminWriteClient } from "@/lib/server/admin-auth";
import { validatePayload, jsonErrorResponse } from "@/lib/api/api-validation";
import { mediaItemSchema } from "@/lib/forms/admin-schemas";

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

function extractMediaStoragePath(fileUrl: string) {
  const marker = "/storage/v1/object/public/media/";
  const index = fileUrl.indexOf(marker);
  if (index === -1) return null;
  const relativePath = fileUrl.slice(index + marker.length);
  return relativePath || null;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can create media library records.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin media writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const validation = validatePayload(mediaItemSchema, body, "MEDIA");
  if (!validation.success) {
    return jsonErrorResponse(400, validation.error.code, validation.error.message);
  }

  const { file_name, file_url, file_type, file_size, alt_text } = validation.data;

  const insertPayload = {
    file_name,
    file_url,
    file_type,
    file_size: file_size ?? null,
    folder: "general",
    alt_text,
  };

  const { data, error } = await auth.writeClient
    .from("media_library")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    return errorResponse(
      500,
      "MEDIA_CREATE_FAILED",
      error.message || "Failed to create media record.",
    );
  }

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can delete media library records.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin media writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const id = typeof (body as { id?: unknown })?.id === "string"
    ? ((body as { id: string }).id.trim())
    : "";
  if (!id) {
    return errorResponse(400, "INVALID_MEDIA_ID", "Media id is required.");
  }

  const { data: existing, error: existingError } = await auth.writeClient
    .from("media_library")
    .select("id, file_url")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return errorResponse(
      500,
      "MEDIA_LOOKUP_FAILED",
      existingError.message || "Failed to look up media record.",
    );
  }

  if (!existing) {
    return errorResponse(404, "MEDIA_NOT_FOUND", "Media record not found.");
  }

  const fileUrl =
    typeof (existing as { file_url?: unknown }).file_url === "string"
      ? String((existing as { file_url: string }).file_url)
      : "";
  const storagePath = fileUrl ? extractMediaStoragePath(fileUrl) : null;

  if (storagePath) {
    await auth.writeClient.storage.from("media").remove([storagePath]);
  }

  const { error } = await auth.writeClient
    .from("media_library")
    .delete()
    .eq("id", id);

  if (error) {
    return errorResponse(
      500,
      "MEDIA_DELETE_FAILED",
      error.message || "Failed to delete media record.",
    );
  }

  return NextResponse.json({ ok: true });
}
