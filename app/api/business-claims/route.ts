import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { notifyBusinessClaimSubmitted } from "@/lib/claims/business-claim-email";
import { calculateBusinessClaimConfidence } from "@/lib/claims/business-claim-scoring";
import {
  enforceFormAbuseProtection,
  extractFormAbuseFields,
} from "@/lib/security/form-abuse-protection";
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
const PROOF_DOCUMENT_BUCKET = "business-claim-proofs";
const MAX_PROOF_DOCUMENT_BYTES = 4 * 1024 * 1024;
const ALLOWED_PROOF_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

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

interface ParsedBusinessClaimRequest {
  body: unknown;
  proofDocument: File | null;
}

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

function isFileLike(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

async function parseBusinessClaimRequest(request: NextRequest): Promise<ParsedBusinessClaimRequest> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.toLowerCase().includes("multipart/form-data")) {
    const formData = await request.formData();
    const body: Record<string, unknown> = {};
    let proofDocument: File | null = null;

    for (const [key, value] of formData.entries()) {
      if (key === "proofDocument" && isFileLike(value) && value.size > 0) {
        proofDocument = value;
        continue;
      }

      if (typeof value === "string") {
        body[key] = value;
      }
    }

    return { body, proofDocument };
  }

  return {
    body: await request.json(),
    proofDocument: null,
  };
}

function sanitizeFileName(value: string) {
  const sanitized = value
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 120);

  return sanitized || "proof-document";
}

function validateProofDocument(file: File | null) {
  if (!file) return null;
  if (file.size > MAX_PROOF_DOCUMENT_BYTES) {
    return "Proof document must be 4 MB or smaller.";
  }
  if (!ALLOWED_PROOF_DOCUMENT_TYPES.has(file.type)) {
    return "Proof document must be a PDF, Word document, JPG, PNG or WebP file.";
  }
  return null;
}

async function uploadProofDocument({
  client,
  claimId,
  listingId,
  file,
}: {
  client: ReturnType<typeof createServiceRoleClient>;
  claimId: string;
  listingId: string;
  file: File;
}) {
  if (!client) throw new Error("Storage client is not configured.");

  const content = Buffer.from(await file.arrayBuffer());
  const storagePath = `${listingId}/${claimId}/${randomUUID()}-${sanitizeFileName(file.name)}`;
  const { error } = await client.storage
    .from(PROOF_DOCUMENT_BUCKET)
    .upload(storagePath, content, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || "Proof document upload failed.");
  }

  return {
    proofUrl: `${PROOF_DOCUMENT_BUCKET}/${storagePath}`,
    storagePath,
    filename: sanitizeFileName(file.name),
    contentType: file.type,
    content,
  };
}

async function removeUploadedProofDocument(
  client: ReturnType<typeof createServiceRoleClient>,
  storagePath: string | null | undefined,
) {
  if (!client || !storagePath) return;
  await client.storage.from(PROOF_DOCUMENT_BUCKET).remove([storagePath]);
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

  let parsedRequest: ParsedBusinessClaimRequest;
  try {
    parsedRequest = await parseBusinessClaimRequest(request);
  } catch {
    return errorResponse(400, "INVALID_REQUEST_BODY", "Request body must be valid JSON or form data.");
  }

  const body = parsedRequest.body;
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
  const proofDocumentError = validateProofDocument(parsedRequest.proofDocument);
  if (proofDocumentError) {
    return errorResponse(400, "BUSINESS_CLAIM_PROOF_DOCUMENT_INVALID", proofDocumentError);
  }

  if (payload.verificationMethod === "document_upload" && !parsedRequest.proofDocument) {
    return errorResponse(
      400,
      "BUSINESS_CLAIM_PROOF_DOCUMENT_REQUIRED",
      "A proof document is required for document upload verification.",
    );
  }

  const abuseFields = extractFormAbuseFields(body);
  const abuse = await enforceFormAbuseProtection({
    request,
    client: writeClient,
    scope: "business_claim",
    email: payload.claimantEmail,
    honeypot: abuseFields.honeypot,
    submittedAt: abuseFields.submittedAt,
    maxAttempts: 5,
    windowSeconds: 60 * 60,
  });

  if (!abuse.allowed) {
    return errorResponse(400, "BUSINESS_CLAIM_REJECTED", "Claim request could not be processed.");
  }

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
  const claimId = randomUUID();
  let uploadedProofDocument: Awaited<ReturnType<typeof uploadProofDocument>> | null = null;

  if (parsedRequest.proofDocument) {
    try {
      uploadedProofDocument = await uploadProofDocument({
        client: writeClient,
        claimId,
        listingId: listing.id,
        file: parsedRequest.proofDocument,
      });
    } catch (error) {
      return errorResponse(
        500,
        "BUSINESS_CLAIM_PROOF_UPLOAD_FAILED",
        error instanceof Error ? error.message : "Proof document upload failed.",
      );
    }
  }

  const { data: claim, error: insertError } = await writeClient
    .from("business_claims")
    .insert({
      id: claimId,
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
      proof_url: uploadedProofDocument?.proofUrl ?? null,
      message: payload.message.trim(),
      status: "pending",
      confidence_score: confidenceScore,
    })
    .select("id, status, selected_tier, created_at")
    .single();

  if (insertError) {
    await removeUploadedProofDocument(writeClient, uploadedProofDocument?.storagePath);

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
    await removeUploadedProofDocument(writeClient, uploadedProofDocument?.storagePath);

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
    proofUrl: uploadedProofDocument?.proofUrl ?? null,
    proofDocument: uploadedProofDocument
      ? {
          filename: uploadedProofDocument.filename,
          content: uploadedProofDocument.content,
          contentType: uploadedProofDocument.contentType,
        }
      : null,
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
