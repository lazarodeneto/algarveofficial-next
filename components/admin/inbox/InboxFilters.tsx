"use client";

import { Badge } from "@/components/ui/badge";
import type { InboxDomain, InboxFilters, InboxUrgency } from "@/lib/admin/inbox/types";

interface InboxFiltersProps {
  value: InboxFilters;
  onChange: (next: InboxFilters) => void;
  counts: {
    total: number;
    urgent: number;
    byDomain: Record<InboxDomain, number>;
  };
}

const DOMAINS: Array<{ id: InboxFilters["domain"]; label: string }> = [
  { id: "all", label: "All" },
  { id: "listings", label: "Listings" },
  { id: "reviews", label: "Reviews" },
  { id: "events", label: "Events" },
];

const URGENCIES: Array<{ id: InboxUrgency | "all"; label: string }> = [
  { id: "all", label: "Any urgency" },
  { id: "urgent", label: "Urgent" },
  { id: "soon", label: "Due soon" },
  { id: "normal", label: "Normal" },
];

const ASSIGNEES: Array<{ id: InboxFilters["assignee"]; label: string }> = [
  { id: "all", label: "Everyone" },
  { id: "me", label: "Assigned to me" },
];

export function InboxFilters({ value, onChange, counts }: InboxFiltersProps) {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col gap-6 border-r border-border bg-muted/30 p-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Inbox
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {counts.total} open · {counts.urgent} urgent
        </p>
      </div>

      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Domain
        </h3>
        <ul className="space-y-1">
          {DOMAINS.map((d) => {
            const count =
              d.id === "all" ? counts.total : counts.byDomain[d.id as InboxDomain] ?? 0;
            const active = value.domain === d.id;
            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => onChange({ ...value, domain: d.id })}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <span>{d.label}</span>
                  <Badge variant={active ? "secondary" : "outline"} className="ml-2">
                    {count}
                  </Badge>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Urgency
        </h3>
        <ul className="space-y-1">
          {URGENCIES.map((u) => {
            const active = value.urgency === u.id;
            return (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => onChange({ ...value, urgency: u.id })}
                  className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {u.label}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Assignee
        </h3>
        <ul className="space-y-1">
          {ASSIGNEES.map((a) => {
            const active = value.assignee === a.id;
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => onChange({ ...value, assignee: a.id })}
                  className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {a.label}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}
