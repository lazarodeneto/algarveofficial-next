import { NextRequest, NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/server/admin-auth";
import { getTranslationProcessorCapabilities } from "@/lib/translations/processorConfig";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request, ["admin", "editor"]);
  if ("error" in auth) return auth.error;

  return NextResponse.json({
    ok: true,
    data: getTranslationProcessorCapabilities(),
  });
}
