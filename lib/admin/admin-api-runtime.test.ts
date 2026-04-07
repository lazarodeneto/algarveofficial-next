import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

import { POST as postEmailRoute, PATCH as patchEmailRoute } from "@/app/api/admin/email/[entity]/route";
import { POST as postGlobalSettingsRoute } from "@/app/api/admin/global-settings/route";
import { POST as postNavigationRoute, PUT as putNavigationRoute } from "@/app/api/admin/navigation/[menu]/route";
import { POST as postTaxonomyRoute, PUT as putTaxonomyRoute } from "@/app/api/admin/taxonomy/[entity]/route";
import { POST as postFooterRoute, PUT as putFooterRoute } from "@/app/api/admin/footer/[entity]/route";
import { GET as getCmsDocumentsRoute } from "@/app/api/admin/cms/documents/route";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";
import { requireAdminReadClient, requireAdminWriteClient } from "@/lib/server/admin-auth";
import { syncCmsDocumentsFromGlobalSettings } from "@/lib/cms/server-persistence";

vi.mock("@/lib/server/admin-auth", () => ({
  requireAdminWriteClient: vi.fn(),
  requireAdminReadClient: vi.fn(),
  adminErrorResponse: (status: number, code: string, message: string) =>
    NextResponse.json({ ok: false, error: { code, message } }, { status }),
}));

vi.mock("@/lib/cms/server-persistence", () => ({
  syncCmsDocumentsFromGlobalSettings: vi.fn(),
}));

const mockedRequireAdminWriteClient = vi.mocked(requireAdminWriteClient);
const mockedRequireAdminReadClient = vi.mocked(requireAdminReadClient);
const mockedSyncCmsDocuments = vi.mocked(syncCmsDocumentsFromGlobalSettings);

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof postGlobalSettingsRoute>[0];
}

function getRequest(pathnameWithQuery: string) {
  return new NextRequest(`http://localhost${pathnameWithQuery}`, {
    method: "GET",
  }) as unknown as Parameters<typeof getCmsDocumentsRoute>[0];
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

  it("still persists non-cms settings for non-default locale payloads", async () => {
    const select = vi.fn().mockResolvedValue({
      data: [{ key: "site_name", value: "Nome", category: "site" }],
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
        locale: "pt-pt",
        settings: [
          { key: "site_name", value: "Nome", category: "site" },
          {
            key: CMS_GLOBAL_SETTING_KEYS.textOverrides,
            value: JSON.stringify({ "home.hero.title": "Olá" }),
            category: "cms",
          },
        ],
      }),
    );
    const payload = (await response.json()) as { ok?: boolean; data?: Array<{ key: string }> };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data).toEqual([{ key: "site_name", value: "Nome", category: "site" }]);
    expect(from).toHaveBeenCalledWith("global_settings");
    expect(upsert).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ key: "site_name", value: "Nome" })]),
      { onConflict: "key" },
    );
    expect(mockedSyncCmsDocuments).toHaveBeenCalledTimes(1);
  });
});

describe("admin navigation route runtime", () => {
  it("returns auth error response when write auth fails", async () => {
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      error: NextResponse.json({ ok: false, error: { message: "Unauthorized" } }, { status: 401 }),
    });

    const response = await postNavigationRoute(
      jsonRequest({ name: "Home", href: "/home", icon: "Home" }),
      { params: Promise.resolve({ menu: "header" }) },
    );

    expect(response.status).toBe(401);
  });

  it("creates navigation menu items with incremented display_order", async () => {
    const existingSelect = vi.fn(() => ({
      order: vi.fn(() => ({
        limit: vi.fn().mockResolvedValue({
          data: [{ display_order: 4 }],
          error: null,
        }),
      })),
    }));
    const insertSingle = vi.fn().mockResolvedValue({
      data: { id: "nav-1", name: "Stay", display_order: 5 },
      error: null,
    });
    const insertSelect = vi.fn(() => ({ single: insertSingle }));
    const insert = vi.fn(() => ({ select: insertSelect }));
    const from = vi.fn(() => ({
      select: existingSelect,
      insert,
    }));

    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { from } as never,
    });

    const response = await postNavigationRoute(
      jsonRequest({ name: "Stay", href: "/stay", icon: "BedDouble" }),
      { params: Promise.resolve({ menu: "header" }) },
    );
    const payload = (await response.json()) as { ok?: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(from).toHaveBeenCalledWith("header_menu_items");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Stay",
        href: "/stay",
        icon: "BedDouble",
        display_order: 5,
      }),
    );
  });

  it("returns 400 for invalid reorder payload", async () => {
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { from: vi.fn() } as never,
    });

    const response = await putNavigationRoute(
      jsonRequest({ orderedIds: [] }),
      { params: Promise.resolve({ menu: "header" }) },
    );
    const payload = (await response.json()) as { error?: { code?: string } };

    expect(response.status).toBe(400);
    expect(payload.error?.code).toBe("INVALID_ORDER");
  });
});

