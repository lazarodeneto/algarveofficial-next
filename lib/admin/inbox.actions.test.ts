import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  approveInboxItem,
  archiveInboxNotification,
  archiveInboxItem,
  assignInboxItem,
  deleteInboxNotification,
  dismissInboxNotification,
  markInboxItemRead,
  markInboxItemReadState,
  markInboxItemUnreadState,
  rejectInboxItem,
  restoreInboxNotification,
} from "@/lib/admin/inbox/actions";
import { getFreshInboxSnapshot } from "@/lib/admin/inbox/aggregator";
import type { InboxItem, InboxSnapshot } from "@/lib/admin/inbox/types";
import { createClient as createCookieClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceRoleClient: vi.fn(),
}));

vi.mock("@/lib/admin/inbox/aggregator", () => ({
  getFreshInboxSnapshot: vi.fn(),
}));

const mockedCreateCookieClient = vi.mocked(createCookieClient);
const mockedCreateServiceRoleClient = vi.mocked(createServiceRoleClient);
const mockedGetFreshInboxSnapshot = vi.mocked(getFreshInboxSnapshot);

const SNAPSHOT_ITEM = {
  id: "claim:22222222-2222-4222-8222-222222222222",
  domain: "listings",
  source: "listing_claim",
  sourceRowId: "22222222-2222-4222-8222-222222222222",
  title: "Partner request: Test Business",
  summary: "Owner · owner@example.com",
  createdAt: "2026-05-13T08:00:00.000Z",
  owner: { id: "owner@example.com", name: "Owner" },
  assignee: null,
  isRead: false,
  readAt: null,
  status: "open",
  statusChangedAt: null,
  statusReason: null,
  sla: {
    dueAt: "2026-05-14T08:00:00.000Z",
    minutesRemaining: 120,
  },
  urgency: "soon",
  resolution: { primary: "reject", available: ["reject", "assign", "archive"] },
  meta: {
    claimId: "22222222-2222-4222-8222-222222222222",
    listingId: null,
    requestType: "claim-business",
    contactEmail: "owner@example.com",
  },
} satisfies InboxItem;

function snapshotWith(items: InboxItem[] = [SNAPSHOT_ITEM]): InboxSnapshot {
  return {
    items,
    counts: {
      total: items.filter((item) => item.status === "open").length,
      urgent: 0,
      soon: 1,
      normal: 0,
      archived: 0,
      resolved: 0,
      dismissed: 0,
      byStatus: {
        open: items.filter((item) => item.status === "open").length,
        archived: 0,
        resolved: 0,
        dismissed: 0,
      },
      byDomain: {
        listings: items.length,
        reviews: 0,
        events: 0,
        billing: 0,
        translations: 0,
        system: 0,
      },
    },
    errors: [],
    generatedAt: "2026-05-13T08:00:00.000Z",
  };
}

function mockAdminSession() {
  mockedCreateCookieClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "11111111-1111-4111-8111-111111111111" } },
        error: null,
      }),
    },
    rpc: vi.fn().mockResolvedValue({ data: "admin", error: null }),
  } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAdminSession();
  mockedGetFreshInboxSnapshot.mockResolvedValue(snapshotWith());
});

