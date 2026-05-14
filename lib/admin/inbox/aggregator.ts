import "server-only";
import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  INBOX_CACHE_TAG,
  computeUrgency,
  SLA_MINUTES,
  type BillingSubscriptionItem,
  type ChatMessageItem,
  type EventModerationItem,
  type ExternalOutboxAlertItem,
  type InboxDomain,
  type InboxDataSourceError,
  type InboxItem,
  type InboxSnapshot,
  type ListingClaimItem,
  type ListingModerationItem,
  type ReviewModerationItem,
  type TranslationJobItem,
} from "./types";
import {
  decodeSideTableArchiveRow,
  inboxSideTableKey,
  inboxSideTableLookupKeys,
} from "./side-table-compat";
import { isInboxReadStateReason, isInboxStatus, normalizeInboxStatusFromReason } from "./status";
import { isProcessorUnconfiguredTranslationError } from "./translation-failures";

type AdminClient = SupabaseClient<Database>;

const CACHE_TTL_SECONDS = 30;
const QUERY_LIMIT = 200;
const BILLING_ATTENTION_STATUSES = ["past_due", "unpaid", "incomplete", "incomplete_expired"];
const TRANSLATION_ATTENTION_STATUSES = ["failed", "missing"] as const;

function getClient(): AdminClient {
  const client = createServiceRoleClient();
  if (!client) {
    throw new Error("Inbox aggregator requires SUPABASE_SERVICE_ROLE_KEY.");
  }
  return client as AdminClient;
}

function computeSla(createdAt: string, slaMinutes: number) {
  const createdMs = Date.parse(createdAt);
  const dueMs = createdMs + slaMinutes * 60_000;
  const minutesRemaining = Math.round((dueMs - Date.now()) / 60_000);
  return {
    dueAt: new Date(dueMs).toISOString(),
    minutesRemaining,
  };
}

function queryError(source: InboxDataSourceError["source"], error: unknown): InboxDataSourceError {
  const message =
    error && typeof error === "object" && "message" in error && typeof error.message === "string"
      ? error.message
      : "Inbox data source query failed.";
  return { source, message };
}

async function fetchProfileNames(
  client: AdminClient,
  userIds: string[],
): Promise<Map<string, string | null>> {
  if (userIds.length === 0) return new Map();
  const { data, error } = await client
    .from("public_profiles")
    .select("id, full_name")
    .in("id", userIds);
  if (error || !data) return new Map();
  return new Map(
    data
      .filter((row): row is { id: string; full_name: string | null } => Boolean(row.id))
      .map((row) => [row.id, row.full_name ?? null]),
  );
}

async function fetchListingNames(
  client: AdminClient,
  listingIds: string[],
): Promise<Map<string, string | null>> {
  if (listingIds.length === 0) return new Map();
  const { data, error } = await client
    .from("listings")
    .select("id, name")
    .in("id", listingIds);
  if (error || !data) return new Map();
  return new Map(
    data.filter((row) => Boolean(row.id)).map((row) => [row.id, row.name ?? null]),
  );
}

interface SourceResult<T extends InboxItem> {
  items: T[];
  error: InboxDataSourceError | null;
}

async function fetchListingModeration(
  client: AdminClient,
): Promise<SourceResult<ListingModerationItem>> {
  const { data, error } = await client
    .from("listings")
    .select("id, name, slug, owner_id, category_id, city_id, short_description, created_at, status")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true })
    .limit(QUERY_LIMIT);
  if (error) return { items: [], error: queryError("listing_moderation", error) };
  if (!data) return { items: [], error: null };

  const ownerIds = Array.from(new Set(data.map((r) => r.owner_id).filter(Boolean)));
  const names = await fetchProfileNames(client, ownerIds);

  return {
    items: data.map((row) => {
      const sla = computeSla(row.created_at, SLA_MINUTES.listing_moderation);
      return {
        id: `listing:${row.id}`,
        domain: "listings",
        source: "listing_moderation",
        sourceRowId: row.id,
        title: row.name,
        summary: row.short_description,
        createdAt: row.created_at,
        owner: { id: row.owner_id, name: names.get(row.owner_id) ?? null },
        assignee: null,
        status: "open",
        sla,
        urgency: computeUrgency(sla.minutesRemaining),
        resolution: { primary: "approve", available: ["approve", "reject", "assign", "archive"] },
        meta: {
          listingId: row.id,
          slug: row.slug,
          categoryId: row.category_id,
          cityId: row.city_id,
        },
      } satisfies ListingModerationItem;
    }),
    error: null,
  };
}

