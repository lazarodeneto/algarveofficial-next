"use client";

import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  approveInboxItem,
  archiveInboxItem,
  assignInboxItem,
  rejectInboxItem,
} from "@/lib/admin/inbox/actions";
import type { InboxItem } from "@/lib/admin/inbox/types";

interface InboxDetailProps {
  item: InboxItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolved: () => void;
  currentUserId: string | null;
}

function formatDue(iso: string, minutes: number): string {
  const due = new Date(iso);
  const label = due.toLocaleString();
  if (minutes <= 0) return `Overdue since ${label}`;
  return `Due by ${label}`;
}

export function InboxDetail({
  item,
  open,
  onOpenChange,
  onResolved,
  currentUserId,
}: InboxDetailProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!item) return null;

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setError(result.error ?? "Action failed.");
        return;
      }
      setRejectReason("");
      setAssigneeId("");
      onResolved();
      onOpenChange(false);
    });
  };

  const base = { source: item.source, sourceRowId: item.sourceRowId };
  const canAssignToMe = currentUserId && currentUserId !== item.assignee?.id;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">{item.title}</SheetTitle>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="outline" className="capitalize">
              {item.domain}
            </Badge>
            <Badge variant={item.urgency === "urgent" ? "destructive" : "secondary"}>
              {item.urgency}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDue(item.sla.dueAt, item.sla.minutesRemaining)}
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
              Resolution
            </dt>
            <dd className="capitalize">{item.resolution.primary}</dd>
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
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={pending}
              onClick={() => run(() => approveInboxItem(base))}
            >
              Approve
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => run(() => archiveInboxItem({ ...base }))}
            >
              Archive
            </Button>
            {canAssignToMe ? (
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

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Reject with reason
            </label>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason shown to submitter"
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

          <div className="space-y-2">
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
                onClick={() => run(() => assignInboxItem({ ...base, assigneeId: assigneeId.trim() }))}
              >
                Assign
              </Button>
            </div>
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
