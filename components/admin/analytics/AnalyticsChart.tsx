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

  if (loading) {
    return (
      <Card className={cn("bg-card border-border", className)}>
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

  const renderChart = () => {
    switch (type) {
      case "area":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 18%)" />
              <XAxis
                dataKey={xAxisKey}
                stroke="hsl(240 5% 55%)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis stroke="hsl(240 5% 55%)" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(240 8% 8%)",
                  border: "1px solid hsl(240 6% 18%)",
                  borderRadius: "8px",
                  color: "hsl(45 20% 95%)",
                }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={colors[0]}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 18%)" />
              <XAxis
                dataKey={xAxisKey}
                stroke="hsl(240 5% 55%)"
                fontSize={11}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="hsl(240 5% 55%)" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(240 8% 8%)",
                  border: "1px solid hsl(240 6% 18%)",
                  borderRadius: "8px",
                  color: "hsl(45 20% 95%)",
                }}
              />
              {dataKeys ? (
                dataKeys.map((dk) => (
                  <Bar key={dk.key} dataKey={dk.key} fill={dk.color} name={dk.name ?? dk.key} radius={[4, 4, 0, 0]} />
                ))
              ) : (
                <Bar dataKey={dataKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case "stacked-bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 18%)" />
              <XAxis
                dataKey={xAxisKey}
                stroke="hsl(240 5% 55%)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis stroke="hsl(240 5% 55%)" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(240 8% 8%)",
                  border: "1px solid hsl(240 6% 18%)",
                  borderRadius: "8px",
                  color: "hsl(45 20% 95%)",
                }}
              />
              <Legend />
              {dataKeys?.map((dk, i) => (
                <Bar
                  key={dk.key}
                  dataKey={dk.key}
                  stackId="a"
                  fill={dk.color}
                  name={dk.name ?? dk.key}
                  radius={i === (dataKeys.length - 1) ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy={isMobile ? "44%" : "47%"}
                innerRadius={isMobile ? 42 : 60}
                outerRadius={isMobile ? 72 : 100}
                paddingAngle={2}
                dataKey={dataKey}
                nameKey={xAxisKey}
                label={
                  isMobile
                    ? false
                    : ({ name, percent }: { name?: string; percent?: number }) =>
                        `${name ?? ""}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={!isMobile}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(240 8% 8%)",
                  border: "1px solid hsl(240 6% 18%)",
                  borderRadius: "8px",
                  color: "hsl(45 20% 95%)",
                }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconSize={10}
                wrapperStyle={{ paddingTop: 8 }}
                formatter={(value) => (
                  <span className={cn("text-muted-foreground", isMobile ? "text-[11px]" : "text-xs")}>
                    {value}
                  </span>
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
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader>
        <CardTitle className="font-serif text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}
