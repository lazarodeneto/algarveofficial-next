import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";

import { AnalyticsChart } from "@/components/admin/analytics/AnalyticsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

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
    <Card className="glass-box border-border/40 bg-card/60 [&>*]:relative [&>*]:z-10">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy("views")}
            aria-pressed={sortBy === "views"}
            className={cn(
              "glass-button-subtle min-w-[5.5rem] justify-center gap-2 rounded-full border-border/60 bg-background/35",
              sortBy === "views" && "border-primary/40 bg-primary/10 text-primary",
            )}
          >
            <ArrowUpDown className="h-3.5 w-3.5" /> Views
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy("clicks")}
            aria-pressed={sortBy === "clicks"}
            className={cn(
              "glass-button-subtle min-w-[5.5rem] justify-center gap-2 rounded-full border-border/60 bg-background/35",
              sortBy === "clicks" && "border-primary/40 bg-primary/10 text-primary",
            )}
          >
            <ArrowUpDown className="h-3.5 w-3.5" /> Clicks
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy("ctr")}
            aria-pressed={sortBy === "ctr"}
            className={cn(
              "glass-button-subtle min-w-[5.5rem] justify-center gap-2 rounded-full border-border/60 bg-background/35",
              sortBy === "ctr" && "border-primary/40 bg-primary/10 text-primary",
            )}
          >
            <ArrowUpDown className="h-3.5 w-3.5" /> CTR
          </Button>
        </div>

        <div className="overflow-hidden rounded-sm border border-border/60 bg-background/25">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow className="bg-background/35">
                <TableHead className="w-auto">Name</TableHead>
                <TableHead className="w-[5.75rem] text-right whitespace-nowrap">Views</TableHead>
                <TableHead className="w-[5.75rem] text-right whitespace-nowrap">Clicks</TableHead>
                <TableHead className="w-[5.75rem] text-right whitespace-nowrap">CTR</TableHead>
                <TableHead className="hidden min-[1800px]:table-cell w-[6.5rem] text-right whitespace-nowrap">
                  Engagement
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRows.slice(0, 10).map((row) => (
                <TableRow key={row.id ?? row.name} className="transition-colors hover:bg-primary/5">
                  <TableCell className="font-medium break-words [overflow-wrap:anywhere]">
                    {row.name}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">
                    {row.views.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">
                    {row.clicks.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">
                    {row.ctr.toFixed(2)}%
                  </TableCell>
                  <TableCell className="hidden min-[1800px]:table-cell text-right tabular-nums whitespace-nowrap">
                    {row.engagementRate.toFixed(2)}%
                  </TableCell>
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
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 min-[1800px]:grid-cols-3">
        <SortableTable title="Top Cities Table" rows={topCities} />
        <SortableTable title="Top Categories Table" rows={topCategories} />
        <SortableTable title="Top Listings Table" rows={topListings} />
      </div>
    </section>
  );
}
