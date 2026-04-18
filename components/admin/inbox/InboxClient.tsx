"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { InboxDetail } from "./InboxDetail";
import { InboxList } from "./InboxList";
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

  useEffect(() => {
    setCounts({
      total: initialSnapshot.counts.total,
      urgent: initialSnapshot.counts.urgent,
      byDomain: initialSnapshot.counts.byDomain,
    });

    return () => {
      reset();
    };
  }, [initialSnapshot.counts, reset, setCounts]);

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

  const hasActiveFilters = !isDefaultInboxFilters(filters);
  const isAssigneeFiltered = filters.assignee === "me";

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-background/80">
      <InboxList
        items={filtered}
        selectedId={selectedId}
        onSelect={handleSelect}
        hasActiveFilters={hasActiveFilters}
        isAssigneeFiltered={isAssigneeFiltered}
        onClearFilters={handleClearFilters}
      />
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
