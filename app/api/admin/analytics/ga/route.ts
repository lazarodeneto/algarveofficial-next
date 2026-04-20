import { NextRequest, NextResponse } from "next/server";

import type { TimeRange } from "@/components/admin/analytics/TimeRangeSelector";
import { requireAdminOrEditorReadClient } from "@/lib/server/admin-auth";
import {
  fetchGaTrafficOverview,
  parseGaPropertyIdFromDashboardUrl,
} from "@/lib/server/googleAnalyticsData";

export const runtime = "nodejs";

const VALID_TIME_RANGES = new Set<TimeRange>(["7d", "30d", "90d"]);

function parseTimeRange(raw: string | null): TimeRange {
  if (raw && VALID_TIME_RANGES.has(raw as TimeRange)) {
    return raw as TimeRange;
  }
  return "30d";
}

function normalizeOptional(raw: string | null): string | undefined {
  const value = raw?.trim();
  return value ? value : undefined;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminOrEditorReadClient(
    request,
    "Only admins or editors can query analytics data.",
  );
  if ("error" in auth) return auth.error;

  const timeRange = parseTimeRange(request.nextUrl.searchParams.get("timeRange"));
  const city = normalizeOptional(request.nextUrl.searchParams.get("city"));
  const categorySlug = normalizeOptional(request.nextUrl.searchParams.get("categorySlug"));

  let propertyIdFromSettings: string | null = null;
  const { data: siteSettings } = await auth.readClient
    .from("site_settings")
    .select("ga_dashboard_url")
    .eq("id", "default")
    .maybeSingle();

  if (siteSettings?.ga_dashboard_url) {
    propertyIdFromSettings = parseGaPropertyIdFromDashboardUrl(siteSettings.ga_dashboard_url);
  }

  try {
    const gaTrafficOverview = await fetchGaTrafficOverview({
      timeRange,
      city,
      categorySlug,
      propertyId: propertyIdFromSettings,
    });

    return NextResponse.json({
      ok: true,
      data: gaTrafficOverview,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Google Analytics connection error.";

    return NextResponse.json({
      ok: false,
      error: {
        code: "GA_FETCH_FAILED",
        message,
      },
    }, { status: 502 });
  }
}
