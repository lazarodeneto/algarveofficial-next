import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

import { POST } from "@/app/api/admin/cms/media-upload/route";
import { requireAdminWriteClient } from "@/lib/server/admin-auth";

vi.mock("@/lib/server/admin-auth", () => ({
  requireAdminWriteClient: vi.fn(),
  adminErrorResponse: (status: number, code: string, message: string) =>
    NextResponse.json({ ok: false, error: { code, message } }, { status }),
}));

const mockedRequireAdminWriteClient = vi.mocked(requireAdminWriteClient);

function mediaUploadRequest(formData: FormData) {
  return new NextRequest("http://localhost/api/admin/cms/media-upload", {
    method: "POST",
    body: formData,
  }) as unknown as Parameters<typeof POST>[0];
}

function validImageFormData(overrides?: { file?: File; pageId?: string; target?: string }) {
  const formData = new FormData();
  formData.set("file", overrides?.file ?? new File(["image"], "hero.webp", { type: "image/webp" }));
  formData.set("pageId", overrides?.pageId ?? "beaches");
  formData.set("target", overrides?.target ?? "image");
  return formData;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("admin CMS media upload route runtime", () => {
  it("requires admin write auth with service-role storage access", async () => {
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      error: NextResponse.json({ ok: false, error: { code: "AUTH_UNAUTHORIZED" } }, { status: 401 }),
    } as never);

    const response = await POST(mediaUploadRequest(validImageFormData()));

    expect(response.status).toBe(401);
    expect(mockedRequireAdminWriteClient).toHaveBeenCalledWith(
      expect.anything(),
      "Only admins can upload CMS page media.",
      expect.objectContaining({
        requireServiceRole: true,
      }),
    );
  });

  it("rejects unsupported hero image MIME types before uploading", async () => {
    const upload = vi.fn();
    const from = vi.fn(() => ({ upload }));
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { storage: { from } },
    } as never);

    const response = await POST(
      mediaUploadRequest(
        validImageFormData({
          file: new File(["gif"], "hero.gif", { type: "image/gif" }),
        }),
      ),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
    expect(upload).not.toHaveBeenCalled();
  });

  it("uploads valid images and returns a stable public URL payload", async () => {
    const upload = vi.fn().mockResolvedValue({ error: null });
    const getPublicUrl = vi.fn().mockReturnValue({
      data: {
        publicUrl:
          "https://niylxpvafywjonrphddp.supabase.co/storage/v1/object/public/media/cms/pages/beaches/hero/hero.webp",
      },
    });
    const from = vi.fn(() => ({ upload, getPublicUrl }));
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { storage: { from } },
    } as never);

    const response = await POST(mediaUploadRequest(validImageFormData()));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      data: expect.objectContaining({
        bucket: "media",
        contentType: "image/webp",
        mediaType: "image",
        publicUrl:
          "https://niylxpvafywjonrphddp.supabase.co/storage/v1/object/public/media/cms/pages/beaches/hero/hero.webp",
        target: "image",
        url: "https://niylxpvafywjonrphddp.supabase.co/storage/v1/object/public/media/cms/pages/beaches/hero/hero.webp",
      }),
    });
    expect(upload).toHaveBeenCalledWith(
      expect.stringMatching(/^cms\/pages\/beaches\/hero\/.+-image-hero\.webp$/),
      expect.any(Buffer),
      expect.objectContaining({
        cacheControl: "31536000",
        contentType: "image/webp",
        upsert: false,
      }),
    );
  });
});
