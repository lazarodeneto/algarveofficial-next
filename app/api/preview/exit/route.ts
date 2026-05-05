import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

function toInternalPath(value: string | null, fallback = "/") {
  const raw = value?.trim() || fallback;
  const normalized = raw.replaceAll("\\", "/");
  if (/^[a-z][a-z0-9+.-]*:/i.test(normalized)) return fallback;
  return `/${normalized.replace(/^\/+/, "")}` || fallback;
}

export async function GET(req: Request) {
  const draft = await draftMode();
  draft.disable();

  const url = new URL(req.url);
  const redirectTo = toInternalPath(url.searchParams.get("redirect"));

  return NextResponse.redirect(new URL(redirectTo, req.url));
}
