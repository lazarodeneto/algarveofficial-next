import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/server/admin-auth";
import { logAdminRequest } from "@/lib/server/observability";

export async function GET(request: NextRequest) {
  logAdminRequest(request);

  const auth = await requireAdminSession(request);
  if ("error" in auth) return auth.error;

  return NextResponse.json({ ok: true, ts: Date.now() });
}