import { NextRequest, NextResponse } from "next/server";

import { getFreshInboxSnapshot } from "@/lib/admin/inbox/aggregator";
import { adminErrorResponse, requireAdminSession } from "@/lib/server/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request, ["admin"]);
  if ("error" in auth) return auth.error;

  try {
    const snapshot = await getFreshInboxSnapshot();
    const assignedToMe = snapshot.items.filter(
      (item) => item.assignee?.id === auth.userId,
    ).length;

    return NextResponse.json(
      {
        ok: true,
        currentUserId: auth.userId,
        snapshot: {
          ...snapshot,
          counts: {
            ...snapshot.counts,
            assignedToMe,
          },
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return adminErrorResponse(
      500,
      "INBOX_FETCH_FAILED",
      error instanceof Error ? error.message : "Failed to load admin inbox.",
    );
  }
}
