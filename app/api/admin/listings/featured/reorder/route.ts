/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins or editors can reorder featured listings.",
    {
      auditAction: "admin.listings.featured-reorder",
    },
  );
  if ("error" in auth) return auth.error;

  let body: { items: { id: string; rank: number }[] };
  try {
    body = await request.json();
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const { items } = body;
  if (!Array.isArray(items) || items.length === 0) {
    return adminErrorResponse(400, "INVALID_ITEMS", "items must be a non-empty array.");
  }

  const { error } = await auth.userClient.rpc("set_featured_ranks" as any, {
    payload: JSON.stringify(items),
  });

  if (error) {
    return adminErrorResponse(500, "FEATURED_REORDER_FAILED", error.message);
  }

  return NextResponse.json({ ok: true });
}
