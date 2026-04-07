import { AnalyticsChart } from "@/components/admin/analytics/AnalyticsChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TierMetric = {
  tier: "signature" | "verified" | "unverified";
  views: number;
  clicks: number;
  ctr: number;
  visibilityShare: number;
  clickShare: number;
};

type Props = {
  loading?: boolean;
  byTier: TierMetric[];
};

function formatTierLabel(tier: TierMetric["tier"]): string {
  if (tier === "signature") return "Signature";
  if (tier === "verified") return "Verified";
  return "Unverified";
}

export function MonetizationInsightsSection({ loading = false, byTier }: Props) {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <AnalyticsChart
          title="Visibility Share"
          description="Impression share by subscription tier"
          type="pie"
          data={byTier.map((row) => ({ name: formatTierLabel(row.tier), value: row.visibilityShare }))}
          dataKey="value"
          xAxisKey="name"
          loading={loading}
          height={300}
        />

        <AnalyticsChart
          title="Click Share"
          description="Click share by subscription tier"
          type="pie"
          data={byTier.map((row) => ({ name: formatTierLabel(row.tier), value: row.clickShare }))}
          dataKey="value"
          xAxisKey="name"
          loading={loading}
          height={300}
        />

        <AnalyticsChart
          title="Tier Efficiency (CTR)"
          description="Clicks / views per tier"
          type="bar"
          data={byTier.map((row) => ({ name: formatTierLabel(row.tier), value: row.ctr }))}
          xAxisKey="name"
          dataKey="value"
          loading={loading}
          height={300}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Tier Monetization Table</CardTitle>
          <CardDescription>Visibility, clicks, and conversion efficiency by tier.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead className="text-right">Visibility Share</TableHead>
                  <TableHead className="text-right">Click Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byTier.map((row) => (
                  <TableRow key={row.tier}>
                    <TableCell className="font-medium">{formatTierLabel(row.tier)}</TableCell>
                    <TableCell className="text-right">{row.views.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{row.clicks.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{row.ctr.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">{row.visibilityShare.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">{row.clickShare.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
