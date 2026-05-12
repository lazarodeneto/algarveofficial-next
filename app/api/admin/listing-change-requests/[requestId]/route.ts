import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAdminListingChangeRequestById } from "@/lib/admin/listing-change-requests/queries";
import { validateListingChangeRequestValue } from "@/lib/admin/listing-change-requests/validation";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const reviewActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  note: z.string().max(2000).optional().nullable(),
});

function isReviewResult(value: unknown): value is {
  success: boolean;
  error?: string;
  action?: string;
  request_id?: string;
  listing_id?: string;
  field_name?: string;
} {
  return typeof value === "object" && value !== null && "success" in value;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can review listing change requests.",
    {
      allowedRoles: ["admin"],
      auditAction: "review_listing_change_request",
    },
  );
  if ("error" in auth) return auth.error;

  const { requestId } = await params;
  if (!requestId) {
    return adminErrorResponse(400, "REQUEST_ID_REQUIRED", "Change request id is required.");
  }

  const payload = reviewActionSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) {
    return adminErrorResponse(
      400,
      "INVALID_REVIEW_ACTION",
      "Invalid listing change request review payload.",
    );
  }

  const { action, note } = payload.data;

  if (action === "reject" && !note?.trim()) {
    return adminErrorResponse(400, "REJECTION_REASON_REQUIRED", "A rejection reason is required.");
  }

  try {
    const changeRequest = await getAdminListingChangeRequestById(requestId);
    if (!changeRequest) {
      return adminErrorResponse(404, "CHANGE_REQUEST_NOT_FOUND", "Listing change request not found.");
    }

    if (changeRequest.status !== "pending") {
      return adminErrorResponse(
        409,
        "CHANGE_REQUEST_ALREADY_REVIEWED",
        "Only pending listing change requests can be reviewed.",
      );
    }

    if (!changeRequest.listing) {
      return adminErrorResponse(
        409,
        "LISTING_NOT_FOUND",
        "The linked listing no longer exists.",
      );
    }

    if (action === "approve") {
      const validation = validateListingChangeRequestValue(
        changeRequest.fieldName,
        changeRequest.requestedValue,
      );
      if (!validation.ok) {
        return adminErrorResponse(
          400,
          "CHANGE_REQUEST_VALUE_INVALID",
          validation.message,
        );
      }
    }

    const { data, error } = await auth.userClient.rpc("admin_review_listing_change_request", {
      _request_id: requestId,
      _action: action,
      _admin_note: note?.trim() || undefined,
    });

    if (error) {
      return adminErrorResponse(500, "CHANGE_REQUEST_REVIEW_FAILED", error.message);
    }

    if (!isReviewResult(data) || data.success !== true) {
      return adminErrorResponse(
        409,
        "CHANGE_REQUEST_REVIEW_REJECTED",
        isReviewResult(data) && data.error
          ? data.error
          : "The listing change request review action could not be completed.",
      );
    }

    return NextResponse.json(
      { ok: true, result: data },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return adminErrorResponse(
      500,
      "CHANGE_REQUEST_REVIEW_FAILED",
      error instanceof Error ? error.message : "Failed to review listing change request.",
    );
  }
}

