import "server-only";
import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  computeUrgency,
  SLA_MINUTES,
  type EventModerationItem,
  type InboxDomain,
  type InboxItem,
  type InboxSnapshot,
  type ListingModerationItem,
  type ReviewModerationItem,
} from "./types";

type AdminClient = SupabaseClient<Database>;

const CACHE_TAG_INBOX = "admin-inbox";
const CACHE_TTL_SECONDS = 30;
const QUERY_LIMIT = 200;

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

async function fetchListingModeration(client: AdminClient): Promise<ListingModerationItem[]> {
  const { data, error } = await client
    .from("listings")
    .select("id, name, slug, owner_id, category_id, city_id, short_description, created_at, status")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true })
    .limit(QUERY_LIMIT);
  if (error || !data) return [];

  const ownerIds = Array.from(new Set(data.map((r) => r.owner_id).filter(Boolean)));
  const names = await fetchProfileNames(client, ownerIds);

  return data.map((row) => {
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
  });
}

async function fetchReviewModeration(client: AdminClient): Promise<ReviewModerationItem[]> {
  const { data, error } = await client
    .from("listing_reviews")
    .select("id, listing_id, user_id, rating, comment, created_at, status, listing:listings(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(QUERY_LIMIT);
  if (error || !data) return [];

  const userIds = Array.from(new Set(data.map((r) => r.user_id).filter(Boolean)));
  const names = await fetchProfileNames(client, userIds);

  return data.map((row) => {
    const sla = computeSla(row.created_at, SLA_MINUTES.review_moderation);
    const listingRel = row.listing as { name?: string | null } | { name?: string | null }[] | null;
    const listingName = Array.isArray(listingRel)
      ? listingRel[0]?.name ?? null
      : listingRel?.name ?? null;
    const title = listingName
      ? `${row.rating}★ on ${listingName}`
      : `${row.rating}★ review`;
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
  });
}

async function fetchEventModeration(client: AdminClient): Promise<EventModerationItem[]> {
  const { data, error } = await client
    .from("events")
    .select("id, title, slug, submitter_id, short_description, created_at, start_date, end_date, status")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true })
    .limit(QUERY_LIMIT);
  if (error || !data) return [];

  const submitterIds = Array.from(new Set(data.map((r) => r.submitter_id).filter(Boolean)));
  const names = await fetchProfileNames(client, submitterIds);

  return data.map((row) => {
    // Event SLA tightens when start_date is imminent.
    const createdSla = computeSla(row.created_at, SLA_MINUTES.event_moderation);
    const startMs = Date.parse(row.start_date);
    const minutesUntilStart = Math.round((startMs - Date.now()) / 60_000);
    const imminent = minutesUntilStart > 0 && minutesUntilStart <= 7 * 24 * 60;
    const minutesRemaining = imminent
      ? Math.min(createdSla.minutesRemaining, minutesUntilStart)
      : createdSla.minutesRemaining;
    const dueAt = imminent && minutesUntilStart < createdSla.minutesRemaining
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
  });
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
}

async function fetchSideTables(client: AdminClient): Promise<InboxSideTables> {
  const [archiveRes, assignRes] = await Promise.all([
    client.from("admin_inbox_archives" as never).select("source, source_row_id"),
    client
      .from("admin_inbox_assignments" as never)
      .select("source, source_row_id, assignee_id, assigned_at"),
  ]);
  const archivedKeys = new Set<string>();
  const archiveRows = (archiveRes.data as Array<{ source: string; source_row_id: string }> | null) ?? [];
  for (const row of archiveRows) archivedKeys.add(`${row.source}:${row.source_row_id}`);

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
  return { archivedKeys, assignments };
}

async function buildSnapshotUncached(): Promise<InboxSnapshot> {
  const client = getClient();
  const [listings, reviews, events, side] = await Promise.all([
    fetchListingModeration(client),
    fetchReviewModeration(client),
    fetchEventModeration(client),
    fetchSideTables(client),
  ]);
  const merged = [...listings, ...reviews, ...events]
    .filter((item) => !side.archivedKeys.has(`${item.source}:${item.sourceRowId}`))
    .map((item) => {
      const assignment = side.assignments.get(`${item.source}:${item.sourceRowId}`);
      return assignment
        ? { ...item, assignee: { id: assignment.assigneeId, assignedAt: assignment.assignedAt } }
        : item;
    });
  const items = sortItems(merged);
  const byDomain: Record<InboxDomain, number> = {
    listings: listings.length,
    reviews: reviews.length,
    events: events.length,
  };
  return {
    items,
    counts: {
      total: items.length,
      urgent: items.filter((i) => i.urgency === "urgent").length,
      byDomain,
    },
    generatedAt: new Date().toISOString(),
  };
}

export const getInboxSnapshot = unstable_cache(
  buildSnapshotUncached,
  ["admin-inbox-snapshot-v1"],
  { revalidate: CACHE_TTL_SECONDS, tags: [CACHE_TAG_INBOX] },
);

export async function getInboxUrgentCount(): Promise<number> {
  const snapshot = await getInboxSnapshot();
  return snapshot.counts.urgent;
}

export const INBOX_CACHE_TAG = CACHE_TAG_INBOX;
