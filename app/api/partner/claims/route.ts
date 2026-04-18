import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { normalizePublicContactEmail, PRIMARY_CONTACT_EMAIL } from "@/lib/contactEmail";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

const partnerClaimSchema = z.object({
  requestType: z.enum(["new-listing", "claim-business"]),
  businessName: z.string().trim().min(2).max(100),
  businessWebsite: z.union([z.string().trim().url().max(500), z.literal(""), z.undefined()]),
  contactName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.union([z.string().trim().max(32), z.literal(""), z.undefined()]),
  message: z.string().trim().min(10).max(2000),
  listingId: z.string().uuid().optional(),
});

const RESEND_OUTBOX_PROVIDER = "resend";
const RESEND_OUTBOX_OPERATION = "resend.send_email";
const RESEND_OUTBOX_SOURCE = "partner-claim-alert";
const RESEND_FROM = "AlgarveOfficial <onboarding@resend.dev>";
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function requestTypeLabel(requestType: "new-listing" | "claim-business") {
  return requestType === "new-listing" ? "New Listing Request" : "Claim Existing Business";
}

function toDisplayValue(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value.trim() : "Not provided";
}

function toMultilineHtml(value: string | null | undefined) {
  const normalized = toDisplayValue(value);
  return escapeHtml(normalized).replace(/\n/g, "<br />");
}

function buildPartnerClaimAlertEmail(args: {
  claimId: string;
  claimCreatedAt: string;
  recipient: string;
  payload: z.infer<typeof partnerClaimSchema>;
}) {
  const { claimId, claimCreatedAt, recipient, payload } = args;
  const businessName = payload.businessName.trim();
  const website = normalizeOptional(payload.businessWebsite);
  const phone = normalizeOptional(payload.phone);
  const subject = `New Partner Claim — ${businessName} (${requestTypeLabel(payload.requestType)})`;
  const listingId = payload.listingId ?? "Not provided";

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;color:#111;max-width:680px;margin:0 auto;padding:24px">
  <h2 style="margin-bottom:6px">New Partner Claim Submitted</h2>
  <p style="color:#6b7280;margin-top:0">Immediate alert from AlgarveOfficial partner intake</p>
  <table style="border-collapse:collapse;width:100%;margin:16px 0">
    <tr><td style="padding:6px 0;color:#6b7280;width:170px">Claim ID</td><td style="padding:6px 0"><strong>${escapeHtml(claimId)}</strong></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Submitted At (UTC)</td><td style="padding:6px 0">${escapeHtml(claimCreatedAt)}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Request Type</td><td style="padding:6px 0">${escapeHtml(requestTypeLabel(payload.requestType))}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Business Name</td><td style="padding:6px 0"><strong>${escapeHtml(businessName)}</strong></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Business Website</td><td style="padding:6px 0">${escapeHtml(toDisplayValue(website))}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Listing ID</td><td style="padding:6px 0">${escapeHtml(listingId)}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Contact Name</td><td style="padding:6px 0">${escapeHtml(payload.contactName.trim())}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Contact Email</td><td style="padding:6px 0"><a href="mailto:${escapeHtml(payload.email.trim())}">${escapeHtml(payload.email.trim())}</a></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Phone</td><td style="padding:6px 0">${escapeHtml(toDisplayValue(phone))}</td></tr>
  </table>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
  <p style="margin:0 0 6px 0;color:#6b7280">Business details from submitter:</p>
  <p style="white-space:normal;line-height:1.65;margin:0">${toMultilineHtml(payload.message)}</p>
</body>
</html>`.trim();

  const text = [
    "New Partner Claim Submitted",
    "",
    `Claim ID: ${claimId}`,
    `Submitted At (UTC): ${claimCreatedAt}`,
    `Request Type: ${requestTypeLabel(payload.requestType)}`,
    `Business Name: ${businessName}`,
    `Business Website: ${toDisplayValue(website)}`,
    `Listing ID: ${listingId}`,
    `Contact Name: ${payload.contactName.trim()}`,
    `Contact Email: ${payload.email.trim()}`,
    `Phone: ${toDisplayValue(phone)}`,
    "",
    "Business details from submitter:",
    payload.message.trim(),
  ].join("\n");

  return {
    to: [recipient],
    from: RESEND_FROM,
    subject,
    html,
    text,
    reply_to: payload.email.trim(),
  };
}

type ServiceRoleClient = NonNullable<ReturnType<typeof createServiceRoleClient>>;

async function resolvePartnerClaimAlertRecipient(writeClient: ServiceRoleClient) {
  try {
    const { data, error } = await writeClient
      .from("contact_settings")
      .select("forwarding_email")
      .eq("id", "default")
      .maybeSingle();

    if (error) return PRIMARY_CONTACT_EMAIL;
    return normalizePublicContactEmail(data?.forwarding_email ?? PRIMARY_CONTACT_EMAIL);
  } catch {
    return PRIMARY_CONTACT_EMAIL;
  }
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

  const userId = await resolveCurrentUserId();
  const payload = parsed.data;

  const { data, error } = await writeClient
    .from("listing_claims")
    .insert({
      request_type: payload.requestType,
      business_name: payload.businessName.trim(),
      business_website: normalizeOptional(payload.businessWebsite),
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
  const alertRecipient = await resolvePartnerClaimAlertRecipient(writeClient);
  const outboxPayload = buildPartnerClaimAlertEmail({
    claimId: data.id,
    claimCreatedAt: data.created_at,
    recipient: alertRecipient,
    payload,
  });

  const { error: outboxError } = await writeClient
    .from("external_outbox" as never)
    .insert({
      provider: RESEND_OUTBOX_PROVIDER,
      operation: RESEND_OUTBOX_OPERATION,
      payload: outboxPayload,
      source: RESEND_OUTBOX_SOURCE,
      idempotency_key: `partner-claim-alert:${data.id}`,
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
