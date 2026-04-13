"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { ListingJobGroup, TranslationJob } from "@/lib/admin/translations/types";
import {
  DONE_STATUSES,
  SEO_COVERAGE_COLORS,
  SEO_COVERAGE_TEXT,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/admin/translations/types";

interface Props {
  group: ListingJobGroup;
  onTranslate: (job: TranslationJob) => Promise<void>;
  onRetry: (job: TranslationJob) => Promise<void>;
  onMarkReviewed: (job: TranslationJob) => Promise<void>;
  onEdit: (job: TranslationJob) => void;
  loadingJobId: string | null;
  defaultExpanded?: boolean;
  // Bulk selection
  selectedJobIds: string[];
  onSelectJob: (jobId: string, checked: boolean) => void;
}

export function TranslationListingGroup({
  group,
  onTranslate,
  onRetry,
  onMarkReviewed,
  onEdit,
  loadingJobId,
  defaultExpanded = false,
  selectedJobIds,
  onSelectJob,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { listing, jobs, doneCount, problemCount, pendingCount, seoCoverage, seoCoverageLabel } = group;

  const failedCount = jobs.filter((j) => j.status === "failed").length;
  const missingCount = jobs.filter((j) => j.status === "missing").length;
  const isSignature = listing.tier === "signature";

  // Group-level selection state
  const jobIds = jobs.map((j) => j.id);
  const groupSelectedCount = jobIds.filter((id) => selectedJobIds.includes(id)).length;
  const allGroupSelected = groupSelectedCount === jobs.length && jobs.length > 0;
  const someGroupSelected = groupSelectedCount > 0 && !allGroupSelected;

  const handleGroupCheckbox = (checked: boolean) => {
    jobIds.forEach((id) => onSelectJob(id, checked));
  };

  return (
    <div
      className={cn(
        "rounded-2xl border transition-colors",
        isSignature
          ? "border-amber-500/35 bg-gradient-to-r from-amber-500/8 to-amber-500/4 shadow-sm shadow-amber-500/5"
          : "border-border/60 bg-card/60",
      )}
    >
      {/* Group header */}
      <div className="flex w-full items-center gap-2 px-4 py-3">
        {/* Group-level checkbox */}
        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          <Checkbox
            checked={allGroupSelected}
            data-state={someGroupSelected ? "indeterminate" : undefined}
            onCheckedChange={(v) => handleGroupCheckbox(v as boolean)}
            className="h-3.5 w-3.5"
          />
        </div>

        {/* Expand/collapse */}
        <button
          className="flex flex-1 min-w-0 items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-lg"
          onClick={() => setExpanded((v) => !v)}
        >
          <span className="shrink-0 text-muted-foreground/60">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>

          {/* Title + tier + badges */}
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span
              className={cn(
                "truncate font-medium text-sm",
                isSignature ? "text-amber-100" : "text-foreground",
              )}
            >
              {isSignature && <span className="mr-1.5 text-amber-400">★</span>}
              {listing.name}
            </span>

            <TierBadge tier={listing.tier} />

            {isSignature && (
              <Badge
                variant="outline"
                className="shrink-0 text-[10px] font-bold border-amber-500/40 bg-amber-500/15 text-amber-300"
              >
                Priority
              </Badge>
            )}
            {listing.status === "draft" && (
              <Badge
                variant="outline"
                className="shrink-0 text-[10px] text-muted-foreground border-border/50"
              >
                Draft
              </Badge>
            )}
          </div>

          {/* City · category */}
          <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
            {listing.city}
            {listing.category ? ` · ${listing.category}` : ""}
          </span>

          {/* Right stats block */}
          <div className="flex shrink-0 items-center gap-3">
            {/* Status summary */}
            <div className="hidden items-center gap-2 text-[11px] text-muted-foreground lg:flex">
              {missingCount > 0 && (
                <span className="text-zinc-400">
                  <span className="font-semibold">{missingCount}</span> missing
                </span>
              )}
              {failedCount > 0 && (
                <span className="text-red-400">
                  <span className="font-semibold">{failedCount}</span> failed
                </span>
              )}
              {doneCount > 0 && (
                <span className="text-emerald-400">
                  <span className="font-semibold">{doneCount}</span> done
                </span>
              )}
            </div>

            {/* SEO coverage bar */}
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-14 overflow-hidden rounded-full bg-border/60">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    SEO_COVERAGE_COLORS[seoCoverageLabel],
                  )}
                  style={{ width: `${seoCoverage}%` }}
                />
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium tabular-nums",
                  SEO_COVERAGE_TEXT[seoCoverageLabel],
                )}
              >
                {seoCoverage}%
              </span>
              <span className="hidden text-[10px] text-muted-foreground/50 sm:inline">
                SEO
              </span>
            </div>

            {/* Done / total */}
            <span className="text-[11px] font-medium text-muted-foreground">
              {doneCount}/{jobs.length}
            </span>
          </div>
        </button>
      </div>

      {/* Locale rows */}
      {expanded && (
        <div className="border-t border-border/40 px-4 py-2 space-y-0.5">
          {jobs
            .slice()
            .sort((a, b) => a.target_lang.localeCompare(b.target_lang))
            .map((job) => (
              <LocaleRow
                key={job.id}
                job={job}
                onTranslate={onTranslate}
                onRetry={onRetry}
                onMarkReviewed={onMarkReviewed}
                onEdit={onEdit}
                isLoading={loadingJobId === job.id}
                isSelected={selectedJobIds.includes(job.id)}
                onSelect={(checked) => onSelectJob(job.id, checked)}
              />
            ))}
        </div>
      )}
    </div>
  );
}

