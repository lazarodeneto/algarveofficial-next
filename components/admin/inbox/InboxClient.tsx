"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { InboxDetail } from "./InboxDetail";
import { InboxList } from "./InboxList";
import { Button } from "@/components/ui/Button";
import {
  DEFAULT_INBOX_FILTERS,
  isDefaultInboxFilters,
  useInboxFiltersState,
} from "@/components/admin/inbox-filters-state";
import type { InboxItem, InboxSnapshot } from "@/lib/admin/inbox/types";

interface InboxClientProps {
  initialSnapshot: InboxSnapshot;
  currentUserId: string | null;
}

export function InboxClient({ initialSnapshot, currentUserId }: InboxClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { filters, setFilters, setCounts, reset } = useInboxFiltersState();

  const [selectedId, setSelectedId] = useState<string | null>(
    initialSnapshot.items[0]?.id ?? null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sourceErrors = initialSnapshot.errors ?? [];

  useEffect(() => {
    const assignedToMe =
      currentUserId == null
        ? 0
        : initialSnapshot.items.filter((item) => item.assignee?.id === currentUserId).length;
    setCounts({
      total: initialSnapshot.counts.total,
      urgent: initialSnapshot.counts.urgent,
      soon: initialSnapshot.counts.soon,
      normal: initialSnapshot.counts.normal,
      assignedToMe,
      byDomain: initialSnapshot.counts.byDomain,
    });
  }, [currentUserId, initialSnapshot.counts, initialSnapshot.items, setCounts]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedId(initialSnapshot.items[0]?.id ?? null);
      return;
    }
    if (!initialSnapshot.items.some((item) => item.id === selectedId)) {
      setSelectedId(initialSnapshot.items[0]?.id ?? null);
    }
  }, [initialSnapshot.items, selectedId]);

  const filtered = useMemo<InboxItem[]>(() => {
    return initialSnapshot.items.filter((item) => {
      if (filters.domain !== "all" && item.domain !== filters.domain) return false;
      if (filters.urgency !== "all" && item.urgency !== filters.urgency) return false;
      if (filters.assignee === "me") {
        if (!currentUserId || item.assignee?.id !== currentUserId) return false;
      }
      return true;
    });
  }, [initialSnapshot.items, filters, currentUserId]);

  const selectedItem = useMemo(
    () => filtered.find((item) => item.id === selectedId) ?? null,
    [filtered, selectedId],
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  }, []);

  const handleResolved = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin", "inbox", "urgent-count"] });
    router.refresh();
  }, [router, queryClient]);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_INBOX_FILTERS);
  }, [setFilters]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin", "inbox", "urgent-count"] });
    router.refresh();
  }, [queryClient, router]);

  const hasActiveFilters = !isDefaultInboxFilters(filters);
  const isAssigneeFiltered = filters.assignee === "me";
  const lastUpdated = new Date(initialSnapshot.generatedAt).toLocaleString();

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-background/80">
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 flex-col gap-3 border-b border-border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-serif text-xl font-semibold text-foreground">Admin Inbox</h1>
            <p className="text-xs text-muted-foreground">
              {initialSnapshot.counts.total} open · {initialSnapshot.counts.urgent} urgent · Checked {lastUpdated}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {sourceErrors.length > 0 ? (
              <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                {sourceErrors.length} source {sourceErrors.length === 1 ? "issue" : "issues"}
              </span>
            ) : null}
            <Button type="button" variant="outline" size="sm" onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
        </header>
        <InboxList
          items={filtered}
          selectedId={selectedId}
          onSelect={handleSelect}
          hasActiveFilters={hasActiveFilters}
          isAssigneeFiltered={isAssigneeFiltered}
          onClearFilters={handleClearFilters}
          sourceErrors={sourceErrors}
        />
      </main>
      <InboxDetail
        item={selectedItem}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onResolved={handleResolved}
        currentUserId={currentUserId}
      />
    </div>
  );
}
