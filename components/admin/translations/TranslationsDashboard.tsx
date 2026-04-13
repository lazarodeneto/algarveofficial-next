"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  getAttentionCounts,
  getTranslationJobsGrouped,
  getStatusCounts,
} from "@/lib/admin/translations/queries";
import { TranslationStatusCards } from "./TranslationStatusCards";
import { TranslationFilters } from "./TranslationFilters";
import { TranslationJobsTable } from "./TranslationJobsTable";
import { CommandModeBar } from "./CommandModeBar";
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
  initialCounts: StatusCounts;
  initialGroups: ListingJobGroup[];
  initialTotal: number;
  initialAttentionCounts: AttentionCounts;
  filters: TFilters;
  filterOptions: FilterOptions;
}

export function TranslationsDashboard({
  initialCounts,
  initialGroups,
  initialTotal,
  initialAttentionCounts,
  filters,
  filterOptions,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [counts, setCounts] = useState<StatusCounts>(initialCounts);
  const [groups, setGroups] = useState<ListingJobGroup[]>(initialGroups);
  const [total, setTotal] = useState(initialTotal);
  const [attentionCounts, setAttentionCounts] = useState<AttentionCounts>(initialAttentionCounts);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const refreshRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch data client-side ─────────────────────────────────────────────────
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
        console.error("Failed to refresh translation data:", err);
      } finally {
        setLoading(false);
      }
    },
    [supabase],
  );

  // Refresh when filters change via URL
  useEffect(() => {
    const currentPage = Number(searchParams.get("page") ?? 1);
    const newFilters: TFilters = {
      status: (searchParams.get("status") as TranslationStatus) || undefined,
      city: searchParams.get("city") || undefined,
      category: searchParams.get("category") || undefined,
      tier: (searchParams.get("tier") as "signature" | "verified") || undefined,
      target_lang: searchParams.get("target_lang") || undefined,
      needs_attention: searchParams.get("needs_attention") === "true",
      page: currentPage,
    };
    fetchData(newFilters);
  }, [searchParams, fetchData]);

  // ── Real-time subscription (status-change guard) ───────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("translation-jobs-rt")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "translation_jobs" },
        (payload) => {
          // Only refresh if the status actually changed — prevents noisy re-renders
          const oldStatus = (payload.old as { status?: string })?.status;
          const newStatus = (payload.new as { status?: string })?.status;
          if (oldStatus === newStatus) return;

          if (refreshRef.current) clearTimeout(refreshRef.current);
          refreshRef.current = setTimeout(() => {
            fetchData(filters);
          }, 1200);
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "translation_jobs" },
        () => {
          if (refreshRef.current) clearTimeout(refreshRef.current);
          refreshRef.current = setTimeout(() => {
            fetchData(filters);
          }, 1200);
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
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  // ── Status card click → filter ─────────────────────────────────────────────
  const handleStatusFilter = useCallback(
    (status: TranslationStatus | "") => {
      const params = new URLSearchParams(searchParams.toString());
      if (status) {
        params.set("status", status);
      } else {
        params.delete("status");
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  // ── Derived metrics (computed here, never in child components) ───────────────
  // Pending = queued only — real pipeline pressure
  const pendingCount = counts.queued ?? 0;
  // Needs attention = missing + queued + failed — actionable problems
  const needsAttention = (counts.missing ?? 0) + (counts.queued ?? 0) + (counts.failed ?? 0);
  // SLA risk placeholder — queued jobs at risk; expand when SLA thresholds are defined
  const slaRiskCount = counts.queued ?? 0;

  const isAttentionMode = filters.needs_attention === true;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Translation Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor and manage listing translations across all locales
          </p>
          {needsAttention > 0 && (
            <p className="mt-1 text-xs text-orange-400/80">
              <span className="font-semibold">{needsAttention.toLocaleString()}</span> need attention
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {pendingCount > 0 && (
            <Badge
              variant="outline"
              className="gap-1.5 border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs"
            >
              <Clock className="h-3 w-3" />
              {pendingCount} queued
            </Badge>
          )}

          <span className="hidden text-[11px] text-muted-foreground/60 sm:block">
            Updated {lastRefreshed.toLocaleTimeString()}
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

      {/* Command mode bar */}
      <CommandModeBar counts={attentionCounts} isActive={isAttentionMode} />

      {/* Status cards */}
      <TranslationStatusCards
        counts={counts}
        activeFilter={filters.status}
        onFilterClick={handleStatusFilter}
      />

      <Separator className="border-border/40" />

      {/* Filters */}
      <TranslationFilters
        filters={filters}
        options={filterOptions}
        totalJobs={total}
      />

      {/* Jobs table */}
      <TranslationJobsTable
        groups={groups}
        onRefresh={() => fetchData(filters)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/40 pt-4">
          <span className="text-xs text-muted-foreground">
            Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || loading}
              onClick={() => goToPage(currentPage - 1)}
              className="border-border/60"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || loading}
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
