"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { InboxDetail } from "./InboxDetail";
import { InboxFilters } from "./InboxFilters";
import { InboxList } from "./InboxList";
import type { InboxFilters as InboxFiltersValue, InboxItem, InboxSnapshot } from "@/lib/admin/inbox/types";

interface InboxClientProps {
  initialSnapshot: InboxSnapshot;
  currentUserId: string | null;
}

const DEFAULT_FILTERS: InboxFiltersValue = {
  domain: "all",
  urgency: "all",
  assignee: "all",
};

export function InboxClient({ initialSnapshot, currentUserId }: InboxClientProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<InboxFiltersValue>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSnapshot.items[0]?.id ?? null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    () => filtered.find((i) => i.id === selectedId) ?? null,
    [filtered, selectedId],
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  }, []);

  const handleResolved = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      <InboxFilters value={filters} onChange={setFilters} counts={initialSnapshot.counts} />
      <InboxList items={filtered} selectedId={selectedId} onSelect={handleSelect} />
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
