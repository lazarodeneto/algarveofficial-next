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
      <Card className={cn("bg-card border-border", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
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
    <Card className={cn("bg-card border-border hover:border-primary/30 transition-colors", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && (
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("font-serif font-semibold text-foreground", valueSize[size])}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <span
              className={cn(
                "flex items-center text-xs font-medium",
                trend.positive === true && "text-green-500",
                trend.positive === false && "text-red-500",
                trend.positive === undefined && "text-muted-foreground"
              )}
            >
              {trend.positive === true && <TrendingUp className="h-3 w-3 mr-0.5" />}
              {trend.positive === false && <TrendingDown className="h-3 w-3 mr-0.5" />}
              {trend.positive === undefined && <Minus className="h-3 w-3 mr-0.5" />}
              {trend.value > 0 ? "+" : ""}{trend.value}%
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
