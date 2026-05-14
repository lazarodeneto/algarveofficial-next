import { createServiceRoleClient } from "@/lib/supabase/service";
import type { EmailRelatedEntityType, EmailTemplateKey } from "@/lib/email/email-types";

type EmailEventStatus = "attempt" | "sent" | "failed" | "skipped";

interface RecordEmailEventInput {
  providerEmailId?: string | null;
  templateKey: EmailTemplateKey;
  recipient?: string | string[] | null;
  subject?: string | null;
  relatedEntityType?: EmailRelatedEntityType | null;
  relatedEntityId?: string | null;
  status: EmailEventStatus;
  errorMessage?: string | null;
  metadata?: Record<string, unknown> | null;
}

function truncate(value: string | null | undefined, maxLength: number) {
  if (!value) return null;
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function normalizeRecipient(value: string | string[] | null | undefined) {
  if (Array.isArray(value)) return value.join(",");
  return value ?? null;
}

function normalizeUuid(value: string | null | undefined) {
  if (!value) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

async function recordEmailEvent(input: RecordEmailEventInput) {
  try {
    const client = createServiceRoleClient();
    if (!client) return;

    await client
      .from("transactional_email_events" as never)
      .insert({
        provider: "resend",
        provider_email_id: input.providerEmailId ?? null,
        template_key: input.templateKey,
        recipient: truncate(normalizeRecipient(input.recipient), 500),
        subject: truncate(input.subject, 500),
        related_entity_type: input.relatedEntityType ?? null,
        related_entity_id: normalizeUuid(input.relatedEntityId),
        status: input.status,
        error_message: truncate(input.errorMessage, 1000),
        metadata: input.metadata ?? {},
      } as never);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email event logging error";
    if (process.env.NODE_ENV !== "test") {
      console.warn("[email-events] failed to record event", { status: input.status, message });
    }
  }
}

export function recordEmailAttempt(input: Omit<RecordEmailEventInput, "status">) {
  return recordEmailEvent({ ...input, status: "attempt" });
}

export function recordEmailSuccess(input: Omit<RecordEmailEventInput, "status">) {
  return recordEmailEvent({ ...input, status: "sent" });
}

export function recordEmailFailure(input: Omit<RecordEmailEventInput, "status">) {
  return recordEmailEvent({ ...input, status: "failed" });
}

export function recordEmailSkipped(input: Omit<RecordEmailEventInput, "status">) {
  return recordEmailEvent({ ...input, status: "skipped" });
}
