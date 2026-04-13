"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Loader2,
  Pencil,
  RefreshCcw,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { ListingJobGroup, TranslationJob } from "@/lib/admin/translations/types";
import {
  ATTENTION_STATUSES,
  DONE_STATUSES,
  SEO_COVERAGE_COLORS,
  SEO_COVERAGE_TEXT,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/admin/translations/types";
import type { TranslationStatus } from "@/lib/admin/translations/types";

interface Props {
  group: ListingJobGroup;
  onTranslate:      (job: TranslationJob) => Promise<void>;
  onRetry:          (job: TranslationJob) => Promise<void>;
  onMarkReviewed:   (job: TranslationJob) => Promise<void>;
  onEdit:           (job: TranslationJob) => void;
  onGroupAction:    (jobIds: string[], status: "queued" | "reviewed") => Promise<void>;
  onGroupRequeue:   (listingId: string) => Promise<void>;
  loadingJobId:     string | null;
  groupActionLoading: boolean;
  defaultExpanded?: boolean;
  // Bulk selection
  selectedJobIds:   string[];
  onSelectJob:      (jobId: string, checked: boolean) => void;
}

// ─── SLA display helper ───────────────────────────────────────────────────────

function computeSla(deadline: string | null) {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff < 0) return { label: "SLA Breached", urgent: true, breached: true };
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return {
    label:   h > 0 ? `${h}h ${m}m remaining` : `${m}m remaining`,
    urgent:  diff < 3_600_000,
    breached: false,
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TranslationListingGroup({
  group,
  onTranslate,
  onRetry,
  onMarkReviewed,
  onEdit,
  onGroupAction,
  onGroupRequeue,
  loadingJobId,
  groupActionLoading,
  defaultExpanded = false,
  selectedJobIds,
  onSelectJob,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const {
    listing,
    jobs,
    doneCount,
    seoCoverage,
    seoCoverageLabel,
    slaBreachCount,
  } = group;

  const failedJobs  = jobs.filter((j) => j.status === "failed");
  const missingJobs = jobs.filter((j) => j.status === "missing");
  const queuedJobs  = jobs.filter((j) => j.status === "queued");
  const autoJobs    = jobs.filter((j) => j.status === "auto");
  const pendingJobs = [...missingJobs, ...queuedJobs];

  // Outdated: done jobs whose source version is behind the listing's current content
  const outdatedJobs = jobs.filter(
    (j) =>
      DONE_STATUSES.includes(j.status) &&
      !!j.source_updated_at &&
      !!listing.content_updated_at &&
      new Date(j.source_updated_at) < new Date(listing.content_updated_at),
  );

  const isSignature = listing.tier === "signature";

  // Nearest active SLA deadline for signature listings
  const nearestDeadline = isSignature
    ? jobs
        .filter(
          (j) =>
            j.sla_deadline &&
            (ATTENTION_STATUSES as TranslationStatus[]).includes(j.status),
        )
        .sort(
          (a, b) =>
            new Date(a.sla_deadline!).getTime() -
            new Date(b.sla_deadline!).getTime(),
        )[0]?.sla_deadline ?? null
    : null;

  const sla = computeSla(nearestDeadline);

  // Group-level selection
  const jobIds              = jobs.map((j) => j.id);
  const groupSelectedCount  = jobIds.filter((id) => selectedJobIds.includes(id)).length;
  const allGroupSelected    = groupSelectedCount === jobs.length && jobs.length > 0;
  const someGroupSelected   = groupSelectedCount > 0 && !allGroupSelected;

  const handleGroupCheckbox = (checked: boolean) =>
    jobIds.forEach((id) => onSelectJob(id, checked));

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-150",
        isSignature
          ? "border-amber-500/35 bg-gradient-to-br from-amber-500/8 via-amber-500/4 to-transparent shadow-sm shadow-amber-500/5"
          : "border-border/60 bg-card/60",
        (sla?.breached) && "border-red-500/40",
      )}
    >

      {/* ── Card header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">

        {/* Checkbox */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 shrink-0"
        >
          <Checkbox
            checked={allGroupSelected}
            data-state={someGroupSelected ? "indeterminate" : undefined}
            onCheckedChange={(v) => handleGroupCheckbox(v as boolean)}
            className="h-3.5 w-3.5"
          />
        </div>

        {/* Name + meta */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "truncate text-sm font-semibold",
                isSignature ? "text-amber-100" : "text-foreground",
              )}
            >
              {isSignature && (
                <span className="mr-1.5 text-amber-400">★</span>
              )}
              {listing.name}
            </span>
            <TierBadge tier={listing.tier} />
            {isSignature && (
              <Badge
                variant="outline"
                className="shrink-0 border-amber-500/40 bg-amber-500/15 text-[10px] font-bold text-amber-300"
              >
                Priority Translation
              </Badge>
            )}
            {listing.status === "draft" && (
              <Badge
                variant="outline"
                className="shrink-0 border-border/50 text-[10px] text-muted-foreground"
              >
                Draft
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {listing.city}
            {listing.category ? ` · ${listing.category}` : ""}
          </span>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-0.5 shrink-0 rounded-lg p-1 text-muted-foreground/60 transition-colors hover:bg-muted/40 hover:text-muted-foreground focus:outline-none"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* ── SEO coverage ─────────────────────────────────────────────────────── */}
      <div className="px-4 pb-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            🌐 SEO Coverage
          </span>
          <span
            className={cn(
              "text-[11px] font-semibold tabular-nums",
              SEO_COVERAGE_TEXT[seoCoverageLabel],
            )}
          >
            {seoCoverage}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              SEO_COVERAGE_COLORS[seoCoverageLabel],
            )}
            style={{ width: `${seoCoverage}%` }}
          />
        </div>
      </div>

      {/* ── Status summary ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pb-3">
        {missingJobs.length > 0 && (
          <span className="text-[11px] text-zinc-400">
            <span className="font-semibold">{missingJobs.length}</span> Missing
          </span>
        )}
        {failedJobs.length > 0 && (
          <span className="text-[11px] text-red-400">
            <span className="font-semibold">{failedJobs.length}</span> Failed
          </span>
        )}
        {queuedJobs.length > 0 && (
          <span className="text-[11px] text-blue-400">
            <span className="font-semibold">{queuedJobs.length}</span> Queued
          </span>
        )}
        {autoJobs.length > 0 && (
          <span className="text-[11px] text-violet-400">
            <span className="font-semibold">{autoJobs.length}</span> AI Ready
          </span>
        )}
        {outdatedJobs.length > 0 && (
          <span className="text-[11px] text-violet-400 font-medium flex items-center gap-0.5">
            <RefreshCcw className="h-2.5 w-2.5" />
            <span className="font-semibold">{outdatedJobs.length}</span> Outdated
          </span>
        )}
        {doneCount > 0 && (
          <span className="text-[11px] text-emerald-400">
            <span className="font-semibold">{doneCount}</span> Done
          </span>
        )}
        <span className="ml-auto text-[11px] tabular-nums text-muted-foreground/50">
          {doneCount}/{jobs.length}
        </span>
      </div>

      {/* ── SLA indicator (signature only) ───────────────────────────────────── */}
      {isSignature && sla && (
        <div
          className={cn(
            "mx-4 mb-3 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium",
            sla.breached
              ? "border-red-500/30 bg-red-500/10 text-red-400"
              : sla.urgent
              ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
              : "border-border/40 bg-muted/20 text-muted-foreground",
          )}
        >
          <ShieldAlert className="h-3 w-3 shrink-0" />
          {sla.breached ? "SLA Breached" : `SLA: ${sla.label}`}
          {slaBreachCount > 1 && (
            <span className="ml-auto text-[10px] opacity-70">
              {slaBreachCount} jobs
            </span>
          )}
        </div>
      )}

      {/* ── Upsell (verified only, incomplete SEO) ────────────────────────────── */}
      {!isSignature && seoCoverage < 100 && (
        <div className="mx-4 mb-3 flex items-center gap-1.5 rounded-xl border border-border/30 bg-muted/10 px-3 py-1.5">
          <span className="text-[11px] text-muted-foreground/60">
            Upgrade to Signature
          </span>
          <ArrowUpRight className="h-3 w-3 text-muted-foreground/40" />
          <span className="text-[11px] text-muted-foreground/60">
            Priority processing
          </span>
        </div>
      )}

      {/* ── Inline action row ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border/30 px-4 py-2.5">
        {pendingJobs.length > 0 && (
          <GroupActionButton
            icon={<Zap className="h-3 w-3" />}
            label={`Queue ${pendingJobs.length} Missing`}
            onClick={() =>
              onGroupAction(pendingJobs.map((j) => j.id), "queued")
            }
            loading={groupActionLoading}
            variant="translate"
          />
        )}
        {failedJobs.length > 0 && (
          <GroupActionButton
            icon={<RefreshCw className="h-3 w-3" />}
            label={`Retry ${failedJobs.length} Failed`}
            onClick={() =>
              onGroupAction(failedJobs.map((j) => j.id), "queued")
            }
            loading={groupActionLoading}
            variant="retry"
          />
        )}
        {autoJobs.length > 0 && (
          <GroupActionButton
            icon={<Sparkles className="h-3 w-3" />}
            label={`Review ${autoJobs.length} AI`}
            onClick={() =>
              onGroupAction(autoJobs.map((j) => j.id), "reviewed")
            }
            loading={groupActionLoading}
            variant="review"
          />
        )}
        {outdatedJobs.length > 0 && (
          <GroupActionButton
            icon={<RefreshCcw className="h-3 w-3" />}
            label={`Re-translate ${outdatedJobs.length}`}
            onClick={() => onGroupRequeue(listing.id)}
            loading={groupActionLoading}
            variant="outdated"
          />
        )}

        {/* Expand/collapse toggle text */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="ml-auto text-[11px] text-muted-foreground/60 hover:text-muted-foreground focus:outline-none"
        >
          {expanded ? "Hide languages" : `View ${jobs.length} languages`}
        </button>
      </div>

      {/* ── Locale rows (expanded) ───────────────────────────────────────────── */}
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

// ─── Group Action Button ──────────────────────────────────────────────────────

const GROUP_ACTION_STYLES: Record<string, string> = {
  translate: "border-blue-500/25 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/40",
  retry:     "border-orange-500/25 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/40",
  review:    "border-violet-500/25 text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/40",
  outdated:  "border-violet-500/35 text-violet-300 hover:bg-violet-500/15 hover:border-violet-500/50 font-semibold",
};

function GroupActionButton({
  icon,
  label,
  onClick,
  loading,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  loading: boolean;
  variant: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={loading}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50",
        GROUP_ACTION_STYLES[variant],
      )}
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : icon}
      {label}
    </button>
  );
}

