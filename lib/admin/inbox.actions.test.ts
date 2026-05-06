import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  approveInboxItem,
  archiveInboxItem,
  assignInboxItem,
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
});
