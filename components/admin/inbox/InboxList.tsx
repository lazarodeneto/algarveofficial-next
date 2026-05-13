"use client";

import { type KeyboardEvent, type MouseEvent, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Archive, ArchiveRestore, BellOff, Loader2, Mail, MailOpen } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import {
  archiveInboxNotification,
  dismissInboxNotification,
  markInboxItemReadState,
  markInboxItemUnreadState,
  restoreInboxNotification,
} from "@/lib/admin/inbox/actions";
import { formatInboxSlaRelative } from "@/lib/admin/inbox/format";
import {
  ADMIN_INBOX_QUERY_KEY,
  type InboxDataSourceError,
  type InboxItem,
  type InboxStatus,
  type InboxUrgency,
} from "@/lib/admin/inbox/types";
import { cn } from "@/lib/utils";

interface InboxListProps {
  items: InboxItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  hasActiveFilters: boolean;
  isAssigneeFiltered: boolean;
  status: InboxStatus;
  onClearFilters: () => void;
  onActionComplete: () => void;
  sourceErrors: InboxDataSourceError[];
  queryError?: string | null;
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
  status,
  onClearFilters,
  onActionComplete,
  sourceErrors,
  queryError,
}: InboxListProps) {
  const queryClient = useQueryClient();
  const [pendingAction, startTransition] = useTransition();
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<{ itemId: string; message: string } | null>(null);

  const runRowAction = (
    event: MouseEvent<HTMLButtonElement>,
    item: InboxItem,
    action: "archive" | "dismiss" | "read" | "unread" | "restore",
  ) => {
    event.stopPropagation();

    setActionError(null);
    setPendingItemId(item.id);
    const input = { source: item.source, sourceRowId: item.sourceRowId };

    startTransition(async () => {
      const result =
        action === "archive"
          ? await archiveInboxNotification(input)
          : action === "dismiss"
            ? await dismissInboxNotification(input)
            : action === "restore"
              ? await restoreInboxNotification(input)
              : action === "read"
                ? await markInboxItemReadState(input)
                : await markInboxItemUnreadState(input);

      if (!result.ok) {
        setActionError({
          itemId: item.id,
          message: result.error ?? "Inbox action failed.",
        });
        setPendingItemId(null);
        return;
      }

      const successMessage =
        action === "archive"
          ? "Message archived."
          : action === "dismiss"
            ? "Notification dismissed."
            : action === "restore"
              ? "Message restored to inbox."
              : action === "read"
                ? "Marked as read."
                : "Marked as unread.";
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: ADMIN_INBOX_QUERY_KEY, exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin", "inbox", "urgent-count"] });
      onActionComplete();
      setPendingItemId(null);
    });
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLDivElement>, itemId: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(itemId);
    }
  };

  if (items.length === 0) {
    if (queryError) {
      return (
        <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 border-r border-border bg-background px-6 text-center">
          <div className="max-w-md rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-left">
            <p className="text-sm font-semibold text-foreground">Inbox could not refresh</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{queryError}</p>
          </div>
        </div>
      );
    }

    if (status === "open" && sourceErrors.length > 0 && !hasActiveFilters && !isAssigneeFiltered) {
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
        <p className="text-sm font-medium text-foreground">
          {status === "archived"
            ? "No archived messages."
            : status === "resolved"
              ? "No resolved messages."
            : status === "dismissed"
              ? "No dismissed messages."
              : "No active inbox messages."}
        </p>
        <p className="max-w-sm text-xs leading-5 text-muted-foreground">
          {status === "open"
            ? "Listings, partner requests, reviews, events, billing, translations, system alerts, assignments, and archives were checked successfully."
            : "Use the Open status filter to return to the active admin inbox."}
        </p>
      </div>
    );
  }

  return (
    <ul className="flex h-full flex-1 flex-col overflow-y-auto border-r border-border bg-background">
      {items.map((item, index) => {
        const showDivider = index === 0 || item.urgency !== items[index - 1]?.urgency;
        const active = item.id === selectedId;
        const isRead = item.isRead ?? false;
        const itemPending = pendingAction && pendingItemId === item.id;
        const isOpenView = status === "open";
        const isRestoreView = status === "archived" || status === "dismissed";

        return (
          <li key={item.id}>
            {showDivider ? (
              <div className="sticky top-0 z-10 border-b border-border bg-muted/60 px-4 py-1 backdrop-blur-sm">
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  {URGENCY_LABEL[item.urgency]}
                </span>
              </div>
            ) : null}
            <div
              className={cn(
                "group relative w-full border-b border-border text-left transition-colors",
                active ? "bg-muted" : "hover:bg-muted/50",
                isRead && !active ? "bg-muted/20" : null,
              )}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect(item.id)}
                onKeyDown={(event) => handleRowKeyDown(event, item.id)}
                className="px-4 py-3 pr-[9.5rem] outline-none focus-visible:bg-muted/70 focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isRead ? "bg-muted-foreground/25" : "bg-primary",
                    )}
                    aria-hidden="true"
                  />
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
                <h3
                  className={cn(
                    "mt-1 truncate text-sm text-foreground",
                    isRead ? "font-medium text-muted-foreground" : "font-semibold",
                  )}
                >
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
              </div>
              <div
                className="absolute right-3 top-3 flex items-center gap-1"
                aria-label="Inbox row actions"
              >
                {isOpenView ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={itemPending}
                      title={isRead ? "Mark as unread" : "Mark as read"}
                      aria-label={
                        isRead ? `Mark ${item.title} as unread` : `Mark ${item.title} as read`
                      }
                      onClick={(event) => runRowAction(event, item, isRead ? "unread" : "read")}
                      className="h-7 w-7 border border-border/60 bg-background/80 shadow-none backdrop-blur-sm"
                    >
                      {itemPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : isRead ? (
                        <Mail className="h-3.5 w-3.5" />
                      ) : (
                        <MailOpen className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={itemPending}
                      title="Archive message"
                      aria-label={`Archive ${item.title}`}
                      onClick={(event) => runRowAction(event, item, "archive")}
                      className="h-7 w-7 border border-border/60 bg-background/80 shadow-none backdrop-blur-sm"
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={itemPending}
                      title="Dismiss notification"
                      aria-label={`Dismiss ${item.title}`}
                      onClick={(event) => runRowAction(event, item, "dismiss")}
                      className="h-7 w-7 border border-border/60 bg-background/80 text-muted-foreground shadow-none backdrop-blur-sm hover:bg-muted"
                    >
                      <BellOff className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : null}
                {isRestoreView ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={itemPending}
                    title="Restore to Inbox"
                    aria-label={`Restore ${item.title} to inbox`}
                    onClick={(event) => runRowAction(event, item, "restore")}
                    className="h-7 w-7 border border-border/60 bg-background/80 shadow-none backdrop-blur-sm"
                  >
                    {itemPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ArchiveRestore className="h-3.5 w-3.5" />
                    )}
                  </Button>
                ) : null}
              </div>
              {actionError?.itemId === item.id ? (
                <p className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1 text-xs text-destructive">
                  {actionError.message}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
