/* eslint-disable no-console */
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/integrations/supabase/types";
import { INBOX_CACHE_TAG } from "@/lib/admin/inbox/types";
import { normalizePublicContactEmail, PRIMARY_CONTACT_EMAIL } from "@/lib/contactEmail";
import {
  enquirySchema,
  normalizeEnquiryPayload,
  type EnquiryPayload,
} from "@/lib/enquiries/schema";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const MESSAGE_FORWARD_COPY_EMAIL = "lazaro@deneto.ch";
const RESEND_OUTBOX_PROVIDER = "resend";
const RESEND_OUTBOX_OPERATION = "resend.send_email";
const RESEND_OUTBOX_SOURCE = "public-message-forward";
const RESEND_EMAIL_API_URL = "https://api.resend.com/emails";
const DEFAULT_TRANSACTIONAL_FROM = "AlgarveOfficial <info@algarveofficial.com>";
const OUTBOX_WARNING_ENQUEUE_FAILED = "email_delivery_failed";
const OUTBOX_WARNING_TRIGGER_FAILED = "email_delivery_failed";
const OUTBOX_WARNING_WORKER_UNHEALTHY = "email_delivery_failed";

type ServiceRoleClient = NonNullable<ReturnType<typeof createServiceRoleClient>>;
type ListingRow = Pick<Database["public"]["Tables"]["listings"]["Row"], "id" | "name" | "owner_id">;

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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toDisplayValue(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value.trim() : "Not provided";
}

function toMultilineHtml(value: string | null | undefined) {
  return escapeHtml(toDisplayValue(value)).replace(/\n/g, "<br />");
}

function getTransactionalFromAddress() {
  return process.env.RESEND_TRANSACTIONAL_FROM?.trim()
    || process.env.EMAIL_FROM?.trim()
    || DEFAULT_TRANSACTIONAL_FROM;
}

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || null;
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

async function resolveAdminUserId(writeClient: ServiceRoleClient) {
  const { data, error } = await writeClient
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.user_id ?? null;
}

