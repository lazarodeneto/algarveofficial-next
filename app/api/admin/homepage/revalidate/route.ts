import { NextRequest, NextResponse } from "next/server";

import { requireAdminWriteClient } from "@/lib/server/admin-auth";
import { revalidateHomepageRoutes } from "@/lib/server/revalidate-homepage";

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can revalidate homepage routes.",
  );
  if ("error" in auth) return auth.error;

  revalidateHomepageRoutes();

  return NextResponse.json({ ok: true });
}
