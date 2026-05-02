import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

import { POST as postEmailRoute, PATCH as patchEmailRoute } from "@/app/api/admin/email/[entity]/route";
import { POST as postGlobalSettingsRoute } from "@/app/api/admin/global-settings/route";
import { POST as postNavigationRoute, PUT as putNavigationRoute } from "@/app/api/admin/navigation/[menu]/route";
import { POST as postTaxonomyRoute, PUT as putTaxonomyRoute } from "@/app/api/admin/taxonomy/[entity]/route";
import { POST as postFooterRoute, PUT as putFooterRoute } from "@/app/api/admin/footer/[entity]/route";
import { GET as getCmsDocumentsRoute } from "@/app/api/admin/cms/documents/route";
import { GET as getListingsRoute, PATCH as patchListingsRoute } from "@/app/api/admin/listings/route";
import { PATCH as patchListingRoute } from "@/app/api/admin/listings/[listingId]/route";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";
import { requireAdminReadClient, requireAdminSession, requireAdminWriteClient } from "@/lib/server/admin-auth";
import { syncCmsDocumentsFromGlobalSettings } from "@/lib/cms/server-persistence";
import { createServiceRoleClient } from "@/lib/supabase/service";

vi.mock("@/lib/server/admin-auth", () => ({
  requireAdminSession: vi.fn(),
  requireAdminWriteClient: vi.fn(),
  requireAdminReadClient: vi.fn(),
  adminErrorResponse: (status: number, code: string, message: string) =>
    NextResponse.json({ ok: false, error: { code, message } }, { status }),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceRoleClient: vi.fn(),
}));

vi.mock("@/lib/cms/server-persistence", () => ({
  syncCmsDocumentsFromGlobalSettings: vi.fn(),
}));

const mockedRequireAdminSession = vi.mocked(requireAdminSession);
const mockedRequireAdminWriteClient = vi.mocked(requireAdminWriteClient);
const mockedRequireAdminReadClient = vi.mocked(requireAdminReadClient);
const mockedSyncCmsDocuments = vi.mocked(syncCmsDocumentsFromGlobalSettings);
const mockedCreateServiceRoleClient = vi.mocked(createServiceRoleClient);

function jsonRequest(body: unknown, method = "POST") {
  return new Request("http://localhost/api/test", {
    method,
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

  it("returns 500 when cms sync fails for cms payloads", async () => {
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { from: vi.fn() } as never,
    });
    mockedSyncCmsDocuments.mockRejectedValueOnce(new Error("cms write failed"));

    const response = await postGlobalSettingsRoute(
      jsonRequest({
        locale: "en-US",
        settings: [
          {
            key: CMS_GLOBAL_SETTING_KEYS.pageConfigs,
            value: JSON.stringify({ experiences: { blocks: { "featured-city-hub": { data: { cityId: "abc" } } } } }),
            category: "cms",
          },
        ],
      }),
    );
    const payload = (await response.json()) as { ok?: boolean; error?: { code?: string } };

    expect(response.status).toBe(500);
    expect(payload.ok).toBe(false);
    expect(payload.error?.code).toBe("CMS_SYNC_FAILED");
    expect(mockedSyncCmsDocuments).toHaveBeenCalledTimes(1);
    expect(mockedSyncCmsDocuments).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining([
        expect.objectContaining({
          key: CMS_GLOBAL_SETTING_KEYS.pageConfigs,
          locale: "en",
        }),
      ]),
    );
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
    const docsEq = vi.fn().mockResolvedValue({
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
    });
    const docsRange = vi.fn(() => ({ eq: docsEq }));
    const docsOrder = vi.fn(() => ({ range: docsRange }));
    const documentQuery = {
      select: vi.fn(() => ({
        order: docsOrder,
      })),
    };
    const versionsLimit = vi.fn().mockResolvedValue({
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
    });
    const versionsOrder = vi.fn(() => ({ limit: versionsLimit }));
    const versionsEq = vi.fn(() => ({ order: versionsOrder }));
    const versionsQuery = {
      select: vi.fn(() => ({
        eq: versionsEq,
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
      getRequest("/api/admin/cms/documents?page_id=home&include_versions=true&version_limit=1"),
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      data?: Array<{ versions?: unknown[] }>;
      meta?: { version_limit?: number; request_id?: string };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data?.[0]?.versions).toHaveLength(1);
    expect(payload.meta?.version_limit).toBe(1);
    expect(typeof payload.meta?.request_id).toBe("string");
    expect(from).toHaveBeenCalledWith("cms_documents");
    expect(from).toHaveBeenCalledWith("cms_document_versions");
    expect(docsRange).toHaveBeenCalledWith(0, 49);
    expect(versionsEq).toHaveBeenCalledWith("document_id", 1);
    expect(versionsOrder).toHaveBeenCalledWith("version", { ascending: false });
    expect(versionsLimit).toHaveBeenCalledWith(1);
  });

  it("returns request_id in error payload when cms document read fails", async () => {
    const docsEq = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "boom" },
    });
    const docsRange = vi.fn(() => ({ eq: docsEq }));
    const docsOrder = vi.fn(() => ({ range: docsRange }));
    const from = vi.fn(() => ({
      select: vi.fn(() => ({ order: docsOrder })),
    }));

    mockedRequireAdminReadClient.mockResolvedValueOnce({
      userId: "admin-1",
      readClient: { from } as never,
    });

    const response = await getCmsDocumentsRoute(
      getRequest("/api/admin/cms/documents?page_id=home"),
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      error?: { code?: string; request_id?: string };
    };

    expect(response.status).toBe(500);
    expect(payload.ok).toBe(false);
    expect(payload.error?.code).toBe("CMS_DOCUMENTS_READ_FAILED");
    expect(typeof payload.error?.request_id).toBe("string");
  });

  it("returns request_id in error payload when cms version read fails", async () => {
    const docsEq = vi.fn().mockResolvedValue({
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
    });
    const docsRange = vi.fn(() => ({ eq: docsEq }));
    const docsOrder = vi.fn(() => ({ range: docsRange }));
    const versionsLimit = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "version boom" },
    });
    const versionsOrder = vi.fn(() => ({ limit: versionsLimit }));
    const versionsEq = vi.fn(() => ({ order: versionsOrder }));

    const from = vi.fn((table: string) => {
      if (table === "cms_documents") {
        return { select: vi.fn(() => ({ order: docsOrder })) };
      }
      if (table === "cms_document_versions") {
        return { select: vi.fn(() => ({ eq: versionsEq })) };
      }
      throw new Error(`Unexpected table ${table}`);
    });

    mockedRequireAdminReadClient.mockResolvedValueOnce({
      userId: "admin-1",
      readClient: { from } as never,
    });

    const response = await getCmsDocumentsRoute(
      getRequest("/api/admin/cms/documents?page_id=home&include_versions=true"),
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      error?: { code?: string; request_id?: string };
    };

    expect(response.status).toBe(500);
    expect(payload.ok).toBe(false);
    expect(payload.error?.code).toBe("CMS_DOCUMENT_VERSIONS_READ_FAILED");
    expect(typeof payload.error?.request_id).toBe("string");
    expect(versionsEq).toHaveBeenCalledWith("document_id", 1);
  });
});

