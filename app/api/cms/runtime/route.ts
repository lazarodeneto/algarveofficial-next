import { NextRequest, NextResponse } from "next/server";

import {
  CmsRuntimeGlobalSettingsError,
  fetchCmsRuntimeSettings,
  normalizeCmsRuntimeLocale,
} from "@/lib/cms/runtime-settings";

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
    const data = await fetchCmsRuntimeSettings({
      requestedKeys: parseRequestedKeys(request),
      locale: normalizeCmsRuntimeLocale(request.nextUrl.searchParams.get("locale")),
    });

    return NextResponse.json({
      ok: true,
      data,
    });
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
        { status: 500 },
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
      { status: 500 },
    );
  }
}
