"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import type { InboxItem, InboxUrgency } from "@/lib/admin/inbox/types";

interface InboxListProps {
  items: InboxItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  hasActiveFilters: boolean;
  isAssigneeFiltered: boolean;
  onClearFilters: () => void;
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
};

function formatRelative(minutes: number): string {
  if (minutes <= 0) return `${Math.abs(minutes)}m overdue`;
  if (minutes < 60) return `${minutes}m left`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h left`;
  const days = Math.round(hours / 24);
  return `${days}d left`;
}

export function InboxList({
  items,
  selectedId,
  onSelect,
  hasActiveFilters,
  isAssigneeFiltered,
  onClearFilters,
}: InboxListProps) {
  if (items.length === 0) {
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
      <div className="flex h-full flex-1 items-center justify-center border-r border-border bg-background">
        <p className="text-sm text-muted-foreground">Inbox clear — nothing pending.</p>
      </div>
    );
  }

  // Build list with sticky tier dividers
  let lastUrgency: InboxUrgency | null = null;

  return (
    <ul className="flex h-full flex-1 flex-col overflow-y-auto border-r border-border bg-background">
      {items.map((item) => {
        const showDivider = item.urgency !== lastUrgency;
        lastUrgency = item.urgency;
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
                  {formatRelative(item.sla.minutesRemaining)}
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
