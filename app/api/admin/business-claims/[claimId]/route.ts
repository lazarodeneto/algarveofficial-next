import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  BUSINESS_CLAIM_EMAIL_WARNINGS,
  loadBusinessClaimEmailContext,
  notifyBusinessClaimReview,
} from "@/lib/claims/business-claim-email";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const reviewActionSchema = z.object({
  action: z.enum(["approve", "reject", "needs_more_info", "dispute"]),
  note: z.string().max(2000).optional().nullable(),
  force: z.boolean().optional(),
});

function isReviewResult(value: unknown): value is {
  success: boolean;
  error?: string;
  action?: string;
  claim_id?: string;
  listing_id?: string;
  owner_id?: string;
} {
  return typeof value === "object" && value !== null && "success" in value;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ claimId: string }> },
) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can review business claims.",
    {
      allowedRoles: ["admin"],
      auditAction: "review_business_claim",
    },
  );
  if ("error" in auth) return auth.error;

  const { claimId } = await params;
  if (!claimId) {
    return adminErrorResponse(400, "CLAIM_ID_REQUIRED", "Claim id is required.");
  }

  const payload = reviewActionSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) {
    return adminErrorResponse(400, "INVALID_REVIEW_ACTION", "Invalid business claim review payload.");
  }

  const { action, note, force } = payload.data;

  if (action === "reject" && !note?.trim()) {
    return adminErrorResponse(400, "REJECTION_REASON_REQUIRED", "A rejection reason is required.");
  }

  try {
    const { data, error } = await auth.userClient.rpc("admin_review_business_claim", {
      _claim_id: claimId,
      _action: action,
      _admin_note: note?.trim() || undefined,
      _force: force === true,
    });

    if (error) {
      return adminErrorResponse(500, "CLAIM_REVIEW_FAILED", error.message);
    }

    if (!isReviewResult(data) || data.success !== true) {
      return adminErrorResponse(
        409,
        "CLAIM_REVIEW_REJECTED",
        isReviewResult(data) && data.error ? data.error : "The claim review action could not be completed.",
      );
    }

    const warnings: string[] = [];

    if (action === "approve" || action === "reject" || action === "needs_more_info") {
      const writeClient = createServiceRoleClient();

      if (!writeClient) {
        warnings.push(BUSINESS_CLAIM_EMAIL_WARNINGS.contextUnavailable);
      } else {
        const context = await loadBusinessClaimEmailContext(writeClient, claimId);
        if (!context) {
          warnings.push(BUSINESS_CLAIM_EMAIL_WARNINGS.contextUnavailable);
        } else {
          warnings.push(...await notifyBusinessClaimReview(writeClient, context));
        }
      }
    }

    return NextResponse.json(
      {
        ok: true,
        result: data,
        ...(warnings.length > 0 ? { warnings: Array.from(new Set(warnings)) } : {}),
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
      "CLAIM_REVIEW_FAILED",
      error instanceof Error ? error.message : "Failed to review business claim.",
    );
  }
}
