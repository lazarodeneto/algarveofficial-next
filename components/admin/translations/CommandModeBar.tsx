"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AlertTriangle,
  Clock,
  FileX2,
  Flame,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { AttentionCounts } from "@/lib/admin/translations/types";

interface Props {
  counts:    AttentionCounts;
  isActive:  boolean;
  isSlaMode: boolean;
  isOutdatedMode: boolean;
}

export function CommandModeBar({
  counts,
  isActive,
  isSlaMode,
  isOutdatedMode,
}: Props) {
  const router   = useRouter();
  const pathname = usePathname();

  const handleFixTopPriority = useCallback(() => {
    router.push(`${pathname}?needs_attention=true`);
  }, [router, pathname]);

  const handleFixSlaFirst = useCallback(() => {
    router.push(`${pathname}?sla_breach=true`);
  }, [router, pathname]);

  const handleReviewAi = useCallback(() => {
    router.push(`${pathname}?status=auto`);
  }, [router, pathname]);

  const handleFixOutdated = useCallback(() => {
    router.push(`${pathname}?outdated=true`);
  }, [router, pathname]);

  if (
    counts.total === 0 &&
    counts.slaRiskCount === 0 &&
    counts.outdatedCount === 0
  ) {
    return null;
  }

  const needsAttention = counts.missing + counts.queued + counts.failed;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all",
        isSlaMode
          ? "border-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/10"
          : isOutdatedMode
          ? "border-violet-500/40 bg-violet-500/10 shadow-md shadow-violet-500/5"
          : isActive
          ? "border-orange-500/40 bg-orange-500/10 shadow-md shadow-orange-500/5"
          : "border-red-500/25 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-amber-500/5",
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/5 via-transparent to-transparent" />

      <div className="relative space-y-3 px-5 py-4">

        {/* ── Headlines + CTAs ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4">

          {/* Headlines */}
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                isSlaMode
                  ? "bg-red-500/25 text-red-400"
                  : "bg-red-500/20 text-red-400",
              )}
            >
              {isSlaMode ? (
                <ShieldAlert className="h-4 w-4" />
              ) : (
                <Flame className="h-4 w-4" />
              )}
            </div>
            <div className="space-y-0.5">
              {needsAttention > 0 && (
                <p className="text-sm font-semibold leading-tight text-foreground">
                  🔥{" "}
                  <span className="text-red-400">
                    {needsAttention.toLocaleString()}
                  </span>{" "}
                  listing{needsAttention !== 1 ? "s" : ""} need attention
                </p>
              )}
              {counts.slaRiskCount > 0 && (
                <p
                  className={cn(
                    "font-semibold leading-tight",
                    needsAttention > 0
                      ? "text-[11px] text-red-400/80"
                      : "text-sm text-foreground",
                  )}
                >
                  ⚠️{" "}
                  <span className="text-red-400">{counts.slaRiskCount}</span>{" "}
                  SLA breached
                </p>
              )}
              {counts.signatureCount > 0 && (
                <p className="text-[11px] font-semibold leading-tight text-amber-400/90">
                  🚀{" "}
                  <span className="text-amber-400">{counts.signatureCount}</span>{" "}
                  Signature at risk
                </p>
              )}
              {counts.outdatedCount > 0 && (
                <p className="text-[11px] font-semibold leading-tight text-violet-400/90">
                  🔄{" "}
                  <span className="text-violet-400">{counts.outdatedCount}</span>{" "}
                  translation{counts.outdatedCount !== 1 ? "s" : ""} outdated
                </p>
              )}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">

            {/* Fix SLA First */}
            {counts.slaRiskCount > 0 && (
              <Button
                size="sm"
                onClick={handleFixSlaFirst}
                variant={isSlaMode ? "outline" : "default"}
                className={cn(
                  "gap-1.5 font-semibold shadow-sm",
                  isSlaMode
                    ? "border-red-500/30 bg-red-500/20 text-red-300 hover:bg-red-500/30"
                    : "bg-red-500 text-white shadow-red-500/20 hover:bg-red-600",
                )}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                {isSlaMode ? "Viewing SLA breaches" : "Fix SLA First"}
              </Button>
            )}

            {/* Fix Top Priority */}
            {counts.total > 0 && !isSlaMode && (
              <Button
                size="sm"
                onClick={handleFixTopPriority}
                variant={isActive ? "outline" : "default"}
                className={cn(
                  "gap-1.5 font-semibold shadow-sm",
                  isActive
                    ? "border-orange-500/30 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30"
                    : "bg-orange-500 text-white shadow-orange-500/20 hover:bg-orange-600",
                )}
              >
                <Zap className="h-3.5 w-3.5" />
                {isActive ? "Viewing attention items" : "Fix Top Priority"}
              </Button>
            )}

            {/* Fix Outdated */}
            {counts.outdatedCount > 0 && (
              <Button
                size="sm"
                onClick={handleFixOutdated}
                variant={isOutdatedMode ? "outline" : "default"}
                className={cn(
                  "gap-1.5 font-semibold shadow-sm",
                  isOutdatedMode
                    ? "border-violet-500/30 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30"
                    : "bg-violet-600 text-white shadow-violet-500/20 hover:bg-violet-700",
                )}
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                {isOutdatedMode ? "Viewing outdated" : "Fix Outdated"}
              </Button>
            )}

            {/* Review AI Content */}
            <Button
              size="sm"
              onClick={handleReviewAi}
              variant="outline"
              className="gap-1.5 border-violet-500/30 bg-violet-500/10 font-semibold text-violet-300 hover:bg-violet-500/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Review AI
            </Button>
          </div>
        </div>

        {/* ── Breakdown pills ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          {counts.missing > 0 && (
            <StatPill
              icon={<FileX2 className="h-3 w-3" />}
              label="Missing"
              count={counts.missing}
              color="border-zinc-500/20 bg-zinc-500/15 text-zinc-400"
            />
          )}
          {counts.queued > 0 && (
            <StatPill
              icon={<Clock className="h-3 w-3" />}
              label="Queued"
              count={counts.queued}
              color="border-blue-500/20 bg-blue-500/15 text-blue-400"
            />
          )}
          {counts.failed > 0 && (
            <StatPill
              icon={<AlertTriangle className="h-3 w-3" />}
              label="Failed"
              count={counts.failed}
              color="border-red-500/20 bg-red-500/15 text-red-400"
            />
          )}
          {counts.signatureCount > 0 && (
            <StatPill
              icon={<Star className="h-3 w-3" />}
              label="Signature"
              count={counts.signatureCount}
              color="border-amber-500/20 bg-amber-500/15 text-amber-400"
            />
          )}
          {counts.outdatedCount > 0 && (
            <StatPill
              icon={<RefreshCcw className="h-3 w-3" />}
              label="Outdated"
              count={counts.outdatedCount}
              color="border-violet-500/20 bg-violet-500/15 text-violet-400"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  count,
  color,
}: {
  icon:  React.ReactNode;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium",
        color,
      )}
    >
      {icon}
      <span className="font-semibold">{count}</span> {label}
    </span>
  );
}
