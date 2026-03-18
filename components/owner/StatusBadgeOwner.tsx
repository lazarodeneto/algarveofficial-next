import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle, FileEdit } from "lucide-react";
import type { PublishStatus } from "@/types/admin";

interface StatusBadgeOwnerProps {
  status: PublishStatus;
  size?: "sm" | "md";
}

const statusConfig: Record<PublishStatus, { label: string; icon: React.ElementType; classes: string }> = {
  draft: {
    label: "Draft",
    icon: FileEdit,
    classes: "bg-muted text-muted-foreground border-border",
  },
  pending_review: {
    label: "Under Review",
    icon: Clock,
    classes: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  published: {
    label: "Published",
    icon: CheckCircle2,
    classes: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  rejected: {
    label: "Needs Changes",
    icon: XCircle,
    classes: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  archived: {
    label: "Archived",
    icon: FileEdit,
    classes: "bg-muted text-muted-foreground border-border",
  },
};

export function StatusBadgeOwner({ status, size = "md" }: StatusBadgeOwnerProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
  };

  const iconSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border",
        config.classes,
        sizeClasses[size]
      )}
    >
      <Icon className={iconSize[size]} />
      {config.label}
    </span>
  );
}
