"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileX2,
  Pencil,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { StatusCounts, TranslationStatus } from "@/lib/admin/translations/types";

interface StatusCardConfig {
  key: TranslationStatus;
  label: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

const CARDS: StatusCardConfig[] = [
  {
    key: "missing",
    label: "Missing",
    icon: <FileX2 className="h-4 w-4" />,
    colorClass: "text-zinc-400",
    bgClass: "bg-zinc-500/10",
    borderClass: "border-zinc-500/20",
  },
  {
    key: "queued",
    label: "Queued",
    icon: <Clock className="h-4 w-4" />,
    colorClass: "text-blue-400",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/20",
  },
  {
    key: "auto",
    label: "Auto",
    icon: <Sparkles className="h-4 w-4" />,
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/20",
  },
  {
    key: "reviewed",
    label: "Reviewed",
    icon: <ShieldCheck className="h-4 w-4" />,
    colorClass: "text-violet-400",
    bgClass: "bg-violet-500/10",
    borderClass: "border-violet-500/20",
  },
  {
    key: "edited",
    label: "Edited",
    icon: <Pencil className="h-4 w-4" />,
    colorClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/20",
  },
  {
    key: "failed",
    label: "Failed",
    icon: <AlertTriangle className="h-4 w-4" />,
    colorClass: "text-red-400",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/20",
  },
];

interface Props {
  counts: StatusCounts;
  activeFilter?: TranslationStatus | "";
  onFilterClick?: (status: TranslationStatus | "") => void;
}

export function TranslationStatusCards({ counts, activeFilter, onFilterClick }: Props) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const done = (counts.auto ?? 0) + (counts.reviewed ?? 0) + (counts.edited ?? 0);
  const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/75">
          Translation Health
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>
            <span className="font-semibold text-foreground">{completionPct}%</span> complete
            &nbsp;·&nbsp;
            <span className="font-semibold text-foreground">{total}</span> total jobs
          </span>
        </div>
      </div>

      {/* Status cards grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CARDS.map(({ key, label, icon, colorClass, bgClass, borderClass }) => {
          const count = counts[key] ?? 0;
          const isActive = activeFilter === key;

          return (
            <button
              key={key}
              onClick={() => onFilterClick?.(isActive ? "" : key)}
              className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-2xl"
            >
              <Card
                className={cn(
                  "border transition-all duration-150 hover:-translate-y-0.5",
                  bgClass,
                  borderClass,
                  isActive
                    ? "ring-2 ring-primary/60 shadow-md"
                    : "hover:shadow-sm hover:border-opacity-40",
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                        {label}
                      </p>
                      <p className={cn("mt-1.5 text-2xl font-serif font-semibold leading-none", colorClass)}>
                        {count.toLocaleString()}
                      </p>
                    </div>
                    <div className={cn("rounded-xl p-1.5", bgClass, colorClass)}>
                      {icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
