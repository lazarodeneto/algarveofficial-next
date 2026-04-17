import { createSign } from "node:crypto";

import type { TimeRange } from "@/components/admin/analytics/TimeRangeSelector";

type RunReportRow = {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
};

type RunReportResponse = {
  rows?: RunReportRow[];
};

type GaServiceAccount = {
  clientEmail: string;
  privateKey: string;
};

export type GaTrafficOverview = {
  connected: true;
  totalUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDurationSec: number;
  topPages: Array<{ page: string; views: number }>;
  topCities: Array<{ city: string; views: number }>;
};

type GaTrafficOverviewInput = {
  timeRange: TimeRange;
  city?: string;
  categorySlug?: string;
  propertyId?: string | null;
};

function toPositiveInt(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "0", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function toRoundedSeconds(value: string | undefined): number {
  const parsed = Number.parseFloat(value ?? "0");
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.round(parsed);
}

function normalizePropertyId(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;

  const strippedPrefix = trimmed.replace(/^properties\//i, "");
  if (/^\d+$/.test(strippedPrefix)) {
    return strippedPrefix;
  }

  const dashboardMatch = strippedPrefix.match(/\/p(\d+)\b/i);
  if (dashboardMatch?.[1]) {
    return dashboardMatch[1];
  }

  const embeddedMatch = strippedPrefix.match(/p(\d{6,})/i);
  if (embeddedMatch?.[1]) {
    return embeddedMatch[1];
  }

  return null;
}

function resolveServiceAccount(): GaServiceAccount | null {
  const json =
    process.env.GA_SERVICE_ACCOUNT_JSON?.trim() ||
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) {
    try {
      const parsed = JSON.parse(json) as {
        client_email?: string;
        private_key?: string;
      };
      const clientEmail = parsed.client_email?.trim();
      const privateKey = parsed.private_key?.replace(/\\n/g, "\n").trim();
      if (clientEmail && privateKey) {
        return { clientEmail, privateKey };
      }
    } catch {
      return null;
    }
  }

  const clientEmail =
    process.env.GA_SERVICE_ACCOUNT_EMAIL?.trim() ||
    process.env.GOOGLE_CLIENT_EMAIL?.trim();
  const privateKey = (
    process.env.GA_SERVICE_ACCOUNT_PRIVATE_KEY ||
    process.env.GOOGLE_PRIVATE_KEY ||
    ""
  )
    .replace(/\\n/g, "\n")
    .trim();
  if (!clientEmail || !privateKey) return null;

  return { clientEmail, privateKey };
}

function rangeStart(timeRange: TimeRange): string {
  if (timeRange === "7d") return "7daysAgo";
  if (timeRange === "90d") return "90daysAgo";
  return "30daysAgo";
}

function base64Url(input: string) {
  return Buffer.from(input).toString("base64url");
}

async function fetchAccessToken(account: GaServiceAccount): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: account.clientEmail,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const unsignedJwt = `${encodedHeader}.${encodedPayload}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsignedJwt);
  signer.end();
  const signature = signer.sign(account.privateKey).toString("base64url");
  const assertion = `${unsignedJwt}.${signature}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payloadJson = (await response.json().catch(() => null)) as
    | { access_token?: string }
    | null;
  return payloadJson?.access_token?.trim() || null;
}

function buildDimensionFilter(city?: string, categorySlug?: string) {
  const expressions: Array<Record<string, unknown>> = [];

  if (city?.trim()) {
    expressions.push({
      filter: {
        fieldName: "city",
        stringFilter: {
          matchType: "EXACT",
          value: city.trim(),
          caseSensitive: false,
        },
      },
    });
  }

  if (categorySlug?.trim()) {
    expressions.push({
      filter: {
        fieldName: "pagePath",
        stringFilter: {
          matchType: "CONTAINS",
          value: `/${categorySlug.trim()}`,
          caseSensitive: false,
        },
      },
    });
  }

  if (expressions.length === 0) return undefined;
  if (expressions.length === 1) return expressions[0];

  return { andGroup: { expressions } };
}

async function runReport(
  accessToken: string,
  propertyId: string,
  body: Record<string, unknown>,
): Promise<RunReportResponse> {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `GA runReport failed (${response.status}): ${errorText || "Unknown error"}`,
    );
  }

  return (await response.json()) as RunReportResponse;
}

export async function fetchGaTrafficOverview(
  input: GaTrafficOverviewInput,
): Promise<GaTrafficOverview | null> {
  const propertyId =
    normalizePropertyId(input.propertyId) ??
    normalizePropertyId(process.env.GA_PROPERTY_ID) ??
    normalizePropertyId(process.env.GOOGLE_ANALYTICS_PROPERTY_ID);
  if (!propertyId) return null;

  const serviceAccount = resolveServiceAccount();
  if (!serviceAccount) return null;

  const accessToken = await fetchAccessToken(serviceAccount);
  if (!accessToken) return null;

  const dateRanges = [{ startDate: rangeStart(input.timeRange), endDate: "today" }];
  const dimensionFilter = buildDimensionFilter(input.city, input.categorySlug);

  const [summaryReport, topPagesReport, topCitiesReport] = await Promise.all([
    runReport(accessToken, propertyId, {
      dateRanges,
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
      ],
      dimensionFilter,
    }),
    runReport(accessToken, propertyId, {
      dateRanges,
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
      dimensionFilter,
    }),
    runReport(accessToken, propertyId, {
      dateRanges,
      dimensions: [{ name: "city" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
      dimensionFilter,
    }),
  ]);

  const summaryMetrics = summaryReport.rows?.[0]?.metricValues ?? [];
  const totalUsers = toPositiveInt(summaryMetrics[0]?.value);
  const sessions = toPositiveInt(summaryMetrics[1]?.value);
  const pageViews = toPositiveInt(summaryMetrics[2]?.value);
  const avgSessionDurationSec = toRoundedSeconds(summaryMetrics[3]?.value);

  const topPages = (topPagesReport.rows ?? [])
    .map((row) => ({
      page: row.dimensionValues?.[0]?.value?.trim() || "(not set)",
      views: toPositiveInt(row.metricValues?.[0]?.value),
    }))
    .filter((row) => row.views > 0)
    .slice(0, 10);

  const topCities = (topCitiesReport.rows ?? [])
    .map((row) => ({
      city: row.dimensionValues?.[0]?.value?.trim() || "Unknown",
      views: toPositiveInt(row.metricValues?.[0]?.value),
    }))
    .filter((row) => row.views > 0)
    .slice(0, 10);

  return {
    connected: true,
    totalUsers,
    sessions,
    pageViews,
    avgSessionDurationSec,
    topPages,
    topCities,
  };
}

export function parseGaPropertyIdFromDashboardUrl(
  dashboardUrl: string | null | undefined,
): string | null {
  return normalizePropertyId(dashboardUrl);
}
