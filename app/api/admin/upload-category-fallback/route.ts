import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdminWriteClient } from "@/lib/server/admin-auth";

export const runtime = "nodejs";

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(request, "Only admins can upload category fallbacks.");
  if ("error" in auth) return auth.error;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const categoryId = formData.get("categoryId") as string | null;

  if (!file || !categoryId) {
    return NextResponse.json({ ok: false, error: "Missing file or categoryId" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, error: "File must be an image" }, { status: 400 });
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "File must be less than 2MB" }, { status: 400 });
  }

  const normalizedMimeType = file.type.toLowerCase();
  const extension = MIME_EXTENSION_MAP[normalizedMimeType];
  if (!extension) {
    return NextResponse.json({ ok: false, error: "Unsupported image type" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "";
  if (!key) {
    return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 });
  }
  const writeClient = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileName = `category-fallbacks/${categoryId}.${extension}`;

  const { error: uploadError } = await writeClient.storage
    .from("listing-images")
    .upload(fileName, fileBuffer, {
      upsert: true,
      contentType: normalizedMimeType,
    });

  if (uploadError) {
    return NextResponse.json({ ok: false, error: uploadError.message }, { status: 500 });
  }

  const { data: publicData } = writeClient.storage.from("listing-images").getPublicUrl(fileName);
  const publicUrl = publicData.publicUrl;

  const { error: updateError } = await writeClient
    .from("categories")
    .update({ fallback_image_url: publicUrl })
    .eq("id", categoryId);

  if (updateError) {
    const columnMissing = updateError.message.toLowerCase().includes("fallback_image_url");
    return NextResponse.json(
      {
        ok: false,
        error: columnMissing
          ? "Database column missing"
          : updateError.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, url: publicUrl });
}