async function resolveListing(
  writeClient: ServiceRoleClient,
  listingId: string | null,
): Promise<ListingRow | null> {
  if (!listingId) return null;
  const { data, error } = await writeClient
    .from("listings")
    .select("id, name, owner_id")
    .eq("id", listingId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

async function resolveForwardRecipients(writeClient: ServiceRoleClient) {
  let primary = PRIMARY_CONTACT_EMAIL;
  try {
    const { data, error } = await writeClient
      .from("contact_settings")
      .select("forwarding_email")
      .eq("id", "default")
      .maybeSingle();
    if (!error) {
      primary = normalizePublicContactEmail(data?.forwarding_email ?? PRIMARY_CONTACT_EMAIL);
    }
  } catch {
    primary = PRIMARY_CONTACT_EMAIL;
  }

  return Array.from(
    new Set([
      normalizePublicContactEmail(primary),
      normalizePublicContactEmail(MESSAGE_FORWARD_COPY_EMAIL),
    ]),
  );
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

function buildStoredMessage(payload: EnquiryPayload, listing: ListingRow | null) {
  const details = [
    payload.phone ? `Phone: ${payload.phone}` : null,
    payload.visit_type ? `Context: ${payload.visit_type}` : null,
    listing?.name || payload.listing_title ? `Listing: ${listing?.name ?? payload.listing_title}` : null,
    payload.agent_name ? `Agent: ${payload.agent_name}` : null,
    payload.agent_email ? `Agent email: ${payload.agent_email}` : null,
  ].filter((line): line is string => Boolean(line));

  return details.length > 0
    ? `${payload.message}\n\n${details.join("\n")}`
    : payload.message;
}

function buildForwardEmail(args: {
  payload: EnquiryPayload;
  listing: ListingRow | null;
  messageId: string;
  threadId: string;
  createdAt: string;
  recipients: string[];
}) {
  const { payload, listing, messageId, threadId, createdAt, recipients } = args;
  const listingTitle = listing?.name ?? payload.listing_title ?? "Website message";
  const subject = `New AlgarveOfficial message - ${listingTitle}`;
  const contextRows = [
    ["Message ID", messageId],
    ["Thread ID", threadId],
    ["Submitted At (UTC)", createdAt],
    ["Name", payload.name],
    ["Email", payload.email],
    ["Phone", payload.phone],
    ["Listing", listingTitle],
    ["Listing ID", listing?.id ?? payload.listing_id],
    ["Agent", payload.agent_name],
    ["Agent Email", payload.agent_email],
    ["Context", payload.visit_type],
  ] as const;

  const htmlRows = contextRows
    .map(([label, value]) => (
      `<tr><td style="padding:6px 0;color:#6b7280;width:170px">${escapeHtml(label)}</td><td style="padding:6px 0">${escapeHtml(toDisplayValue(value))}</td></tr>`
    ))
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;color:#111;max-width:680px;margin:0 auto;padding:24px">
  <h2 style="margin-bottom:6px">New AlgarveOfficial Message</h2>
  <p style="color:#6b7280;margin-top:0">Forwarded copy for ${escapeHtml(recipients.join(", "))}</p>
  <table style="border-collapse:collapse;width:100%;margin:16px 0">
    ${htmlRows}
  </table>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
  <p style="margin:0 0 6px 0;color:#6b7280">Message:</p>
  <p style="white-space:normal;line-height:1.65;margin:0">${toMultilineHtml(payload.message)}</p>
</body>
</html>`.trim();

  const text = [
    "New AlgarveOfficial Message",
    "",
    ...contextRows.map(([label, value]) => `${label}: ${toDisplayValue(value)}`),
    "",
    "Message:",
    payload.message,
  ].join("\n");

  return {
    to: recipients,
    from: getTransactionalFromAddress(),
    subject,
    html,
    text,
    reply_to: payload.email,
  };
}

async function sendForwardEmailDirectly(
  outboxPayload: ReturnType<typeof buildForwardEmail>,
  idempotencyKey: string,
) {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return { status: "not_configured" as const };
  }

  try {
    const response = await fetch(RESEND_EMAIL_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(outboxPayload),
    });

    if (response.ok) {
      return { status: "sent" as const };
    }

    const responseBody = await response.text().catch(() => "");
    return {
      status: "failed" as const,
      message: responseBody || `Resend responded with HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      status: "failed" as const,
      message: error instanceof Error ? error.message : "Resend request failed",
    };
  }
}

async function recordSentForwardEmail(args: {
  writeClient: ServiceRoleClient;
  outboxPayload: ReturnType<typeof buildForwardEmail>;
  idempotencyKey: string;
  messageId: string;
}) {
  const { writeClient, outboxPayload, idempotencyKey, messageId } = args;
  const { error } = await writeClient
    .from("external_outbox" as never)
    .insert({
      provider: RESEND_OUTBOX_PROVIDER,
      operation: RESEND_OUTBOX_OPERATION,
      payload: outboxPayload,
      source: RESEND_OUTBOX_SOURCE,
      idempotency_key: idempotencyKey,
      status: "sent",
      attempts: 1,
    } as never);

  if (error) {
    console.error("Forwarding email was sent, but outbox audit insert failed", {
      messageId,
      error: error.message,
    });
  }
}

async function enqueueForwardEmail(args: {
  writeClient: ServiceRoleClient;
  payload: EnquiryPayload;
  listing: ListingRow | null;
  messageId: string;
  threadId: string;
  createdAt: string;
}) {
  const { writeClient, payload, listing, messageId, threadId, createdAt } = args;
  const warnings: string[] = [];
  const recipients = await resolveForwardRecipients(writeClient);
  const outboxPayload = buildForwardEmail({
    payload,
    listing,
    messageId,
    threadId,
    createdAt,
    recipients,
  });
  const idempotencyKey = `public-message-forward:${messageId}`;

  const directDelivery = await sendForwardEmailDirectly(outboxPayload, idempotencyKey);
  if (directDelivery.status === "sent") {
    await recordSentForwardEmail({
      writeClient,
      outboxPayload,
      idempotencyKey,
      messageId,
    });
    return warnings;
  }

  if (directDelivery.status === "failed") {
    console.error("Direct public message forwarding email failed; falling back to outbox", {
      messageId,
      error: directDelivery.message,
    });
  }

  const { error: outboxError } = await writeClient
    .from("external_outbox" as never)
    .insert({
      provider: RESEND_OUTBOX_PROVIDER,
      operation: RESEND_OUTBOX_OPERATION,
      payload: outboxPayload,
      source: RESEND_OUTBOX_SOURCE,
      idempotency_key: idempotencyKey,
    } as never);

  if (outboxError) {
    console.error("Failed to enqueue public message forwarding email", {
      messageId,
      error: outboxError.message,
    });
    warnings.push(OUTBOX_WARNING_ENQUEUE_FAILED);
    return warnings;
  }

  const { error: triggerError } = await writeClient.rpc("trigger_process_outbox" as never);
  if (triggerError) {
    console.error("Failed to trigger immediate outbox processing for public message forwarding", {
      messageId,
      error: triggerError.message,
    });
    warnings.push(OUTBOX_WARNING_TRIGGER_FAILED);
  }

  if (await hasOutboxDeliveryAvailabilityIssue(writeClient)) {
    warnings.push(OUTBOX_WARNING_WORKER_UNHEALTHY);
  }

  return Array.from(new Set(warnings));
}

function invalidateAdminMessageViews() {
  revalidateTag(INBOX_CACHE_TAG, "max");
  revalidatePath("/admin/inbox");
  revalidatePath("/[locale]/admin/inbox", "page");
  revalidatePath("/admin/messages");
  revalidatePath("/[locale]/admin/messages", "page");
}

export async function POST(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsed = enquirySchema.safeParse(rawBody);
  if (!parsed.success) {
    return errorResponse(400, "INVALID_ENQUIRY", "Message details are invalid.", parsed.error.flatten());
  }

  const writeClient = createServiceRoleClient();
  if (!writeClient) {
    return errorResponse(500, "SERVICE_ROLE_NOT_CONFIGURED", "Message storage is not configured.");
  }

  try {
    const payload = normalizeEnquiryPayload(parsed.data);
    const [listing, currentUserId, adminUserId] = await Promise.all([
      resolveListing(writeClient, payload.listing_id),
      resolveCurrentUserId(),
      resolveAdminUserId(writeClient),
    ]);

    if (payload.listing_id && !listing) {
      return errorResponse(404, "LISTING_NOT_FOUND", "The referenced listing was not found.");
    }

    const shouldRouteToAdmin = payload.visit_type === "Owner Support";
    const ownerId = shouldRouteToAdmin ? adminUserId : listing?.owner_id ?? adminUserId;
    if (!ownerId) {
      return errorResponse(
        500,
        "ADMIN_USER_NOT_CONFIGURED",
        "Messages cannot be delivered because no admin user is configured.",
      );
    }

    const createdAt = new Date().toISOString();
    let threadId: string | null = null;

    if (listing?.id && currentUserId) {
      const { data: existingThread, error: existingThreadError } = await writeClient
        .from("chat_threads")
        .select("id")
        .eq("listing_id", listing.id)
        .eq("owner_id", ownerId)
        .eq("viewer_id", currentUserId)
        .eq("channel", "whatsapp")
        .maybeSingle();

      if (existingThreadError) {
        return errorResponse(500, "CHAT_THREAD_LOOKUP_FAILED", existingThreadError.message);
      }
      threadId = existingThread?.id ?? null;
    }

    if (!threadId) {
      const { data: thread, error: threadError } = await writeClient
        .from("chat_threads")
        .insert({
          listing_id: listing?.id ?? null,
          owner_id: ownerId,
          viewer_id: currentUserId,
          contact_name: payload.name,
          contact_email: payload.email,
          status: "active",
          last_message_at: createdAt,
          unread_owner_count: 0,
          unread_viewer_count: 0,
        })
        .select("id")
        .single();

      if (threadError) {
        return errorResponse(500, "CHAT_THREAD_CREATE_FAILED", threadError.message);
      }
      threadId = thread.id;
    } else {
      const { error: threadUpdateError } = await writeClient
        .from("chat_threads")
        .update({
          contact_name: payload.name,
          contact_email: payload.email,
          status: "active",
          last_message_at: createdAt,
        })
        .eq("id", threadId);

      if (threadUpdateError) {
        return errorResponse(500, "CHAT_THREAD_UPDATE_FAILED", threadUpdateError.message);
      }
    }

    const { data: message, error: messageError } = await writeClient
      .from("chat_messages")
      .insert({
        thread_id: threadId,
        sender_type: "viewer",
        direction: "inbound",
        body_text: buildStoredMessage(payload, listing),
        recipient_id: ownerId,
        delivery_status: "delivered",
        created_at: createdAt,
      })
      .select("id, created_at")
      .single();

    if (messageError) {
      return errorResponse(500, "CHAT_MESSAGE_CREATE_FAILED", messageError.message);
    }

    const warnings = await enqueueForwardEmail({
      writeClient,
      payload,
      listing,
      messageId: message.id,
      threadId,
      createdAt: message.created_at,
    });

    invalidateAdminMessageViews();

    return NextResponse.json({
      ok: true,
      data: {
        threadId,
        messageId: message.id,
      },
      warnings,
    }, { status: 201 });
  } catch (error) {
    return errorResponse(
      500,
      "ENQUIRY_CREATE_FAILED",
      error instanceof Error ? error.message : "Failed to send message.",
    );
  }
}
