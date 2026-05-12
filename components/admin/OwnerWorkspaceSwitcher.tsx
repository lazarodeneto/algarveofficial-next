"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useLocalePath } from "@/hooks/useLocalePath";
import { cn } from "@/lib/utils";

type OwnerWorkspace = "crm" | "claims";

interface OwnerWorkspaceSwitcherProps {
  active: OwnerWorkspace;
  ownerBadge?: string;
  claimsBadge?: string;
  claimsBadgeTone?: "default" | "warning" | "destructive";
  compact?: boolean;
}

const WORKSPACES = {
  crm: {
    href: "/admin/crm",
    title: "Owner CRM",
    description: "Owners, messages, subscriptions and listing performance.",
    icon: Users,
  },
  claims: {
    href: "/admin/business-claims",
    title: "Business Claims",
    description: "Review ownership requests before assigning listings.",
    icon: ShieldCheck,
  },
} as const;

function getBadgeClasses(tone: OwnerWorkspaceSwitcherProps["claimsBadgeTone"]) {
  if (tone === "destructive") {
    return "border-red-300 bg-red-50 text-red-700 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-300";
  }

  if (tone === "warning") {
    return "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-300";
  }

  return "bg-background/80";
}

export function OwnerWorkspaceSwitcher({
  active,
  ownerBadge,
  claimsBadge,
  claimsBadgeTone = "default",
  compact = false,
}: OwnerWorkspaceSwitcherProps) {
  const l = useLocalePath();

  const renderWorkspace = (workspace: OwnerWorkspace) => {
    const item = WORKSPACES[workspace];
    const Icon = item.icon;
    const isActive = active === workspace;
    const badge = workspace === "crm" ? ownerBadge : claimsBadge;
    const content = (
      <div className="flex h-full items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "mt-0.5 flex shrink-0 items-center justify-center rounded-xl border",
              compact ? "h-8 w-8" : "h-9 w-9",
              isActive
                ? "border-primary/20 bg-background/80 text-primary"
                : "border-primary/20 bg-primary/10 text-primary",
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {badge ? (
            <Badge
              variant="outline"
              className={cn(
                "max-w-[9rem] truncate whitespace-nowrap",
                workspace === "claims" ? getBadgeClasses(claimsBadgeTone) : "bg-background/80",
              )}
            >
              {badge}
            </Badge>
          ) : null}
          {!isActive ? (
            <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
          ) : null}
        </div>
      </div>
    );

    if (isActive) {
      return (
        <div
          key={workspace}
          className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3"
          aria-current="page"
        >
          {content}
        </div>
      );
    }

    return (
      <Link
        key={workspace}
        href={l(item.href)}
        className="group rounded-xl border border-border/70 bg-background/70 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
      >
        {content}
      </Link>
    );
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card/85 p-2 shadow-sm backdrop-blur">
      <div className="grid gap-2 lg:grid-cols-2">
        {renderWorkspace("crm")}
        {renderWorkspace("claims")}
      </div>
    </div>
  );
}