describe("admin taxonomy route runtime", () => {
  it("returns auth error response when write auth fails", async () => {
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      error: NextResponse.json({ ok: false, error: { message: "Unauthorized" } }, { status: 401 }),
    });

    const response = await postTaxonomyRoute(
      jsonRequest({ name: "Lagos", slug: "lagos" }),
      { params: Promise.resolve({ entity: "cities" }) },
    );

    expect(response.status).toBe(401);
  });

  it("creates taxonomy items with incremented display_order", async () => {
    const select = vi.fn(() => ({
      order: vi.fn(() => ({
        limit: vi.fn().mockResolvedValue({
          data: [{ display_order: 7 }],
          error: null,
        }),
      })),
    }));
    const single = vi.fn().mockResolvedValue({
      data: { id: "city-1", name: "Lagos", display_order: 8 },
      error: null,
    });
    const insert = vi.fn(() => ({ select: vi.fn(() => ({ single })) }));
    const from = vi.fn(() => ({ select, insert }));

    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { from } as never,
    });

    const response = await postTaxonomyRoute(
      jsonRequest({ name: "Lagos", slug: "lagos" }),
      { params: Promise.resolve({ entity: "cities" }) },
    );
    const payload = (await response.json()) as { ok?: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(from).toHaveBeenCalledWith("cities");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Lagos", slug: "lagos", display_order: 8 }),
    );
  });

  it("returns 400 for invalid reorder payload", async () => {
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { from: vi.fn() } as never,
    });

    const response = await putTaxonomyRoute(
      jsonRequest({ orderedIds: [] }),
      { params: Promise.resolve({ entity: "cities" }) },
    );
    const payload = (await response.json()) as { error?: { code?: string } };

    expect(response.status).toBe(400);
    expect(payload.error?.code).toBe("INVALID_ORDER");
  });
});

describe("admin footer route runtime", () => {
  it("returns auth error response when write auth fails", async () => {
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      error: NextResponse.json({ ok: false, error: { message: "Unauthorized" } }, { status: 401 }),
    });

    const response = await postFooterRoute(
      jsonRequest({ title: "Explore", slug: "explore" }),
      { params: Promise.resolve({ entity: "sections" }) },
    );

    expect(response.status).toBe(401);
  });

  it("creates footer sections with incremented display_order", async () => {
    const select = vi.fn(() => ({
      order: vi.fn(() => ({
        limit: vi.fn().mockResolvedValue({
          data: [{ display_order: 3 }],
          error: null,
        }),
      })),
    }));
    const single = vi.fn().mockResolvedValue({
      data: { id: "footer-sec-1", title: "Explore", display_order: 4 },
      error: null,
    });
    const insert = vi.fn(() => ({ select: vi.fn(() => ({ single })) }));
    const from = vi.fn(() => ({ select, insert }));

    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { from } as never,
    });

    const response = await postFooterRoute(
      jsonRequest({ title: "Explore", slug: "explore" }),
      { params: Promise.resolve({ entity: "sections" }) },
    );
    const payload = (await response.json()) as { ok?: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(from).toHaveBeenCalledWith("footer_sections");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Explore", slug: "explore", display_order: 4 }),
    );
  });

  it("returns 400 for invalid footer reorder payload", async () => {
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { from: vi.fn() } as never,
    });

    const response = await putFooterRoute(
      jsonRequest({ orderedIds: [] }),
      { params: Promise.resolve({ entity: "sections" }) },
    );
    const payload = (await response.json()) as { error?: { code?: string } };

    expect(response.status).toBe(400);
    expect(payload.error?.code).toBe("INVALID_ORDER");
  });
});

describe("admin cms documents route runtime", () => {
  it("returns auth error response when write auth fails", async () => {
    mockedRequireAdminReadClient.mockResolvedValueOnce({
      error: NextResponse.json({ ok: false, error: { message: "Unauthorized" } }, { status: 401 }),
    });

    const response = await getCmsDocumentsRoute(getRequest("/api/admin/cms/documents"));
    expect(response.status).toBe(401);
  });

  it("returns 400 for invalid doc_type filter", async () => {
    mockedRequireAdminReadClient.mockResolvedValueOnce({
      userId: "admin-1",
      readClient: { from: vi.fn() } as never,
    });

    const response = await getCmsDocumentsRoute(
      getRequest("/api/admin/cms/documents?doc_type=unknown"),
    );
    const payload = (await response.json()) as { error?: { code?: string } };

    expect(response.status).toBe(400);
    expect(payload.error?.code).toBe("INVALID_DOC_TYPE");
  });

  it("returns documents with versions when include_versions=true", async () => {
    const documentQuery = {
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 1,
                  page_id: "home",
                  block_id: null,
                  locale: "pt-pt",
                  doc_type: "page_config",
                  status: "published",
                  current_version_id: 11,
                  created_at: "2026-01-01T00:00:00.000Z",
                  updated_at: "2026-01-02T00:00:00.000Z",
                },
              ],
              error: null,
            }),
          })),
        })),
      })),
    };
    const versionsQuery = {
      select: vi.fn(() => ({
        in: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 11,
                document_id: 1,
                version: 3,
                content: { text: { "hero.title": "Olá" } },
                created_at: "2026-01-02T00:00:00.000Z",
                created_by: null,
              },
            ],
            error: null,
          }),
        })),
      })),
    };

    const from = vi.fn((table: string) => {
      if (table === "cms_documents") return documentQuery;
      if (table === "cms_document_versions") return versionsQuery;
      throw new Error(`Unexpected table ${table}`);
    });

    mockedRequireAdminReadClient.mockResolvedValueOnce({
      userId: "admin-1",
      readClient: { from } as never,
    });

    const response = await getCmsDocumentsRoute(
      getRequest("/api/admin/cms/documents?page_id=home&include_versions=true"),
    );
    const payload = (await response.json()) as { ok?: boolean; data?: Array<{ versions?: unknown[] }> };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data?.[0]?.versions).toHaveLength(1);
    expect(from).toHaveBeenCalledWith("cms_documents");
    expect(from).toHaveBeenCalledWith("cms_document_versions");
  });
});
