"use client";

import { usePathname } from "next/navigation";

import { InboxFilters } from "@/components/admin/inbox-filters";
import { useInboxFiltersState } from "@/components/admin/inbox-filters-state";

function isInboxRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return /\/admin\/inbox(?:\/|$)/.test(pathname);
}

export function ContextPanel() {
  const pathname = usePathname();
  const { filters, setFilters, counts } = useInboxFiltersState();

  if (!isInboxRoute(pathname)) {
    return null;
  }

  return (
    <aside className="w-[17rem] shrink-0 border-r border-border/70 bg-background/55 backdrop-blur-sm">
      <InboxFilters value={filters} onChange={setFilters} counts={counts} />
    </aside>
  );
}
