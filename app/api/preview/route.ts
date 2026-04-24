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

  const resolvedPath = locale && locale !== "en" 
    ? `/${locale}${path}` 
    : path;

  const draft = await draftMode();
  draft.enable();

  return NextResponse.redirect(new URL(resolvedPath, req.url));
}