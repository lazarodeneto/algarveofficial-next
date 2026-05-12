// Inbox strict rule: every item MUST have owner + SLA + resolution action.
// Fields are non-optional by design — if a source can't supply all three,
// it does not belong in the Inbox.

export type InboxDomain =
  | "listings"
  | "reviews"
  | "events"
  | "billing"
  | "translations"
  | "system";

export type InboxSource =
  | "billing_subscription"
  | "external_outbox_alert"
  | "listing_claim"
  | "listing_moderation"
  | "review_moderation"
  | "event_moderation"
  | "translation_job";

export type InboxUrgency = "urgent" | "soon" | "normal";

export type InboxAction = "approve" | "reject" | "assign" | "archive";

export const INBOX_CACHE_TAG = "admin-inbox";
export const ADMIN_INBOX_QUERY_KEY = ["admin-inbox"] as const;

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
  primary: InboxAction;
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
  isRead?: boolean;
  readAt?: string | null;
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

export interface ListingClaimItem extends InboxItemBase {
  domain: "listings";
  source: "listing_claim";
  meta: {
    claimId: string;
    listingId: string | null;
    requestType: "claim-business" | "new-listing";
    contactEmail: string;
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

export interface BillingSubscriptionItem extends InboxItemBase {
  domain: "billing";
  source: "billing_subscription";
  meta: {
    subscriptionId: string;
    ownerId: string;
    tier: string;
    status: string;
    currentPeriodEnd: string | null;
  };
}

export interface TranslationJobItem extends InboxItemBase {
  domain: "translations";
  source: "translation_job";
  meta: {
    jobId: string;
    listingId: string;
    targetLang: string;
    status: string;
    attempts: number;
  };
}

export interface ExternalOutboxAlertItem extends InboxItemBase {
  domain: "system";
  source: "external_outbox_alert";
  meta: {
    alertId: string;
    alertKey: string;
    severity: string;
    details: unknown;
  };
}

export type InboxItem =
  | BillingSubscriptionItem
  | ExternalOutboxAlertItem
  | ListingClaimItem
  | ListingModerationItem
  | ReviewModerationItem
  | EventModerationItem
  | TranslationJobItem;

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
    soon: number;
    normal: number;
    assignedToMe?: number;
    byDomain: Record<InboxDomain, number>;
  };
  errors: InboxDataSourceError[];
  generatedAt: string;
}

export interface InboxDataSourceError {
  source: InboxSource | "side_tables";
  message: string;
}

// SLA windows (minutes). Used by adapters to compute dueAt + urgency.
export const SLA_MINUTES: Record<InboxSource, number> = {
  billing_subscription: 6 * 60,
  external_outbox_alert: 30,
  listing_claim: 24 * 60,
  listing_moderation: 24 * 60,
  review_moderation: 48 * 60,
  event_moderation: 24 * 60,
  translation_job: 4 * 60,
};

export function computeUrgency(minutesRemaining: number): InboxUrgency {
  if (minutesRemaining <= 0) return "urgent";
  if (minutesRemaining <= 6 * 60) return "soon";
  return "normal";
}
