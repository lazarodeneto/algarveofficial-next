import { getEmailConfig } from "@/lib/email/email-config";
import { getResendClient, isEmailConfigured } from "@/lib/email/resend-client";
import type { Database } from "@/integrations/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type ServiceClient = SupabaseClient<Database>;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface NewsletterSubscriberForSync {
  id: string;
  email: string;
  fullName?: string | null;
  locale?: string | null;
  source?: string | null;
  confirmedAt?: string | null;
}

export interface NewsletterContactSyncResult {
  success: boolean;
  skipped: boolean;
  providerContactId: string | null;
  status: "synced" | "skipped" | "failed";
  reason: string | null;
}

function result(overrides: Partial<NewsletterContactSyncResult>): NewsletterContactSyncResult {
  return {
    success: false,
    skipped: false,
    providerContactId: null,
    status: "failed",
    reason: null,
    ...overrides,
  };
}

function contactNameParts(fullName: string | null | undefined) {
  const normalized = fullName?.trim();
  if (!normalized) return {};
  const [firstName, ...rest] = normalized.split(/\s+/);
  return {
    firstName,
    lastName: rest.length > 0 ? rest.join(" ") : undefined,
  };
}

function safeErrorMessage(error: unknown) {
  if (!error) return "resend_contact_sync_failed";
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && "message" in error && typeof (error as { message?: unknown }).message === "string") {
    return (error as { message: string }).message;
  }
  return "resend_contact_sync_failed";
}

function responseErrorMessage(response: { error?: unknown } | null | undefined) {
  return response?.error ? safeErrorMessage(response.error) : null;
}

function getContactTargets() {
  const config = getEmailConfig();
  return {
    segmentId: config.resendNewsletterSegmentId,
    topicId: config.resendNewsletterTopicId,
    audienceId: config.resendAudienceId,
  };
}

function isValidAudienceId(value: string | null | undefined): value is string {
  return Boolean(value && UUID_PATTERN.test(value));
}

function resolveContactTargets() {
  const targets = getContactTargets();
  const hasModernTarget = Boolean(targets.segmentId || targets.topicId);
  const audienceId = hasModernTarget
    ? null
    : isValidAudienceId(targets.audienceId)
      ? targets.audienceId
      : null;
  const warning = targets.audienceId && !audienceId
    ? hasModernTarget
      ? "legacy_audience_ignored_for_segment_topic_sync"
      : "legacy_audience_id_invalid"
    : null;

  return {
    ...targets,
    audienceId,
    warning,
  };
}

