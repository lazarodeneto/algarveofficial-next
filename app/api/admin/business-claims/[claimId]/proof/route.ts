import { NextRequest, NextResponse } from "next/server";

import { adminErrorResponse, requireAdminSession } from "@/lib/server/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const PROOF_DOCUMENT_BUCKET = "business-claim-proofs";

function parseProofStoragePath(value: string | null | undefined) {
  if (!value) return null;
  const prefix = `${PROOF_DOCUMENT_BUCKET}/`;
  return value.startsWith(prefix) ? value.slice(prefix.length) : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ claimId: string }> },
) {
  const auth = await requireAdminSession(request, ["admin"]);
  if ("error" in auth) return auth.error;

  const { claimId } = await params;
  if (!claimId) {
    return adminErrorResponse(400, "CLAIM_ID_REQUIRED", "Claim id is required.");
  }

  const client = createServiceRoleClient();
  if (!client) {
    return adminErrorResponse(500, "SERVER_MISCONFIGURED", "Server storage is not configured.");
  }

  const { data: claim, error } = await client
    .from("business_claims")
    .select("id, proof_url")
    .eq("id", claimId)
    .maybeSingle();

  if (error) {
    return adminErrorResponse(500, "PROOF_LOOKUP_FAILED", error.message);
  }

  const storagePath = parseProofStoragePath(claim?.proof_url);
  if (!storagePath) {
    return adminErrorResponse(404, "PROOF_NOT_FOUND", "No proof document is available for this claim.");
  }

  const { data: signed, error: signedError } = await client.storage
    .from(PROOF_DOCUMENT_BUCKET)
    .createSignedUrl(storagePath, 60 * 5, {
      download: true,
    });

  if (signedError || !signed?.signedUrl) {
    return adminErrorResponse(
      500,
      "PROOF_SIGNED_URL_FAILED",
      signedError?.message ?? "Could not create proof document download link.",
    );
  }

  return NextResponse.redirect(signed.signedUrl, 302);
}
