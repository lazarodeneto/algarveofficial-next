import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { notifyBusinessClaimSubmitted } from "@/lib/claims/business-claim-email";
import { calculateBusinessClaimConfidence } from "@/lib/claims/business-claim-scoring";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { isValidExternalUrlInput, normalizeExternalUrlForStorage } from "@/lib/url-input";

const claimantRoleSchema = z.enum([
  "owner",
  "general_manager",
  "marketing_manager",
  "employee",
  "agency_representative",
  "other",
]);

const verificationMethodSchema = z.enum([
  "business_email_domain",
  "phone_verification",
  "website_contact_match",
  "official_social_media",
  "document_upload",
  "manual_review",
]);

const selectedTierSchema = z.enum(["free", "verified", "signature"]);

const businessClaimSchema = z.object({
  listingId: z.string().uuid(),
  claimantName: z.string().trim().min(2).max(120),
  claimantEmail: z.string().trim().email().max(255),
  claimantPhone: z.union([z.string().trim().max(40), z.literal(""), z.undefined()]),
  claimantRole: claimantRoleSchema,
  companyWebsite: z
    .union([z.string().trim().max(500), z.literal(""), z.undefined()])
    .refine((value) => !value || isValidExternalUrlInput(value), {
      message: "companyWebsite must be a valid URL.",
    }),
  message: z.string().trim().min(10).max(2000),
  proofNotes: z.union([z.string().trim().max(2000), z.literal(""), z.undefined()]),
  selectedTier: selectedTierSchema,
  verificationMethod: verificationMethodSchema,
});

function errorResponse(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        details: details ?? null,
      },
    },
    { status },
  );
}

function normalizeOptional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

async function getCurrentUserId() {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return errorResponse(401, "AUTH_REQUIRED", "Sign in before submitting a business claim.");
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsed = businessClaimSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      400,
      "BUSINESS_CLAIM_VALIDATION_ERROR",
      "Invalid business claim payload.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const writeClient = createServiceRoleClient();
  if (!writeClient) {
    return errorResponse(
      503,
      "SERVICE_ROLE_NOT_CONFIGURED",
      "Server is missing SUPABASE_SERVICE_ROLE_KEY for business claim submissions.",
    );
  }

  const payload = parsed.data;
  const { data: listing, error: listingError } = await writeClient
    .from("listings")
    .select("id, name, slug, status, claim_status, website_url, contact_phone")
    .eq("id", payload.listingId)
    .eq("status", "published")
    .maybeSingle();

  if (listingError) {
    return errorResponse(500, "BUSINESS_CLAIM_LISTING_LOOKUP_FAILED", listingError.message);
  }

  if (!listing) {
    return errorResponse(404, "BUSINESS_CLAIM_LISTING_NOT_FOUND", "The listing could not be found.");
  }

  if (listing.claim_status === "claimed") {
    return errorResponse(
      409,
      "BUSINESS_CLAIM_LISTING_CLAIMED",
      "This listing is already managed by an official representative.",
    );
  }

  if (listing.claim_status === "claim_pending" || listing.claim_status === "disputed") {
    return errorResponse(
      409,
      "BUSINESS_CLAIM_ALREADY_UNDER_REVIEW",
      "This listing already has an ownership claim under review.",
    );
  }

  const companyWebsite = normalizeExternalUrlForStorage(payload.companyWebsite);
  const claimantPhone = normalizeOptional(payload.claimantPhone);
  const proofNotes = normalizeOptional(payload.proofNotes);
  const confidenceScore = calculateBusinessClaimConfidence({
    claimantEmail: payload.claimantEmail,
    companyWebsite,
    claimantPhone,
    listingWebsite: listing.website_url,
    listingPhone: listing.contact_phone,
  });

  const { data: claim, error: insertError } = await writeClient
    .from("business_claims")
    .insert({
      listing_id: listing.id,
      claimant_user_id: userId,
      claimant_name: payload.claimantName.trim(),
      claimant_email: payload.claimantEmail.trim(),
      claimant_phone: claimantPhone,
      claimant_role: payload.claimantRole,
      business_email: payload.claimantEmail.trim(),
      company_website: companyWebsite,
      selected_tier: payload.selectedTier,
      verification_method: payload.verificationMethod,
      proof_notes: proofNotes,
      message: payload.message.trim(),
      status: "pending",
      confidence_score: confidenceScore,
    })
    .select("id, status, selected_tier, created_at")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return errorResponse(
        409,
        "BUSINESS_CLAIM_ACTIVE_EXISTS",
        "This listing already has an active ownership claim under review.",
      );
    }

    return errorResponse(500, "BUSINESS_CLAIM_INSERT_FAILED", insertError.message);
  }

  const { data: updatedListing, error: updateError } = await writeClient
    .from("listings")
    .update({
      claim_status: "claim_pending",
      claim_verification_method: payload.verificationMethod,
    })
    .eq("id", listing.id)
    .eq("claim_status", "unclaimed")
    .select("id, claim_status")
    .maybeSingle();

  if (updateError || !updatedListing) {
    const cleanupMessage = updateError
      ? `Cancelled after listing claim_status update failed: ${updateError.message}`
      : "Cancelled because listing claim_status changed before submission could be completed.";
    const { error: cleanupError } = await writeClient
      .from("business_claims")
      .update({
        status: "cancelled",
        review_note: cleanupMessage,
      })
      .eq("id", claim.id)
      .eq("status", "pending");

    return errorResponse(
      updateError ? 500 : 409,
      updateError
        ? "BUSINESS_CLAIM_LISTING_STATUS_UPDATE_FAILED"
        : "BUSINESS_CLAIM_LISTING_STATUS_CHANGED",
      updateError
        ? updateError.message
        : "This listing changed claim status before your request could be completed. Please refresh and try again.",
      cleanupError ? { cleanupError: cleanupError.message } : undefined,
    );
  }

  const emailWarnings = await notifyBusinessClaimSubmitted(writeClient, {
    claimId: claim.id,
    listingId: listing.id,
    businessName: listing.name,
    businessSlug: listing.slug,
    claimantName: payload.claimantName.trim(),
    claimantEmail: payload.claimantEmail.trim(),
    selectedTier: payload.selectedTier,
    status: claim.status,
    createdAt: claim.created_at,
  });

  return NextResponse.json(
    {
      ok: true,
      data: claim,
      ...(emailWarnings.length > 0 ? { warnings: emailWarnings } : {}),
    },
    { status: 201 },
  );
}
