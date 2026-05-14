/* eslint-disable no-console */
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/integrations/supabase/types";
import { INBOX_CACHE_TAG } from "@/lib/admin/inbox/types";
import { notifyOwnerListingContactReceived } from "@/lib/communication/listing-notifications";
import {
  getContactNotificationRecipients,
  getDefaultFrom,
  getSiteUrl,
} from "@/lib/email/email-config";
import { sendEmail } from "@/lib/email/send-email";
import { contactAdminNotificationTemplate } from "@/lib/email/templates/contact-admin-notification";
import { contactUserConfirmationTemplate } from "@/lib/email/templates/contact-user-confirmation";
import {
  enquirySchema,
  normalizeEnquiryPayload,
  type EnquiryPayload,
} from "@/lib/enquiries/schema";
import {
  enforceFormAbuseProtection,
  extractFormAbuseFields,
} from "@/lib/security/form-abuse-protection";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const RESEND_OUTBOX_PROVIDER = "resend";
const RESEND_OUTBOX_OPERATION = "resend.send_email";
const RESEND_OUTBOX_SOURCE = "public-message-forward";
const DEFAULT_TRANSACTIONAL_FROM = "AlgarveOfficial <info@algarveofficial.com>";
const OUTBOX_WARNING_ENQUEUE_FAILED = "email_delivery_failed";
const OUTBOX_WARNING_TRIGGER_FAILED = "email_delivery_failed";
const OUTBOX_WARNING_WORKER_UNHEALTHY = "email_delivery_failed";

type ServiceRoleClient = NonNullable<ReturnType<typeof createServiceRoleClient>>;
type ListingRow = Pick<Database["public"]["Tables"]["listings"]["Row"], "id" | "name" | "owner_id" | "slug">;

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

function getTransactionalFromAddress() {
  return getDefaultFrom()
    || process.env.RESEND_TRANSACTIONAL_FROM?.trim()
    || process.env.EMAIL_FROM?.trim()
    || DEFAULT_TRANSACTIONAL_FROM;
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
    .select("id, name, owner_id, slug")
    .eq("id", listingId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

function getOutboxAlertKey(alert: unknown) {
  if (!alert || typeof alert !== "object") return null;
  const key = (alert as { alert_key?: unknown }).alert_key;
  return typeof key === "string" ? key : null;
}

function parseMessageSubject(message: string) {
  const match = message.match(/^Subject:\s*(.+?)\n\n([\s\S]*)$/);
  if (!match) {
    return {
      subject: "Website message",
      body: message,
    };
  }

  return {
    subject: match[1]?.trim() || "Website message",
    body: match[2]?.trim() || message,
  };
}

function publicListingUrl(listing: ListingRow | null) {
  if (!listing) return null;
  return new URL(`/listing/${encodeURIComponent(listing.slug || listing.id)}`, getSiteUrl()).toString();
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
  const message = parseMessageSubject(payload.message);
  const listingTitle = listing?.name ?? payload.listing_title ?? null;
  const template = contactAdminNotificationTemplate({
    messageId,
    threadId,
    senderName: payload.name,
    senderEmail: payload.email,
    phone: payload.phone,
    subjectLabel: message.subject,
    message: message.body,
    listingTitle,
    listingUrl: publicListingUrl(listing),
    sourceUrl: payload.agent_name ? `Agent: ${payload.agent_name}` : payload.visit_type,
    submittedAt: createdAt,
    adminUrl: `/admin/inbox`,
  });

  return {
    to: recipients,
    from: getTransactionalFromAddress(),
    subject: template.subject,
    html: template.html,
    text: template.text,
    reply_to: payload.email,
  };
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
  const recipients = getContactNotificationRecipients();
  if (recipients.length === 0) {
    console.error("Public message forwarding has no configured recipients", { messageId });
    warnings.push(OUTBOX_WARNING_ENQUEUE_FAILED);
    return warnings;
  }

  const outboxPayload = buildForwardEmail({
    payload,
    listing,
    messageId,
    threadId,
    createdAt,
    recipients,
  });
  const idempotencyKey = `enquiry/${messageId}/admin`;

  const directDelivery = await sendEmail({
    to: recipients,
    replyTo: payload.email,
    subject: outboxPayload.subject,
    html: outboxPayload.html,
    text: outboxPayload.text,
    templateKey: "contact_admin_notification",
    relatedEntityType: "enquiry",
    relatedEntityId: messageId,
    idempotencyKey,
    metadata: {
      threadId,
      listingId: listing?.id ?? payload.listing_id ?? null,
      visitType: payload.visit_type ?? null,
    },
    tags: [
      { name: "template", value: "contact_admin_notification" },
      { name: "source", value: "enquiry" },
    ],
  });

  if (directDelivery.success) {
    return warnings;
  }

  console.error("Direct public message forwarding email failed; falling back to outbox", {
    messageId,
    error: directDelivery.error ?? directDelivery.reason ?? "unknown",
  });

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

async function sendContactUserConfirmation(args: {
  payload: EnquiryPayload;
  listing: ListingRow | null;
  messageId: string;
  createdAt: string;
}) {
  const { payload, listing, messageId, createdAt } = args;
  const parsedMessage = parseMessageSubject(payload.message);
  const content = contactUserConfirmationTemplate({
    name: payload.name,
    subjectLabel: parsedMessage.subject,
    listingTitle: listing?.name ?? payload.listing_title ?? null,
  });

  const result = await sendEmail({
    to: payload.email,
    subject: content.subject,
    html: content.html,
    text: content.text,
    templateKey: "contact_user_confirmation",
    relatedEntityType: "enquiry",
    relatedEntityId: messageId,
    idempotencyKey: `enquiry/${messageId}/user`,
    metadata: {
      listingId: listing?.id ?? payload.listing_id ?? null,
      submittedAt: createdAt,
    },
    tags: [
      { name: "template", value: "contact_user_confirmation" },
      { name: "source", value: "enquiry" },
    ],
  });

  if (!result.success && !result.skipped) {
    console.error("Public message confirmation email failed", {
      messageId,
      error: result.error ?? result.reason ?? "unknown",
    });
  }
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
    const abuseFields = extractFormAbuseFields(rawBody);
    const abuse = await enforceFormAbuseProtection({
      request,
      client: writeClient,
      scope: "enquiry",
      email: payload.email,
      honeypot: abuseFields.honeypot,
      submittedAt: abuseFields.submittedAt,
      maxAttempts: 8,
      windowSeconds: 60 * 60,
    });

    if (!abuse.allowed) {
      return errorResponse(400, "ENQUIRY_REJECTED", "Message could not be processed.");
    }

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

    await sendContactUserConfirmation({
      payload,
      listing,
      messageId: message.id,
      createdAt: message.created_at,
    });

    if (listing?.id && ownerId === listing.owner_id) {
      await notifyOwnerListingContactReceived({
        client: writeClient,
        listingId: listing.id,
        messageId: message.id,
        senderName: payload.name,
        senderEmail: payload.email,
        messagePreview: payload.message,
      }).catch((error) => {
        console.error("Owner listing contact notification failed", {
          messageId: message.id,
          error: error instanceof Error ? error.message : "unknown",
        });
      });
    }

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
