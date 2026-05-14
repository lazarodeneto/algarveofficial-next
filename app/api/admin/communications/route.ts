/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

import { adminErrorResponse, requireAdminSession } from "@/lib/server/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const EMAIL_STATUSES = new Set([
  "attempt",
  "sent",
  "failed",
  "skipped",
  "delivered",
  "delivery_delayed",
  "bounced",
  "complained",
  "opened",
  "clicked",
  "suppressed",
]);

function normalizeFilter(value: string | null, maxLength = 80) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function maskEmail(value: string | null | undefined) {
  if (!value) return null;
  return value
    .split(",")
    .map((item) => {
      const trimmed = item.trim();
      const [local, domain] = trimmed.split("@");
      if (!local || !domain) return trimmed ? "masked" : null;
      const visible = local.length <= 2 ? local[0] : `${local.slice(0, 2)}***`;
      return `${visible}@${domain}`;
    })
    .filter((item): item is string => Boolean(item))
    .join(", ");
}

function countByStatus(rows: Array<{ status?: string | null }>) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const status = row.status ?? "unknown";
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});
}

function sanitizeEmailEvent(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    provider: typeof row.provider === "string" ? row.provider : "resend",
    providerEmailId: typeof row.provider_email_id === "string" ? row.provider_email_id : null,
    templateKey: typeof row.template_key === "string" ? row.template_key : "unknown",
    recipient: maskEmail(typeof row.recipient === "string" ? row.recipient : null),
    subject: typeof row.subject === "string" ? row.subject : null,
    relatedEntityType: typeof row.related_entity_type === "string" ? row.related_entity_type : null,
    relatedEntityId: typeof row.related_entity_id === "string" ? row.related_entity_id : null,
    status: typeof row.status === "string" ? row.status : "unknown",
    errorMessage: typeof row.error_message === "string" ? row.error_message.slice(0, 240) : null,
    createdAt: typeof row.created_at === "string" ? row.created_at : null,
  };
}

function sanitizeWebhookReceipt(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    provider: typeof row.provider === "string" ? row.provider : "resend",
    eventId: typeof row.event_id === "string" ? row.event_id : null,
    eventType: typeof row.event_type === "string" ? row.event_type : null,
    receivedAt: typeof row.received_at === "string" ? row.received_at : null,
    createdAt: typeof row.created_at === "string" ? row.created_at : null,
  };
}