async function fetchListingClaims(client: AdminClient): Promise<SourceResult<ListingClaimItem>> {
  const { data, error } = await client
    .from("listing_claims")
    .select("id, listing_id, business_name, contact_name, email, message, request_type, status, user_id, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(QUERY_LIMIT);
  if (error) return { items: [], error: queryError("listing_claim", error) };
  if (!data) return { items: [], error: null };

  const userIds = Array.from(
    new Set(data.map((r) => r.user_id).filter((id): id is string => Boolean(id))),
  );
  const names = await fetchProfileNames(client, userIds);

  return {
    items: data.map((row) => {
      const sla = computeSla(row.created_at, SLA_MINUTES.listing_claim);
      return {
        id: `claim:${row.id}`,
        domain: "listings",
        source: "listing_claim",
        sourceRowId: row.id,
        title: `Partner request: ${row.business_name}`,
        summary: row.message ?? `${row.contact_name} · ${row.email}`,
        createdAt: row.created_at,
        owner: {
          id: row.user_id ?? row.email,
          name: row.user_id ? names.get(row.user_id) ?? row.contact_name : row.contact_name,
        },
        assignee: null,
        status: "open",
        sla,
        urgency: computeUrgency(sla.minutesRemaining),
        resolution: { primary: "reject", available: ["reject", "assign", "archive"] },
        meta: {
          claimId: row.id,
          listingId: row.listing_id,
          requestType: row.request_type as "claim-business" | "new-listing",
          contactEmail: row.email,
        },
      } satisfies ListingClaimItem;
    }),
    error: null,
  };
}

async function fetchBillingSubscriptionIssues(
  client: AdminClient,
): Promise<SourceResult<BillingSubscriptionItem>> {
  const { data, error } = await client
    .from("owner_subscriptions")
    .select("id, owner_id, tier, billing_period, status, current_period_end, updated_at")
    .in("status", BILLING_ATTENTION_STATUSES)
    .order("updated_at", { ascending: true })
    .limit(QUERY_LIMIT);
  if (error) return { items: [], error: queryError("billing_subscription", error) };
  if (!data) return { items: [], error: null };

  const ownerIds = Array.from(new Set(data.map((r) => r.owner_id).filter(Boolean)));
  const names = await fetchProfileNames(client, ownerIds);

  return {
    items: data.map((row) => {
      const sla = computeSla(row.updated_at, SLA_MINUTES.billing_subscription);
      return {
        id: `billing:${row.id}`,
        domain: "billing",
        source: "billing_subscription",
        sourceRowId: row.id,
        title: `Subscription ${row.status}`,
        summary: `${row.tier} · ${row.billing_period}`,
        createdAt: row.updated_at,
        owner: { id: row.owner_id, name: names.get(row.owner_id) ?? null },
        assignee: null,
        status: "open",
        sla,
        urgency: computeUrgency(sla.minutesRemaining),
        resolution: { primary: "assign", available: ["assign"] },
        meta: {
          subscriptionId: row.id,
          ownerId: row.owner_id,
          tier: row.tier,
          status: row.status,
          currentPeriodEnd: row.current_period_end,
        },
      } satisfies BillingSubscriptionItem;
    }),
    error: null,
  };
}

async function fetchReviewModeration(
  client: AdminClient,
): Promise<SourceResult<ReviewModerationItem>> {
  const { data, error } = await client
    .from("listing_reviews")
    .select("id, listing_id, user_id, rating, comment, created_at, status, listing:listings(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(QUERY_LIMIT);
  if (error) return { items: [], error: queryError("review_moderation", error) };
  if (!data) return { items: [], error: null };

  const userIds = Array.from(new Set(data.map((r) => r.user_id).filter(Boolean)));
  const names = await fetchProfileNames(client, userIds);

  return {
    items: data.map((row) => {
      const sla = computeSla(row.created_at, SLA_MINUTES.review_moderation);
      const listingRel = row.listing as { name?: string | null } | { name?: string | null }[] | null;
      const listingName = Array.isArray(listingRel)
        ? listingRel[0]?.name ?? null
        : listingRel?.name ?? null;
      const title = listingName ? `${row.rating}★ on ${listingName}` : `${row.rating}★ review`;
      return {
        id: `review:${row.id}`,
        domain: "reviews",
        source: "review_moderation",
        sourceRowId: row.id,
        title,
        summary: row.comment,
        createdAt: row.created_at,
        owner: { id: row.user_id, name: names.get(row.user_id) ?? null },
        assignee: null,
        status: "open",
        sla,
        urgency: computeUrgency(sla.minutesRemaining),
        resolution: { primary: "approve", available: ["approve", "reject", "assign", "archive"] },
        meta: {
          reviewId: row.id,
          listingId: row.listing_id,
          listingName,
          rating: row.rating,
        },
      } satisfies ReviewModerationItem;
    }),
    error: null,
  };
}

async function fetchEventModeration(
  client: AdminClient,
): Promise<SourceResult<EventModerationItem>> {
  const { data, error } = await client
    .from("events")
    .select("id, title, slug, submitter_id, short_description, created_at, start_date, end_date, status")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true })
    .limit(QUERY_LIMIT);
  if (error) return { items: [], error: queryError("event_moderation", error) };
  if (!data) return { items: [], error: null };

  const submitterIds = Array.from(new Set(data.map((r) => r.submitter_id).filter(Boolean)));
  const names = await fetchProfileNames(client, submitterIds);

  return {
    items: data.map((row) => {
      // Event SLA tightens when start_date is imminent.
      const createdSla = computeSla(row.created_at, SLA_MINUTES.event_moderation);
      const startMs = Date.parse(row.start_date);
      const minutesUntilStart = Math.round((startMs - Date.now()) / 60_000);
      const imminent = minutesUntilStart > 0 && minutesUntilStart <= 7 * 24 * 60;
      const minutesRemaining = imminent
        ? Math.min(createdSla.minutesRemaining, minutesUntilStart)
        : createdSla.minutesRemaining;
      const dueAt =
        imminent && minutesUntilStart < createdSla.minutesRemaining
          ? row.start_date
          : createdSla.dueAt;
      return {
        id: `event:${row.id}`,
        domain: "events",
        source: "event_moderation",
        sourceRowId: row.id,
        title: row.title,
        summary: row.short_description,
        createdAt: row.created_at,
        owner: { id: row.submitter_id, name: names.get(row.submitter_id) ?? null },
        assignee: null,
        status: "open",
        sla: { dueAt, minutesRemaining },
        urgency: computeUrgency(minutesRemaining),
        resolution: { primary: "approve", available: ["approve", "reject", "assign", "archive"] },
        meta: {
          eventId: row.id,
          slug: row.slug,
          startDate: row.start_date,
          endDate: row.end_date,
        },
      } satisfies EventModerationItem;
    }),
    error: null,
  };
}

