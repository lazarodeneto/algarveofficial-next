import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const path = url.searchParams.get("path") || "/";
  const locale = url.searchParams.get("locale") || "en";

  if (secret !== process.env.PREVIEW_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const pathWithLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  const pathAlreadyLocalized = pathWithLeadingSlash === `/${locale}` || pathWithLeadingSlash.startsWith(`/${locale}/`);
  const resolvedPath = locale
    ? pathAlreadyLocalized
      ? pathWithLeadingSlash
      : `/${locale}${pathWithLeadingSlash === "/" ? "" : pathWithLeadingSlash}`
    : pathWithLeadingSlash;

  const draft = await draftMode();
  draft.enable();

  return NextResponse.redirect(new URL(resolvedPath, req.url));
}
