"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import type { InboxDomain, InboxFilters } from "@/lib/admin/inbox/types";

export interface InboxFilterCounts {
  total: number;
  urgent: number;
  byDomain: Record<InboxDomain, number>;
}

const EMPTY_COUNTS: InboxFilterCounts = {
  total: 0,
  urgent: 0,
  byDomain: {
    listings: 0,
    reviews: 0,
    events: 0,
  },
};

export const DEFAULT_INBOX_FILTERS: InboxFilters = {
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

  const value = useMemo<InboxFiltersState>(
    () => ({
      filters,
      setFilters,
      counts,
      setCounts,
      reset: () => {
        setFilters(DEFAULT_INBOX_FILTERS);
        setCounts(EMPTY_COUNTS);
      },
    }),
    [filters, counts],
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
  return filters.domain === "all" && filters.urgency === "all" && filters.assignee === "all";
}
