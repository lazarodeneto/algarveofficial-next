import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Server misconfigured" }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const categoryId = formData.get("categoryId") as string | null;

    if (!file || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Missing file or categoryId" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "File must be an image" },
        { status: 400 }
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File must be less than 2MB" },
        { status: 400 }
      );
    }

    const normalizedMimeType = file.type.toLowerCase();
    const extension = MIME_EXTENSION_MAP[normalizedMimeType];
    if (!extension) {
      return NextResponse.json(
        { success: false, error: "Unsupported image type. Use JPG, PNG, WebP, or GIF." },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `category-fallbacks/${categoryId}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(fileName, fileBuffer, {
        upsert: true,
        contentType: normalizedMimeType,
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicData } = supabase.storage
      .from("listing-images")
      .getPublicUrl(fileName);
    const publicUrl = publicData.publicUrl;

    const { error: updateError } = await supabase
      .from("categories")
      .update({ fallback_image_url: publicUrl })
      .eq("id", categoryId);

    if (updateError) {
      const columnMissing = updateError.message.toLowerCase().includes("fallback_image_url");
      return NextResponse.json(
        {
          success: false,
          error: columnMissing
            ? "Database column categories.fallback_image_url is missing. Run latest Supabase migrations."
            : updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
