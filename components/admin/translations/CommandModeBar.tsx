"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AlertTriangle, Clock, FileX2, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AttentionCounts } from "@/lib/admin/translations/types";

interface Props {
  counts: AttentionCounts;
  isActive: boolean;
}

export function CommandModeBar({ counts, isActive }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleFixTopPriority = useCallback(() => {
    // Set needs_attention=true, clear all other filters, reset pagination
    router.push(`${pathname}?needs_attention=true`);
  }, [router, pathname]);

  if (counts.total === 0) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border px-5 py-4 transition-all",
        isActive
          ? "border-orange-500/40 bg-orange-500/10 shadow-md shadow-orange-500/5"
          : "border-red-500/25 bg-red-500/8 bg-gradient-to-r from-red-500/10 via-orange-500/8 to-amber-500/5",
      )}
    >
      {/* Glow accent */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/5 via-transparent to-transparent" />

      <div className="relative flex flex-wrap items-center gap-4">
        {/* Icon + headline */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              <span className="text-red-400">{counts.total}</span>{" "}
              listing{counts.total !== 1 ? "s" : ""} need attention
            </p>
            <p className="text-[11px] text-muted-foreground/70">
              Translation gaps may reduce SEO reach
            </p>
          </div>
        </div>

        {/* Breakdown pills */}
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
        </div>

        {/* CTA */}
        <div className="ml-auto shrink-0">
          <Button
            size="sm"
            onClick={handleFixTopPriority}
            className={cn(
              "gap-1.5 font-semibold shadow-sm",
              isActive
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30"
                : "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20",
            )}
            variant={isActive ? "outline" : "default"}
          >
            <Zap className="h-3.5 w-3.5" />
            {isActive ? "Viewing attention items" : "Fix Top Priority"}
          </Button>
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
