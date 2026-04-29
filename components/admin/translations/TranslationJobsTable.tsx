"use client";

import { useCallback, useState } from "react";
import { Loader2, RefreshCw, ShieldCheck, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  bulkUpdateTranslationStatus,
  enqueueTranslationJob,
  requeueOutdatedJobs,
  updateTranslationStatus,
} from "@/lib/admin/translations/queries";
import { TranslationListingGroup } from "./TranslationListingGroup";
import { TranslationEditorDrawer } from "./TranslationEditorDrawer";
import type { ListingJobGroup, ListingRow, TranslationJob } from "@/lib/admin/translations/types";

interface Props {
  groups:    ListingJobGroup[];
  onRefresh: () => void;
}

export function TranslationJobsTable({ groups, onRefresh }: Props) {
  const supabase = createClient();

  const [loadingJobId,      setLoadingJobId]      = useState<string | null>(null);
  const [bulkLoading,       setBulkLoading]        = useState(false);
  const [groupActionLoading, setGroupActionLoading] = useState(false);
  const [selectedJobIds,    setSelectedJobIds]     = useState<string[]>([]);
  const [editorState,       setEditorState]        = useState<{
    job:     TranslationJob | null;
    listing: ListingRow | null;
    open:    boolean;
  }>({ job: null, listing: null, open: false });

  // ── Selection helpers ──────────────────────────────────────────────────────
  const handleSelectJob = useCallback((jobId: string, checked: boolean) => {
    setSelectedJobIds((prev) =>
      checked ? [...prev, jobId] : prev.filter((id) => id !== jobId),
    );
  }, []);

  const clearSelection = useCallback(() => setSelectedJobIds([]), []);

  // ── Single job actions ─────────────────────────────────────────────────────
  const withLoading = useCallback(
    async (jobId: string, fn: () => Promise<void>) => {
      setLoadingJobId(jobId);
      try {
        await fn();
        onRefresh();
      } finally {
        setLoadingJobId(null);
      }
    },
    [onRefresh],
  );

  const handleTranslate = useCallback(
    async (job: TranslationJob) => {
      await withLoading(job.id, async () => {
        await enqueueTranslationJob(supabase, job.listing_id, job.target_lang);
        toast.success(`Queued ${job.target_lang.toUpperCase()} translation.`);
      });
    },
    [supabase, withLoading],
  );

  const handleRetry = useCallback(
    async (job: TranslationJob) => {
      await withLoading(job.id, async () => {
        await enqueueTranslationJob(supabase, job.listing_id, job.target_lang);
        toast.success(`Retrying ${job.target_lang.toUpperCase()} translation.`);
      });
    },
    [supabase, withLoading],
  );

  const handleMarkReviewed = useCallback(
    async (job: TranslationJob) => {
      await withLoading(job.id, async () => {
        await updateTranslationStatus(supabase, job.id, "reviewed");
        toast.success(`Marked ${job.target_lang.toUpperCase()} as reviewed.`);
      });
    },
    [supabase, withLoading],
  );

  const handleEdit = useCallback((job: TranslationJob, listing: ListingRow) => {
    setEditorState({ job, listing, open: true });
  }, []);

  const handleEditorSaved = useCallback(
    (_jobId: string) => { onRefresh(); },
    [onRefresh],
  );

  // ── Group-level requeue (outdated jobs) ───────────────────────────────────
  const handleGroupRequeue = useCallback(
    async (listingId: string, tier: "signature" | "verified") => {
      setGroupActionLoading(true);
      try {
        const count = await requeueOutdatedJobs(supabase, listingId, tier);
        toast.success(
          count > 0
            ? `${count} outdated job${count !== 1 ? "s" : ""} re-queued.`
            : "No outdated jobs found.",
        );
        onRefresh();
      } catch {
        toast.error("Re-queue failed. Please try again.");
      } finally {
        setGroupActionLoading(false);
      }
    },
    [supabase, onRefresh],
  );

  // ── Group-level bulk action ────────────────────────────────────────────────
  const handleGroupAction = useCallback(
    async (jobIds: string[], status: "queued" | "reviewed") => {
      if (jobIds.length === 0) return;
      setGroupActionLoading(true);
      try {
        await bulkUpdateTranslationStatus(supabase, jobIds, status);
        toast.success(
          `${jobIds.length} job${jobIds.length !== 1 ? "s" : ""} ${
            status === "queued" ? "queued" : "marked reviewed"
          }.`,
        );
        onRefresh();
      } catch {
        toast.error("Action failed. Please try again.");
      } finally {
        setGroupActionLoading(false);
      }
    },
    [supabase, onRefresh],
  );

  // ── Toolbar bulk actions ───────────────────────────────────────────────────
  const handleBulkAction = useCallback(
    async (action: "queue" | "reviewed" | "retry") => {
      if (selectedJobIds.length === 0) return;
      setBulkLoading(true);
      try {
        const status = action === "reviewed" ? "reviewed" : "queued";
        await bulkUpdateTranslationStatus(supabase, selectedJobIds, status);
        toast.success(
          `${selectedJobIds.length} job${selectedJobIds.length !== 1 ? "s" : ""} updated.`,
        );
        setSelectedJobIds([]);
        onRefresh();
      } catch {
        toast.error("Bulk update failed.");
      } finally {
        setBulkLoading(false);
      }
    },
    [supabase, selectedJobIds, onRefresh],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  if (groups.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border/50 text-sm text-muted-foreground">
        No translation jobs match the current filters.
      </div>
    );
  }

  return (
    <>
      {/* ── Sticky bulk actions bar ─────────────────────────────────────────── */}
      {selectedJobIds.length > 0 && (
        <div className="sticky top-4 z-20 flex items-center gap-3 rounded-2xl border border-primary/30 bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm">
          <span className="text-sm font-medium text-foreground">
            <span className="font-bold text-primary">{selectedJobIds.length}</span> selected
          </span>
          <div className="flex flex-wrap gap-2">
            <BulkButton
              icon={<Zap className="h-3.5 w-3.5" />}
              label="Queue selected"
              onClick={() => handleBulkAction("queue")}
              loading={bulkLoading}
              variant="translate"
            />
            <BulkButton
              icon={<RefreshCw className="h-3.5 w-3.5" />}
              label="Retry selected"
              onClick={() => handleBulkAction("retry")}
              loading={bulkLoading}
              variant="retry"
            />
            <BulkButton
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
              label="Mark reviewed"
              onClick={() => handleBulkAction("reviewed")}
              loading={bulkLoading}
              variant="review"
            />
          </div>
          <button
            onClick={clearSelection}
            className="ml-auto text-muted-foreground hover:text-foreground focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Listing groups ───────────────────────────────────────────────────── */}
      <div className="space-y-2">
        {groups.map((group, idx) => (
          <TranslationListingGroup
            key={group.listing.id}
            group={group}
            onTranslate={handleTranslate}
            onRetry={handleRetry}
            onMarkReviewed={handleMarkReviewed}
            onEdit={(job) => handleEdit(job, group.listing)}
            onGroupAction={handleGroupAction}
            onGroupRequeue={(listingId) =>
              handleGroupRequeue(listingId, group.listing.tier)
            }
            groupActionLoading={groupActionLoading}
            loadingJobId={loadingJobId}
            defaultExpanded={idx < 3}
            selectedJobIds={selectedJobIds}
            onSelectJob={handleSelectJob}
          />
        ))}
      </div>

      <TranslationEditorDrawer
        job={editorState.job}
        listing={editorState.listing}
        open={editorState.open}
        onClose={() => setEditorState((s) => ({ ...s, open: false }))}
        onSaved={handleEditorSaved}
      />
    </>
  );
}

// ─── Bulk Action Button ───────────────────────────────────────────────────────

const BULK_STYLES: Record<string, string> = {
  translate: "border-blue-500/30 text-blue-400 hover:bg-blue-500/10",
  retry:     "border-orange-500/30 text-orange-400 hover:bg-orange-500/10",
  review:    "border-violet-500/30 text-violet-400 hover:bg-violet-500/10",
};

function BulkButton({
  icon,
  label,
  onClick,
  loading,
  variant,
}: {
  icon:    React.ReactNode;
  label:   string;
  onClick: () => void;
  loading: boolean;
  variant: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={loading}
      className={cn("h-7 gap-1.5 text-xs", BULK_STYLES[variant])}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon}
      {label}
    </Button>
  );
}
