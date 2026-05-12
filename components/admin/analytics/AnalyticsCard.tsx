import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    positive?: boolean;
    label?: string;
  };
  loading?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function AnalyticsCard({
  title,
  value,
  description,
  icon,
  trend,
  loading = false,
  className,
  size = "md",
}: AnalyticsCardProps) {
  if (loading) {
    return (
      <Card
        className={cn(
          "glass-box border-border/40 bg-card/60 [&>*]:relative [&>*]:z-10",
          className,
        )}
      >
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-2 h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  const valueSize = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  return (
    <Card
      className={cn(
        "glass-box group border-border/40 bg-card/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_18px_52px_-28px_hsl(var(--primary)/0.45)] [&>*]:relative [&>*]:z-10",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {title}
          </CardTitle>
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] transition-transform duration-300 group-hover:scale-105">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("font-serif font-semibold text-foreground", valueSize[size])}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <div className="mt-1 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "flex items-center text-xs font-medium",
                trend.positive === true && "text-green-500",
                trend.positive === false && "text-red-500",
                trend.positive === undefined && "text-muted-foreground"
              )}
            >
              {trend.positive === true && <TrendingUp className="mr-0.5 h-3 w-3" />}
              {trend.positive === false && <TrendingDown className="mr-0.5 h-3 w-3" />}
              {trend.positive === undefined && <Minus className="mr-0.5 h-3 w-3" />}
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
              {trend.label && <span className="ml-1 text-muted-foreground">{trend.label}</span>}
            </span>
          )}
          {description && (
            <CardDescription className="text-xs">
              {description}
            </CardDescription>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
