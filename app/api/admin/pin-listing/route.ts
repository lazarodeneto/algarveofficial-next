import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/integrations/supabase/types";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";
import { logAdminRequest, logAdminError, createRequestId } from "@/lib/server/observability";

interface PinListingBody {
  listingId: string;
  position?: number | null;
  action?: string;
}

export async function POST(request: NextRequest) {
  logAdminRequest(request);
  const requestId = createRequestId();

  const auth = await requireAdminWriteClient(
    request,
    "Only admins can pin listings.",
    {
      auditAction: "admin.pin-listing",
    },
  );
  if ("error" in auth) return auth.error;

  let body: PinListingBody;
  try {
    body = (await request.json()) as PinListingBody;
  } catch {
    logAdminError("PIN_INVALID_JSON", "Failed to parse JSON", { requestId });
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const { listingId, position, action } = body;

  if (!listingId || typeof listingId !== "string") {
    logAdminError("PIN_INVALID_ID", "Missing listingId", { requestId });
    return adminErrorResponse(400, "INVALID_ID", "listingId is required.");
  }

  const isUnpin = action === "unpin";
  const newRank = isUnpin ? null : position ?? null;

  const { data: updated, error } = await auth.userClient
    .from("listings")
    .update({ featured_rank: newRank } as Database["public"]["Tables"]["listings"]["Update"])
    .eq("id", listingId)
    .select("id, name, featured_rank")
    .single();

  if (error) {
    logAdminError("PIN_UPDATE_FAILED", error, { requestId, listingId });
    return adminErrorResponse(500, "PIN_FAILED", error.message);
  }

  return NextResponse.json({
    ok: true,
    data: updated,
  });
}