// ─── Locale Row ───────────────────────────────────────────────────────────────

interface LocaleRowProps {
  job: TranslationJob;
  onTranslate: (job: TranslationJob) => Promise<void>;
  onRetry: (job: TranslationJob) => Promise<void>;
  onMarkReviewed: (job: TranslationJob) => Promise<void>;
  onEdit: (job: TranslationJob) => void;
  isLoading: boolean;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}

function LocaleRow({
  job,
  onTranslate,
  onRetry,
  onMarkReviewed,
  onEdit,
  isLoading,
  isSelected,
  onSelect,
}: LocaleRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-2 py-2 transition-colors",
        isSelected ? "bg-primary/8" : "hover:bg-muted/30",
      )}
    >
      {/* Row checkbox */}
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(v) => onSelect(v as boolean)}
          className="h-3.5 w-3.5"
        />
      </div>

      {/* Language pill */}
      <span className="w-12 shrink-0 rounded-md bg-muted/50 px-1.5 py-0.5 text-center text-[11px] font-mono font-semibold uppercase text-muted-foreground">
        {job.target_lang}
      </span>

      {/* Status badge */}
      <Badge
        variant="outline"
        className={cn("text-[10px] font-medium shrink-0", STATUS_COLORS[job.status])}
      >
        {STATUS_LABELS[job.status]}
      </Badge>

      {/* Error excerpt */}
      {job.status === "failed" && job.last_error && (
        <span className="min-w-0 flex-1 truncate text-[11px] text-red-400/80">
          {job.last_error}
        </span>
      )}

      {/* Attempts */}
      {job.attempts > 0 && (
        <span className="shrink-0 text-[11px] text-muted-foreground/60">{job.attempts}×</span>
      )}

      {/* Updated at */}
      <span className="ml-auto hidden shrink-0 text-[11px] text-muted-foreground/50 sm:block">
        {new Date(job.updated_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        })}
      </span>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : (
          <>
            {(job.status === "missing" || job.status === "queued") && (
              <ActionButton
                icon={<Zap className="h-3 w-3" />}
                label="Translate"
                onClick={() => onTranslate(job)}
                variant="translate"
              />
            )}
            {job.status === "failed" && (
              <ActionButton
                icon={<RefreshCw className="h-3 w-3" />}
                label="Retry"
                onClick={() => onRetry(job)}
                variant="retry"
              />
            )}
            {job.status === "auto" && (
              <ActionButton
                icon={<ShieldCheck className="h-3 w-3" />}
                label="Review"
                onClick={() => onMarkReviewed(job)}
                variant="review"
              />
            )}
            <ActionButton
              icon={<Pencil className="h-3 w-3" />}
              label="Edit"
              onClick={() => onEdit(job)}
              variant="edit"
            />
          </>
        )}
      </div>
    </div>
  );
}

// ─── Action Button ────────────────────────────────────────────────────────────

const ACTION_STYLES: Record<string, string> = {
  translate: "text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 border-blue-500/20",
  retry: "text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 border-orange-500/20",
  review: "text-violet-400 hover:bg-violet-500/10 hover:text-violet-300 border-violet-500/20",
  edit: "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-border/50",
};

function ActionButton({
  icon,
  label,
  onClick,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={label}
      className={cn(
        "flex items-center gap-1 rounded-lg border px-1.5 py-1 text-[10px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        ACTION_STYLES[variant],
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ─── Tier Badge ───────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: "signature" | "verified" }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-semibold shrink-0",
        tier === "signature"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
          : "border-blue-500/30 bg-blue-500/10 text-blue-400",
      )}
    >
      {tier === "signature" ? "Signature" : "Verified"}
    </Badge>
  );
}
