import { NextRequest, NextResponse } from "next/server";

import { adminErrorResponse, requireAdminReadClient } from "@/lib/server/admin-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdminReadClient(request, "Only admins can open CMS preview links.");
  if ("error" in auth) return auth.error;

  const path = request.nextUrl.searchParams.get("path")?.trim() || "/";
  const locale = request.nextUrl.searchParams.get("locale")?.trim() || "en";
  const secret = process.env.PREVIEW_SECRET;

  if (!secret) {
    return adminErrorResponse(
      500,
      "MISSING_PREVIEW_SECRET",
      "Server is missing PREVIEW_SECRET.",
    );
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const previewUrl = `/api/preview?secret=${encodeURIComponent(secret)}&path=${encodeURIComponent(normalizedPath)}&locale=${encodeURIComponent(locale)}`;

  return NextResponse.json({
    ok: true,
    data: {
      url: previewUrl,
      path: normalizedPath,
      locale,
    },
  });
}
