import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";

import { AnalyticsChart } from "@/components/admin/analytics/AnalyticsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type NamedMetric = {
  id?: string;
  name: string;
  views: number;
  clicks: number;
  ctr: number;
  engagementRate: number;
};

type Props = {
  loading?: boolean;
  topCities: NamedMetric[];
  topCategories: NamedMetric[];
  topListings: NamedMetric[];
};

type SortField = "views" | "clicks" | "ctr";

function SortableTable({
  title,
  rows,
}: {
  title: string;
  rows: NamedMetric[];
}) {
  const [sortBy, setSortBy] = useState<SortField>("views");

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [rows, sortBy]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSortBy("views")} className="gap-2">
            <ArrowUpDown className="h-3.5 w-3.5" /> Views
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSortBy("clicks")} className="gap-2">
            <ArrowUpDown className="h-3.5 w-3.5" /> Clicks
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSortBy("ctr")} className="gap-2">
            <ArrowUpDown className="h-3.5 w-3.5" /> CTR
          </Button>
        </div>

        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Engagement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRows.slice(0, 10).map((row) => (
                <TableRow key={row.id ?? row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right">{row.views.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.clicks.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.ctr.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">{row.engagementRate.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function ContentPerformanceSection({
  loading = false,
  topCities,
  topCategories,
  topListings,
}: Props) {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <AnalyticsChart
          title="Top Cities"
          description="Page views and click intensity by city"
          type="bar"
          data={topCities.map((row) => ({ name: row.name, value: row.views }))}
          dataKey="value"
          xAxisKey="name"
          loading={loading}
          height={280}
        />
        <AnalyticsChart
          title="Top Categories"
          description="Category-level content pull"
          type="bar"
          data={topCategories.map((row) => ({ name: row.name, value: row.views }))}
          dataKey="value"
          xAxisKey="name"
          loading={loading}
          height={280}
        />
        <AnalyticsChart
          title="Top Listings"
          description="Most viewed listing URLs"
          type="bar"
          data={topListings.map((row) => ({ name: row.name, value: row.views }))}
          dataKey="value"
          xAxisKey="name"
          loading={loading}
          height={280}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SortableTable title="Top Cities Table" rows={topCities} />
        <SortableTable title="Top Categories Table" rows={topCategories} />
        <SortableTable title="Top Listings Table" rows={topListings} />
      </div>
    </section>
  );
}
