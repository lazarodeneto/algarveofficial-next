"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { formatInboxSlaRelative } from "@/lib/admin/inbox/format";
import type { InboxDataSourceError, InboxItem, InboxUrgency } from "@/lib/admin/inbox/types";

interface InboxListProps {
  items: InboxItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  hasActiveFilters: boolean;
  isAssigneeFiltered: boolean;
  onClearFilters: () => void;
  sourceErrors: InboxDataSourceError[];
}

const URGENCY_TONE: Record<InboxUrgency, string> = {
  urgent: "bg-destructive text-destructive-foreground",
  soon: "bg-amber-500/90 text-white",
  normal: "bg-muted text-muted-foreground",
};

const URGENCY_LABEL: Record<InboxUrgency, string> = {
  urgent: "Urgent",
  soon: "Due soon",
  normal: "Normal",
};

const DOMAIN_LABEL: Record<InboxItem["domain"], string> = {
  listings: "Listing",
  reviews: "Review",
  events: "Event",
  billing: "Billing",
  translations: "Translation",
  system: "System",
};

export function InboxList({
  items,
  selectedId,
  onSelect,
  hasActiveFilters,
  isAssigneeFiltered,
  onClearFilters,
  sourceErrors,
}: InboxListProps) {
  if (items.length === 0) {
    if (sourceErrors.length > 0 && !hasActiveFilters && !isAssigneeFiltered) {
      return (
        <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 border-r border-border bg-background px-6 text-center">
          <div className="max-w-md rounded-lg border border-amber-400/40 bg-amber-500/10 p-4 text-left">
            <p className="text-sm font-semibold text-foreground">Inbox data source unavailable</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              The inbox could not verify every operational queue, so it will not show a false
              “clear” state. Fix the source issue and refresh.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {sourceErrors.slice(0, 3).map((error) => (
                <li key={`${error.source}:${error.message}`}>
                  <span className="font-medium text-foreground">{error.source}</span>: {error.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    if (isAssigneeFiltered) {
      return (
        <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 border-r border-border bg-background px-6 text-center">
          <p className="text-sm font-medium text-foreground">Nothing assigned to you yet.</p>
          <p className="text-xs text-muted-foreground">
            Assign items to yourself from the detail panel.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onClearFilters}>
            View all items
          </Button>
        </div>
      );
    }

    if (hasActiveFilters) {
      return (
        <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 border-r border-border bg-background px-6 text-center">
          <p className="text-sm font-medium text-foreground">No items match these filters.</p>
          <Button type="button" variant="outline" size="sm" onClick={onClearFilters}>
            Clear filters
          </Button>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-2 border-r border-border bg-background px-6 text-center">
        <p className="text-sm font-medium text-foreground">Inbox clear — nothing pending.</p>
        <p className="max-w-sm text-xs leading-5 text-muted-foreground">
          Listings, partner requests, reviews, events, billing, translations, system alerts,
          assignments, and archives were checked successfully.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex h-full flex-1 flex-col overflow-y-auto border-r border-border bg-background">
      {items.map((item, index) => {
        const showDivider = index === 0 || item.urgency !== items[index - 1]?.urgency;
        const active = item.id === selectedId;

        return (
          <li key={item.id}>
            {showDivider ? (
              <div className="sticky top-0 z-10 border-b border-border bg-muted/60 px-4 py-1 backdrop-blur-sm">
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  {URGENCY_LABEL[item.urgency]}
                </span>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              className={`w-full border-b border-border px-4 py-3 text-left transition-colors ${
                active ? "bg-muted" : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-5 items-center rounded px-1.5 text-[10px] font-semibold uppercase tracking-wide ${URGENCY_TONE[item.urgency]}`}
                >
                  {item.urgency}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {DOMAIN_LABEL[item.domain]}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatInboxSlaRelative(item.sla.minutesRemaining)}
                </span>
              </div>
              <h3 className="mt-1 truncate text-sm font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {item.owner.name ?? item.owner.id.slice(0, 8)}
                {item.summary ? ` · ${item.summary}` : ""}
              </p>
              {item.assignee ? (
                <Badge variant="outline" className="mt-1 text-[10px]">
                  Assigned
                </Badge>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
