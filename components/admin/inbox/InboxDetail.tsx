"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { BellOff, CheckCheck } from "lucide-react";

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
} from "@/lib/admin/inbox/actions";
import { useLocalePath } from "@/hooks/useLocalePath";
import { formatInboxDueStatus } from "@/lib/admin/inbox/format";
import type {
  BillingSubscriptionItem,
  EventModerationItem,
  ExternalOutboxAlertItem,
  InboxItem,
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
}: InboxDetailProps) {
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<(() => Promise<{ ok: boolean; error?: string }>) | null>(null);
  const [pending, startTransition] = useTransition();

  if (!item) return null;

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    setLastAction(() => fn);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setError(result.error ?? "Action failed.");
        return;
      }
      setRejectReason("");
      setAssigneeId("");
      setLastAction(null);
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
  const canApprove = item.resolution.available.includes("approve");
  const canReject = item.resolution.available.includes("reject");
  const canArchive = item.resolution.available.includes("archive");
  const canAssign = item.resolution.available.includes("assign");
  const readActionLabel =
    item.source === "external_outbox_alert"
      ? "Clear alert"
      : item.source === "billing_subscription" || item.source === "translation_job"
        ? "Clear notification"
        : "Mark as read";
  const readActionReason = readActionLabel.toLowerCase().replace(/\s+/g, "_");
  const ReadActionIcon = item.source === "external_outbox_alert" ? BellOff : CheckCheck;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
              <dd>
                {item.assignee.id === currentUserId ? "You" : item.assignee.id.slice(0, 8)}
              </dd>
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
                onClick={() => run(() => approveInboxItem(base))}
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
                    onClick={() => run(() => rejectInboxItem({ ...base, reason: rejectReason }))}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Secondary actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => run(() => markInboxItemRead({ ...base, reason: readActionReason }))}
              aria-label={`${readActionLabel} and clear this inbox notification`}
            >
              <ReadActionIcon className="mr-2 h-4 w-4" />
              {readActionLabel}
            </Button>
            {canArchive ? (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => run(() => archiveInboxItem({ ...base }))}
              >
                Archive
              </Button>
            ) : null}
            {canAssign && canAssignToMe ? (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  run(() => assignInboxItem({ ...base, assigneeId: currentUserId! }))
                }
              >
                Assign to me
              </Button>
            ) : null}
          </div>

          {/* Manual assign */}
          {canAssign ? (
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Assign to user ID
              </label>
              <div className="flex gap-2">
                <Input
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  placeholder="UUID of assignee"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending || !assigneeId.trim()}
                  onClick={() =>
                    run(() => assignInboxItem({ ...base, assigneeId: assigneeId.trim() }))
                  }
                >
                  Assign
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
    </Sheet>
  );
}
