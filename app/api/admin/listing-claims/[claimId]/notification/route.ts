import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { notifyListingClaimReviewed } from "@/lib/communication/listing-notifications";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const notificationSchema = z.object({
  action: z.enum(["approved", "rejected"]),
  listingId: z.string().uuid().optional().nullable(),
  reason: z.string().trim().max(1000).optional().nullable(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ claimId: string }> },
) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins or editors can send listing claim notifications.",
    {
      auditAction: "admin.listing-claims.notification",
    },
  );
  if ("error" in auth) return auth.error;

  const { claimId } = await params;
  if (!claimId) {
    return adminErrorResponse(400, "CLAIM_ID_REQUIRED", "Claim id is required.");
  }

  const payload = notificationSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) {
    return adminErrorResponse(400, "INVALID_NOTIFICATION_PAYLOAD", "Invalid listing claim notification payload.");
  }

  const notification = await notifyListingClaimReviewed({
    client: auth.writeClient,
    claimId,
    status: payload.data.action,
    listingId: payload.data.listingId,
    reason: payload.data.reason,
  }).catch((error) => ({
    sent: false,
    skipped: false,
    reason: error instanceof Error ? error.message : "listing_claim_notification_failed",
  }));

  return NextResponse.json({
    ok: true,
    notification,
    ...(!notification.sent && !notification.skipped
      ? { warnings: ["listing_claim_notification_failed"] }
      : {}),
  });
}
