"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, ArchiveRestore, BellOff, CheckCheck, Loader2, Search, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  approveInboxItem,
  archiveInboxItem,
  assignInboxItem,
  markInboxItemRead,
  rejectInboxItem,
  restoreInboxNotification,
} from "@/lib/admin/inbox/actions";
import { useLocalePath } from "@/hooks/useLocalePath";
import { fetchAdmin } from "@/lib/api/fetchAdmin";
import { formatInboxDueStatus } from "@/lib/admin/inbox/format";
import type {
  BillingSubscriptionItem,
  ChatMessageItem,
  EventModerationItem,
  ExternalOutboxAlertItem,
  InboxItem,
  InboxStatus,
  ListingClaimItem,
  ListingModerationItem,
  ReviewModerationItem,
  TranslationJobItem,
} from "@/lib/admin/inbox/types";
import { ADMIN_INBOX_QUERY_KEY } from "@/lib/admin/inbox/types";

interface InboxDetailProps {
  item: InboxItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolved: () => void;
  currentUserId: string | null;
  viewStatus: InboxStatus;
}

interface InboxAssigneeOption {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: "admin";
}

interface InboxAssigneeSearchResponse {
  ok: true;
  assignees: InboxAssigneeOption[];
}

async function fetchInboxAssignees(search: string): Promise<InboxAssigneeOption[]> {
  const params = new URLSearchParams();
  if (search.trim()) params.set("query", search.trim());
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const response = (await fetchAdmin(`/api/admin/inbox/assignees${suffix}`)) as InboxAssigneeSearchResponse;
  return response.assignees;
}

function formatAssigneeName(assignee: InboxAssigneeOption) {
  return assignee.fullName?.trim() || assignee.email || assignee.id;
}

function EntityLink({ item }: { item: InboxItem }) {
  const l = useLocalePath();

  if (item.source === "listing_claim") {
    const { requestType } = (item as ListingClaimItem).meta;
    return (
      <Link
        href={l("/admin/claims")}
        className="text-sm text-primary underline-offset-2 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {requestType === "claim-business" ? "Open partner claims ↗" : "Open new listing requests ↗"}
      </Link>
    );
  }

  if (item.source === "billing_subscription") {
    const { ownerId } = (item as BillingSubscriptionItem).meta;
    return (
      <Link
        href={`${l("/admin/subscriptions")}?owner=${ownerId}`}
        className="text-sm text-primary underline-offset-2 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open subscriptions ↗
      </Link>
    );
  }

  if (item.source === "chat_message") {
    const { threadId } = (item as ChatMessageItem).meta;
    return (
      <Link
        href={`${l("/admin/messages")}?threadId=${threadId}`}
        className="text-sm text-primary underline-offset-2 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open message thread ↗
      </Link>
    );
  }

  if (item.source === "translation_job") {
    const { listingId } = (item as TranslationJobItem).meta;
    return (
      <Link
        href={`${l("/admin/content/translations")}?listing=${listingId}`}
        className="text-sm text-primary underline-offset-2 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open translations ↗
      </Link>
    );
  }

  if (item.source === "external_outbox_alert") {
    const { alertKey } = (item as ExternalOutboxAlertItem).meta;
    return (
      <Link
        href={l("/admin/email")}
        className="text-sm text-primary underline-offset-2 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {alertKey.includes("outbox") ? "Open email/outbox dashboard ↗" : "Open admin dashboard ↗"}
      </Link>
    );
  }

  if (item.domain === "listings") {
    const { listingId } = (item as ListingModerationItem).meta;
    return (
      <Link
        href={l(`/admin/listings/${listingId}/edit`)}
        className="text-sm text-primary underline-offset-2 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        View listing ↗
      </Link>
    );
  }
  if (item.domain === "events") {
    const { eventId } = (item as EventModerationItem).meta;
    return (
      <Link
        href={l(`/admin/content/events/${eventId}/edit`)}
        className="text-sm text-primary underline-offset-2 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        View event ↗
      </Link>
    );
  }
  if (item.domain === "reviews") {
    const { listingId, listingName } = (item as ReviewModerationItem).meta;
    return (
      <Link
        href={`${l("/admin/reviews")}?listing=${listingId}`}
        className="text-sm text-primary underline-offset-2 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {listingName ? `Reviews for ${listingName} ↗` : "View review queue ↗"}
      </Link>
    );
  }
  return null;
}