interface ChatMessageAttentionRow {
  id: string;
  thread_id: string;
  body_text: string | null;
  sender_type: string | null;
  delivery_status: string | null;
  created_at: string;
  recipient_id: string | null;
}

interface ChatThreadAttentionRow {
  id: string;
  listing_id: string | null;
  owner_id: string;
  viewer_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  status: string;
  last_message_at: string | null;
  created_at: string;
}

function truncateSummary(value: string | null | undefined, max = 220) {
  const normalized = value?.replace(/\s+/g, " ").trim();
  if (!normalized) return null;
  return normalized.length > max ? `${normalized.slice(0, max - 1)}…` : normalized;
}

async function fetchChatMessageIssues(
  client: AdminClient,
): Promise<SourceResult<ChatMessageItem>> {
  const { data, error } = await client
    .from("chat_messages")
    .select("id, thread_id, body_text, sender_type, delivery_status, created_at, recipient_id")
    .neq("sender_type", "admin")
    .neq("delivery_status", "read")
    .order("created_at", { ascending: false })
    .limit(QUERY_LIMIT);
  if (error) return { items: [], error: queryError("chat_message", error) };
  if (!data) return { items: [], error: null };

  const latestByThread = new Map<string, ChatMessageAttentionRow>();
  for (const row of data as ChatMessageAttentionRow[]) {
    if (!latestByThread.has(row.thread_id)) latestByThread.set(row.thread_id, row);
  }

  const threadIds = Array.from(latestByThread.keys());
  if (threadIds.length === 0) return { items: [], error: null };

  const { data: threadData, error: threadError } = await client
    .from("chat_threads")
    .select("id, listing_id, owner_id, viewer_id, contact_name, contact_email, status, last_message_at, created_at")
    .in("id", threadIds)
    .eq("status", "active");
  if (threadError) return { items: [], error: queryError("chat_message", threadError) };
  if (!threadData) return { items: [], error: null };

  const threads = new Map(
    (threadData as ChatThreadAttentionRow[]).map((thread) => [thread.id, thread]),
  );
  const listingIds = Array.from(
    new Set(
      (threadData as ChatThreadAttentionRow[])
        .map((thread) => thread.listing_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const viewerIds = Array.from(
    new Set(
      (threadData as ChatThreadAttentionRow[])
        .map((thread) => thread.viewer_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const [listingNames, viewerNames] = await Promise.all([
    fetchListingNames(client, listingIds),
    fetchProfileNames(client, viewerIds),
  ]);

  return {
    items: Array.from(latestByThread.values())
      .flatMap((message): ChatMessageItem[] => {
        const thread = threads.get(message.thread_id);
        if (!thread) return [];

        const listingName = thread.listing_id
          ? listingNames.get(thread.listing_id) ?? null
          : null;
        const submitterName =
          thread.contact_name?.trim()
          || (thread.viewer_id ? viewerNames.get(thread.viewer_id) ?? null : null)
          || thread.contact_email
          || "Website visitor";
        const summaryParts = [
          thread.contact_email ? `From ${thread.contact_email}` : null,
          truncateSummary(message.body_text),
        ].filter((part): part is string => Boolean(part));
        const sla = computeSla(message.created_at, SLA_MINUTES.chat_message);

        return [{
          id: `message:${message.id}`,
          domain: "messages",
          source: "chat_message",
          sourceRowId: message.id,
          title: listingName
            ? `New message about ${listingName}`
            : `New message from ${submitterName}`,
          summary: summaryParts.join(" · ") || null,
          createdAt: message.created_at,
          owner: {
            id: thread.viewer_id ?? thread.contact_email ?? message.id,
            name: submitterName,
          },
          assignee: null,
          status: "open",
          sla,
          urgency: computeUrgency(sla.minutesRemaining),
          resolution: { primary: "assign", available: ["assign"] },
          meta: {
            messageId: message.id,
            threadId: message.thread_id,
            listingId: thread.listing_id,
            listingName,
            contactEmail: thread.contact_email,
          },
        } satisfies ChatMessageItem];
      }),
    error: null,
  };
}

async function fetchTranslationJobIssues(
  client: AdminClient,
): Promise<SourceResult<TranslationJobItem>> {
  const { data, error } = await client
    .from("translation_jobs")
    .select("id, listing_id, target_lang, status, attempts, last_error, created_at, updated_at")
    .in("status", TRANSLATION_ATTENTION_STATUSES)
    .order("updated_at", { ascending: true })
    .limit(QUERY_LIMIT);
  if (error) return { items: [], error: queryError("translation_job", error) };
  if (!data) return { items: [], error: null };

  const listingIds = Array.from(new Set(data.map((r) => r.listing_id).filter(Boolean)));
  const names = await fetchListingNames(client, listingIds);
  const processorConfigRows = data.filter((row) =>
    isProcessorUnconfiguredTranslationError(row.last_error),
  );
  const regularRows = data.filter((row) => !processorConfigRows.includes(row));
  const groupedItems: TranslationJobItem[] = [];

  if (processorConfigRows.length > 0) {
    const createdAt = processorConfigRows
      .map((row) => row.updated_at ?? row.created_at)
      .sort()[0];
    const listingCount = new Set(processorConfigRows.map((row) => row.listing_id)).size;
    const localeCount = new Set(processorConfigRows.map((row) => row.target_lang)).size;
    const representative = processorConfigRows[0];
    const sla = computeSla(createdAt, 24 * 60);
    groupedItems.push({
      id: "translation:processor-unconfigured",
      domain: "translations",
      source: "translation_job",
      sourceRowId: representative.id,
      title: "Translation processor is not configured",
      summary: `${processorConfigRows.length} job${processorConfigRows.length !== 1 ? "s" : ""} across ${listingCount} listing${listingCount !== 1 ? "s" : ""} and ${localeCount} locale${localeCount !== 1 ? "s" : ""} require manual review or provider setup.`,
      createdAt,
      owner: { id: "translation-system", name: "Translation Studio" },
      assignee: null,
      status: "open",
      sla,
      urgency: "normal",
      resolution: { primary: "assign", available: ["assign"] },
      meta: {
        jobId: representative.id,
        listingId: representative.listing_id,
        targetLang: "multiple",
        status: "configuration_missing",
        attempts: processorConfigRows.reduce((sum, row) => sum + (row.attempts ?? 0), 0),
      },
    } satisfies TranslationJobItem);
  }

  return {
    items: [
      ...groupedItems,
      ...regularRows.map((row) => {
      const createdAt = row.updated_at ?? row.created_at;
      const sla = computeSla(createdAt, SLA_MINUTES.translation_job);
      const listingName = names.get(row.listing_id) ?? row.listing_id.slice(0, 8);
      return {
        id: `translation:${row.id}`,
        domain: "translations",
        source: "translation_job",
        sourceRowId: row.id,
        title: `Translation ${row.status}: ${listingName}`,
        summary: `${row.target_lang}${row.last_error ? ` · ${row.last_error}` : ""}`,
        createdAt,
        owner: { id: row.listing_id, name: listingName },
        assignee: null,
        status: "open",
        sla,
        urgency: computeUrgency(sla.minutesRemaining),
        resolution: { primary: "assign", available: ["assign"] },
        meta: {
          jobId: row.id,
          listingId: row.listing_id,
          targetLang: row.target_lang,
          status: row.status,
          attempts: row.attempts ?? 0,
        },
      } satisfies TranslationJobItem;
      }),
    ],
    error: null,
  };
}

interface OutboxAlert {
  id?: string;
  alert_key?: string;
  severity?: string;
  title?: string;
  first_seen_at?: string;
  last_seen_at?: string;
  details?: unknown;
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

async function fetchExternalOutboxAlerts(
  client: AdminClient,
): Promise<SourceResult<ExternalOutboxAlertItem>> {
  const { data, error } = await client
    .from("admin_external_outbox_health" as never)
    .select("open_alerts")
    .maybeSingle();
  if (error) return { items: [], error: queryError("external_outbox_alert", error) };
  if (!data) return { items: [], error: null };

  const row = data as { open_alerts?: unknown };
  const alerts = Array.isArray(row.open_alerts) ? (row.open_alerts as OutboxAlert[]) : [];

  return {
    items: alerts
      .filter((alert) => isUuid(alert.id))
      .map((alert) => {
        const createdAt = alert.last_seen_at ?? alert.first_seen_at ?? new Date().toISOString();
        const severity = alert.severity ?? "warning";
        const sla = computeSla(createdAt, SLA_MINUTES.external_outbox_alert);
        const urgency = severity === "critical" ? "urgent" : computeUrgency(sla.minutesRemaining);
        return {
          id: `outbox-alert:${alert.id}`,
          domain: "system",
          source: "external_outbox_alert",
          sourceRowId: alert.id!,
          title: alert.title ?? "External outbox alert",
          summary: alert.alert_key ?? "External provider queue needs attention",
          createdAt,
          owner: { id: "system", name: "System" },
          assignee: null,
          status: "open",
          sla,
          urgency,
          resolution: { primary: "assign", available: ["assign"] },
          meta: {
            alertId: alert.id!,
            alertKey: alert.alert_key ?? "external_outbox",
            severity,
            details: alert.details ?? null,
          },
        } satisfies ExternalOutboxAlertItem;
      }),
    error: null,
  };
}

function sortItems(items: InboxItem[]): InboxItem[] {
  const urgencyWeight = { urgent: 0, soon: 1, normal: 2 } as const;
  return [...items].sort((a, b) => {
    const diff = urgencyWeight[a.urgency] - urgencyWeight[b.urgency];
    if (diff !== 0) return diff;
    return a.sla.minutesRemaining - b.sla.minutesRemaining;
  });
}

interface InboxSideTables {
  itemStates: Map<string, InboxItemState>;
  assignments: Map<string, { assigneeId: string; assignedAt: string }>;
  readStates: Map<string, { readBy: string | null; readAt: string }>;
  errors: InboxDataSourceError[];
}

interface InboxItemState {
  status: InboxItem["status"];
  changedAt: string;
  reason: string | null;
  itemSnapshot: InboxItem | null;
}

interface InboxArchiveRow {
  source: string;
  source_row_id: string;
  reason: string | null;
  archived_at: string;
  status?: string | null;
  resolved_at?: string | null;
  dismissed_at?: string | null;
  updated_at?: string | null;
  item_snapshot?: unknown;
}

function isMissingInboxHistoryColumnError(error: { message?: string; code?: string } | null): boolean {
  const message = error?.message ?? "";
  return (
    error?.code === "42703" ||
    error?.code === "PGRST204" ||
    message.includes("item_snapshot") ||
    message.includes("resolved_at") ||
    message.includes("dismissed_at") ||
    message.includes("admin_inbox_archives.status") ||
    message.includes("Could not find")
  );
}

function parseInboxItemSnapshot(value: unknown): InboxItem | null {
  if (!value || typeof value !== "object") return null;
  const snapshot = value as Partial<InboxItem>;
  if (
    typeof snapshot.id !== "string" ||
    typeof snapshot.source !== "string" ||
    typeof snapshot.sourceRowId !== "string" ||
    typeof snapshot.title !== "string" ||
    typeof snapshot.createdAt !== "string" ||
    !isInboxStatus(snapshot.status)
  ) {
    return null;
  }
  return snapshot as InboxItem;
}

async function fetchArchiveRows(
  client: AdminClient,
): Promise<{ data: InboxArchiveRow[]; error: InboxDataSourceError | null }> {
  const full = await client
    .from("admin_inbox_archives" as never)
    .select(
      "source, source_row_id, reason, archived_at, status, resolved_at, dismissed_at, updated_at, item_snapshot",
    );

  if (!full.error) {
    return { data: (full.data as InboxArchiveRow[] | null) ?? [], error: null };
  }

  if (!isMissingInboxHistoryColumnError(full.error)) {
    return { data: [], error: queryError("side_tables", full.error) };
  }

  const legacy = await client
    .from("admin_inbox_archives" as never)
    .select("source, source_row_id, reason, archived_at");

  return {
    data: (legacy.data as InboxArchiveRow[] | null) ?? [],
    error: legacy.error ? queryError("side_tables", legacy.error) : null,
  };
}

async function fetchSideTables(client: AdminClient): Promise<InboxSideTables> {
  const [archiveRes, assignRes] = await Promise.all([
    fetchArchiveRows(client),
    client
      .from("admin_inbox_assignments" as never)
      .select("source, source_row_id, assignee_id, assigned_at"),
  ]);
  const errors = [archiveRes.error, assignRes.error ? queryError("side_tables", assignRes.error) : null]
    .filter(Boolean)
    .filter((error): error is InboxDataSourceError => Boolean(error));
  const itemStates = new Map<string, InboxItemState>();
  const readStates = new Map<string, { readBy: string | null; readAt: string }>();
  for (const row of archiveRes.data) {
    const decoded = decodeSideTableArchiveRow(row.source, row.reason);
    const key = inboxSideTableKey(decoded.source, row.source_row_id);
    const status = isInboxStatus(row.status)
      ? row.status
      : normalizeInboxStatusFromReason(decoded.reason);
    if (isInboxReadStateReason(decoded.reason)) {
      readStates.set(key, { readBy: null, readAt: row.archived_at });
    } else if (status !== "open") {
      itemStates.set(key, {
        status,
        changedAt: row.resolved_at ?? row.dismissed_at ?? row.updated_at ?? row.archived_at,
        reason: decoded.reason,
        itemSnapshot: parseInboxItemSnapshot(row.item_snapshot),
      });
    }
  }

  const assignments = new Map<string, { assigneeId: string; assignedAt: string }>();
  const assignRows =
    (assignRes.data as Array<{
      source: string;
      source_row_id: string;
      assignee_id: string;
      assigned_at: string;
    }> | null) ?? [];
  for (const row of assignRows) {
    assignments.set(inboxSideTableKey(row.source, row.source_row_id), {
      assigneeId: row.assignee_id,
      assignedAt: row.assigned_at,
    });
  }
  return { itemStates, assignments, readStates, errors };
}

async function buildSnapshotUncached(): Promise<InboxSnapshot> {
  const client = getClient();
  const [listings, claims, reviews, events, billing, messages, translations, outboxAlerts, side] = await Promise.all([
    fetchListingModeration(client),
    fetchListingClaims(client),
    fetchReviewModeration(client),
    fetchEventModeration(client),
    fetchBillingSubscriptionIssues(client),
    fetchChatMessageIssues(client),
    fetchTranslationJobIssues(client),
    fetchExternalOutboxAlerts(client),
    fetchSideTables(client),
  ]);
  const errors = [
    listings.error,
    claims.error,
    reviews.error,
    events.error,
    billing.error,
    messages.error,
    translations.error,
    outboxAlerts.error,
    ...side.errors,
  ].filter((error): error is InboxDataSourceError => Boolean(error));
  const merged: InboxItem[] = [
    ...listings.items,
    ...claims.items,
    ...reviews.items,
    ...events.items,
    ...billing.items,
    ...messages.items,
    ...translations.items,
    ...outboxAlerts.items,
  ]
    .map((item): InboxItem => {
      const keys = inboxSideTableLookupKeys(item.source, item.sourceRowId);
      const assignment = keys.map((key) => side.assignments.get(key)).find(Boolean);
      const readState = keys.map((key) => side.readStates.get(key)).find(Boolean);
      const itemState = keys.map((key) => side.itemStates.get(key)).find(Boolean);
      return {
        ...item,
        assignee: assignment
          ? { id: assignment.assigneeId, assignedAt: assignment.assignedAt }
          : item.assignee,
        isRead: Boolean(readState),
        readAt: readState?.readAt ?? null,
        status: itemState?.status ?? "open",
        statusChangedAt: itemState?.changedAt ?? null,
        statusReason: itemState?.reason ?? null,
      };
    });
  const liveKeys = new Set(
    merged.map((item) => inboxSideTableKey(item.source, item.sourceRowId)),
  );
  const snapshotItems: InboxItem[] = Array.from(side.itemStates.entries())
    .flatMap(([key, itemState]): InboxItem[] => {
      if (liveKeys.has(key) || !itemState.itemSnapshot) return [];
      const item = itemState.itemSnapshot;
      const assignment = side.assignments.get(key);
      const readState = side.readStates.get(key);
      return [{
        ...item,
        assignee: assignment
          ? { id: assignment.assigneeId, assignedAt: assignment.assignedAt }
          : item.assignee,
        isRead: Boolean(readState),
        readAt: readState?.readAt ?? item.readAt ?? null,
        status: itemState.status,
        statusChangedAt: itemState.changedAt,
        statusReason: itemState.reason,
      }];
    });
  const items = sortItems([...merged, ...snapshotItems]);
  const openItems = items.filter((item) => item.status === "open");
  const byDomain: Record<InboxDomain, number> = {
    listings: 0,
    reviews: 0,
    events: 0,
    billing: 0,
    messages: 0,
    translations: 0,
    system: 0,
  };
  for (const item of openItems) byDomain[item.domain] += 1;
  const byStatus = {
    open: openItems.length,
    archived: items.filter((item) => item.status === "archived").length,
    resolved: items.filter((item) => item.status === "resolved").length,
    dismissed: items.filter((item) => item.status === "dismissed").length,
  };
  return {
    items,
    counts: {
      total: openItems.length,
      urgent: openItems.filter((i) => i.urgency === "urgent").length,
      soon: openItems.filter((i) => i.urgency === "soon").length,
      normal: openItems.filter((i) => i.urgency === "normal").length,
      archived: byStatus.archived,
      dismissed: byStatus.dismissed,
      resolved: byStatus.resolved,
      byStatus,
      byDomain,
    },
    errors,
    generatedAt: new Date().toISOString(),
  };
}

export const getInboxSnapshot = unstable_cache(
  buildSnapshotUncached,
  ["admin-inbox-snapshot-v6"],
  { revalidate: CACHE_TTL_SECONDS, tags: [INBOX_CACHE_TAG] },
);

export async function getFreshInboxSnapshot(): Promise<InboxSnapshot> {
  return buildSnapshotUncached();
}

export async function getInboxUrgentCount(): Promise<number> {
  const snapshot = await getInboxSnapshot();
  return snapshot.counts.urgent;
}
