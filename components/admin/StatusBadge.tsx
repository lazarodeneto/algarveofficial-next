import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, X, FileEdit, Archive } from "lucide-react";
import type { PublishStatus } from "@/types/admin";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: PublishStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = {
    published: {
      label: "Published",
      icon: Check,
      className: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    pending_review: {
      label: "Pending Review",
      icon: Clock,
      className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    draft: {
      label: "Draft",
      icon: FileEdit,
      className: "bg-muted text-muted-foreground border-border",
    },
    rejected: {
      label: "Rejected",
      icon: X,
      className: "bg-destructive/20 text-destructive border-destructive/30",
    },
    archived: {
      label: "Archived",
      icon: Archive,
      className: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    },
  };

  const entry = config[status as keyof typeof config];
  if (!entry) {
    return <Badge variant="outline" className="gap-1 font-medium text-xs">{status}</Badge>;
  }
  const { label, icon: Icon, className } = entry;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-medium",
        size === "sm" && "text-xs px-1.5 py-0",
        className
      )}
    >
      <Icon className={cn("h-3 w-3", size === "sm" && "h-2.5 w-2.5")} />
      {label}
    </Badge>
  );
}
