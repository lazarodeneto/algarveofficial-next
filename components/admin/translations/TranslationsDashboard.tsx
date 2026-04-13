"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { getTranslationJobsGrouped, getStatusCounts } from "@/lib/admin/translations/queries";
import { TranslationStatusCards } from "./TranslationStatusCards";
import { TranslationFilters } from "./TranslationFilters";
import { TranslationJobsTable } from "./TranslationJobsTable";
import type {
  FilterOptions,
  ListingJobGroup,
  StatusCounts,
  TranslationFilters as TFilters,
  TranslationStatus,
} from "@/lib/admin/translations/types";
import { PAGE_SIZE } from "@/lib/admin/translations/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Props {
  initialCounts: StatusCounts;
  initialGroups: ListingJobGroup[];
  initialTotal: number;
  filters: TFilters;
  filterOptions: FilterOptions;
}

export function TranslationsDashboard({
  initialCounts,
  initialGroups,
  initialTotal,
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
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const refreshRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch data client-side ─────────────────────────────────────────────────
  const fetchData = useCallback(
    async (currentFilters: TFilters) => {
      setLoading(true);
      try {
        const [countsResult, jobsResult] = await Promise.all([
          getStatusCounts(supabase),
          getTranslationJobsGrouped(supabase, currentFilters),
        ]);
        setCounts(countsResult);
        setGroups(jobsResult.groups);
        setTotal(jobsResult.total);
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
      page: currentPage,
    };
    fetchData(newFilters);
  }, [searchParams, fetchData]);

  // ── Real-time subscription ─────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("translation-jobs-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "translation_jobs" },
        () => {
          // Debounce rapid fire updates
          if (refreshRef.current) clearTimeout(refreshRef.current);
          refreshRef.current = setTimeout(() => {
            fetchData(filters);
          }, 800);
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

  const pendingCount = counts.queued ?? 0;

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
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Pending badge */}
          {pendingCount > 0 && (
            <Badge
              variant="outline"
              className="gap-1.5 border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs"
            >
              <Clock className="h-3 w-3" />
              {pendingCount} pending
            </Badge>
          )}

          {/* Last refreshed */}
          <span className="hidden text-[11px] text-muted-foreground/60 sm:block">
            Updated {lastRefreshed.toLocaleTimeString()}
          </span>

          {/* Refresh button */}
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
