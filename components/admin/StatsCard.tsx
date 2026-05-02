import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon, description, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("border-border/70 bg-card/95 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25", className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/75">{title}</p>
            <p className="mt-2 text-2xl font-serif font-semibold leading-none text-foreground sm:text-[2rem]">{value}</p>
            {description && (
              <p className="mt-2 max-w-[20ch] text-xs leading-5 text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p className={cn(
                "mt-2 text-xs font-medium",
                trend.positive ? "text-green-400" : "text-destructive"
              )}>
                {trend.positive ? "+" : ""}{trend.value}% from last month
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary shadow-inner shadow-primary/10">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
