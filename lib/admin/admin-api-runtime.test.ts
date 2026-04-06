import { afterEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

import { POST as postEmailRoute, PATCH as patchEmailRoute } from "@/app/api/admin/email/[entity]/route";
import { POST as postGlobalSettingsRoute } from "@/app/api/admin/global-settings/route";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";
import { requireAdminWriteClient } from "@/lib/server/admin-auth";
import { syncCmsDocumentsFromGlobalSettings } from "@/lib/cms/server-persistence";

vi.mock("@/lib/server/admin-auth", () => ({
  requireAdminWriteClient: vi.fn(),
  adminErrorResponse: (status: number, code: string, message: string) =>
    NextResponse.json({ ok: false, error: { code, message } }, { status }),
}));

vi.mock("@/lib/cms/server-persistence", () => ({
  syncCmsDocumentsFromGlobalSettings: vi.fn(),
}));

const mockedRequireAdminWriteClient = vi.mocked(requireAdminWriteClient);
const mockedSyncCmsDocuments = vi.mocked(syncCmsDocumentsFromGlobalSettings);

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof postGlobalSettingsRoute>[0];
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("admin email route runtime", () => {
  it("returns auth error response when write auth fails", async () => {
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      error: NextResponse.json({ ok: false, error: { message: "Unauthorized" } }, { status: 401 }),
    });

    const response = await postEmailRoute(
      jsonRequest({ name: "Template A" }),
      { params: Promise.resolve({ entity: "templates" }) },
    );

    expect(response.status).toBe(401);
  });

  it("creates template records with created_by from authenticated admin context", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "tpl-1", name: "Template A", created_by: "admin-1" },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const from = vi.fn(() => ({ insert }));

    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { from } as never,
    });

    const response = await postEmailRoute(
      jsonRequest({ name: "Template A", subject: "Hello", html_content: "<p>Hi</p>" }),
      { params: Promise.resolve({ entity: "templates" }) },
    );
    const payload = (await response.json()) as { ok?: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(from).toHaveBeenCalledWith("email_templates");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Template A", created_by: "admin-1" }),
    );
  });

  it("returns 400 for patch requests missing id", async () => {
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { from: vi.fn() } as never,
    });

    const response = await patchEmailRoute(
      jsonRequest({ name: "Updated" }),
      { params: Promise.resolve({ entity: "templates" }) },
    );
    const payload = (await response.json()) as { error?: { code?: string } };

    expect(response.status).toBe(400);
    expect(payload.error?.code).toBe("INVALID_ITEM_ID");
  });
});

describe("admin global settings route runtime", () => {
  it("writes default-locale settings to global_settings and syncs cms documents", async () => {
    const select = vi.fn().mockResolvedValue({
      data: [{ key: "site_name", value: "AlgarveOfficial", category: "site" }],
      error: null,
    });
    const upsert = vi.fn(() => ({ select }));
    const from = vi.fn(() => ({ upsert }));

    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { from } as never,
    });
    mockedSyncCmsDocuments.mockResolvedValueOnce(undefined);

    const response = await postGlobalSettingsRoute(
      jsonRequest({
        settings: [{ key: "site_name", value: "AlgarveOfficial", category: "site" }],
      }),
    );
    const payload = (await response.json()) as { ok?: boolean; data?: Array<{ key: string }> };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data?.[0]?.key).toBe("site_name");
    expect(from).toHaveBeenCalledWith("global_settings");
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(mockedSyncCmsDocuments).toHaveBeenCalledTimes(1);
  });

  it("skips global_settings upsert for non-default locale when payload is cms-only", async () => {
    const from = vi.fn();

    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { from } as never,
    });
    mockedSyncCmsDocuments.mockResolvedValueOnce(undefined);

    const response = await postGlobalSettingsRoute(
      jsonRequest({
        locale: "pt-pt",
        settings: [
          {
            key: CMS_GLOBAL_SETTING_KEYS.pageConfigs,
            value: JSON.stringify({ home: { text: { "hero.title": "Olá" } } }),
            category: "cms",
          },
        ],
      }),
    );
    const payload = (await response.json()) as { ok?: boolean; data?: unknown[] };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data).toEqual([]);
    expect(from).not.toHaveBeenCalled();
    expect(mockedSyncCmsDocuments).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining([
        expect.objectContaining({
          key: CMS_GLOBAL_SETTING_KEYS.pageConfigs,
          locale: "pt-pt",
        }),
      ]),
    );
  });
});
