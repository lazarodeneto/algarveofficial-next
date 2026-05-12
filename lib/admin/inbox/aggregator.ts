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

  return {
    items: data.map((row) => {
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
  archivedKeys: Set<string>;
  assignments: Map<string, { assigneeId: string; assignedAt: string }>;
  readStates: Map<string, { readBy: string | null; readAt: string }>;
  errors: InboxDataSourceError[];
}

async function fetchSideTables(client: AdminClient): Promise<InboxSideTables> {
  const [archiveRes, assignRes] = await Promise.all([
    client.from("admin_inbox_archives" as never).select("source, source_row_id, reason, archived_at"),
    client
      .from("admin_inbox_assignments" as never)
      .select("source, source_row_id, assignee_id, assigned_at"),
  ]);
  const errors = [archiveRes.error, assignRes.error]
    .filter(Boolean)
    .map((error) => queryError("side_tables", error));
  const archivedKeys = new Set<string>();
  const readStates = new Map<string, { readBy: string | null; readAt: string }>();
  const archiveRows =
    (archiveRes.data as Array<{
      source: string;
      source_row_id: string;
      reason: string | null;
      archived_at: string;
    }> | null) ?? [];
  for (const row of archiveRows) {
    const key = `${row.source}:${row.source_row_id}`;
    if (row.reason === "read_from_list") {
      readStates.set(key, { readBy: null, readAt: row.archived_at });
    } else {
      archivedKeys.add(key);
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
    assignments.set(`${row.source}:${row.source_row_id}`, {
      assigneeId: row.assignee_id,
      assignedAt: row.assigned_at,
    });
  }
  return { archivedKeys, assignments, readStates, errors };
}

async function buildSnapshotUncached(): Promise<InboxSnapshot> {
  const client = getClient();
  const [listings, claims, reviews, events, billing, translations, outboxAlerts, side] = await Promise.all([
    fetchListingModeration(client),
    fetchListingClaims(client),
    fetchReviewModeration(client),
    fetchEventModeration(client),
    fetchBillingSubscriptionIssues(client),
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
    translations.error,
    outboxAlerts.error,
    ...side.errors,
  ].filter((error): error is InboxDataSourceError => Boolean(error));
  const merged = [
    ...listings.items,
    ...claims.items,
    ...reviews.items,
    ...events.items,
    ...billing.items,
    ...translations.items,
    ...outboxAlerts.items,
  ]
    .filter((item) => !side.archivedKeys.has(`${item.source}:${item.sourceRowId}`))
    .map((item) => {
      const key = `${item.source}:${item.sourceRowId}`;
      const assignment = side.assignments.get(key);
      const readState = side.readStates.get(key);
      return {
        ...item,
        assignee: assignment
          ? { id: assignment.assigneeId, assignedAt: assignment.assignedAt }
          : item.assignee,
        isRead: Boolean(readState),
        readAt: readState?.readAt ?? null,
      };
    });
  const items = sortItems(merged);
  const byDomain: Record<InboxDomain, number> = {
    listings: 0,
    reviews: 0,
    events: 0,
    billing: 0,
    translations: 0,
    system: 0,
  };
  for (const item of items) byDomain[item.domain] += 1;
  return {
    items,
    counts: {
      total: items.length,
      urgent: items.filter((i) => i.urgency === "urgent").length,
      soon: items.filter((i) => i.urgency === "soon").length,
      normal: items.filter((i) => i.urgency === "normal").length,
      byDomain,
    },
    errors,
    generatedAt: new Date().toISOString(),
  };
}

export const getInboxSnapshot = unstable_cache(
  buildSnapshotUncached,
  ["admin-inbox-snapshot-v3"],
  { revalidate: CACHE_TTL_SECONDS, tags: [INBOX_CACHE_TAG] },
);

export async function getFreshInboxSnapshot(): Promise<InboxSnapshot> {
  return buildSnapshotUncached();
}

export async function getInboxUrgentCount(): Promise<number> {
  const snapshot = await getInboxSnapshot();
  return snapshot.counts.urgent;
}
