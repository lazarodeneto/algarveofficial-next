import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

import { DEFAULT_LOCALE, isValidLocale } from "@/lib/i18n/config";

function toInternalPath(value: string | null, fallback = "/") {
  const raw = value?.trim() || fallback;
  const normalized = raw.replaceAll("\\", "/");
  if (/^[a-z][a-z0-9+.-]*:/i.test(normalized)) return fallback;
  return `/${normalized.replace(/^\/+/, "")}` || fallback;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const path = toInternalPath(url.searchParams.get("path"));
  const localeParam = url.searchParams.get("locale")?.trim().toLowerCase();
  const locale = isValidLocale(localeParam) ? localeParam : DEFAULT_LOCALE;

  if (secret !== process.env.PREVIEW_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const pathAlreadyLocalized = path === `/${locale}` || path.startsWith(`/${locale}/`);
  const resolvedPath = locale
    ? pathAlreadyLocalized
      ? path
      : `/${locale}${path === "/" ? "" : path}`
    : path;

  const draft = await draftMode();
  draft.enable();

  return NextResponse.redirect(new URL(resolvedPath, req.url));
}
