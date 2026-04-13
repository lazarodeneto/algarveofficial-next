"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  enqueueTranslationJob,
  updateTranslationStatus,
} from "@/lib/admin/translations/queries";
import { TranslationListingGroup } from "./TranslationListingGroup";
import { TranslationEditorDrawer } from "./TranslationEditorDrawer";
import type { ListingJobGroup, TranslationJob, ListingRow } from "@/lib/admin/translations/types";

interface Props {
  groups: ListingJobGroup[];
  onRefresh: () => void;
}

export function TranslationJobsTable({ groups, onRefresh }: Props) {
  const supabase = createClient();
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<{
    job: TranslationJob | null;
    listing: ListingRow | null;
    open: boolean;
  }>({ job: null, listing: null, open: false });

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

  const handleEdit = useCallback(
    (job: TranslationJob, listing: ListingRow) => {
      setEditorState({ job, listing, open: true });
    },
    [],
  );

  const handleEditorSaved = useCallback(
    (_jobId: string) => {
      onRefresh();
    },
    [onRefresh],
  );

  if (groups.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border/50 text-sm text-muted-foreground">
        No translation jobs match the current filters.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {groups.map((group, idx) => (
          <TranslationListingGroup
            key={group.listing.id}
            group={group}
            onTranslate={handleTranslate}
            onRetry={handleRetry}
            onMarkReviewed={handleMarkReviewed}
            onEdit={(job) => handleEdit(job, group.listing)}
            loadingJobId={loadingJobId}
            defaultExpanded={idx < 3} // expand top 3 by priority
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
