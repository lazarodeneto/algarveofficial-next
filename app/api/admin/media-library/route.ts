import { NextRequest, NextResponse } from "next/server";

import { requireAdminWriteClient } from "@/lib/server/admin-auth";

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
  );
  if ("error" in auth) return auth.error;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const payload = (body as Record<string, unknown> | null) ?? null;
  if (!payload) {
    return errorResponse(400, "INVALID_PAYLOAD", "Missing media payload.");
  }

  const file_name = typeof payload.file_name === "string" ? payload.file_name.trim() : "";
  const file_url = typeof payload.file_url === "string" ? payload.file_url.trim() : "";
  const file_type = payload.file_type === "image" || payload.file_type === "video" ? payload.file_type : null;

  if (!file_name || !file_url || !file_type) {
    return errorResponse(400, "INVALID_MEDIA", "file_name, file_url, and file_type are required.");
  }

  const insertPayload = {
    file_name,
    file_url,
    file_type,
    file_size: typeof payload.file_size === "number" ? payload.file_size : null,
    folder: typeof payload.folder === "string" && payload.folder.trim() ? payload.folder.trim() : "general",
    alt_text: typeof payload.alt_text === "string" ? payload.alt_text : null,
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
