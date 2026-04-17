import { Activity, Clock3, Eye, Users } from "lucide-react";

import { AnalyticsCard } from "@/components/admin/analytics/AnalyticsCard";
import { AnalyticsChart } from "@/components/admin/analytics/AnalyticsChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  loading?: boolean;
  data: {
    source: "ga" | "none";
    isGaConnected: boolean;
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
  const showBlankState = !data.isGaConnected;

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Traffic Source</CardTitle>
          <CardDescription>
            {data.isGaConnected
              ? "Google Analytics API is connected and active."
              : "Google Analytics API is not connected in-app."}
          </CardDescription>
        </CardHeader>
        {data.isGaConnected ? (
          <CardContent>
            <div className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              Source: GA
            </div>
          </CardContent>
        ) : null}
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
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
