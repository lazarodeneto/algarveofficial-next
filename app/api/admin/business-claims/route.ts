import { NextRequest, NextResponse } from "next/server";

import {
  listAdminBusinessClaims,
  parseBusinessClaimsFilters,
  parseBusinessClaimsPagination,
} from "@/lib/admin/business-claims/queries";
import { adminErrorResponse, requireAdminSession } from "@/lib/server/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request, ["admin"]);
  if ("error" in auth) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const filters = parseBusinessClaimsFilters(searchParams);
    const pagination = parseBusinessClaimsPagination(searchParams);
    const claims = await listAdminBusinessClaims({ filters, pagination });

    return NextResponse.json(
      { ok: true, claims },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return adminErrorResponse(
      500,
      "BUSINESS_CLAIMS_FETCH_FAILED",
      error instanceof Error ? error.message : "Failed to load business claims.",
    );
  }
}