describe("admin listings route runtime", () => {
  it("rejects non-admin listing reads before creating a service-role client", async () => {
    mockedRequireAdminSession.mockResolvedValueOnce({
      error: NextResponse.json({ ok: false, error: { message: "Forbidden" } }, { status: 403 }),
    });

    const response = await getListingsRoute(
      getRequest("/api/admin/listings") as unknown as Parameters<typeof getListingsRoute>[0],
    );

    expect(response.status).toBe(403);
    expect(mockedCreateServiceRoleClient).not.toHaveBeenCalled();
  });

  it("uses service-role visibility for admin listing reads", async () => {
    const defaultOwnerListing = {
      id: "1ac08644-4707-48d3-8cb8-32e0f5237ec5",
      name: "Golf Clubs Rental Algarve",
      slug: "golf-clubs-rental-algarve-lagos",
      tier: "unverified",
      status: "published",
      is_curated: false,
      featured_rank: null,
      city: { id: "city-lagos", name: "Lagos" },
      category: { id: "cat-golf", name: "Golf" },
      region: null,
    };
    const range = vi.fn().mockResolvedValue({ data: [defaultOwnerListing], count: 1201, error: null });
    const secondOrder = vi.fn(() => ({ range }));
    const firstOrder = vi.fn(() => ({ order: secondOrder }));
    const select = vi.fn(() => ({ order: firstOrder }));
    const serviceFrom = vi.fn(() => ({ select }));
    const userFrom = vi.fn();

    mockedRequireAdminSession.mockResolvedValueOnce({
      userId: "admin-1",
      userClient: { from: userFrom } as never,
    });
    mockedCreateServiceRoleClient.mockReturnValueOnce({ from: serviceFrom } as never);

    const response = await getListingsRoute(
      getRequest("/api/admin/listings") as unknown as Parameters<typeof getListingsRoute>[0],
    );
    const payload = (await response.json()) as { ok?: boolean; data?: Array<{ name?: string }> };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data?.[0]?.name).toBe("Golf Clubs Rental Algarve");
    expect(serviceFrom).toHaveBeenCalledWith("listings");
    expect(userFrom).not.toHaveBeenCalled();
    expect(select).toHaveBeenCalledWith(
      expect.stringContaining("category:categories(id, name)"),
      { count: "exact" },
    );
    expect(select).toHaveBeenCalledWith(expect.stringContaining("featured_image_url"), { count: "exact" });
    expect(select).toHaveBeenCalledWith(expect.stringContaining("website_url"), { count: "exact" });
    expect(select).toHaveBeenCalledWith(expect.stringContaining("latitude"), { count: "exact" });
    expect(payload).toEqual(expect.objectContaining({ total: 1201, page: 1, pageSize: 50, totalPages: 25 }));
    expect(range).toHaveBeenCalledWith(0, 49);
  });

  it("reads later admin listing pages with exact totals instead of loading every row", async () => {
    const laterPageListing = {
      id: "1ac08644-4707-48d3-8cb8-32e0f5237ec5",
      name: "Golf Clubs Rental Algarve",
    };
    const range = vi.fn().mockResolvedValue({ data: [laterPageListing], count: 1201, error: null });
    const secondOrder = vi.fn(() => ({ range }));
    const firstOrder = vi.fn(() => ({ order: secondOrder }));
    const select = vi.fn(() => ({ order: firstOrder }));
    const serviceFrom = vi.fn(() => ({ select }));

    mockedRequireAdminSession.mockResolvedValueOnce({
      userId: "admin-1",
      userClient: { from: vi.fn() } as never,
    });
    mockedCreateServiceRoleClient.mockReturnValueOnce({ from: serviceFrom } as never);

    const response = await getListingsRoute(
      getRequest("/api/admin/listings?page=21&pageSize=50") as unknown as Parameters<typeof getListingsRoute>[0],
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      data?: Array<{ name?: string }>;
      total?: number;
      page?: number;
      pageSize?: number;
      totalPages?: number;
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data).toHaveLength(1);
    expect(payload.data?.[0]?.name).toBe("Golf Clubs Rental Algarve");
    expect(payload.total).toBe(1201);
    expect(payload.page).toBe(21);
    expect(payload.pageSize).toBe(50);
    expect(payload.totalPages).toBe(25);
    expect(payload.hasNextPage).toBe(true);
    expect(payload.hasPreviousPage).toBe(true);
    expect(range).toHaveBeenCalledTimes(1);
    expect(range).toHaveBeenCalledWith(1000, 1049);
  });

  it("applies admin listing search on the service-role query", async () => {
    const elsListing = {
      id: "1ac08644-4707-48d3-8cb8-32e0f5237ec5",
      name: "The Els Club Vilamoura",
      slug: "the-els-club-vilamoura",
    };
    const range = vi.fn().mockResolvedValue({ data: [elsListing], count: 1, error: null });
    const secondOrder = vi.fn(() => ({ range }));
    const firstOrder = vi.fn(() => ({ order: secondOrder }));
    const ilike = vi.fn(() => ({ order: firstOrder }));
    const select = vi.fn(() => ({ ilike, order: firstOrder }));
    const serviceFrom = vi.fn(() => ({ select }));

    mockedRequireAdminSession.mockResolvedValueOnce({
      userId: "admin-1",
      userClient: { from: vi.fn() } as never,
    });
    mockedCreateServiceRoleClient.mockReturnValueOnce({ from: serviceFrom } as never);

    const response = await getListingsRoute(
      getRequest("/api/admin/listings?search=ELS") as unknown as Parameters<typeof getListingsRoute>[0],
    );
    const payload = (await response.json()) as { ok?: boolean; data?: Array<{ name?: string }> };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data?.[0]?.name).toBe("The Els Club Vilamoura");
    expect(ilike).toHaveBeenCalledWith("name", "%ELS%");
  });

  it("uses requester-scoped client for bulk publish updates", async () => {
    const bulkIn = vi.fn().mockResolvedValue({ error: null });
    const bulkUpdate = vi.fn(() => ({ in: bulkIn }));
    const userFrom = vi.fn(() => ({ update: bulkUpdate }));
    const writeFrom = vi.fn(() => ({ update: vi.fn() }));

    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      userClient: { from: userFrom } as never,
      writeClient: { from: writeFrom } as never,
    });

    const response = await patchListingsRoute(
      jsonRequest(
        { action: "bulk-publish", ids: ["listing-1"] },
        "PATCH",
      ) as unknown as Parameters<typeof patchListingsRoute>[0],
    );
    const payload = (await response.json()) as { ok?: boolean; count?: number };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.count).toBe(1);
    expect(userFrom).toHaveBeenCalledWith("listings");
    expect(writeFrom).not.toHaveBeenCalled();
    expect(bulkUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "published",
      }),
    );
    expect(bulkIn).toHaveBeenCalledWith("id", ["listing-1"]);
  });

  it("uses requester-scoped client for single listing publish updates", async () => {
    const updateEq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq: updateEq }));
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { id: "listing-1", status: "published" },
      error: null,
    });
    const selectEq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq: selectEq }));
    const userFrom = vi.fn(() => ({ update, select }));
    const writeFrom = vi.fn(() => ({ update: vi.fn(), select: vi.fn() }));

    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      userClient: { from: userFrom } as never,
      writeClient: { from: writeFrom } as never,
    });

    const response = await patchListingRoute(
      jsonRequest({ status: "published" }, "PATCH") as unknown as Parameters<typeof patchListingRoute>[0],
      { params: Promise.resolve({ listingId: "listing-1" }) },
    );
    const payload = (await response.json()) as { ok?: boolean; data?: { status?: string } };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data?.status).toBe("published");
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "published",
      }),
    );
    expect(updateEq).toHaveBeenCalledWith("id", "listing-1");
    expect(select).toHaveBeenCalledWith("*");
    expect(writeFrom).not.toHaveBeenCalled();
  });
});
