/* eslint-disable no-console */
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { verifyServerSecret } from "@/lib/server/secret-auth";

const CMS_TAG_MAP: Record<string, string> = {
  "/": "cms:home",
  "/golf": "cms:golf",
  "/blog": "cms:blog",
  "/destinations": "cms:destinations",
  "/experiences": "cms:experiences",
  "/relocation": "cms:live",
  "/live": "cms:live",
  "/real-estate": "cms:real-estate",
  "/directory": "cms:directory",
  "/events": "cms:events",
  "/stay": "cms:stay",
  "/map": "cms:map",
  "/invest": "cms:invest",
  "/partner": "cms:partner",
  "/properties": "cms:properties",
};

const ALLOWED_TAGS = new Set(Object.values(CMS_TAG_MAP));
const BLOCKED_PATH_SEGMENTS = ["/admin", "/owner", "/api", "/auth", "/preview"];

function verifyRevalidateSecret(request: NextRequest) {
  return verifyServerSecret(request, {
    envName: "REVALIDATE_SECRET",
    headerNames: ["x-revalidate-secret"],
  });
}

function normalizePublicPath(value: unknown) {
  if (typeof value !== "string") return null;
  const path = value.trim();
  if (!path.startsWith("/")) return null;
  if (path.includes("://") || path.includes("\\")) return null;

  const locale = SUPPORTED_LOCALES.find((supportedLocale) => {
    return path === `/${supportedLocale}` || path.startsWith(`/${supportedLocale}/`);
  });
  if (!locale) return null;

  const unlocalizedPath = path === `/${locale}` ? "/" : path.slice(locale.length + 1);
  if (BLOCKED_PATH_SEGMENTS.some((segment) => unlocalizedPath === segment || unlocalizedPath.startsWith(`${segment}/`))) {
    return null;
  }

  return {
    path,
    unlocalizedPath,
  };
}

export async function POST(request: NextRequest) {
  const auth = verifyRevalidateSecret(request);
  if (auth === "missing-config") {
    console.error("[revalidate] REVALIDATE_SECRET is required.");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }
  if (auth !== "authorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const tag = typeof body?.tag === "string" ? body.tag.trim() : "";
    const normalizedPath = normalizePublicPath(body?.path);

    if (tag) {
      if (!ALLOWED_TAGS.has(tag)) {
        return NextResponse.json({ error: "Invalid tag" }, { status: 400 });
      }
      revalidateTag(tag, "max");
      return NextResponse.json({ revalidated: true, tag });
    }

    if (!normalizedPath) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const pathTag = CMS_TAG_MAP[normalizedPath.unlocalizedPath];
    if (!pathTag) {
      return NextResponse.json({ error: "Unsupported path" }, { status: 400 });
    }

    revalidateTag(pathTag, "max");

    return NextResponse.json({ revalidated: true, path: normalizedPath.path, tag: pathTag });
  } catch (_error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