export function InboxDetail({
  item,
  open,
  onOpenChange,
  onResolved,
  currentUserId,
  viewStatus,
}: InboxDetailProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {item ? (
        <InboxDetailContent
          key={item.id}
          item={item}
          open={open}
          onOpenChange={onOpenChange}
          onResolved={onResolved}
          currentUserId={currentUserId}
          viewStatus={viewStatus}
        />
      ) : null}
    </Sheet>
  );
}

function InboxDetailContent({
  item,
  open,
  onOpenChange,
  onResolved,
  currentUserId,
  viewStatus,
}: Omit<InboxDetailProps, "item"> & { item: InboxItem }) {
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState("");
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState<InboxAssigneeOption | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<(() => Promise<{ ok: boolean; error?: string }>) | null>(null);
  const [pending, startTransition] = useTransition();
  const canSearchAssignees =
    open &&
    viewStatus === "open" &&
    item?.status === "open" &&
    item.resolution.available.includes("assign");
  const assigneeSearchTerm = assigneeSearch.trim();
  const assigneesQuery = useQuery({
    queryKey: ["admin-inbox-assignees", assigneeSearchTerm],
    queryFn: () => fetchInboxAssignees(assigneeSearchTerm),
    enabled: canSearchAssignees,
    staleTime: 60_000,
  });

  const run = (
    fn: () => Promise<{ ok: boolean; error?: string }>,
    successMessage?: string,
  ) => {
    setError(null);
    setLastAction(() => fn);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setError(result.error ?? "Action failed.");
        return;
      }
      setRejectReason("");
      setAssigneeSearch("");
      setSelectedAssignee(null);
      setLastAction(null);
      if (successMessage) toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: ADMIN_INBOX_QUERY_KEY, exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin", "inbox", "urgent-count"] });
      onResolved();
      onOpenChange(false);
    });
  };

  const retry = () => {
    if (lastAction) run(lastAction);
  };

  const base = { source: item.source, sourceRowId: item.sourceRowId };
  const canAssignToMe = currentUserId && currentUserId !== item.assignee?.id;
  const isOpenView = viewStatus === "open" && item.status === "open";
  const isRestorableView =
    (viewStatus === "archived" || viewStatus === "dismissed") &&
    (item.status === "archived" || item.status === "dismissed");
  const canApprove = isOpenView && item.resolution.available.includes("approve");
  const canReject = isOpenView && item.resolution.available.includes("reject");
  const canArchive = isOpenView && item.resolution.available.includes("archive");
  const canAssign = isOpenView && item.resolution.available.includes("assign");
  const readActionLabel =
    item.source === "external_outbox_alert"
      ? "Clear alert"
      : item.source === "billing_subscription" || item.source === "translation_job"
        ? "Clear notification"
        : "Mark as read";
  const readActionReason = readActionLabel.toLowerCase().replace(/\s+/g, "_");
  const ReadActionIcon = item.source === "external_outbox_alert" ? BellOff : CheckCheck;

  return (
    <SheetContent side="right" className="w-full max-w-xl overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="text-left">{item.title}</SheetTitle>
        <SheetDescription className="text-left">
          Review inbox item details and apply moderation actions.
        </SheetDescription>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant="outline" className="capitalize">
            {item.domain}
          </Badge>
          <Badge variant={item.urgency === "urgent" ? "destructive" : "secondary"}>
            {item.urgency}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {item.status}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatInboxDueStatus(item.sla.dueAt, item.sla.minutesRemaining)}
          </span>
        </div>
      </SheetHeader>

      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Submitter
          </dt>
          <dd>{item.owner.name ?? item.owner.id}</dd>
        </div>
        {item.summary ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Summary
            </dt>
            <dd className="whitespace-pre-wrap">{item.summary}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Created
          </dt>
          <dd>{new Date(item.createdAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Link
          </dt>
          <dd>
            <EntityLink item={item} />
          </dd>
        </div>
        {item.assignee ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Assigned to
            </dt>
            <dd>{item.assignee.id === currentUserId ? "You" : item.assignee.id.slice(0, 8)}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-6 space-y-4 border-t border-border pt-6">
          {/* Primary actions */}
          <div className="flex flex-wrap gap-2">
            {canApprove ? (
              <Button
                type="button"
                disabled={pending}
                onClick={() => run(() => approveInboxItem(base), "Inbox item approved.")}
              >
                Approve
              </Button>
            ) : null}

            {canReject ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Rejection reason"
                    className="w-52"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={pending || !rejectReason.trim()}
                    onClick={() =>
                      run(
                        () => rejectInboxItem({ ...base, reason: rejectReason }),
                        "Inbox item rejected.",
                      )
                    }
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Secondary actions */}
          <div className="flex flex-wrap gap-2">
            {isOpenView ? (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  run(
                    () => markInboxItemRead({ ...base, reason: readActionReason }),
                    "Notification cleared.",
                  )
                }
                aria-label={`${readActionLabel} and clear this inbox notification`}
              >
                <ReadActionIcon className="mr-2 h-4 w-4" />
                {readActionLabel}
              </Button>
            ) : null}
            {canArchive ? (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => run(() => archiveInboxItem({ ...base }), "Message archived.")}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            ) : null}
            {isRestorableView ? (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  run(() => restoreInboxNotification({ ...base }), "Message restored to inbox.")
                }
              >
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Restore to Inbox
              </Button>
            ) : null}
            {canAssign && canAssignToMe ? (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  run(
                    () => assignInboxItem({ ...base, assigneeId: currentUserId! }),
                    "Inbox item assigned.",
                  )
                }
              >
                Assign to me
              </Button>
            ) : null}
          </div>

          {/* Manual assign */}
          {canAssign ? (
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Assign to admin
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={assigneeSearch}
                  onChange={(e) => {
                    setAssigneeSearch(e.target.value);
                    setSelectedAssignee(null);
                  }}
                  placeholder="Search by name or email"
                  className="pl-9"
                  aria-label="Search admin assignee by name or email"
                />
              </div>
              <div className="rounded-lg border border-border bg-background p-1">
                {assigneesQuery.isLoading || assigneesQuery.isFetching ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching admins...
                  </div>
                ) : assigneesQuery.isError ? (
                  <p className="px-3 py-2 text-sm text-destructive">
                    Could not load admin users.
                  </p>
                ) : assigneesQuery.data?.length ? (
                  <div className="max-h-52 overflow-y-auto" role="listbox" aria-label="Admin assignee results">
                    {assigneesQuery.data.map((assignee) => {
                      const selected = selectedAssignee?.id === assignee.id;
                      return (
                        <button
                          key={assignee.id}
                          type="button"
                          className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                            selected ? "bg-primary/10 text-primary" : "hover:bg-muted"
                          }`}
                          onClick={() => {
                            setSelectedAssignee(assignee);
                            setAssigneeSearch(formatAssigneeName(assignee));
                          }}
                          role="option"
                          aria-selected={selected}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary">
                            {formatAssigneeName(assignee).charAt(0)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-foreground">
                              {formatAssigneeName(assignee)}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {assignee.email}
                            </span>
                          </span>
                          {selected ? <UserCheck className="h-4 w-4 shrink-0" /> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    No admin users match this search.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending || !selectedAssignee}
                  onClick={() =>
                    run(
                      () => assignInboxItem({ ...base, assigneeId: selectedAssignee!.id }),
                      "Inbox item assigned.",
                    )
                  }
                >
                  {selectedAssignee ? `Assign to ${formatAssigneeName(selectedAssignee)}` : "Assign"}
                </Button>
              </div>
            </div>
          ) : null}

          {/* Error + retry */}
          {error ? (
            <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
              <p className="flex-1 text-sm text-destructive" role="alert">
                {error}
              </p>
              {lastAction ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={retry}
                >
                  Retry
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
    </SheetContent>
  );
}
