"use client";

import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InboxDomain, InboxFilters, InboxUrgency } from "@/lib/admin/inbox/types";

import type { InboxFilterCounts } from "./inbox-filters-state";

interface InboxFiltersProps {
  value: InboxFilters;
  onChange: (next: InboxFilters) => void;
  counts: InboxFilterCounts;
}

const DOMAIN_OPTIONS: Array<{ id: InboxFilters["domain"]; label: string }> = [
  { id: "all", label: "All" },
  { id: "listings", label: "Listings" },
  { id: "reviews", label: "Reviews" },
  { id: "events", label: "Events" },
];

const URGENCY_OPTIONS: Array<{ id: InboxUrgency | "all"; label: string }> = [
  { id: "all", label: "Any urgency" },
  { id: "urgent", label: "Urgent" },
  { id: "soon", label: "Due soon" },
  { id: "normal", label: "Normal" },
];

const ASSIGNEE_OPTIONS: Array<{ id: InboxFilters["assignee"]; label: string }> = [
  { id: "all", label: "Everyone" },
  { id: "me", label: "Assigned to me" },
];

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/90">
      {children}
    </h3>
  );
}

function OptionButton({
  active,
  onClick,
  children,
  right,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
  right?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors",
        "hover:border-border/80 hover:bg-muted/40",
        active
          ? "border-primary/35 bg-primary/10 text-foreground"
          : "border-transparent text-muted-foreground",
      )}
    >
      <span>{children}</span>
      {right ?? null}
    </button>
  );
}

export function InboxFilters({ value, onChange, counts }: InboxFiltersProps) {
  return (
    <aside className="flex h-full w-full shrink-0 flex-col gap-7 px-4 py-5">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Inbox Filters
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {counts.total} open \u00b7 {counts.urgent} urgent
        </p>
      </div>

      <section>
        <SectionTitle>Domain</SectionTitle>
        <ul className="space-y-1">
          {DOMAIN_OPTIONS.map((option) => {
            const active = value.domain === option.id;
            const count =
              option.id === "all"
                ? counts.total
                : counts.byDomain[option.id as InboxDomain] ?? 0;

            return (
              <li key={option.id}>
                <OptionButton
                  active={active}
                  onClick={() => onChange({ ...value, domain: option.id })}
                  right={
                    <Badge
                      variant={active ? "secondary" : "outline"}
                      className="ml-2 border-border/60 bg-background/80"
                    >
                      {count}
                    </Badge>
                  }
                >
                  {option.label}
                </OptionButton>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <SectionTitle>Urgency</SectionTitle>
        <ul className="space-y-1">
          {URGENCY_OPTIONS.map((option) => {
            const active = value.urgency === option.id;
            return (
              <li key={option.id}>
                <OptionButton
                  active={active}
                  onClick={() => onChange({ ...value, urgency: option.id })}
                >
                  {option.label}
                </OptionButton>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <SectionTitle>Assignee</SectionTitle>
        <ul className="space-y-1">
          {ASSIGNEE_OPTIONS.map((option) => {
            const active = value.assignee === option.id;
            return (
              <li key={option.id}>
                <OptionButton
                  active={active}
                  onClick={() => onChange({ ...value, assignee: option.id })}
                >
                  {option.label}
                </OptionButton>
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}
