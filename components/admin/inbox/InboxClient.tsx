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
  isDefaultInboxFilters,
  useInboxFiltersState,
} from "@/components/admin/inbox-filters-state";
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
    snapshot.items[0]?.id ?? null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sourceErrors = snapshot.errors ?? [];
  const queryError = query.error instanceof Error ? query.error.message : null;

  useEffect(() => {
    const assignedToMe =
      snapshot.counts.assignedToMe ??
      (effectiveUserId == null
        ? 0
        : snapshot.items.filter((item) => item.assignee?.id === effectiveUserId).length);
    setCounts({
      total: snapshot.counts.total,
      urgent: snapshot.counts.urgent,
      soon: snapshot.counts.soon,
      normal: snapshot.counts.normal,
      assignedToMe,
      byDomain: snapshot.counts.byDomain,
    });
  }, [effectiveUserId, snapshot.counts, snapshot.items, setCounts]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedId(snapshot.items[0]?.id ?? null);
      return;
    }
    if (!snapshot.items.some((item) => item.id === selectedId)) {
      setSelectedId(snapshot.items[0]?.id ?? null);
    }
  }, [snapshot.items, selectedId]);

  const filtered = useMemo<InboxItem[]>(() => {
    return snapshot.items.filter((item) => {
      if (filters.domain !== "all" && item.domain !== filters.domain) return false;
      if (filters.urgency !== "all" && item.urgency !== filters.urgency) return false;
      if (filters.assignee === "me") {
        if (!effectiveUserId || item.assignee?.id !== effectiveUserId) return false;
      }
      return true;
    });
  }, [snapshot.items, filters, effectiveUserId]);

  const selectedItem = useMemo(
    () => filtered.find((item) => item.id === selectedId) ?? null,
    [filtered, selectedId],
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

  const hasActiveFilters = !isDefaultInboxFilters(filters);
  const isAssigneeFiltered = filters.assignee === "me";
  const lastUpdated = new Date(snapshot.generatedAt).toLocaleString();

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
            <h1 className="font-serif text-xl font-semibold text-foreground">Admin Inbox</h1>
            <p className="text-xs text-muted-foreground">
              {snapshot.counts.total} open · {snapshot.counts.urgent} urgent · Checked {lastUpdated}
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
          selectedId={selectedId}
          onSelect={handleSelect}
          hasActiveFilters={hasActiveFilters}
          isAssigneeFiltered={isAssigneeFiltered}
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
      />
    </div>
  );
}
