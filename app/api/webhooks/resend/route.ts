import { NextRequest, NextResponse } from "next/server";

import { getEmailConfig } from "@/lib/email/email-config";
import { getResendClient } from "@/lib/email/resend-client";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ResendWebhookPayload = {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    subject?: string;
    to?: string[];
    email?: string;
    id?: string;
    unsubscribed?: boolean;
    bounce?: { message?: string; type?: string; subType?: string };
    failed?: { reason?: string };
    suppressed?: { message?: string; type?: string };
    tags?: Record<string, string>;
  };
};

const EMAIL_STATUS_BY_EVENT: Record<string, string> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.delivery_delayed": "delivery_delayed",
  "email.bounced": "bounced",
  "email.complained": "complained",
  "email.failed": "failed",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.suppressed": "suppressed",
};

function response(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status });
}

function webhookHeaders(request: NextRequest) {
  return {
    id: request.headers.get("svix-id") ?? "",
    timestamp: request.headers.get("svix-timestamp") ?? "",
    signature: request.headers.get("svix-signature") ?? "",
  };
}

function eventId(request: NextRequest, event: ResendWebhookPayload) {
  return request.headers.get("svix-id")
    || event.data?.email_id
    || `${event.type}:${event.created_at ?? Date.now()}`;
}

function firstRecipient(event: ResendWebhookPayload) {
  return event.data?.to?.[0]?.toLowerCase() ?? event.data?.email?.toLowerCase() ?? null;
}

function errorMessageForEvent(event: ResendWebhookPayload) {
  return event.data?.bounce?.message
    ?? event.data?.failed?.reason
    ?? event.data?.suppressed?.message
    ?? null;
}

async function storeReceipt(args: {
  client: NonNullable<ReturnType<typeof createServiceRoleClient>>;
  id: string;
  event: ResendWebhookPayload;
}) {
  const { client, id, event } = args;
  const { error } = await client
    .from("webhook_event_receipts" as never)
    .insert({
      provider: "resend",
      event_id: id,
      event_type: event.type,
      payload: event,
    } as never);

  if (error && (error as { code?: string }).code === "23505") {
    return "duplicate" as const;
  }

  if (error) {
    throw new Error(error.message);
  }

  return "stored" as const;
}

async function upsertTransactionalEvent(args: {
  client: NonNullable<ReturnType<typeof createServiceRoleClient>>;
  event: ResendWebhookPayload;
}) {
  const { client, event } = args;
  const emailId = event.data?.email_id;
  if (!emailId) return;

  const status = EMAIL_STATUS_BY_EVENT[event.type];
  if (!status) return;

  const { data } = await client
    .from("transactional_email_events" as never)
    .select("id")
    .eq("provider_email_id", emailId)
    .limit(1)
    .maybeSingle();

  const metadata = {
    resend_event_type: event.type,
    resend_created_at: event.created_at ?? null,
    resend_tags: event.data?.tags ?? null,
  };

  const existing = data as { id?: string } | null;
  if (existing?.id) {
    await client
      .from("transactional_email_events" as never)
      .update({
        status,
        error_message: errorMessageForEvent(event),
        metadata,
      } as never)
      .eq("id", existing.id);
    return;
  }

  await client
    .from("transactional_email_events" as never)
    .insert({
      provider: "resend",
      provider_email_id: emailId,
      template_key: event.data?.tags?.template ?? "resend_webhook",
      recipient: event.data?.to?.join(",") ?? null,
      subject: event.data?.subject ?? null,
      related_entity_type: "system",
      status,
      error_message: errorMessageForEvent(event),
      metadata,
    } as never);
}

async function updateNewsletterSuppression(args: {
  client: NonNullable<ReturnType<typeof createServiceRoleClient>>;
  event: ResendWebhookPayload;
}) {
  const { client, event } = args;
  const recipient = firstRecipient(event);
  if (!recipient) return;

  const status = event.type === "email.bounced"
    ? "bounced"
    : event.type === "email.complained"
      ? "complained"
      : event.type === "email.suppressed" || event.type === "email.failed"
        ? "failed"
        : (event.type === "contact.unsubscribed" || (event.type.startsWith("contact.") && event.data?.unsubscribed))
          ? "unsubscribed"
          : null;

  if (!status) return;

  const patch: Record<string, unknown> = {
    status,
    is_subscribed: false,
    updated_at: new Date().toISOString(),
  };

  if (status === "unsubscribed") {
    patch.unsubscribed_at = new Date().toISOString();
  }

  if (event.data?.id) {
    patch.resend_contact_id = event.data.id;
  }

  await client
    .from("email_subscribers" as never)
    .update(patch as never)
    .eq("email", recipient);
}

async function parseOrVerifyEvent(request: NextRequest, rawBody: string) {
  const config = getEmailConfig();
  const headers = webhookHeaders(request);

  if (!config.resendWebhookSecret) {
    if (config.isProduction) {
      throw new Error("resend_webhook_secret_missing");
    }
    return JSON.parse(rawBody) as ResendWebhookPayload;
  }

  return getResendClient().webhooks.verify({
    payload: rawBody,
    headers,
    webhookSecret: config.resendWebhookSecret,
  }) as ResendWebhookPayload;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  let event: ResendWebhookPayload;

  try {
    event = await parseOrVerifyEvent(request, rawBody);
  } catch {
    return response(401, { ok: false, error: "invalid_resend_webhook_signature" });
  }

  const client = createServiceRoleClient();
  if (!client) {
    return response(503, { ok: false, error: "service_role_not_configured" });
  }

  try {
    const receiptStatus = await storeReceipt({
      client,
      id: eventId(request, event),
      event,
    });

    if (receiptStatus === "duplicate") {
      return response(200, { ok: true, duplicate: true });
    }

    await upsertTransactionalEvent({ client, event });
    await updateNewsletterSuppression({ client, event });

    return response(200, { ok: true });
  } catch {
    return response(500, { ok: false, error: "resend_webhook_processing_failed" });
  }
}
