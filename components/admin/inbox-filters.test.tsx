import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InboxFilters } from "./inbox-filters";
import type { InboxFilterCounts } from "./inbox-filters-state";
import type { InboxFilters as InboxFiltersValue } from "@/lib/admin/inbox/types";

const counts: InboxFilterCounts = {
  total: 2,
  urgent: 1,
  soon: 1,
  normal: 0,
  assignedToMe: 0,
  byStatus: {
    open: 2,
    archived: 3,
    resolved: 0,
    dismissed: 1,
  },
  byDomain: {
    listings: 1,
    reviews: 0,
    events: 0,
    billing: 0,
    messages: 0,
    translations: 1,
    system: 0,
  },
};

describe("InboxFilters", () => {
  it("renders status filters with archived counts", () => {
    const onChange = vi.fn();
    const value: InboxFiltersValue = {
      status: "open",
      domain: "all",
      urgency: "all",
      assignee: "all",
    };

    render(<InboxFilters value={value} counts={counts} onChange={onChange} />);

    expect(screen.getByRole("button", { name: /open/i })).toHaveTextContent("2");
    expect(screen.getByRole("button", { name: /archived/i })).toHaveTextContent("3");
    expect(screen.getByRole("button", { name: /resolved/i })).toHaveTextContent("0");
    expect(screen.getByRole("button", { name: /dismissed/i })).toHaveTextContent("1");

    fireEvent.click(screen.getByRole("button", { name: /archived/i }));

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      status: "archived",
    });
  });
});
