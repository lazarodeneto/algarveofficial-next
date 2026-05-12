/* eslint-disable no-console */
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { normalizePublicContactEmail, PRIMARY_CONTACT_EMAIL } from "@/lib/contactEmail";

type EmailClient = SupabaseClient<Database>;

const RESEND_OUTBOX_PROVIDER = "resend";
const RESEND_OUTBOX_OPERATION = "resend.send_email";
const BUSINESS_CLAIM_EMAIL_SOURCE = "business-claim-email";
const DEFAULT_TRANSACTIONAL_FROM = "AlgarveOfficial <info@algarveofficial.com>";

export const BUSINESS_CLAIM_EMAIL_WARNINGS = {
  enqueueFailed: "business_claim_email_enqueue_failed",
  triggerFailed: "business_claim_email_trigger_failed",
  workerUnhealthy: "business_claim_email_outbox_worker_unhealthy",
  contextUnavailable: "business_claim_email_context_unavailable",
} as const;

export type BusinessClaimEmailWarning =
  (typeof BUSINESS_CLAIM_EMAIL_WARNINGS)[keyof typeof BUSINESS_CLAIM_EMAIL_WARNINGS];

export type BusinessClaimEmailStatus =
  | "pending"
  | "needs_more_info"
  | "approved"
  | "rejected"
  | "cancelled"
  | "disputed";

export type BusinessClaimEmailTier = "free" | "verified" | "signature";

export interface BusinessClaimEmailContext {
  claimId: string;
  listingId: string;
  businessName: string;
  businessSlug?: string | null;
  claimantName: string;
  claimantEmail: string;
  selectedTier: BusinessClaimEmailTier;
  status: BusinessClaimEmailStatus;
  createdAt?: string | null;
  reviewNote?: string | null;
  rejectionReason?: string | null;
}

interface EmailJob {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string | null;
  idempotencyKey: string;
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") || "https://algarveofficial.com";
}

function getTransactionalFromAddress() {
  return process.env.RESEND_TRANSACTIONAL_FROM?.trim()
    || process.env.EMAIL_FROM?.trim()
    || DEFAULT_TRANSACTIONAL_FROM;
}