describe("admin inbox actions", () => {
  it("rejects invalid sources before touching privileged write clients", async () => {
    const result = await approveInboxItem({
      source: "billing_alert" as never,
      sourceRowId: "22222222-2222-4222-8222-222222222222",
    });

    expect(result).toEqual({ ok: false, error: "Invalid inbox source." });
    expect(mockedCreateServiceRoleClient).not.toHaveBeenCalled();
  });

  it("requires UUID source row ids", async () => {
    const result = await approveInboxItem({
      source: "listing_moderation",
      sourceRowId: "not-a-uuid",
    });

    expect(result).toEqual({ ok: false, error: "sourceRowId must be a valid UUID." });
    expect(mockedCreateServiceRoleClient).not.toHaveBeenCalled();
  });

  it("only assigns inbox items to admins", async () => {
    const from = vi.fn();
    const rpc = vi.fn().mockResolvedValue({ data: "owner", error: null });
    mockedCreateServiceRoleClient.mockReturnValue({ from, rpc } as never);

    const result = await assignInboxItem({
      source: "listing_moderation",
      sourceRowId: "22222222-2222-4222-8222-222222222222",
      assigneeId: "33333333-3333-4333-8333-333333333333",
    });

    expect(result).toEqual({
      ok: false,
      error: "Inbox items can only be assigned to admins.",
    });
    expect(rpc).toHaveBeenCalledWith("get_user_role", {
      _user_id: "33333333-3333-4333-8333-333333333333",
    });
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects pending partner claims through the inbox action path", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { id: "22222222-2222-4222-8222-222222222222" },
      error: null,
    });
    const select = vi.fn(() => ({ maybeSingle }));
    const secondEq = vi.fn(() => ({ select }));
    const firstEq = vi.fn(() => ({ eq: secondEq }));
    const update = vi.fn(() => ({ eq: firstEq }));
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn((table: string) => (table === "listing_claims" ? { update } : { upsert }));
    mockedCreateServiceRoleClient.mockReturnValue({ from } as never);

    const result = await rejectInboxItem({
      source: "listing_claim",
      sourceRowId: "22222222-2222-4222-8222-222222222222",
      reason: "Unable to verify this request.",
    });

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("listing_claims");
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "rejected",
        rejection_reason: "Unable to verify this request.",
      }),
    );
    expect(firstEq).toHaveBeenCalledWith("id", "22222222-2222-4222-8222-222222222222");
    expect(secondEq).toHaveBeenCalledWith("status", "pending");
    expect(from).toHaveBeenCalledWith("admin_inbox_archives");
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "listing_claim",
        source_row_id: "22222222-2222-4222-8222-222222222222",
        status: "resolved",
        reason: "rejected_from_inbox",
        item_snapshot: SNAPSHOT_ITEM,
      }),
      { onConflict: "source,source_row_id" },
    );
  });

  it("does not archive derived system alerts that must be resolved at source", async () => {
    const result = await archiveInboxItem({
      source: "external_outbox_alert",
      sourceRowId: "22222222-2222-4222-8222-222222222222",
    });

    expect(result).toEqual({
      ok: false,
      error: "This inbox item must be resolved in its source system.",
    });
    expect(mockedCreateServiceRoleClient).not.toHaveBeenCalled();
  });

  it("marks derived system alerts as read through the inbox side table", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({ upsert }));
    mockedCreateServiceRoleClient.mockReturnValue({ from } as never);

    const result = await markInboxItemRead({
      source: "external_outbox_alert",
      sourceRowId: "22222222-2222-4222-8222-222222222222",
      reason: "clear_alert",
    });

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("admin_inbox_archives");
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "external_outbox_alert",
        source_row_id: "22222222-2222-4222-8222-222222222222",
        archived_by: "11111111-1111-4111-8111-111111111111",
        reason: "clear_alert",
      }),
      { onConflict: "source,source_row_id" },
    );
  });

  it("archives any derived notification from the list without changing the source row", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({ upsert }));
    mockedCreateServiceRoleClient.mockReturnValue({ from } as never);

    const result = await archiveInboxNotification({
      source: "translation_job",
      sourceRowId: "22222222-2222-4222-8222-222222222222",
    });

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("admin_inbox_archives");
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "translation_job",
        source_row_id: "22222222-2222-4222-8222-222222222222",
        archived_by: "11111111-1111-4111-8111-111111111111",
        reason: "archived_from_list",
      }),
      { onConflict: "source,source_row_id" },
    );
  });

  it("deletes an inbox notification by suppressing it in the archive side table", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({ upsert }));
    mockedCreateServiceRoleClient.mockReturnValue({ from } as never);

    const result = await deleteInboxNotification({
      source: "translation_job",
      sourceRowId: "22222222-2222-4222-8222-222222222222",
    });

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("admin_inbox_archives");
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "translation_job",
        source_row_id: "22222222-2222-4222-8222-222222222222",
        reason: "deleted_from_inbox",
      }),
      { onConflict: "source,source_row_id" },
    );
  });

  it("dismisses an inbox notification without deleting its source row", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({ upsert }));
    mockedCreateServiceRoleClient.mockReturnValue({ from } as never);

    const result = await dismissInboxNotification({
      source: "translation_job",
      sourceRowId: "22222222-2222-4222-8222-222222222222",
    });

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("admin_inbox_archives");
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "translation_job",
        source_row_id: "22222222-2222-4222-8222-222222222222",
        reason: "dismissed_from_inbox",
      }),
      { onConflict: "source,source_row_id" },
    );
  });

  it("restores an archived inbox notification by clearing the suppression row", async () => {
    const neq = vi.fn().mockResolvedValue({ error: null });
    const secondEq = vi.fn(() => ({ neq }));
    const firstEq = vi.fn(() => ({ eq: secondEq }));
    const deleteQuery = vi.fn(() => ({ eq: firstEq }));
    const from = vi.fn(() => ({ delete: deleteQuery }));
    mockedCreateServiceRoleClient.mockReturnValue({ from } as never);

    const result = await restoreInboxNotification({
      source: "listing_moderation",
      sourceRowId: "22222222-2222-4222-8222-222222222222",
    });

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("admin_inbox_archives");
    expect(deleteQuery).toHaveBeenCalled();
    expect(firstEq).toHaveBeenCalledWith("source", "listing_moderation");
    expect(secondEq).toHaveBeenCalledWith(
      "source_row_id",
      "22222222-2222-4222-8222-222222222222",
    );
    expect(neq).toHaveBeenCalledWith("reason", "read_from_list");
  });

  it("restores a legacy-encoded archived inbox notification", async () => {
    const neqCalls: Array<[string, string]> = [];
    const eqCalls: Array<[string, string]> = [];
    const makeDeleteChain = () => {
      const neq = vi.fn((column: string, value: string) => {
        neqCalls.push([column, value]);
        return Promise.resolve({ error: null });
      });
      const secondEq = vi.fn((column: string, value: string) => {
        eqCalls.push([column, value]);
        return { neq };
      });
      const firstEq = vi.fn((column: string, value: string) => {
        eqCalls.push([column, value]);
        return { eq: secondEq };
      });
      return { eq: firstEq };
    };
    const deleteQuery = vi.fn(makeDeleteChain);
    const from = vi.fn(() => ({ delete: deleteQuery }));
    mockedCreateServiceRoleClient.mockReturnValue({ from } as never);

    const result = await restoreInboxNotification({
      source: "translation_job",
      sourceRowId: "22222222-2222-4222-8222-222222222222",
    });

    expect(result).toEqual({ ok: true });
    expect(deleteQuery).toHaveBeenCalledTimes(2);
    expect(eqCalls).toContainEqual(["source", "translation_job"]);
    expect(eqCalls).toContainEqual(["source", "listing_moderation"]);
    expect(neqCalls).toContainEqual(["reason", "read_from_list"]);
    expect(neqCalls).toContainEqual(["reason", "read_from_list:translation_job"]);
  });

  it("marks an inbox row read through a non-hiding side-table reason", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({ upsert }));
    mockedCreateServiceRoleClient.mockReturnValue({ from } as never);

    const result = await markInboxItemReadState({
      source: "translation_job",
      sourceRowId: "22222222-2222-4222-8222-222222222222",
    });

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("admin_inbox_archives");
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "translation_job",
        source_row_id: "22222222-2222-4222-8222-222222222222",
        archived_by: "11111111-1111-4111-8111-111111111111",
        reason: "read_from_list",
      }),
      { onConflict: "source,source_row_id" },
    );
  });

  it("returns a migration-focused error when the inbox side-table source constraint is stale", async () => {
    const upsert = vi.fn().mockResolvedValue({
      error: {
        code: "23514",
        message:
          'new row for relation "admin_inbox_archives" violates check constraint "admin_inbox_archives_source_chk"',
      },
    });
    const from = vi.fn(() => ({ upsert }));
    mockedCreateServiceRoleClient.mockReturnValue({ from } as never);

    const result = await markInboxItemReadState({
      source: "translation_job",
      sourceRowId: "22222222-2222-4222-8222-222222222222",
    });

    expect(result).toEqual({
      ok: false,
      error:
        "Admin inbox action storage is out of date. Apply supabase/migrations/20260512110500_resync_admin_inbox_side_table_sources.sql and refresh the Supabase schema cache.",
    });
  });

  it("falls back to a legacy-compatible side-table source when a deployed constraint is stale", async () => {
    const upsert = vi
      .fn()
      .mockResolvedValueOnce({
        error: {
          code: "23514",
          message:
            'new row for relation "admin_inbox_archives" violates check constraint "admin_inbox_archives_source_chk"',
        },
      })
      .mockResolvedValueOnce({ error: null });
    const from = vi.fn(() => ({ upsert }));
    mockedCreateServiceRoleClient.mockReturnValue({ from } as never);

    const result = await markInboxItemReadState({
      source: "translation_job",
      sourceRowId: "22222222-2222-4222-8222-222222222222",
    });

    expect(result).toEqual({ ok: true });
    expect(upsert).toHaveBeenCalledTimes(2);
    expect(upsert).toHaveBeenLastCalledWith(
      expect.objectContaining({
        source: "listing_moderation",
        source_row_id: "22222222-2222-4222-8222-222222222222",
        reason: "read_from_list:translation_job",
      }),
      { onConflict: "source,source_row_id" },
    );
  });

  it("marks an inbox row unread by removing its read state", async () => {
    const thirdEq = vi.fn().mockResolvedValue({ error: null });
    const secondEq = vi.fn(() => ({ eq: thirdEq }));
    const firstEq = vi.fn(() => ({ eq: secondEq }));
    const deleteQuery = vi.fn(() => ({ eq: firstEq }));
    const from = vi.fn(() => ({ delete: deleteQuery }));
    mockedCreateServiceRoleClient.mockReturnValue({ from } as never);

    const result = await markInboxItemUnreadState({
      source: "translation_job",
      sourceRowId: "22222222-2222-4222-8222-222222222222",
    });

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("admin_inbox_archives");
    expect(deleteQuery).toHaveBeenCalled();
    expect(firstEq).toHaveBeenCalledWith("source", "translation_job");
    expect(secondEq).toHaveBeenCalledWith(
      "source_row_id",
      "22222222-2222-4222-8222-222222222222",
    );
    expect(thirdEq).toHaveBeenCalledWith("reason", "read_from_list");
  });

  it("marks a fallback-read inbox row unread when the side-table constraint is stale", async () => {
    const eqCalls: Array<[string, string]> = [];
    const makeDeleteChain = () => {
      const thirdEq = vi.fn((column: string, value: string) => {
        eqCalls.push([column, value]);
        return Promise.resolve({ error: null });
      });
      const secondEq = vi.fn((column: string, value: string) => {
        eqCalls.push([column, value]);
        return { eq: thirdEq };
      });
      const firstEq = vi.fn((column: string, value: string) => {
        eqCalls.push([column, value]);
        return { eq: secondEq };
      });
      return { eq: firstEq };
    };
    const deleteQuery = vi.fn(makeDeleteChain);
    const from = vi.fn(() => ({ delete: deleteQuery }));
    mockedCreateServiceRoleClient.mockReturnValue({ from } as never);

    const result = await markInboxItemUnreadState({
      source: "translation_job",
      sourceRowId: "22222222-2222-4222-8222-222222222222",
    });

    expect(result).toEqual({ ok: true });
    expect(deleteQuery).toHaveBeenCalledTimes(2);
    expect(eqCalls).toContainEqual(["source", "translation_job"]);
    expect(eqCalls).toContainEqual(["reason", "read_from_list"]);
    expect(eqCalls).toContainEqual(["source", "listing_moderation"]);
    expect(eqCalls).toContainEqual(["reason", "read_from_list:translation_job"]);
  });
});
