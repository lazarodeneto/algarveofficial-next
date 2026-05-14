/* eslint-disable no-console */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { PRIMARY_CONTACT_EMAIL } from "@/lib/contactEmail";
import { getClaimNotificationRecipients, getDefaultFrom } from "@/lib/email/email-config";
import { sendEmail } from "@/lib/email/send-email";
import { claimAdminNotificationTemplate } from "@/lib/email/templates/claim-admin-notification";
import { claimUserConfirmationTemplate } from "@/lib/email/templates/claim-user-confirmation";
import {
  enforceFormAbuseProtection,
  extractFormAbuseFields,
} from "@/lib/security/form-abuse-protection";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { isValidExternalUrlInput, normalizeExternalUrlForStorage } from "@/lib/url-input";

const partnerClaimSchema = z.object({
  requestType: z.enum(["new-listing", "claim-business"]),
  businessName: z.string().trim().min(2).max(100),
  businessWebsite: z
    .union([z.string().trim().max(500), z.literal(""), z.undefined()])
    .refine((value) => !value || isValidExternalUrlInput(value), {
      message: "businessWebsite must be a valid URL.",
    }),
  contactName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.union([z.string().trim().max(32), z.literal(""), z.undefined()]),
  message: z.string().trim().min(10).max(2000),
  listingId: z.string().uuid().optional(),
});

const RESEND_OUTBOX_PROVIDER = "resend";
const RESEND_OUTBOX_OPERATION = "resend.send_email";
const RESEND_OUTBOX_SOURCE = "partner-claim-alert";
const DEFAULT_TRANSACTIONAL_FROM = "AlgarveOfficial <info@algarveofficial.com>";
const OUTBOX_WARNING_ENQUEUE_FAILED = "partner_claim_alert_enqueue_failed";
const OUTBOX_WARNING_TRIGGER_FAILED = "partner_claim_alert_trigger_failed";
const OUTBOX_WARNING_WORKER_UNHEALTHY = "partner_claim_alert_outbox_worker_unhealthy";

function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
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
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function requestTypeLabel(requestType: "new-listing" | "claim-business") {
  return requestType === "new-listing" ? "New Listing Request" : "Claim Existing Business";
}

function getTransactionalFromAddress() {
  return getDefaultFrom()
    || process.env.RESEND_TRANSACTIONAL_FROM?.trim()
    || process.env.EMAIL_FROM?.trim()
    || DEFAULT_TRANSACTIONAL_FROM;
}

function buildPartnerClaimAlertEmail(args: {
  claimId: string;
  claimCreatedAt: string;
  recipients: string[];
  payload: z.infer<typeof partnerClaimSchema>;
}) {
  const { claimId, claimCreatedAt, recipients, payload } = args;
  const businessName = payload.businessName.trim();
  const website = normalizeExternalUrlForStorage(payload.businessWebsite);
  const phone = normalizeOptional(payload.phone);
  const template = claimAdminNotificationTemplate({
    claimId,
    requestType: requestTypeLabel(payload.requestType),
    businessName,
    claimantName: payload.contactName.trim(),
    claimantEmail: payload.email.trim(),
    claimantPhone: phone,
    claimantRole: payload.requestType === "claim-business" ? "Business owner or representative" : "New listing requester",
    message: payload.message.trim(),
    proof: website,
    listingTitle: payload.listingId ? businessName : null,
    listingUrl: payload.listingId ? `/listing/${payload.listingId}` : null,
    submittedAt: claimCreatedAt,
    adminUrl: `/admin/claims`,
  });

  return {
    to: recipients,
    from: getTransactionalFromAddress(),
    subject: template.subject,
    html: template.html,
    text: template.text,
    reply_to: payload.email.trim(),
  };
}

type ServiceRoleClient = NonNullable<ReturnType<typeof createServiceRoleClient>>;

