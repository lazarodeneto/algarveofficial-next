import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  approveInboxItem,
  archiveInboxNotification,
  archiveInboxItem,
  assignInboxItem,
  deleteInboxNotification,
  markInboxItemRead,
  markInboxItemReadState,
  markInboxItemUnreadState,
  rejectInboxItem,
} from "@/lib/admin/inbox/actions";
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

const mockedCreateCookieClient = vi.mocked(createCookieClient);
const mockedCreateServiceRoleClient = vi.mocked(createServiceRoleClient);

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
    const from = vi.fn(() => ({ update }));
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
