import { describe, expect, it } from "vitest";

import { filterInboxItems, getInboxFilterCounts } from "./filtering";
import type { InboxItem, InboxStatus, InboxUrgency } from "./types";

function item(
  id: string,
  status: InboxStatus,
  urgency: InboxUrgency,
  domain: InboxItem["domain"] = "listings",
): InboxItem {
  return {
    id,
    domain,
    source: "listing_moderation",
    sourceRowId: id,
    title: id,
    summary: null,
    createdAt: "2026-05-13T10:00:00.000Z",
    owner: { id: "owner-1", name: "Owner" },
    assignee: null,
    isRead: false,
    readAt: null,
    status,
    statusChangedAt: status === "open" ? null : "2026-05-13T11:00:00.000Z",
    statusReason: status === "archived" ? "archived_from_list" : null,
    sla: {
      dueAt: "2026-05-14T10:00:00.000Z",
      minutesRemaining: urgency === "urgent" ? -5 : urgency === "soon" ? 120 : 900,
    },
    urgency,
    resolution: { primary: "archive", available: ["archive", "assign"] },
    meta: {
      listingId: id,
      slug: id,
      categoryId: "category-1",
      cityId: "city-1",
    },
  };
}

describe("admin inbox filtering", () => {
  it("keeps archived messages out of the default open inbox", () => {
    const items = [
      item("11111111-1111-4111-8111-111111111111", "open", "normal"),
      item("22222222-2222-4222-8222-222222222222", "archived", "urgent"),
    ];

    const visible = filterInboxItems(
      items,
      { status: "open", domain: "all", urgency: "all", assignee: "all" },
      null,
    );

    expect(visible.map((row) => row.id)).toEqual(["11111111-1111-4111-8111-111111111111"]);
  });

  it("returns archived messages only when the archived status filter is selected", () => {
    const items = [
      item("11111111-1111-4111-8111-111111111111", "open", "normal"),
      item("22222222-2222-4222-8222-222222222222", "archived", "urgent"),
      item("33333333-3333-4333-8333-333333333333", "dismissed", "soon"),
      item("44444444-4444-4444-8444-444444444444", "resolved", "normal"),
    ];

    const visible = filterInboxItems(
      items,
      { status: "archived", domain: "all", urgency: "all", assignee: "all" },
      null,
    );

    expect(visible.map((row) => row.id)).toEqual(["22222222-2222-4222-8222-222222222222"]);
  });

  it("returns resolved messages only when the resolved status filter is selected", () => {
    const items = [
      item("11111111-1111-4111-8111-111111111111", "open", "normal"),
      item("44444444-4444-4444-8444-444444444444", "resolved", "normal"),
    ];

    const visible = filterInboxItems(
      items,
      { status: "resolved", domain: "all", urgency: "all", assignee: "all" },
      null,
    );

    expect(visible.map((row) => row.id)).toEqual(["44444444-4444-4444-8444-444444444444"]);
  });

  it("computes urgency and domain counts within the selected status", () => {
    const items = [
      item("11111111-1111-4111-8111-111111111111", "open", "normal", "listings"),
      item("22222222-2222-4222-8222-222222222222", "archived", "urgent", "listings"),
      item("33333333-3333-4333-8333-333333333333", "archived", "soon", "translations"),
    ];

    const openCounts = getInboxFilterCounts(items, "open", null);
    const archivedCounts = getInboxFilterCounts(items, "archived", null);

    expect(openCounts.urgent).toBe(0);
    expect(openCounts.byStatus.archived).toBe(2);
    expect(archivedCounts.total).toBe(2);
    expect(archivedCounts.urgent).toBe(1);
    expect(archivedCounts.byDomain).toMatchObject({
      listings: 1,
      translations: 1,
    });
  });
});
