import { NextRequest, NextResponse } from "next/server";

import { DEFAULT_LOCALE, isValidLocale } from "@/lib/i18n/config";
import { adminErrorResponse, requireAdminSession } from "@/lib/server/admin-auth";

function toInternalPath(value: string | null, fallback = "/") {
  const raw = value?.trim() || fallback;
  const normalized = raw.replaceAll("\\", "/");
  if (/^[a-z][a-z0-9+.-]*:/i.test(normalized)) return fallback;
  return `/${normalized.replace(/^\/+/, "")}` || fallback;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if ("error" in auth) return auth.error;

  const path = toInternalPath(request.nextUrl.searchParams.get("path"));
  const localeParam = request.nextUrl.searchParams.get("locale")?.trim().toLowerCase();
  const locale = isValidLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const secret = process.env.PREVIEW_SECRET;

  if (!secret) {
    return adminErrorResponse(
      500,
      "MISSING_PREVIEW_SECRET",
      "Server is missing PREVIEW_SECRET.",
    );
  }

  const previewUrl = `/api/preview?secret=${encodeURIComponent(secret)}&path=${encodeURIComponent(path)}&locale=${encodeURIComponent(locale)}`;

  return NextResponse.json({
    ok: true,
    data: {
      url: previewUrl,
      path,
      locale,
    },
  });
}
