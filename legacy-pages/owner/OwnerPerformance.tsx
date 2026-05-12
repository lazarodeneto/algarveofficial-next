"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  CalendarRange,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  MousePointerClick,
  Phone,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalePath } from "@/hooks/useLocalePath";
import type { ListingPerformanceMetricKey } from "@/lib/analytics/listingPerformance";

type PerformanceCounts = Record<ListingPerformanceMetricKey, number>;

interface OwnerPerformanceListing {
  id: string;
  name: string;
  slug: string | null;
  tier: string | null;
  claimStatus: string | null;
  city: string | null;
  category: string | null;
  counts: PerformanceCounts;
}

interface OwnerPerformanceResponse {
  ok: boolean;
  data: {
    range: {
      days: number;
      startAt: string;
      endAt: string;
    };
    totals: PerformanceCounts;
    listings: OwnerPerformanceListing[];
  };
}

const RANGE_OPTIONS = [7, 30, 90] as const;

function metricLabel(metric: ListingPerformanceMetricKey) {
  const labels: Record<ListingPerformanceMetricKey, string> = {
    profileViews: "Profile views",
    websiteClicks: "Website clicks",
    phoneClicks: "Phone clicks",
    directionsClicks: "Directions clicks",
    whatsAppClicks: "WhatsApp clicks",
    bookingClicks: "Booking clicks",
  };
  return labels[metric];
}

function metricIcon(metric: ListingPerformanceMetricKey) {
  if (metric === "profileViews") return TrendingUp;
  if (metric === "websiteClicks") return Globe;
  if (metric === "phoneClicks") return Phone;
  if (metric === "directionsClicks") return MapPin;
  if (metric === "bookingClicks") return CalendarRange;
  return MousePointerClick;
}

async function fetchOwnerPerformance(rangeDays: number): Promise<OwnerPerformanceResponse["data"]> {
  const response = await fetch(`/api/owner/performance?rangeDays=${rangeDays}`, {
    credentials: "same-origin",
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null) as OwnerPerformanceResponse | {
    error?: { message?: string };
  } | null;

  if (!response.ok || !payload || !("ok" in payload) || payload.ok !== true) {
    const message = payload && "error" in payload
      ? payload.error?.message
      : null;
    throw new Error(message || "Could not load owner performance metrics.");
  }

  return payload.data;
}

export default function OwnerPerformance() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const l = useLocalePath();
  const [rangeDays, setRangeDays] = useState<(typeof RANGE_OPTIONS)[number]>(30);
  const numberFormatter = useMemo(() => new Intl.NumberFormat(), []);

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["owner-performance", user?.id, rangeDays],
    queryFn: () => fetchOwnerPerformance(rangeDays),
    enabled: !!user?.id,
    staleTime: 0,
    refetchOnReconnect: true,
  });

  const metricKeys: ListingPerformanceMetricKey[] = [
    "profileViews",
    "websiteClicks",
    "phoneClicks",
    "directionsClicks",
    "whatsAppClicks",
    "bookingClicks",
  ];

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {t("owner.performance.eyebrow", { defaultValue: "Performance" })}
          </p>
          <h1 className="mt-2 text-2xl font-serif font-semibold text-foreground">
            {t("owner.performance.title", { defaultValue: "Listing performance" })}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("owner.performance.subtitle", {
              defaultValue: "Track profile views and high-intent actions for your claimed AlgarveOfficial listings.",
            })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {RANGE_OPTIONS.map((days) => (
            <Button
              key={days}
              type="button"
              variant={rangeDays === days ? "gold" : "outline"}
              size="sm"
              onClick={() => setRangeDays(days)}
            >
              {t("owner.performance.days", { count: days, defaultValue: "{{count}} days" })}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[360px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-6">
            <p className="font-medium text-destructive">
              {t("owner.performance.loadFailed", { defaultValue: "Could not load performance metrics" })}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{(error as Error).message}</p>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {metricKeys.map((metric) => {
              const Icon = metricIcon(metric);
              return (
                <Card key={metric} className="border-border/70">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {metricLabel(metric)}
                      </p>
                      <p className="mt-1 text-3xl font-semibold text-foreground">
                        {numberFormatter.format(data.totals[metric] ?? 0)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-border/70">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  {t("owner.performance.byListing", { defaultValue: "Performance by listing" })}
                </CardTitle>
                <CardDescription>
                  {t("owner.performance.rangeSummary", {
                    count: data.range.days,
                    defaultValue: "Showing the last {{count}} days. Metrics require visitor analytics consent.",
                  })}
                </CardDescription>
              </div>
              {isFetching ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : null}
            </CardHeader>
            <CardContent>
              {data.listings.length === 0 ? (
                <div className="rounded-sm border border-dashed border-border p-8 text-center">
                  <p className="font-medium text-foreground">
                    {t("owner.performance.emptyTitle", { defaultValue: "No claimed listings yet" })}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("owner.performance.emptyDescription", {
                      defaultValue: "Approved claimed listings will appear here once they are assigned to your account.",
                    })}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <caption className="sr-only">
                      {t("owner.performance.tableCaption", { defaultValue: "Performance metrics for claimed listings" })}
                    </caption>
                    <thead className="border-b border-border text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      <tr>
                        <th scope="col" className="py-3 pr-4 font-semibold">
                          {t("owner.performance.tableListing", { defaultValue: "Listing" })}
                        </th>
                        {metricKeys.map((metric) => (
                          <th key={metric} scope="col" className="px-3 py-3 text-right font-semibold">
                            {metricLabel(metric)}
                          </th>
                        ))}
                        <th scope="col" className="py-3 pl-4 text-right font-semibold">
                          {t("owner.performance.tableAction", { defaultValue: "Action" })}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/70">
                      {data.listings.map((listing) => (
                        <tr key={listing.id}>
                          <th scope="row" className="max-w-[260px] py-4 pr-4 text-left align-top font-normal">
                            <p className="font-medium text-foreground">{listing.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {[listing.city, listing.category].filter(Boolean).join(" · ") || "Algarve"}
                            </p>
                          </th>
                          {metricKeys.map((metric) => (
                            <td key={metric} className="px-3 py-4 text-right tabular-nums text-foreground">
                              {numberFormatter.format(listing.counts[metric] ?? 0)}
                            </td>
                          ))}
                          <td className="py-4 pl-4 text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={l(`/listing/${listing.slug || listing.id}`)} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                                {t("owner.performance.view", { defaultValue: "View" })}
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
