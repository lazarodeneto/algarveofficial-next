"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, HelpCircle, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { toast } from "sonner";

import type { BusinessClaimStatus } from "@/lib/admin/business-claims/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type ReviewAction = "approve" | "reject" | "needs_more_info" | "dispute";

interface BusinessClaimReviewActionsProps {
  claimId: string;
  status: BusinessClaimStatus;
}

const ACTION_LABELS: Record<ReviewAction, string> = {
  approve: "Approve claim",
  reject: "Reject claim",
  needs_more_info: "Request more information",
  dispute: "Mark disputed",
};

async function submitReviewAction({
  claimId,
  action,
  note,
}: {
  claimId: string;
  action: ReviewAction;
  note: string;
}) {
  const response = await fetch(`/api/admin/business-claims/${claimId}`, {
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
        ? body.error?.message ?? "Failed to review business claim."
        : "Failed to review business claim.",
    );
  }
}

export function BusinessClaimReviewActions({
  claimId,
  status,
}: BusinessClaimReviewActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [pendingAction, setPendingAction] = useState<ReviewAction | null>(null);
  const isClosed = ["approved", "rejected", "cancelled"].includes(status);

  const handleAction = async (action: ReviewAction) => {
    if (action === "reject" && !note.trim()) {
      toast.error("Add a rejection reason before rejecting this claim.");
      return;
    }

    setPendingAction(action);
    try {
      await submitReviewAction({ claimId, action, note });
      toast.success(`${ACTION_LABELS[action]} completed`);
      setNote("");
      await queryClient.invalidateQueries({
        queryKey: ["admin-business-claims"],
        exact: false,
      });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to review business claim.");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader>
        <CardTitle>Admin review</CardTitle>
        <CardDescription>
          Approval assigns the listing to the claimant and marks the listing as claimed.
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
            This claim is already closed. Create a disputed review flow before re-opening ownership.
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
            onClick={() => handleAction("needs_more_info")}
            disabled={Boolean(pendingAction) || isClosed}
          >
            {pendingAction === "needs_more_info" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <HelpCircle className="mr-2 h-4 w-4" />
            )}
            More info
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
          <Button
            type="button"
            variant="outline"
            className="border-purple-400/40 text-purple-700 hover:bg-purple-500/10 dark:text-purple-300"
            onClick={() => handleAction("dispute")}
            disabled={Boolean(pendingAction) || isClosed}
          >
            {pendingAction === "dispute" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShieldAlert className="mr-2 h-4 w-4" />
            )}
            Dispute
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