function resolvePartnerClaimAlertRecipients() {
  const configured = getClaimNotificationRecipients();
  return configured.length > 0 ? configured : [PRIMARY_CONTACT_EMAIL];
}

function getOutboxAlertKey(alert: unknown) {
  if (!alert || typeof alert !== "object") return null;
  const key = (alert as { alert_key?: unknown }).alert_key;
  return typeof key === "string" ? key : null;
}

async function hasOutboxDeliveryAvailabilityIssue(writeClient: ServiceRoleClient) {
  try {
    const { data, error } = await writeClient
      .from("admin_external_outbox_health" as never)
      .select("open_alerts")
      .maybeSingle();

    if (error) return false;
    const alertsRaw = (data as { open_alerts?: unknown } | null)?.open_alerts;
    if (!Array.isArray(alertsRaw)) return false;

    return alertsRaw.some((alert) => {
      const key = getOutboxAlertKey(alert);
      return key === "worker_secret_missing" || key === "worker_cron_missing" || key === "worker_liveness";
    });
  } catch {
    return false;
  }
}

async function resolveCurrentUserId() {
  try {
    const authClient = await createServerClient();
    const { data, error } = await authClient.auth.getUser();
    if (error) return null;
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

async function validateClaimListingReference(
  writeClient: ServiceRoleClient,
  payload: z.infer<typeof partnerClaimSchema>,
) {
  if (payload.requestType === "claim-business" && !payload.listingId) {
    return errorResponse(
      400,
      "PARTNER_CLAIM_LISTING_REQUIRED",
      "A business claim request must reference an existing published listing.",
    );
  }

  if (!payload.listingId) return null;

  if (payload.requestType !== "claim-business") {
    return errorResponse(
      400,
      "PARTNER_CLAIM_LISTING_TYPE_MISMATCH",
      "A listing can only be attached to a business claim request.",
    );
  }

  const { data, error } = await writeClient
    .from("listings")
    .select("id")
    .eq("id", payload.listingId)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    return errorResponse(500, "PARTNER_CLAIM_LISTING_LOOKUP_FAILED", error.message);
  }

  if (!data) {
    return errorResponse(
      400,
      "PARTNER_CLAIM_LISTING_NOT_FOUND",
      "The listing you are trying to claim could not be found.",
    );
  }

  return null;
}

export async function POST(request: NextRequest) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsed = partnerClaimSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      400,
      "PARTNER_CLAIM_VALIDATION_ERROR",
      "Invalid partner claim payload.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const writeClient = createServiceRoleClient();
  if (!writeClient) {
    return errorResponse(
      503,
      "SERVICE_ROLE_NOT_CONFIGURED",
      "Server is missing SUPABASE_SERVICE_ROLE_KEY for partner claim submissions.",
    );
  }

  const payload = parsed.data;
  const abuseFields = extractFormAbuseFields(body);
  const abuse = await enforceFormAbuseProtection({
    request,
    client: writeClient,
    scope: "partner_claim",
    email: payload.email,
    honeypot: abuseFields.honeypot,
    submittedAt: abuseFields.submittedAt,
    maxAttempts: 5,
    windowSeconds: 60 * 60,
  });

  if (!abuse.allowed) {
    return errorResponse(400, "PARTNER_CLAIM_REJECTED", "Claim request could not be processed.");
  }

  const listingReferenceError = await validateClaimListingReference(writeClient, payload);
  if (listingReferenceError) return listingReferenceError;

  const userId = await resolveCurrentUserId();

  const { data, error } = await writeClient
    .from("listing_claims")
    .insert({
      request_type: payload.requestType,
      business_name: payload.businessName.trim(),
      business_website: normalizeExternalUrlForStorage(payload.businessWebsite),
      contact_name: payload.contactName.trim(),
      email: payload.email.trim(),
      phone: normalizeOptional(payload.phone),
      message: payload.message.trim(),
      listing_id: payload.listingId ?? null,
      user_id: userId,
      status: "pending",
    })
    .select("id, status, created_at")
    .single();

  if (error) {
    return errorResponse(500, "PARTNER_CLAIM_INSERT_FAILED", error.message);
  }

  const warnings: string[] = [];
  const alertRecipients = resolvePartnerClaimAlertRecipients();
  const outboxPayload = buildPartnerClaimAlertEmail({
    claimId: data.id,
    claimCreatedAt: data.created_at,
    recipients: alertRecipients,
    payload,
  });
  const adminIdempotencyKey = `listing-claim/${data.id}/admin`;

  const adminEmailResult = await sendEmail({
    to: alertRecipients,
    replyTo: payload.email.trim(),
    subject: outboxPayload.subject,
    html: outboxPayload.html,
    text: outboxPayload.text,
    templateKey: "claim_admin_notification",
    relatedEntityType: "listing_claim",
    relatedEntityId: data.id,
    idempotencyKey: adminIdempotencyKey,
    metadata: {
      requestType: payload.requestType,
      listingId: payload.listingId ?? null,
    },
    tags: [
      { name: "template", value: "claim_admin_notification" },
      { name: "source", value: "listing_claim" },
    ],
  });

  const userTemplate = claimUserConfirmationTemplate({
    claimantName: payload.contactName.trim(),
    businessName: payload.businessName.trim(),
    claimId: data.id,
    listingUrl: payload.listingId ? `/listing/${payload.listingId}` : null,
  });

  const userEmailResult = await sendEmail({
    to: payload.email.trim(),
    subject: userTemplate.subject,
    html: userTemplate.html,
    text: userTemplate.text,
    templateKey: "claim_user_confirmation",
    relatedEntityType: "listing_claim",
    relatedEntityId: data.id,
    idempotencyKey: `listing-claim/${data.id}/user`,
    metadata: {
      requestType: payload.requestType,
      listingId: payload.listingId ?? null,
    },
    tags: [
      { name: "template", value: "claim_user_confirmation" },
      { name: "source", value: "listing_claim" },
    ],
  });

  if (!userEmailResult.success && !userEmailResult.skipped) {
    console.error("Partner claim confirmation email failed", {
      claimId: data.id,
      error: userEmailResult.error ?? userEmailResult.reason ?? "unknown",
    });
  }

  if (adminEmailResult.success) {
    return NextResponse.json({ ok: true, data }, { status: 201 });
  }

  console.error("Direct partner claim alert email failed; falling back to outbox", {
    claimId: data.id,
    error: adminEmailResult.error ?? adminEmailResult.reason ?? "unknown",
  });

  const { error: outboxError } = await writeClient
    .from("external_outbox" as never)
    .insert({
      provider: RESEND_OUTBOX_PROVIDER,
        operation: RESEND_OUTBOX_OPERATION,
        payload: outboxPayload,
        source: RESEND_OUTBOX_SOURCE,
        idempotency_key: adminIdempotencyKey,
      } as never);

  if (outboxError) {
    console.error("Failed to enqueue partner claim email alert", {
      claimId: data.id,
      error: outboxError.message,
    });
    warnings.push(OUTBOX_WARNING_ENQUEUE_FAILED);
  } else {
    const { error: triggerError } = await writeClient.rpc("trigger_process_outbox" as never);
    if (triggerError) {
      console.error("Failed to trigger immediate outbox processing for partner claim alert", {
        claimId: data.id,
        error: triggerError.message,
      });
      warnings.push(OUTBOX_WARNING_TRIGGER_FAILED);
    }

    const outboxUnavailable = await hasOutboxDeliveryAvailabilityIssue(writeClient);
    if (outboxUnavailable) {
      warnings.push(OUTBOX_WARNING_WORKER_UNHEALTHY);
    }
  }

  if (warnings.length > 0) {
    return NextResponse.json({ ok: true, data, warnings }, { status: 201 });
  }

  return NextResponse.json({ ok: true, data }, { status: 201 });
}
