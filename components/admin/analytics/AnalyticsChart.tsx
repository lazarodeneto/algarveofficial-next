import { useId } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChartData {
  [key: string]: string | number;
}

interface AnalyticsChartProps {
  title: string;
  description?: string;
  data: ChartData[];
  type: "area" | "bar" | "pie" | "stacked-bar";
  dataKey?: string;
  dataKeys?: { key: string; color: string; name?: string }[];
  xAxisKey?: string;
  loading?: boolean;
  className?: string;
  height?: number;
  colors?: string[];
}

const defaultColors = [
  "hsl(43 74% 49%)",   // Gold/Primary
  "hsl(142 76% 36%)",  // Green
  "hsl(217 91% 60%)",  // Blue
  "hsl(280 87% 65%)",  // Purple
  "hsl(0 72% 51%)",    // Red
  "hsl(24 95% 53%)",   // Orange
];

function formatTick(value: string | number, maxLength: number) {
  const text = String(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

function toFiniteNumber(value: string | number | undefined): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatPieShare(value: number, total: number): string {
  if (total <= 0 || value <= 0) return "0%";
  const share = (value / total) * 100;
  if (share < 1) return "<1%";
  return `${Math.round(share)}%`;
}

export function AnalyticsChart({
  title,
  description,
  data,
  type,
  dataKey = "value",
  dataKeys,
  xAxisKey = "date",
  loading = false,
  className,
  height = 300,
  colors = defaultColors,
}: AnalyticsChartProps) {
  const isMobile = useIsMobile();
  const chartId = useId().replace(/:/g, "");
  const areaGradientId = `analytics-area-${chartId}`;
  const barGradientId = `analytics-bar-${chartId}`;
  const hasData = data.length > 0;
  const compactXAxis = isMobile || data.length > 5;
  const pieTotal = data.reduce((sum, item) => sum + toFiniteNumber(item[dataKey]), 0);
  const tooltipStyle = {
    backgroundColor: "hsl(var(--card) / 0.92)",
    border: "1px solid hsl(var(--border) / 0.7)",
    borderRadius: "14px",
    boxShadow: "0 18px 48px -28px rgb(15 23 42 / 0.55)",
    color: "hsl(var(--foreground))",
    backdropFilter: "blur(18px) saturate(150%)",
  };

  if (loading) {
    return (
      <Card
        className={cn(
          "glass-box border-border/40 bg-card/60 [&>*]:relative [&>*]:z-10",
          className,
        )}
      >
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full" style={{ height }} />
        </CardContent>
      </Card>
    );
  }

  const renderEmpty = () => (
    <div
      className="flex w-full flex-col items-center justify-center rounded-sm border border-dashed border-border/70 bg-background/25 px-4 text-center text-sm text-muted-foreground"
      style={{ minHeight: height }}
    >
      <span className="font-medium text-foreground">No analytics yet</span>
      <span className="mt-1 max-w-xs">
        Data will appear here as visitors interact with the selected period and filters.
      </span>
    </div>
  );

  const renderChart = () => {
    if (!hasData) {
      return renderEmpty();
    }

    switch (type) {
      case "area":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 10, right: 12, left: isMobile ? -18 : -10, bottom: 8 }}>
              <defs>
                <linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 8" stroke="hsl(var(--border) / 0.58)" vertical={false} />
              <XAxis
                dataKey={xAxisKey}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatTick(value, isMobile ? 9 : 16)}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={isMobile ? 28 : 34}
              />
              <Tooltip
                cursor={{ stroke: "hsl(var(--primary) / 0.35)", strokeWidth: 1 }}
                contentStyle={tooltipStyle}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={colors[0]}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#${areaGradientId})`}
                activeDot={{ r: 5, fill: colors[0], stroke: "hsl(var(--background))", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              margin={{ top: 10, right: isMobile ? 4 : 12, left: isMobile ? -22 : -12, bottom: compactXAxis ? 10 : 0 }}
            >
              <defs>
                <linearGradient id={barGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors[0]} stopOpacity={1} />
                  <stop offset="100%" stopColor={colors[0]} stopOpacity={0.68} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 8" stroke="hsl(var(--border) / 0.58)" vertical={false} />
              <XAxis
                dataKey={xAxisKey}
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                angle={compactXAxis ? -28 : 0}
                textAnchor={compactXAxis ? "end" : "middle"}
                height={compactXAxis ? 72 : 42}
                interval={isMobile ? "preserveStartEnd" : 0}
                tickFormatter={(value) => formatTick(value, isMobile ? 8 : 16)}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={isMobile ? 28 : 34}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--primary) / 0.08)" }}
                contentStyle={tooltipStyle}
              />
              {dataKeys ? (
                dataKeys.map((dk) => (
                  <Bar
                    key={dk.key}
                    dataKey={dk.key}
                    fill={dk.color}
                    name={dk.name ?? dk.key}
                    radius={[8, 8, 2, 2]}
                    maxBarSize={42}
                    isAnimationActive
                    animationDuration={700}
                  />
                ))
              ) : (
                <Bar
                  dataKey={dataKey}
                  fill={`url(#${barGradientId})`}
                  radius={[9, 9, 2, 2]}
                  maxBarSize={54}
                  isAnimationActive
                  animationDuration={700}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case "stacked-bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 10, right: 12, left: isMobile ? -18 : -10, bottom: 8 }}>
              <CartesianGrid strokeDasharray="4 8" stroke="hsl(var(--border) / 0.58)" vertical={false} />
              <XAxis
                dataKey={xAxisKey}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatTick(value, isMobile ? 8 : 14)}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={isMobile ? 28 : 34}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--primary) / 0.08)" }}
                contentStyle={tooltipStyle}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
              {dataKeys?.map((dk, i) => (
                <Bar
                  key={dk.key}
                  dataKey={dk.key}
                  stackId="a"
                  fill={dk.color}
                  name={dk.name ?? dk.key}
                  radius={i === (dataKeys.length - 1) ? [8, 8, 2, 2] : [0, 0, 0, 0]}
                  maxBarSize={48}
                  isAnimationActive
                  animationDuration={700}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart margin={{ top: 0, right: 8, bottom: 14, left: 8 }}>
              <Pie
                data={data}
                cx="50%"
                cy={isMobile ? "42%" : "45%"}
                innerRadius={isMobile ? 42 : 62}
                outerRadius={isMobile ? 72 : 98}
                paddingAngle={2}
                dataKey={dataKey}
                nameKey={xAxisKey}
                label={false}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => [
                  formatPieShare(toFiniteNumber(value as string | number), pieTotal),
                  name,
                ]}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconSize={10}
                content={() => (
                  <div className="flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 px-1 pt-2 text-[11px] text-muted-foreground sm:text-xs">
                    {data.map((entry, index) => {
                      const name = String(entry[xAxisKey] ?? "");
                      const value = toFiniteNumber(entry[dataKey]);
                      return (
                        <span key={`${name}-${index}`} className="inline-flex min-w-0 items-center gap-1.5">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: colors[index % colors.length] }}
                          />
                          <span className="truncate">{name}</span>
                          <span className="font-medium text-foreground">
                            {formatPieShare(value, pieTotal)}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      className={cn(
        "glass-box min-w-0 border-border/40 bg-card/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 [&>*]:relative [&>*]:z-10",
        className,
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {description && <CardDescription className="text-sm">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="overflow-hidden px-3 pb-4 sm:px-5">{renderChart()}</CardContent>
    </Card>
  );
}
