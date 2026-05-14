import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";

import {
  CmsRuntimeGlobalSettingsError,
  fetchCmsRuntimeSettings,
  normalizeCmsRuntimeLocale,
} from "@/lib/cms/runtime-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

function parseRequestedKeys(request: NextRequest) {
  const direct = request.nextUrl.searchParams.getAll("key");
  if (direct.length > 0) {
    return [...new Set(direct.map((value) => value.trim()).filter(Boolean))];
  }

  const csv = request.nextUrl.searchParams.get("keys");
  if (!csv) return [];
  return [...new Set(csv.split(",").map((value) => value.trim()).filter(Boolean))];
}

export async function GET(request: NextRequest) {
  try {
    const draft = await draftMode();
    const data = await fetchCmsRuntimeSettings({
      requestedKeys: parseRequestedKeys(request),
      locale: normalizeCmsRuntimeLocale(request.nextUrl.searchParams.get("locale")),
      includeDraft: draft.isEnabled,
    });

    return NextResponse.json(
      {
        ok: true,
        data,
      },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    if (error instanceof CmsRuntimeGlobalSettingsError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: 500, headers: NO_STORE_HEADERS },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CMS_RUNTIME_READ_FAILED",
          message: "Failed to read CMS runtime settings.",
        },
      },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
