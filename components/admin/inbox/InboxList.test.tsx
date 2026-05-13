import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { InboxList } from "./InboxList";
import type { InboxItem, InboxStatus } from "@/lib/admin/inbox/types";

vi.mock("@/lib/admin/inbox/actions", () => ({
  archiveInboxNotification: vi.fn(),
  dismissInboxNotification: vi.fn(),
  markInboxItemReadState: vi.fn(),
  markInboxItemUnreadState: vi.fn(),
  restoreInboxNotification: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

function item(status: InboxStatus): InboxItem {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    domain: "listings",
    source: "listing_moderation",
    sourceRowId: "11111111-1111-4111-8111-111111111111",
    title: "Pending listing",
    summary: "Needs review",
    createdAt: "2026-05-13T10:00:00.000Z",
    owner: { id: "owner-1", name: "Owner" },
    assignee: null,
    isRead: false,
    readAt: null,
    status,
    statusChangedAt: status === "open" ? null : "2026-05-13T11:00:00.000Z",
    statusReason: status === "archived" ? "archived_from_list" : null,
    sla: {
      dueAt: "2026-05-13T12:00:00.000Z",
      minutesRemaining: 120,
    },
    urgency: "soon",
    resolution: { primary: "archive", available: ["archive", "assign"] },
    meta: {
      listingId: "11111111-1111-4111-8111-111111111111",
      slug: "pending-listing",
      categoryId: "category-1",
      cityId: "city-1",
    },
  };
}

function renderList(status: InboxStatus, items: InboxItem[]) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <InboxList
        items={items}
        selectedId={items[0]?.id ?? null}
        onSelect={vi.fn()}
        hasActiveFilters={false}
        isAssigneeFiltered={false}
        status={status}
        onClearFilters={vi.fn()}
        onActionComplete={vi.fn()}
        sourceErrors={[]}
        queryError={null}
      />
    </QueryClientProvider>,
  );
}

describe("InboxList", () => {
  it("shows archive controls only in the open inbox view", () => {
    renderList("open", [item("open")]);

    expect(screen.getByLabelText("Archive Pending listing")).toBeInTheDocument();
    expect(screen.queryByLabelText("Restore Pending listing to inbox")).not.toBeInTheDocument();
  });

  it("shows restore controls only in the archived inbox view", () => {
    renderList("archived", [item("archived")]);

    expect(screen.getByLabelText("Restore Pending listing to inbox")).toBeInTheDocument();
    expect(screen.queryByLabelText("Archive Pending listing")).not.toBeInTheDocument();
  });

  it("renders the archived empty state", () => {
    renderList("archived", []);

    expect(screen.getByText("No archived messages.")).toBeInTheDocument();
  });

  it("renders resolved messages without restore controls", () => {
    renderList("resolved", [item("resolved")]);

    expect(screen.getByText("Pending listing")).toBeInTheDocument();
    expect(screen.queryByLabelText("Restore Pending listing to inbox")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Archive Pending listing")).not.toBeInTheDocument();
  });
});
