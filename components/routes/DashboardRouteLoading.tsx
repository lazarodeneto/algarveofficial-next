"use client";

import { Loader2 } from "lucide-react";

interface DashboardRouteLoadingProps {
  label?: string;
}

export function DashboardRouteLoading({
  label = "Loading dashboard page...",
}: DashboardRouteLoadingProps) {
  return (
    <div className="flex min-h-[55vh] items-center justify-center rounded-2xl border border-border/60 bg-card/40 px-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
