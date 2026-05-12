"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type ReviewAction = "approve" | "reject";

interface ListingChangeRequestReviewActionsProps {
  requestId: string;
  status: string;
}

const ACTION_LABELS: Record<ReviewAction, string> = {
  approve: "Approve request",
  reject: "Reject request",
};

async function submitReviewAction({
  requestId,
  action,
  note,
}: {
  requestId: string;
  action: ReviewAction;
  note: string;
}) {
  const response = await fetch(`/api/admin/listing-change-requests/${requestId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      note: note.trim() || null,
    }),
  });

  const body = (await response.json().catch(() => null)) as
    | { ok: true }
    | { ok?: false; error?: { message?: string } }
    | null;

  if (!response.ok || body?.ok !== true) {
    throw new Error(
      body && "error" in body
        ? body.error?.message ?? "Failed to review listing change request."
        : "Failed to review listing change request.",
    );
  }
}

export function ListingChangeRequestReviewActions({
  requestId,
  status,
}: ListingChangeRequestReviewActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [pendingAction, setPendingAction] = useState<ReviewAction | null>(null);
  const isClosed = status !== "pending";

  const handleAction = async (action: ReviewAction) => {
    if (action === "reject" && !note.trim()) {
      toast.error("Add a rejection reason before rejecting this request.");
      return;
    }

    setPendingAction(action);
    try {
      await submitReviewAction({ requestId, action, note });
      toast.success(`${ACTION_LABELS[action]} completed`);
      setNote("");
      await queryClient.invalidateQueries({
        queryKey: ["admin-listing-change-requests"],
        exact: false,
      });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to review listing change request.");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader>
        <CardTitle>Admin review</CardTitle>
        <CardDescription>
          Approval applies the requested value to the linked listing. Rejection leaves the listing unchanged.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Admin note or rejection reason"
          className="min-h-24 bg-background/80"
          disabled={Boolean(pendingAction) || isClosed}
        />

        {isClosed ? (
          <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground">
            This request is already closed. Create a new owner request before changing the listing again.
          </div>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="default"
            onClick={() => handleAction("approve")}
            disabled={Boolean(pendingAction) || isClosed}
          >
            {pendingAction === "approve" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Approve
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-red-400/40 text-red-700 hover:bg-red-500/10 dark:text-red-300"
            onClick={() => handleAction("reject")}
            disabled={Boolean(pendingAction) || isClosed}
          >
            {pendingAction === "reject" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

