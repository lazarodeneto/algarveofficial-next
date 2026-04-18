import { NextRequest, NextResponse } from "next/server";

import { getInboxUrgentCount } from "@/lib/admin/inbox/aggregator";
import { requireAdminReadClient } from "@/lib/server/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminReadClient(request, "Only admins can read inbox counts.");
  if ("error" in auth) return auth.error;

  const count = await getInboxUrgentCount();
  return NextResponse.json({ ok: true, count });
}
