"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AlertTriangle, Clock, FileX2, Flame, ShieldAlert, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AttentionCounts } from "@/lib/admin/translations/types";

interface Props {
  counts: AttentionCounts;
  isActive: boolean;
  isSlaMode: boolean;
}

export function CommandModeBar({ counts, isActive, isSlaMode }: Props) {
  const router   = useRouter();
  const pathname = usePathname();

  const handleFixTopPriority = useCallback(() => {
    router.push(`${pathname}?needs_attention=true`);
  }, [router, pathname]);

  const handleFixSlaFirst = useCallback(() => {
    router.push(`${pathname}?sla_breach=true`);
  }, [router, pathname]);

  if (counts.total === 0 && counts.slaRiskCount === 0) return null;

  const needsAttention = counts.missing + counts.queued + counts.failed;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border px-5 py-4 transition-all",
        isSlaMode
          ? "border-red-500/50 bg-red-500/10 shadow-md shadow-red-500/10"
          : isActive
          ? "border-orange-500/40 bg-orange-500/10 shadow-md shadow-orange-500/5"
          : "border-red-500/25 bg-gradient-to-r from-red-500/10 via-orange-500/8 to-amber-500/5",
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/5 via-transparent to-transparent" />

      <div className="relative flex flex-wrap items-center gap-4">

        {/* ── Headline ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
              isSlaMode ? "bg-red-500/25 text-red-400" : "bg-red-500/20 text-red-400",
            )}
          >
            {isSlaMode ? <ShieldAlert className="h-4 w-4" /> : <Flame className="h-4 w-4" />}
          </div>
          <div>
            {needsAttention > 0 && (
              <p className="text-sm font-semibold text-foreground leading-tight">
                🔥{" "}
                <span className="text-red-400">{needsAttention.toLocaleString()}</span>{" "}
                job{needsAttention !== 1 ? "s" : ""} need attention
              </p>
            )}
            {counts.slaRiskCount > 0 && (
              <p
                className={cn(
                  "font-semibold leading-tight",
                  needsAttention > 0 ? "text-[11px] text-red-400/80 mt-0.5" : "text-sm text-foreground",
                )}
              >
                ⚠️{" "}
                <span className="text-red-400">{counts.slaRiskCount}</span>{" "}
                SLA breached
              </p>
            )}
            {needsAttention === 0 && counts.slaRiskCount === 0 && (
              <p className="text-sm font-semibold text-muted-foreground">
                All jobs within SLA
              </p>
            )}
          </div>
        </div>

        {/* ── Breakdown pills ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          {counts.missing > 0 && (
            <StatPill
              icon={<FileX2 className="h-3 w-3" />}
              label="Missing"
              count={counts.missing}
              color="text-zinc-400 bg-zinc-500/15 border-zinc-500/20"
            />
          )}
          {counts.queued > 0 && (
            <StatPill
              icon={<Clock className="h-3 w-3" />}
              label="Queued"
              count={counts.queued}
              color="text-blue-400 bg-blue-500/15 border-blue-500/20"
            />
          )}
          {counts.failed > 0 && (
            <StatPill
              icon={<AlertTriangle className="h-3 w-3" />}
              label="Failed"
              count={counts.failed}
              color="text-red-400 bg-red-500/15 border-red-500/20"
            />
          )}
          {counts.signatureCount > 0 && (
            <StatPill
              icon={<Star className="h-3 w-3" />}
              label="Signature"
              count={counts.signatureCount}
              color="text-amber-400 bg-amber-500/15 border-amber-500/20"
            />
          )}
        </div>

        {/* ── CTAs ───────────────────────────────────────────────────────────── */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* Fix SLA First — shown only when there are breached SLAs */}
          {counts.slaRiskCount > 0 && (
            <Button
              size="sm"
              onClick={handleFixSlaFirst}
              className={cn(
                "gap-1.5 font-semibold shadow-sm",
                isSlaMode
                  ? "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                  : "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20",
              )}
              variant={isSlaMode ? "outline" : "default"}
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
              className={cn(
                "gap-1.5 font-semibold shadow-sm",
                isActive
                  ? "bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30"
                  : "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20",
              )}
              variant={isActive ? "outline" : "default"}
            >
              <Zap className="h-3.5 w-3.5" />
              {isActive ? "Viewing attention items" : "Fix Top Priority"}
            </Button>
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
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <span className={cn("flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium", color)}>
      {icon}
      <span className="font-semibold">{count}</span> {label}
    </span>
  );
}
