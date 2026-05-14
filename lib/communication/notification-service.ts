import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { getAdminNotificationRecipients } from "@/lib/email/email-config";
import { sendEmail } from "@/lib/email/send-email";
import { adminAlertTemplate } from "@/lib/email/templates/admin-alert";
import { internalMessageNotificationTemplate } from "@/lib/email/templates/internal-message-notification";

type CommunicationClient = SupabaseClient<Database>;

export interface CommunicationNotificationResult {
  sent: boolean;
  skipped: boolean;
  reason: string | null;
}

interface ChatThreadContext {
  id: string;
  listing_id: string | null;
  owner_id: string | null;
  viewer_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
}

interface ProfileContext {
  id: string;
  email: string | null;
  full_name: string | null;
}

interface ListingContext {
  id: string;
  name: string | null;
  slug: string | null;
}

function notificationResult(overrides: Partial<CommunicationNotificationResult>): CommunicationNotificationResult {
  return {
    sent: false,
    skipped: false,
    reason: null,
    ...overrides,
  };
}

function truncatePreview(value: string | null | undefined, maxLength = 600) {
  const normalized = value?.replace(/\s+/g, " ").trim();
  if (!normalized) return "A new message is waiting in AlgarveOfficial.";
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}…` : normalized;
}

function ownerUrl(threadId?: string | null) {
  return threadId ? `/owner?thread=${encodeURIComponent(threadId)}` : "/owner";
}

function adminInboxUrl(threadId?: string | null) {
  return threadId ? `/admin/inbox?thread=${encodeURIComponent(threadId)}` : "/admin/inbox";
}

async function loadThreadContext(client: CommunicationClient, threadId: string) {
  const { data, error } = await client
    .from("chat_threads")
    .select("id, listing_id, owner_id, viewer_id, contact_name, contact_email")
    .eq("id", threadId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ChatThreadContext;
}

async function loadProfiles(client: CommunicationClient, ids: Array<string | null | undefined>) {
  const profileIds = Array.from(new Set(ids.filter((id): id is string => Boolean(id))));
  if (profileIds.length === 0) return new Map<string, ProfileContext>();

  const { data, error } = await client
    .from("profiles")
    .select("id, email, full_name")
    .in("id", profileIds);

  if (error || !data) return new Map<string, ProfileContext>();
  return new Map((data as ProfileContext[]).map((profile) => [profile.id, profile]));
}

async function loadListing(client: CommunicationClient, listingId: string | null | undefined) {
  if (!listingId) return null;
  const { data, error } = await client
    .from("listings")
    .select("id, name, slug")
    .eq("id", listingId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ListingContext;
}

export async function notifyAdminNewInboxMessage(input: {
  threadId: string;
  messageId: string;
  senderName: string;
  senderEmail?: string | null;
  listingTitle?: string | null;
  messagePreview: string;
  submittedAt?: string | null;
  recipients?: string[];
}) {
  const recipients = input.recipients?.length ? input.recipients : getAdminNotificationRecipients();
  if (recipients.length === 0) {
    return notificationResult({ skipped: true, reason: "admin_recipients_not_configured" });
  }

  const content = internalMessageNotificationTemplate({
    senderName: input.senderName,
    senderEmail: input.senderEmail,
    listingTitle: input.listingTitle,
    messagePreview: truncatePreview(input.messagePreview),
    threadUrl: adminInboxUrl(input.threadId),
    submittedAt: input.submittedAt,
  });

  const result = await sendEmail({
    to: recipients,
    replyTo: input.senderEmail ?? null,
    subject: content.subject,
    html: content.html,
    text: content.text,
    templateKey: "internal_message_notification",
    relatedEntityType: "admin_inbox",
    relatedEntityId: input.messageId,
    idempotencyKey: `admin-inbox/${input.threadId}/new-message/${input.messageId}`,
    metadata: { threadId: input.threadId, notification: "admin_new_inbox_message" },
    tags: [
      { name: "template", value: "internal_message_notification" },
      { name: "source", value: "admin_inbox" },
    ],
    allowSkip: true,
  });

  return notificationResult({
    sent: result.success,
    skipped: result.skipped,
    reason: result.error ?? result.reason,
  });
}

export async function notifyUserMessageReceived(input: {
  client: CommunicationClient;
  threadId: string;
  messageId: string;
  messagePreview: string;
}) {
  const thread = await loadThreadContext(input.client, input.threadId);
  if (!thread) return notificationResult({ skipped: true, reason: "thread_not_found" });

  const profiles = await loadProfiles(input.client, [thread.viewer_id, thread.owner_id]);
  const viewer = thread.viewer_id ? profiles.get(thread.viewer_id) ?? null : null;
  const owner = thread.owner_id ? profiles.get(thread.owner_id) ?? null : null;
  const recipientEmail = thread.contact_email ?? viewer?.email ?? owner?.email ?? null;

  if (!recipientEmail) {
    return notificationResult({ skipped: true, reason: "recipient_email_missing" });
  }

  const listing = await loadListing(input.client, thread.listing_id);
  const content = internalMessageNotificationTemplate({
    recipientName: thread.contact_name ?? viewer?.full_name ?? owner?.full_name ?? null,
    senderName: "AlgarveOfficial team",
    listingTitle: listing?.name ?? null,
    messagePreview: truncatePreview(input.messagePreview),
    threadUrl: ownerUrl(input.threadId),
    submittedAt: new Date().toISOString(),
  });

  const result = await sendEmail({
    to: recipientEmail,
    subject: content.subject,
    html: content.html,
    text: content.text,
    templateKey: "internal_message_notification",
    relatedEntityType: "admin_inbox",
    relatedEntityId: input.messageId,
    idempotencyKey: `admin-inbox/${input.threadId}/reply/${input.messageId}`,
    metadata: { threadId: input.threadId, listingId: thread.listing_id, notification: "user_message_received" },
    tags: [
      { name: "template", value: "internal_message_notification" },
      { name: "source", value: "admin_reply" },
    ],
    allowSkip: true,
  });

  return notificationResult({
    sent: result.success,
    skipped: result.skipped,
    reason: result.error ?? result.reason,
  });
}

export const notifyOwnerMessageReceived = notifyUserMessageReceived;

export async function notifyAdminStatusChange(input: {
  threadId: string;
  status: string;
  title?: string;
  body?: string | null;
}) {
  const recipients = getAdminNotificationRecipients();
  if (recipients.length === 0) {
    return notificationResult({ skipped: true, reason: "admin_recipients_not_configured" });
  }

  const content = adminAlertTemplate({
    title: input.title ?? "Admin inbox status changed",
    intro: "An admin inbox item status changed.",
    rows: [
      { label: "Thread", value: input.threadId },
      { label: "Status", value: input.status },
    ],
    body: input.body,
    actionLabel: "Open inbox",
    actionUrl: adminInboxUrl(input.threadId),
  });

  const result = await sendEmail({
    to: recipients,
    subject: content.subject,
    html: content.html,
    text: content.text,
    templateKey: "admin_alert",
    relatedEntityType: "admin_inbox",
    relatedEntityId: input.threadId,
    idempotencyKey: `admin-inbox/${input.threadId}/status/${input.status}`,
    metadata: { threadId: input.threadId, status: input.status },
    tags: [
      { name: "template", value: "admin_alert" },
      { name: "source", value: "admin_inbox" },
    ],
    allowSkip: true,
  });

  return notificationResult({
    sent: result.success,
    skipped: result.skipped,
    reason: result.error ?? result.reason,
  });
}

export async function notifyAdminSystemAlert(input: {
  title: string;
  intro: string;
  body?: string | null;
  actionLabel?: string | null;
  actionUrl?: string | null;
  idempotencyKey: string;
}) {
  const recipients = getAdminNotificationRecipients();
  if (recipients.length === 0) {
    return notificationResult({ skipped: true, reason: "admin_recipients_not_configured" });
  }

  const content = adminAlertTemplate(input);
  const result = await sendEmail({
    to: recipients,
    subject: content.subject,
    html: content.html,
    text: content.text,
    templateKey: "admin_alert",
    relatedEntityType: "system",
    idempotencyKey: input.idempotencyKey,
    tags: [
      { name: "template", value: "admin_alert" },
      { name: "source", value: "system" },
    ],
    allowSkip: true,
  });

  return notificationResult({
    sent: result.success,
    skipped: result.skipped,
    reason: result.error ?? result.reason,
  });
}