async function safeQuery<T>(operation: () => Promise<{ data: T | null; error: { message?: string } | null }>) {
  try {
    const result = await operation();
    return result.error ? { data: null, error: result.error.message ?? "Query failed." } : { data: result.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Query failed.",
    };
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request, ["admin", "editor"]);
  if ("error" in auth) return auth.error;

  const client = createServiceRoleClient() ?? auth.userClient;
  const status = normalizeFilter(request.nextUrl.searchParams.get("status"));
  const templateKey = normalizeFilter(request.nextUrl.searchParams.get("template_key"));
  const relatedEntityType = normalizeFilter(request.nextUrl.searchParams.get("related_entity_type"));

  if (status && !EMAIL_STATUSES.has(status)) {
    return adminErrorResponse(400, "INVALID_STATUS", "Unsupported email event status filter.");
  }

  let emailQuery = client
    .from("transactional_email_events" as never)
    .select("id, provider, provider_email_id, template_key, recipient, subject, related_entity_type, related_entity_id, status, error_message, created_at");

  if (status) emailQuery = (emailQuery as any).eq("status", status);
  if (templateKey) emailQuery = (emailQuery as any).eq("template_key", templateKey);
  if (relatedEntityType) emailQuery = (emailQuery as any).eq("related_entity_type", relatedEntityType);

  const [
    emailEventsResult,
    failedEmailEventsResult,
    webhookReceiptsResult,
    subscriberRowsResult,
    recentSubscribersResult,
    outboxRowsResult,
    outboxHealthResult,
  ] = await Promise.all([
    safeQuery(() =>
      (emailQuery as any)
        .order("created_at", { ascending: false })
        .limit(80),
    ),
    safeQuery(() =>
      client
        .from("transactional_email_events" as never)
        .select("id, provider, provider_email_id, template_key, recipient, subject, related_entity_type, related_entity_id, status, error_message, created_at")
        .in("status", ["failed", "skipped", "bounced", "complained", "suppressed"])
        .order("created_at", { ascending: false })
        .limit(30) as any,
    ),
    safeQuery(() =>
      client
        .from("webhook_event_receipts" as never)
        .select("id, provider, event_id, event_type, received_at, created_at")
        .eq("provider", "resend")
        .order("received_at", { ascending: false })
        .limit(50) as any,
    ),
    safeQuery(() =>
      client
        .from("email_subscribers" as never)
        .select("status")
        .limit(2000) as any,
    ),
    safeQuery(() =>
      client
        .from("email_subscribers" as never)
        .select("id, email, status, resend_sync_status, created_at, confirmed_at, unsubscribed_at")
        .order("created_at", { ascending: false })
        .limit(30) as any,
    ),
    safeQuery(() =>
      client
        .from("external_outbox" as never)
        .select("status")
        .limit(2000) as any,
    ),
    safeQuery(() =>
      client
        .from("admin_external_outbox_health" as never)
        .select("open_alerts")
        .maybeSingle() as any,
    ),
  ]);

  const emailEvents = ((emailEventsResult.data as Record<string, unknown>[] | null) ?? []).map(sanitizeEmailEvent);
  const failedEmailEvents = ((failedEmailEventsResult.data as Record<string, unknown>[] | null) ?? []).map(sanitizeEmailEvent);
  const subscriberRows = (subscriberRowsResult.data as Array<{ status?: string | null }> | null) ?? [];
  const recentSubscribers = ((recentSubscribersResult.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
    id: String(row.id),
    email: maskEmail(typeof row.email === "string" ? row.email : null),
    status: typeof row.status === "string" ? row.status : "unknown",
    resendSyncStatus: typeof row.resend_sync_status === "string" ? row.resend_sync_status : null,
    createdAt: typeof row.created_at === "string" ? row.created_at : null,
    confirmedAt: typeof row.confirmed_at === "string" ? row.confirmed_at : null,
    unsubscribedAt: typeof row.unsubscribed_at === "string" ? row.unsubscribed_at : null,
  }));
  const outboxRows = (outboxRowsResult.data as Array<{ status?: string | null }> | null) ?? [];
  const openAlerts = Array.isArray((outboxHealthResult.data as { open_alerts?: unknown } | null)?.open_alerts)
    ? ((outboxHealthResult.data as { open_alerts?: unknown[] }).open_alerts ?? [])
    : [];

  return NextResponse.json({
    ok: true,
    filters: { status, templateKey, relatedEntityType },
    emailEvents,
    failedEmailEvents,
    webhookReceipts: ((webhookReceiptsResult.data as Record<string, unknown>[] | null) ?? []).map(sanitizeWebhookReceipt),
    newsletter: {
      counts: countByStatus(subscriberRows),
      recentSubscribers,
    },
    externalOutbox: {
      counts: countByStatus(outboxRows),
      openAlertCount: openAlerts.length,
    },
    errors: [
      emailEventsResult.error ? { source: "transactional_email_events", message: emailEventsResult.error } : null,
      failedEmailEventsResult.error ? { source: "failed_email_events", message: failedEmailEventsResult.error } : null,
      webhookReceiptsResult.error ? { source: "webhook_event_receipts", message: webhookReceiptsResult.error } : null,
      subscriberRowsResult.error ? { source: "email_subscribers", message: subscriberRowsResult.error } : null,
      outboxRowsResult.error ? { source: "external_outbox", message: outboxRowsResult.error } : null,
      outboxHealthResult.error ? { source: "admin_external_outbox_health", message: outboxHealthResult.error } : null,
    ].filter(Boolean),
  });
}
