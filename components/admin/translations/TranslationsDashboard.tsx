"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  getAttentionCounts,
  getTranslationJobsGrouped,
  getStatusCounts,
} from "@/lib/admin/translations/queries";
import { TranslationStatusCards } from "./TranslationStatusCards";
import { TranslationFilters }     from "./TranslationFilters";
import { TranslationJobsTable }   from "./TranslationJobsTable";
import { CommandModeBar }         from "./CommandModeBar";
import type {
  AttentionCounts,
  FilterOptions,
  ListingJobGroup,
  StatusCounts,
  TranslationFilters as TFilters,
  TranslationStatus,
} from "@/lib/admin/translations/types";
import { PAGE_SIZE } from "@/lib/admin/translations/types";

interface Props {
  initialCounts:          StatusCounts;
  initialGroups:          ListingJobGroup[];
  initialTotal:           number;
  initialAttentionCounts: AttentionCounts;
  filters:                TFilters;
  filterOptions:          FilterOptions;
}

export function TranslationsDashboard({
  initialCounts,
  initialGroups,
  initialTotal,
  initialAttentionCounts,
  filters,
  filterOptions,
}: Props) {
  const supabase     = createClient();
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [counts,          setCounts]          = useState<StatusCounts>(initialCounts);
  const [groups,          setGroups]          = useState<ListingJobGroup[]>(initialGroups);
  const [total,           setTotal]           = useState(initialTotal);
  const [attentionCounts, setAttentionCounts] = useState<AttentionCounts>(initialAttentionCounts);
  const [loading,         setLoading]         = useState(false);
  const [lastRefreshed,   setLastRefreshed]   = useState<Date>(new Date());
  const refreshRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch all data client-side ─────────────────────────────────────────────
  const fetchData = useCallback(
    async (currentFilters: TFilters) => {
      setLoading(true);
      try {
        const [countsResult, jobsResult, attentionResult] = await Promise.all([
          getStatusCounts(supabase),
          getTranslationJobsGrouped(supabase, currentFilters),
          getAttentionCounts(supabase),
        ]);
        setCounts(countsResult);
        setGroups(jobsResult.groups);
        setTotal(jobsResult.total);
        setAttentionCounts(attentionResult);
        setLastRefreshed(new Date());
      } catch (err) {
        console.error("[TranslationsDashboard] fetchData error:", err);
      } finally {
        setLoading(false);
      }
    },
    [supabase],
  );

  // Re-fetch when URL searchParams change
  useEffect(() => {
    const newFilters: TFilters = {
      status:          searchParams.get("status") as TranslationStatus ?? undefined,
      city:            searchParams.get("city") ?? undefined,
      category:        searchParams.get("category") ?? undefined,
      tier:            searchParams.get("tier") as "signature" | "verified" ?? undefined,
      target_lang:     searchParams.get("target_lang") ?? undefined,
      needs_attention: searchParams.get("needs_attention") === "true",
      sla_breach:      searchParams.get("sla_breach")  === "true",
      outdated:        searchParams.get("outdated")     === "true",
      page:            Math.max(1, Number(searchParams.get("page") ?? 1)),
    };
    fetchData(newFilters);
  }, [searchParams, fetchData]);

  // ── Realtime — debounced, only on status change ────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("translation-jobs-rt")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "translation_jobs" },
        (payload) => {
          const oldStatus = (payload.old as { status?: string })?.status;
          const newStatus = (payload.new as { status?: string })?.status;
          if (oldStatus === newStatus) return;
          if (refreshRef.current) clearTimeout(refreshRef.current);
          refreshRef.current = setTimeout(() => fetchData(filters), 1000);
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "translation_jobs" },
        () => {
          if (refreshRef.current) clearTimeout(refreshRef.current);
          refreshRef.current = setTimeout(() => fetchData(filters), 1000);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (refreshRef.current) clearTimeout(refreshRef.current);
    };
  }, [supabase, filters, fetchData]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const currentPage = filters.page ?? 1;
  const totalPages  = Math.ceil(total / PAGE_SIZE);

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const handleStatusFilter = useCallback(
    (status: TranslationStatus | "") => {
      const params = new URLSearchParams(searchParams.toString());
      if (status) params.set("status", status); else params.delete("status");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  // ── Derived metrics ────────────────────────────────────────────────────────
  const totalJobs        = Object.values(counts).reduce((a, b) => a + b, 0);
  const doneJobs         = (counts.auto ?? 0) + (counts.reviewed ?? 0) + (counts.edited ?? 0);
  const completionPct    = totalJobs > 0 ? Math.round((doneJobs / totalJobs) * 100) : 0;
  const pendingCount     = counts.queued ?? 0;
  const slaRiskCount     = attentionCounts.slaRiskCount ?? 0;
  const isAttentionMode  = !!filters.needs_attention;
  const isSlaMode        = !!filters.sla_breach;
  const isOutdatedMode   = !!filters.outdated;

  return (
    <div className="space-y-5">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Translation Management
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Monitor and manage listing translations across all locales
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-[11px] text-muted-foreground/50 sm:block">
            {lastRefreshed.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(filters)}
            disabled={loading}
            className="gap-1.5 border-border/60"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Command Mode bar ──────────────────────────────────────────────── */}
      <CommandModeBar
        counts={attentionCounts}
        isActive={isAttentionMode}
        isSlaMode={isSlaMode}
        isOutdatedMode={isOutdatedMode}
      />

      {/* ── System Health Strip ───────────────────────────────────────────── */}
      <SystemHealthStrip
        queued={pendingCount}
        completionPct={completionPct}
        slaBreached={slaRiskCount}
        outdated={attentionCounts.outdatedCount ?? 0}
      />

      {/* ── Status cards ──────────────────────────────────────────────────── */}
      <TranslationStatusCards
        counts={counts}
        activeFilter={filters.status}
        onFilterClick={handleStatusFilter}
      />

      <Separator className="border-border/40" />

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <TranslationFilters
        filters={filters}
        options={filterOptions}
        totalJobs={total}
      />

      {/* ── Jobs table ────────────────────────────────────────────────────── */}
      <TranslationJobsTable
        groups={groups}
        onRefresh={() => fetchData(filters)}
      />

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/40 pt-4">
          <span className="text-xs text-muted-foreground">
            Page{" "}
            <span className="font-medium text-foreground">{currentPage}</span>{" "}
            of{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              disabled={currentPage <= 1 ?? loading}
              onClick={() => goToPage(currentPage - 1)}
              className="border-border/60"
            >
              Previous
            </Button>
            <Button
              variant="outline" size="sm"
              disabled={currentPage >= totalPages ?? loading}
              onClick={() => goToPage(currentPage + 1)}
              className="border-border/60"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── System Health Strip ──────────────────────────────────────────────────────

function SystemHealthStrip({
  queued,
  completionPct,
  slaBreached,
  outdated,
}: {
  queued:        number;
  completionPct: number;
  slaBreached:   number;
  outdated:      number;
}) {
  const coverageColor =
    completionPct >= 75
      ? "text-emerald-400"
      : completionPct >= 40
      ? "text-amber-400"
      : "text-red-400";

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-border/40 bg-card/40 px-4 py-2.5">
      <HealthMetric
        label="Queued"
        value={queued.toLocaleString()}
        valueClass={queued > 0 ? "text-blue-400" : "text-muted-foreground"}
      />
      <div className="hidden h-4 w-px bg-border/50 sm:block" />
      <HealthMetric
        label="Coverage"
        value={`${completionPct}%`}
        valueClass={coverageColor}
      />
      <div className="hidden h-4 w-px bg-border/50 sm:block" />
      <HealthMetric
        label="SLA Breached"
        value={slaBreached.toLocaleString()}
        valueClass={slaBreached > 0 ? "text-red-400" : "text-emerald-400"}
      />
      <div className="hidden h-4 w-px bg-border/50 sm:block" />
      <HealthMetric
        label="Outdated"
        value={outdated.toLocaleString()}
        valueClass={outdated > 0 ? "text-violet-400" : "text-muted-foreground"}
      />
    </div>
  );
}

function HealthMetric({
  label,
  value,
  valueClass,
}: {
  label:      string;
  value:      string;
  valueClass: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground/60">{label}</span>
      <span className={cn("text-sm font-semibold tabular-nums", valueClass)}>
        {value}
      </span>
    </div>
  );
}
