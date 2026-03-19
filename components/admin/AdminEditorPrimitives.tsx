import type { ReactNode } from "react";
import { Link } from "@/components/router/nextRouterCompat";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdminEditorHeaderProps {
  title: string;
  description: string;
  backTo: string;
  backLabel: string;
  actions?: ReactNode;
}

export function AdminEditorHeader({
  title,
  description,
  backTo,
  backLabel,
  actions,
}: AdminEditorHeaderProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[28px] border border-border/70 bg-card/90 px-5 py-4 shadow-sm lg:flex-row lg:items-end lg:justify-between lg:px-6">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" asChild className="h-8 rounded-full px-2.5 text-muted-foreground">
          <Link href={backTo}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-semibold tracking-tight text-foreground lg:text-3xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

interface AdminEditorCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  headerActions?: ReactNode;
}

export function AdminEditorCard({
  title,
  description,
  icon,
  children,
  className,
  contentClassName,
  headerActions,
}: AdminEditorCardProps) {
  return (
    <Card className={cn("rounded-[24px] border-border/70 bg-card/95 shadow-sm", className)}>
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              {icon ? <span className="text-primary">{icon}</span> : null}
              {title}
            </CardTitle>
            {description ? <CardDescription className="text-sm leading-6">{description}</CardDescription> : null}
          </div>
          {headerActions}
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-4", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
