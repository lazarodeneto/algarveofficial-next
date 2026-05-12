import { NextRequest, NextResponse } from "next/server";

import {
  listAdminListingChangeRequests,
  parseListingChangeRequestsFilters,
  parseListingChangeRequestsPagination,
} from "@/lib/admin/listing-change-requests/queries";
import { adminErrorResponse, requireAdminSession } from "@/lib/server/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request, ["admin"]);
  if ("error" in auth) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const filters = parseListingChangeRequestsFilters(searchParams);
    const pagination = parseListingChangeRequestsPagination(searchParams);
    const requests = await listAdminListingChangeRequests({ filters, pagination });

    return NextResponse.json(
      { ok: true, requests },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return adminErrorResponse(
      500,
      "LISTING_CHANGE_REQUESTS_FETCH_FAILED",
      error instanceof Error ? error.message : "Failed to load listing change requests.",
    );
  }
}

