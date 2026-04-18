// Inbox strict rule: every item MUST have owner + SLA + resolution action.
// Fields are non-optional by design — if a source can't supply all three,
// it does not belong in the Inbox.

export type InboxDomain = "listings" | "reviews" | "events";

export type InboxSource =
  | "listing_moderation"
  | "review_moderation"
  | "event_moderation";

export type InboxUrgency = "urgent" | "soon" | "normal";

export type InboxAction = "approve" | "reject" | "assign" | "archive";

export interface InboxOwner {
  id: string;
  name: string | null;
}

export interface InboxSla {
  // ISO 8601 — when this item becomes urgent if not resolved.
  dueAt: string;
  // Minutes remaining until dueAt (negative = overdue).
  minutesRemaining: number;
}

export interface InboxResolution {
  // Primary resolution action the admin will take.
  primary: Exclude<InboxAction, "assign" | "archive">;
  // All actions available on this item type.
  available: InboxAction[];
}

export interface InboxAssignee {
  id: string;
  assignedAt: string;
}

export interface InboxItemBase {
  id: string;
  domain: InboxDomain;
  source: InboxSource;
  sourceRowId: string;
  title: string;
  summary: string | null;
  createdAt: string;
  owner: InboxOwner;
  assignee: InboxAssignee | null;
  sla: InboxSla;
  urgency: InboxUrgency;
  resolution: InboxResolution;
}

export interface ListingModerationItem extends InboxItemBase {
  domain: "listings";
  source: "listing_moderation";
  meta: {
    listingId: string;
    slug: string;
    categoryId: string;
    cityId: string;
  };
}

export interface ReviewModerationItem extends InboxItemBase {
  domain: "reviews";
  source: "review_moderation";
  meta: {
    reviewId: string;
    listingId: string;
    listingName: string | null;
    rating: number;
  };
}

export interface EventModerationItem extends InboxItemBase {
  domain: "events";
  source: "event_moderation";
  meta: {
    eventId: string;
    slug: string;
    startDate: string;
    endDate: string;
  };
}

export type InboxItem =
  | ListingModerationItem
  | ReviewModerationItem
  | EventModerationItem;

export interface InboxFilters {
  domain: InboxDomain | "all";
  urgency: InboxUrgency | "all";
  assignee: "me" | "all";
}

export interface InboxSnapshot {
  items: InboxItem[];
  counts: {
    total: number;
    urgent: number;
    byDomain: Record<InboxDomain, number>;
  };
  generatedAt: string;
}

// SLA windows (minutes). Used by adapters to compute dueAt + urgency.
export const SLA_MINUTES: Record<InboxSource, number> = {
  listing_moderation: 24 * 60,
  review_moderation: 48 * 60,
  event_moderation: 24 * 60,
};

export function computeUrgency(minutesRemaining: number): InboxUrgency {
  if (minutesRemaining <= 0) return "urgent";
  if (minutesRemaining <= 6 * 60) return "soon";
  return "normal";
}
