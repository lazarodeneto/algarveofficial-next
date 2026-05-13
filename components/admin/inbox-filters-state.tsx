"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import type { InboxFilters } from "@/lib/admin/inbox/types";
import type { InboxFilterCounts } from "@/lib/admin/inbox/filtering";

export type { InboxFilterCounts };

const EMPTY_COUNTS: InboxFilterCounts = {
  total: 0,
  urgent: 0,
  soon: 0,
  normal: 0,
  assignedToMe: 0,
  byStatus: {
    open: 0,
    archived: 0,
    resolved: 0,
    dismissed: 0,
  },
  byDomain: {
    listings: 0,
    reviews: 0,
    events: 0,
    billing: 0,
    translations: 0,
    system: 0,
  },
};

export const DEFAULT_INBOX_FILTERS: InboxFilters = {
  status: "open",
  domain: "all",
  urgency: "all",
  assignee: "all",
};

interface InboxFiltersState {
  filters: InboxFilters;
  setFilters: Dispatch<SetStateAction<InboxFilters>>;
  counts: InboxFilterCounts;
  setCounts: Dispatch<SetStateAction<InboxFilterCounts>>;
  reset: () => void;
}

const InboxFiltersContext = createContext<InboxFiltersState | null>(null);

export function InboxFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<InboxFilters>(DEFAULT_INBOX_FILTERS);
  const [counts, setCounts] = useState<InboxFilterCounts>(EMPTY_COUNTS);

  const reset = useCallback(() => {
    setFilters(DEFAULT_INBOX_FILTERS);
    setCounts(EMPTY_COUNTS);
  }, []);

  const value = useMemo<InboxFiltersState>(
    () => ({
      filters,
      setFilters,
      counts,
      setCounts,
      reset,
    }),
    [filters, counts, reset],
  );

  return <InboxFiltersContext.Provider value={value}>{children}</InboxFiltersContext.Provider>;
}

export function useInboxFiltersState() {
  const context = useContext(InboxFiltersContext);
  if (!context) {
    throw new Error("useInboxFiltersState must be used within InboxFiltersProvider.");
  }
  return context;
}

export function isDefaultInboxFilters(filters: InboxFilters): boolean {
  return (
    filters.status === "open" &&
    filters.domain === "all" &&
    filters.urgency === "all" &&
    filters.assignee === "all"
  );
}
