import { AnalyticsChart } from "@/components/admin/analytics/AnalyticsChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type BlockMetric = {
  blockId: string;
  impressions: number;
  clicks: number;
  ctr: number;
};

type PositionMetric = {
  position: number;
  clicks: number;
  impressions: number;
  ctr: number;
};

type SelectionMetric = {
  selection: "manual" | "tier-driven" | "hybrid" | "unknown";
  clicks: number;
  impressions: number;
  engagementRate: number;
};

type Props = {
  loading?: boolean;
  blockPerformance: BlockMetric[];
  positionPerformance: PositionMetric[];
  selectionModePerformance: SelectionMetric[];
};

export function PlacementPerformanceSection({
  loading = false,
  blockPerformance,
  positionPerformance,
  selectionModePerformance,
}: Props) {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <AnalyticsChart
          title="Block Performance"
          description="Impressions vs clicks per CMS block"
          type="bar"
          data={blockPerformance.map((row) => ({
            name: row.blockId,
            impressions: row.impressions,
            clicks: row.clicks,
          }))}
          dataKeys={[
            { key: "impressions", color: "hsl(217 91% 60%)", name: "Impressions" },
            { key: "clicks", color: "hsl(43 74% 49%)", name: "Clicks" },
          ]}
          xAxisKey="name"
          loading={loading}
          height={300}
        />

        <AnalyticsChart
          title="Position CTR"
          description="Position-level click-through performance"
          type="bar"
          data={positionPerformance.map((row) => ({ name: String(row.position), value: row.ctr }))}
          xAxisKey="name"
          dataKey="value"
          loading={loading}
          height={300}
        />

        <AnalyticsChart
          title="Selection Mode"
          description="manual vs tier-driven vs hybrid"
          type="bar"
          data={selectionModePerformance.map((row) => ({
            name: row.selection,
            impressions: row.impressions,
            clicks: row.clicks,
          }))}
          dataKeys={[
            { key: "impressions", color: "hsl(217 91% 60%)", name: "Impressions" },
            { key: "clicks", color: "hsl(43 74% 49%)", name: "Clicks" },
          ]}
          xAxisKey="name"
          loading={loading}
          height={300}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Block Performance Table</CardTitle>
            <CardDescription>CTR by block for placement decisions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Block</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockPerformance.map((row) => (
                    <TableRow key={row.blockId}>
                      <TableCell className="font-medium">{row.blockId}</TableCell>
                      <TableCell className="text-right">{row.impressions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.ctr.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Position Performance Table</CardTitle>
            <CardDescription>Monetization-critical position response.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positionPerformance.map((row) => (
                    <TableRow key={row.position}>
                      <TableCell className="font-medium">{row.position}</TableCell>
                      <TableCell className="text-right">{row.impressions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.ctr.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
