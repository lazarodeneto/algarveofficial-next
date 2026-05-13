"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { InboxDetail } from "./InboxDetail";
import { InboxList } from "./InboxList";
import { Button } from "@/components/ui/Button";
import {
  DEFAULT_INBOX_FILTERS,
  useInboxFiltersState,
} from "@/components/admin/inbox-filters-state";
import { filterInboxItems, getInboxFilterCounts } from "@/lib/admin/inbox/filtering";
import {
  ADMIN_INBOX_QUERY_KEY,
  type InboxItem,
  type InboxSnapshot,
} from "@/lib/admin/inbox/types";

interface InboxClientProps {
  initialSnapshot: InboxSnapshot;
  currentUserId: string | null;
}

interface InboxApiResponse {
  ok: true;
  currentUserId: string;
  snapshot: InboxSnapshot;
}

async function fetchInboxSnapshot(): Promise<InboxApiResponse> {
  const response = await fetch("/api/admin/inbox", {
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as
    | InboxApiResponse
    | { ok?: false; error?: { message?: string } }
    | null;

  if (!response.ok || body?.ok !== true) {
    throw new Error(
      body && "error" in body
        ? body.error?.message ?? "Failed to load admin inbox."
        : "Failed to load admin inbox.",
    );
  }

  return body;
}

export function InboxClient({ initialSnapshot, currentUserId }: InboxClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { filters, setFilters, setCounts, reset } = useInboxFiltersState();
  const query = useQuery({
    queryKey: [...ADMIN_INBOX_QUERY_KEY, currentUserId ?? "anonymous"],
    queryFn: fetchInboxSnapshot,
    initialData: {
      ok: true,
      currentUserId: currentUserId ?? "",
      snapshot: initialSnapshot,
    } satisfies InboxApiResponse,
    staleTime: 0,
    refetchOnReconnect: true,
  });
  const { refetch } = query;

  const snapshot = query.data?.snapshot ?? initialSnapshot;
  const effectiveUserId = query.data?.currentUserId || currentUserId;
  const [selectedId, setSelectedId] = useState<string | null>(
    snapshot.items.find((item) => item.status === "open")?.id ?? null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sourceErrors = snapshot.errors ?? [];
  const queryError = query.error instanceof Error ? query.error.message : null;

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const filtered = useMemo<InboxItem[]>(() => {
    return filterInboxItems(snapshot.items, filters, effectiveUserId);
  }, [snapshot.items, filters, effectiveUserId]);

  const filterCounts = useMemo(
    () => getInboxFilterCounts(snapshot.items, filters.status, effectiveUserId),
    [snapshot.items, filters.status, effectiveUserId],
  );

  useEffect(() => {
    setCounts(filterCounts);
  }, [filterCounts, setCounts]);

  const effectiveSelectedId =
    selectedId && filtered.some((item) => item.id === selectedId)
      ? selectedId
      : filtered[0]?.id ?? null;

  const selectedItem = useMemo(
    () => filtered.find((item) => item.id === effectiveSelectedId) ?? null,
    [filtered, effectiveSelectedId],
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  }, []);

  const handleResolved = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ADMIN_INBOX_QUERY_KEY, exact: false });
    queryClient.invalidateQueries({ queryKey: ["admin", "inbox", "urgent-count"] });
    router.refresh();
  }, [router, queryClient]);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_INBOX_FILTERS);
  }, [setFilters]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ADMIN_INBOX_QUERY_KEY, exact: false });
    queryClient.invalidateQueries({ queryKey: ["admin", "inbox", "urgent-count"] });
    refetch();
  }, [queryClient, refetch]);

  const hasNarrowingFilters =
    filters.domain !== "all" || filters.urgency !== "all" || filters.assignee !== "all";
  const isAssigneeFiltered = filters.assignee === "me";
  const lastUpdated = new Date(snapshot.generatedAt).toLocaleString();
  const viewTitle =
    filters.status === "archived"
      ? "Archived Inbox"
      : filters.status === "resolved"
        ? "Resolved Inbox"
      : filters.status === "dismissed"
        ? "Dismissed Inbox"
        : "Admin Inbox";
  const viewSummary =
    filters.status === "archived"
      ? `${filterCounts.total} archived · ${filterCounts.urgent} archived urgent · Checked ${lastUpdated}`
      : filters.status === "resolved"
        ? `${filterCounts.total} resolved · Checked ${lastUpdated}`
      : filters.status === "dismissed"
        ? `${filterCounts.total} dismissed · Checked ${lastUpdated}`
        : `${filterCounts.total} open · ${filterCounts.urgent} urgent · Checked ${lastUpdated}`;

  if (!query.data && query.isPending) {
    return (
      <div className="flex h-full min-h-0 w-full items-center justify-center bg-background/80">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading inbox...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-background/80">
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 flex-col gap-3 border-b border-border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-serif text-xl font-semibold text-foreground">{viewTitle}</h1>
            <p className="text-xs text-muted-foreground">
              {viewSummary}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {query.isError ? (
              <span className="rounded-full border border-destructive/35 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                Refresh failed
              </span>
            ) : null}
            {query.isFetching ? (
              <span className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Refreshing...
              </span>
            ) : null}
            {sourceErrors.length > 0 ? (
              <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                {sourceErrors.length} source {sourceErrors.length === 1 ? "issue" : "issues"}
              </span>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={query.isFetching}
            >
              Refresh
            </Button>
          </div>
        </header>
        <InboxList
          items={filtered}
          selectedId={effectiveSelectedId}
          onSelect={handleSelect}
          hasActiveFilters={hasNarrowingFilters}
          isAssigneeFiltered={isAssigneeFiltered}
          status={filters.status}
          onClearFilters={handleClearFilters}
          onActionComplete={handleResolved}
          sourceErrors={sourceErrors}
          queryError={queryError}
        />
      </main>
      <InboxDetail
        item={selectedItem}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onResolved={handleResolved}
        currentUserId={effectiveUserId}
        viewStatus={filters.status}
      />
    </div>
  );
}
