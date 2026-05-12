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
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
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

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="glass-box border-border/40 bg-card/60 [&>*]:relative [&>*]:z-10">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold">Block Performance Table</CardTitle>
            <CardDescription>CTR by block for placement decisions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-sm border border-border/60 bg-background/25">
              <Table>
                <TableHeader>
                  <TableRow className="bg-background/35">
                    <TableHead>Block</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockPerformance.map((row) => (
                    <TableRow key={row.blockId} className="transition-colors hover:bg-primary/5">
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

        <Card className="glass-box border-border/40 bg-card/60 [&>*]:relative [&>*]:z-10">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold">Position Performance Table</CardTitle>
            <CardDescription>Monetization-critical position response.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-sm border border-border/60 bg-background/25">
              <Table>
                <TableHeader>
                  <TableRow className="bg-background/35">
                    <TableHead>Position</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positionPerformance.map((row) => (
                    <TableRow key={row.position} className="transition-colors hover:bg-primary/5">
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