// ─── Locale Row ───────────────────────────────────────────────────────────────

interface LocaleRowProps {
  job:           TranslationJob;
  onTranslate:   (job: TranslationJob) => Promise<void>;
  onRetry:       (job: TranslationJob) => Promise<void>;
  onMarkReviewed:(job: TranslationJob) => Promise<void>;
  onEdit:        (job: TranslationJob) => void;
  isLoading:     boolean;
  isSelected:    boolean;
  onSelect:      (checked: boolean) => void;
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
  const slaInfo  = job.sla_deadline ? computeSla(job.sla_deadline) : null;
  // Outdated is passed through the job; we check via parent group context
  // (source_updated_at is available on the job itself — no extra prop needed)

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors",
        isSelected ? "bg-primary/8" : "hover:bg-muted/30",
      )}
    >
      {/* Checkbox */}
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(v) => onSelect(v as boolean)}
          className="h-3.5 w-3.5"
        />
      </div>

      {/* Language pill */}
      <span className="w-12 shrink-0 rounded-md bg-muted/50 px-1.5 py-0.5 text-center font-mono text-[11px] font-semibold uppercase text-muted-foreground">
        {job.target_lang}
      </span>

      {/* Status badge */}
      <Badge
        variant="outline"
        className={cn("shrink-0 text-[10px] font-medium", STATUS_COLORS[job.status])}
      >
        {STATUS_LABELS[job.status]}
      </Badge>

      {/* Error excerpt */}
      {job.status === "failed" && job.last_error && (
        <span className="min-w-0 flex-1 truncate text-[11px] text-red-400/80">
          {job.last_error}
        </span>
      )}

      {/* SLA inline (breach only) */}
      {slaInfo?.breached && (
        <span className="shrink-0 text-[10px] font-medium text-red-400">
          SLA ⚠
        </span>
      )}

      {/* Attempts */}
      {job.attempts > 0 && (
        <span className="shrink-0 text-[11px] text-muted-foreground/50">
          {job.attempts}×
        </span>
      )}

      {/* Updated at */}
      <span className="ml-auto hidden shrink-0 text-[11px] text-muted-foreground/40 sm:block">
        {new Date(job.updated_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        })}
      </span>

      {/* Per-row actions */}
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
  translate: "border-blue-500/20 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300",
  retry:     "border-orange-500/20 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300",
  review:    "border-violet-500/20 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300",
  edit:      "border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
};

function ActionButton({
  icon,
  label,
  onClick,
  variant,
}: {
  icon:    React.ReactNode;
  label:   string;
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
        "shrink-0 text-[10px] font-semibold",
        tier === "signature"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
          : "border-blue-500/30 bg-blue-500/10 text-blue-400",
      )}
    >
      {tier === "signature" ? "Signature" : "Verified"}
    </Badge>
  );
}
