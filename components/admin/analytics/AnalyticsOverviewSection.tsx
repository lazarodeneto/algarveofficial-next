import { Activity, Clock3, Eye, Radio, Users } from "lucide-react";

import { AnalyticsCard } from "@/components/admin/analytics/AnalyticsCard";
import { AnalyticsChart } from "@/components/admin/analytics/AnalyticsChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { resolveGaMeasurementId } from "@/lib/analytics/ga-config";

type Props = {
  loading?: boolean;
  data: {
    source: "ga" | "none";
    isGaConnected: boolean;
    gaError: string | null;
    totalUsers: number;
    sessions: number;
    pageViews: number;
    avgSessionDurationSec: number;
    topPages: Array<{ page: string; views: number }>;
    topCities: Array<{ city: string; views: number }>;
    topCategories: Array<{ category: string; views: number }>;
  };
};

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 1) return "—";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function AnalyticsOverviewSection({ loading = false, data }: Props) {
  const { settings } = useSiteSettings();
  const gaMeasurementId = resolveGaMeasurementId(settings?.ga_measurement_id);
  const showBlankState = !data.isGaConnected;

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard
          title="Total Users"
          value={showBlankState ? "—" : data.totalUsers}
          icon={<Users className="h-4 w-4" />}
          loading={loading}
          size="sm"
        />
        <AnalyticsCard
          title="Sessions"
          value={showBlankState ? "—" : data.sessions}
          icon={<Activity className="h-4 w-4" />}
          loading={loading}
          size="sm"
        />
        <AnalyticsCard
          title="Page Views"
          value={showBlankState ? "—" : data.pageViews}
          icon={<Eye className="h-4 w-4" />}
          loading={loading}
          size="sm"
        />
        <AnalyticsCard
          title="Avg Session Duration"
          value={formatDuration(data.avgSessionDurationSec)}
          icon={<Clock3 className="h-4 w-4" />}
          loading={loading}
          size="sm"
        />
      </div>

      <Card className="glass-box border-border/40 bg-card/60 [&>*]:relative [&>*]:z-10">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Traffic Source</CardTitle>
            <CardDescription>
              {data.isGaConnected
                ? "Google Analytics API is connected and active."
                : data.gaError
                  ? `Google Analytics API connection error: ${data.gaError}`
                  : "Google Analytics API is not connected in-app."}
            </CardDescription>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            <Radio className="h-4 w-4" />
          </div>
        </CardHeader>
        {data.isGaConnected ? (
          <CardContent>
            <div className="inline-flex max-w-full items-center rounded-full border border-border/70 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]">
              <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_14px_rgb(16_185_129/0.55)]" />
              <span className="truncate">Source: {gaMeasurementId}</span>
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <div className="rounded-sm border border-dashed border-border/70 bg-background/25 px-4 py-3 text-sm text-muted-foreground">
              Connect Google Analytics to unlock live audience, session, and route-level visibility.
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <AnalyticsChart
          title="Top Pages"
          description="Page-level visibility"
          type="bar"
          data={data.topPages.map((item) => ({ name: item.page, value: item.views }))}
          xAxisKey="name"
          dataKey="value"
          loading={loading}
          height={280}
        />
        <AnalyticsChart
          title="Top Cities"
          description="City-level visibility"
          type="bar"
          data={data.topCities.map((item) => ({ name: item.city, value: item.views }))}
          xAxisKey="name"
          dataKey="value"
          loading={loading}
          height={280}
        />
        <AnalyticsChart
          title="Top Categories"
          description="Category-level visibility"
          type="bar"
          data={data.topCategories.map((item) => ({ name: item.category, value: item.views }))}
          xAxisKey="name"
          dataKey="value"
          loading={loading}
          height={280}
        />
      </div>
    </section>
  );
}
