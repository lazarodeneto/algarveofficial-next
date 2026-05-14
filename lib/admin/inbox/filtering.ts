import type {
  InboxDomain,
  InboxFilters,
  InboxItem,
  InboxStatus,
} from "./types";

export interface InboxFilterCounts {
  total: number;
  urgent: number;
  soon: number;
  normal: number;
  assignedToMe: number;
  byStatus: Record<InboxStatus, number>;
  byDomain: Record<InboxDomain, number>;
}

const EMPTY_DOMAIN_COUNTS: Record<InboxDomain, number> = {
  listings: 0,
  reviews: 0,
  events: 0,
  billing: 0,
  messages: 0,
  translations: 0,
  system: 0,
};

export function filterInboxItems(
  items: InboxItem[],
  filters: InboxFilters,
  currentUserId: string | null,
): InboxItem[] {
  return items.filter((item) => {
    if (item.status !== filters.status) return false;
    if (filters.domain !== "all" && item.domain !== filters.domain) return false;
    if (filters.urgency !== "all" && item.urgency !== filters.urgency) return false;
    if (filters.assignee === "me") {
      if (!currentUserId || item.assignee?.id !== currentUserId) return false;
    }
    return true;
  });
}

export function getInboxFilterCounts(
  items: InboxItem[],
  status: InboxFilters["status"],
  currentUserId: string | null,
): InboxFilterCounts {
  const byStatus: Record<InboxStatus, number> = {
    open: 0,
    archived: 0,
    resolved: 0,
    dismissed: 0,
  };
  for (const item of items) byStatus[item.status] += 1;

  const visibleStatusItems = items.filter((item) => item.status === status);
  const byDomain = { ...EMPTY_DOMAIN_COUNTS };
  for (const item of visibleStatusItems) byDomain[item.domain] += 1;

  return {
    total: visibleStatusItems.length,
    urgent: visibleStatusItems.filter((item) => item.urgency === "urgent").length,
    soon: visibleStatusItems.filter((item) => item.urgency === "soon").length,
    normal: visibleStatusItems.filter((item) => item.urgency === "normal").length,
    assignedToMe:
      currentUserId == null
        ? 0
        : visibleStatusItems.filter((item) => item.assignee?.id === currentUserId).length,
    byStatus,
    byDomain,
  };
}