async function updateLocalSyncStatus(args: {
  client?: ServiceClient | null;
  subscriberId: string;
  patch: Record<string, unknown>;
}) {
  const { client, subscriberId, patch } = args;
  if (!client) return;

  try {
    await client
      .from("email_subscribers" as never)
      .update({
        ...patch,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", subscriberId);
  } catch {
    // Sync status is diagnostic only and must not fail the user-facing flow.
  }
}

export async function upsertNewsletterContact(subscriber: NewsletterSubscriberForSync) {
  if (!isEmailConfigured()) {
    return result({ skipped: true, status: "skipped", reason: "email_not_configured" });
  }

  const targets = resolveContactTargets();
  if (!targets.segmentId && !targets.topicId && !targets.audienceId) {
    return result({
      skipped: true,
      status: "skipped",
      reason: targets.warning ?? "newsletter_resend_target_not_configured",
    });
  }

  const client = getResendClient();
  const nameParts = contactNameParts(subscriber.fullName);
  const properties = {
    locale: subscriber.locale ?? null,
    source: subscriber.source ?? "newsletter",
    subscribed_at: subscriber.confirmedAt ?? new Date().toISOString(),
  };

  try {
    const existing = await client.contacts.get(targets.audienceId
      ? { audienceId: targets.audienceId, email: subscriber.email }
      : { email: subscriber.email });

    if (existing.data?.id) {
      const updated = await client.contacts.update({
        ...(targets.audienceId ? { audienceId: targets.audienceId } : {}),
        email: subscriber.email,
        unsubscribed: false,
        ...nameParts,
        properties,
      });
      const error = responseErrorMessage(updated);
      if (error) return result({ reason: error });
      return result({ success: true, status: "synced", providerContactId: updated.data?.id ?? existing.data.id });
    }
  } catch {
    // Continue with create; Resend returns typed errors for not found in some SDK paths.
  }

  const created = targets.audienceId && !targets.segmentId && !targets.topicId
    ? await client.contacts.create({
      audienceId: targets.audienceId,
      email: subscriber.email,
      unsubscribed: false,
      ...nameParts,
      properties,
    })
    : await client.contacts.create({
      email: subscriber.email,
      unsubscribed: false,
      ...nameParts,
      properties,
      segments: targets.segmentId ? [{ id: targets.segmentId }] : undefined,
      topics: targets.topicId ? [{ id: targets.topicId, subscription: "opt_in" }] : undefined,
    });

  const error = responseErrorMessage(created);
  if (error) {
    const updated = await client.contacts.update({
      ...(targets.audienceId ? { audienceId: targets.audienceId } : {}),
      email: subscriber.email,
      unsubscribed: false,
      ...nameParts,
      properties,
    });
    const updateError = responseErrorMessage(updated);
    if (updateError) return result({ reason: updateError });
    return result({ success: true, status: "synced", providerContactId: updated.data?.id ?? null });
  }

  return result({ success: true, status: "synced", providerContactId: created.data?.id ?? null });
}

export async function addNewsletterContactToSegment(email: string, segmentId?: string | null) {
  const resolvedSegmentId = segmentId ?? getContactTargets().segmentId;
  if (!resolvedSegmentId) return result({ skipped: true, status: "skipped", reason: "newsletter_segment_not_configured" });
  if (!isEmailConfigured()) return result({ skipped: true, status: "skipped", reason: "email_not_configured" });

  const response = await getResendClient().contacts.segments.add({ email, segmentId: resolvedSegmentId });
  const error = responseErrorMessage(response);
  if (error) return result({ reason: error });
  return result({ success: true, status: "synced", providerContactId: response.data?.id ?? null });
}

export async function updateNewsletterTopicSubscription(
  email: string,
  subscription: "opt_in" | "opt_out",
  topicId?: string | null,
) {
  const resolvedTopicId = topicId ?? getContactTargets().topicId;
  if (!resolvedTopicId) return result({ skipped: true, status: "skipped", reason: "newsletter_topic_not_configured" });
  if (!isEmailConfigured()) return result({ skipped: true, status: "skipped", reason: "email_not_configured" });

  const response = await getResendClient().contacts.topics.update({
    email,
    topics: [{ id: resolvedTopicId, subscription }],
  });
  const error = responseErrorMessage(response);
  if (error) return result({ reason: error });
  return result({ success: true, status: "synced", providerContactId: response.data?.id ?? null });
}

export async function markNewsletterContactUnsubscribed(email: string) {
  if (!isEmailConfigured()) return result({ skipped: true, status: "skipped", reason: "email_not_configured" });

  const targets = resolveContactTargets();
  try {
    if (targets.topicId) {
      await updateNewsletterTopicSubscription(email, "opt_out", targets.topicId);
    }

    const response = await getResendClient().contacts.update({
      ...(targets.audienceId && !targets.segmentId && !targets.topicId ? { audienceId: targets.audienceId } : {}),
      email,
      unsubscribed: true,
    });
    const error = responseErrorMessage(response);
    if (error) return result({ reason: error });
    return result({ success: true, status: "synced", providerContactId: response.data?.id ?? null });
  } catch (error) {
    return result({ reason: safeErrorMessage(error) });
  }
}

export async function syncNewsletterSubscriberToResend(args: {
  client?: ServiceClient | null;
  subscriber: NewsletterSubscriberForSync;
}) {
  const { client, subscriber } = args;

  try {
    const targets = resolveContactTargets();
    const sync = await upsertNewsletterContact(subscriber);
    const warnings = [targets.warning].filter((warning): warning is string => Boolean(warning));
    const downstreamResults: NewsletterContactSyncResult[] = [];

    if (sync.success && targets.segmentId) {
      downstreamResults.push(await addNewsletterContactToSegment(subscriber.email, targets.segmentId));
    }

    if (sync.success && targets.topicId) {
      downstreamResults.push(await updateNewsletterTopicSubscription(subscriber.email, "opt_in", targets.topicId));
    }

    const failedDownstream = downstreamResults.find((downstream) => !downstream.success && !downstream.skipped);
    const finalSync = failedDownstream
      ? result({
        providerContactId: sync.providerContactId,
        reason: failedDownstream.reason ?? "newsletter_resend_target_sync_failed",
      })
      : sync;

    await updateLocalSyncStatus({
      client,
      subscriberId: subscriber.id,
      patch: {
        resend_contact_id: finalSync.providerContactId,
        resend_sync_status: finalSync.status,
        resend_synced_at: finalSync.success ? new Date().toISOString() : null,
        resend_segment_id: targets.segmentId,
        resend_topic_id: targets.topicId,
        metadata: {
          resend_sync_reason: finalSync.reason,
          resend_sync_warnings: warnings,
        },
      },
    });

    return finalSync;
  } catch (error) {
    const reason = safeErrorMessage(error);
    await updateLocalSyncStatus({
      client,
      subscriberId: subscriber.id,
      patch: {
        resend_sync_status: "failed",
        metadata: {
          resend_sync_reason: reason,
        },
      },
    });
    return result({ reason });
  }
}