function getReplyToAddress() {
  return process.env.EMAIL_REPLY_TO?.trim() || PRIMARY_CONTACT_EMAIL;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toDisplayValue(value: string | null | undefined) {
  return value && value.trim() ? value.trim() : "Not provided";
}

function tierLabel(tier: BusinessClaimEmailTier) {
  if (tier === "signature") return "Signature Partner";
  if (tier === "verified") return "Verified Business";
  return "Free Claim";
}

function statusLabel(status: BusinessClaimEmailStatus) {
  return status.replaceAll("_", " ");
}

function ownerDashboardUrl() {
  return `${getSiteUrl()}/owner/listings`;
}

function adminClaimUrl(claimId: string) {
  return `${getSiteUrl()}/admin/business-claims/${encodeURIComponent(claimId)}`;
}

function publicListingUrl(ctx: BusinessClaimEmailContext) {
  return ctx.businessSlug
    ? `${getSiteUrl()}/listing/${encodeURIComponent(ctx.businessSlug)}`
    : null;
}

function emailLayout({
  preview,
  heading,
  intro,
  rows,
  nextStep,
  actionLabel,
  actionUrl,
  note,
}: {
  preview: string;
  heading: string;
  intro: string;
  rows: Array<[string, string]>;
  nextStep: string;
  actionLabel?: string;
  actionUrl?: string | null;
  note?: string | null;
}) {
  const renderedRows = rows
    .map(([label, value]) => (
      `<tr><td style="padding:7px 0;color:#64748b;width:150px">${escapeHtml(label)}</td><td style="padding:7px 0"><strong>${escapeHtml(value)}</strong></td></tr>`
    ))
    .join("");
  const action = actionLabel && actionUrl
    ? `<p style="margin:22px 0"><a href="${escapeHtml(actionUrl)}" style="display:inline-block;background:#caa132;color:#111827;text-decoration:none;border-radius:999px;padding:12px 18px;font-weight:700">${escapeHtml(actionLabel)}</a></p>`
    : "";
  const renderedNote = note
    ? `<div style="margin:18px 0;padding:14px 16px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc"><p style="margin:0;color:#334155;line-height:1.6">${escapeHtml(note)}</p></div>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(preview)}</title></head>
<body style="font-family:Arial,sans-serif;color:#111827;background:#f8fafc;margin:0;padding:24px">
  <main style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:28px">
    <p style="margin:0 0 12px;color:#c08b13;font-size:12px;letter-spacing:.18em;text-transform:uppercase;font-weight:700">AlgarveOfficial</p>
    <h1 style="margin:0 0 12px;font-size:26px;line-height:1.2">${escapeHtml(heading)}</h1>
    <p style="margin:0 0 20px;color:#475569;line-height:1.65">${escapeHtml(intro)}</p>
    <table style="border-collapse:collapse;width:100%;margin:16px 0">${renderedRows}</table>
    ${renderedNote}
    <h2 style="margin:22px 0 8px;font-size:16px">Next step</h2>
    <p style="margin:0;color:#475569;line-height:1.65">${escapeHtml(nextStep)}</p>
    ${action}
    <p style="margin:28px 0 0;color:#94a3b8;font-size:12px;line-height:1.5">This email does not include proof documents or sensitive verification attachments.</p>
  </main>
</body>
</html>`.trim();
}

function baseRows(ctx: BusinessClaimEmailContext): Array<[string, string]> {
  return [
    ["Business", ctx.businessName],
    ["Claim reference", ctx.claimId],
    ["Selected tier", tierLabel(ctx.selectedTier)],
    ["Status", statusLabel(ctx.status)],
  ];
}

function textEmail({
  heading,
  intro,
  rows,
  nextStep,
  actionLabel,
  actionUrl,
  note,
}: {
  heading: string;
  intro: string;
  rows: Array<[string, string]>;
  nextStep: string;
  actionLabel?: string;
  actionUrl?: string | null;
  note?: string | null;
}) {
  return [
    heading,
    "",
    intro,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    ...(note ? ["", "Note:", note] : []),
    "",
    "Next step:",
    nextStep,
    ...(actionLabel && actionUrl ? ["", `${actionLabel}: ${actionUrl}`] : []),
  ].join("\n");
}

function buildClaimantSubmittedEmail(ctx: BusinessClaimEmailContext): EmailJob {
  const subject = "We received your AlgarveOfficial business claim";
  const rows = baseRows(ctx);
  const nextStep = "Our team will review your request and email you when there is an update.";

  return {
    to: ctx.claimantEmail,
    subject,
    html: emailLayout({
      preview: subject,
      heading: "We received your business claim",
      intro: `Hi ${ctx.claimantName}, your claim for ${ctx.businessName} has been received.`,
      rows,
      nextStep,
    }),
    text: textEmail({
      heading: "We received your business claim",
      intro: `Hi ${ctx.claimantName}, your claim for ${ctx.businessName} has been received.`,
      rows,
      nextStep,
    }),
    idempotencyKey: `business-claim:${ctx.claimId}:submitted-claimant`,
  };
}

function buildAdminSubmittedEmail(ctx: BusinessClaimEmailContext, recipient: string): EmailJob {
  const subject = "New business claim submitted";
  const listingUrl = publicListingUrl(ctx);
  const rows: Array<[string, string]> = [
    ...baseRows(ctx),
    ["Claimant", ctx.claimantName],
    ["Claimant email", ctx.claimantEmail],
    ["Listing ID", ctx.listingId],
  ];
  const nextStep = "Review the structured claim in the admin dashboard.";

  return {
    to: recipient,
    subject,
    html: emailLayout({
      preview: subject,
      heading: "New business claim submitted",
      intro: `${ctx.claimantName} submitted a claim for ${ctx.businessName}.`,
      rows,
      nextStep,
      actionLabel: "Review claim",
      actionUrl: adminClaimUrl(ctx.claimId),
      note: listingUrl ? `Public listing: ${listingUrl}` : null,
    }),
    text: textEmail({
      heading: "New business claim submitted",
      intro: `${ctx.claimantName} submitted a claim for ${ctx.businessName}.`,
      rows,
      nextStep,
      actionLabel: "Review claim",
      actionUrl: adminClaimUrl(ctx.claimId),
      note: listingUrl ? `Public listing: ${listingUrl}` : null,
    }),
    replyTo: ctx.claimantEmail,
    idempotencyKey: `business-claim:${ctx.claimId}:submitted-admin`,
  };
}

function buildReviewEmail(ctx: BusinessClaimEmailContext): EmailJob | null {
  const status = ctx.status;
  if (status !== "approved" && status !== "rejected" && status !== "needs_more_info") {
    return null;
  }

  const subjectByStatus = {
    approved: "Your AlgarveOfficial business claim was approved",
    rejected: "Your AlgarveOfficial business claim was not approved",
    needs_more_info: "More information needed for your AlgarveOfficial claim",
  } satisfies Record<typeof status, string>;
  const headingByStatus = {
    approved: "Your business claim was approved",
    rejected: "Your business claim was not approved",
    needs_more_info: "More information is needed",
  } satisfies Record<typeof status, string>;
  const nextStepByStatus = {
    approved: "You can now manage this business from your owner dashboard.",
    rejected: "Review the reason below and submit a new claim if the information changes.",
    needs_more_info: "Please provide the requested information so our team can continue the review.",
  } satisfies Record<typeof status, string>;
  const note = status === "rejected" ? ctx.rejectionReason : ctx.reviewNote;
  const rows = baseRows(ctx);

  return {
    to: ctx.claimantEmail,
    subject: subjectByStatus[status],
    html: emailLayout({
      preview: subjectByStatus[status],
      heading: headingByStatus[status],
      intro: `Hi ${ctx.claimantName}, there is an update on your claim for ${ctx.businessName}.`,
      rows,
      nextStep: nextStepByStatus[status],
      actionLabel: status === "approved" ? "Open owner dashboard" : undefined,
      actionUrl: status === "approved" ? ownerDashboardUrl() : undefined,
      note,
    }),
    text: textEmail({
      heading: headingByStatus[status],
      intro: `Hi ${ctx.claimantName}, there is an update on your claim for ${ctx.businessName}.`,
      rows,
      nextStep: nextStepByStatus[status],
      actionLabel: status === "approved" ? "Open owner dashboard" : undefined,
      actionUrl: status === "approved" ? ownerDashboardUrl() : undefined,
      note,
    }),
    idempotencyKey: `business-claim:${ctx.claimId}:${status}-claimant`,
  };
}

async function resolveBusinessClaimAdminRecipient(client: EmailClient) {
  try {
    const { data, error } = await client
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

async function hasOutboxDeliveryAvailabilityIssue(client: EmailClient) {
  try {
    const { data, error } = await client
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

async function enqueueBusinessClaimEmailJobs(client: EmailClient, jobs: EmailJob[]) {
  const warnings: BusinessClaimEmailWarning[] = [];
  let enqueued = 0;

  for (const job of jobs) {
    const payload = {
      to: [job.to],
      from: getTransactionalFromAddress(),
      subject: job.subject,
      html: job.html,
      text: job.text,
      reply_to: job.replyTo ?? getReplyToAddress(),
    };

    const { error } = await client
      .from("external_outbox" as never)
      .insert({
        provider: RESEND_OUTBOX_PROVIDER,
        operation: RESEND_OUTBOX_OPERATION,
        payload,
        source: BUSINESS_CLAIM_EMAIL_SOURCE,
        idempotency_key: job.idempotencyKey,
      } as never);

    if (error) {
      if ((error as { code?: string }).code === "23505") {
        continue;
      }
      console.error("Failed to enqueue business claim email", {
        idempotencyKey: job.idempotencyKey,
        error: error.message,
      });
      warnings.push(BUSINESS_CLAIM_EMAIL_WARNINGS.enqueueFailed);
      continue;
    }

    enqueued += 1;
  }

  if (enqueued > 0) {
    const { error: triggerError } = await client.rpc("trigger_process_outbox" as never);
    if (triggerError) {
      console.error("Failed to trigger immediate outbox processing for business claim email", {
        error: triggerError.message,
      });
      warnings.push(BUSINESS_CLAIM_EMAIL_WARNINGS.triggerFailed);
    }

    if (await hasOutboxDeliveryAvailabilityIssue(client)) {
      warnings.push(BUSINESS_CLAIM_EMAIL_WARNINGS.workerUnhealthy);
    }
  }

  return Array.from(new Set(warnings));
}

export async function notifyBusinessClaimSubmitted(
  client: EmailClient,
  context: BusinessClaimEmailContext,
) {
  const adminRecipient = await resolveBusinessClaimAdminRecipient(client);
  return enqueueBusinessClaimEmailJobs(client, [
    buildClaimantSubmittedEmail(context),
    buildAdminSubmittedEmail(context, adminRecipient),
  ]);
}

export async function notifyBusinessClaimReview(
  client: EmailClient,
  context: BusinessClaimEmailContext,
) {
  const job = buildReviewEmail(context);
  return job ? enqueueBusinessClaimEmailJobs(client, [job]) : [];
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export async function loadBusinessClaimEmailContext(
  client: EmailClient,
  claimId: string,
): Promise<BusinessClaimEmailContext | null> {
  const { data, error } = await client
    .from("business_claims")
    .select(`
      id,
      listing_id,
      claimant_name,
      claimant_email,
      selected_tier,
      status,
      created_at,
      review_note,
      rejection_reason,
      listing:listings!business_claims_listing_id_fkey (
        id,
        name,
        slug
      )
    `)
    .eq("id", claimId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("Failed to load business claim email context", {
        claimId,
        error: error.message,
      });
    }
    return null;
  }

  const row = data as Record<string, unknown>;
  const listing = one(toRecord(row.listing) as Record<string, unknown> | Record<string, unknown>[] | null);

  return {
    claimId: String(row.id),
    listingId: readString(row.listing_id) ?? String(row.listing_id),
    businessName: readString(listing?.name) ?? "this business",
    businessSlug: readString(listing?.slug),
    claimantName: readString(row.claimant_name) ?? "there",
    claimantEmail: readString(row.claimant_email) ?? "",
    selectedTier: (readString(row.selected_tier) ?? "free") as BusinessClaimEmailTier,
    status: (readString(row.status) ?? "pending") as BusinessClaimEmailStatus,
    createdAt: readString(row.created_at),
    reviewNote: readString(row.review_note),
    rejectionReason: readString(row.rejection_reason),
  };
}
