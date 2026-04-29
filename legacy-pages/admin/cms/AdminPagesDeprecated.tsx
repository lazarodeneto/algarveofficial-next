import { DashboardBreadcrumb } from "@/components/ui/dashboard-breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Layers, ArrowRight } from "lucide-react";
import { LocaleLink } from "@/components/navigation/LocaleLink";

export default function AdminPagesDeprecated() {
  return (
    <div className="space-y-6">
      <div>
        <DashboardBreadcrumb />
        <h1 className="text-2xl font-serif font-bold text-foreground mt-2">Pages</h1>
        <p className="text-muted-foreground">
          This module has been deprecated because it writes to a non-runtime data source.
        </p>
      </div>

      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Editorial Path Deprecated
          </CardTitle>
          <CardDescription>
            The legacy Pages editor stored records in the <code>pages</code> table, but public routes do not consume that table.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use the Full Page Builder and dedicated CMS modules (Home, Partner, Legal, Menus, etc.) as the runtime-backed source of truth.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <LocaleLink href="/admin/content/page-builder">
                <Layers className="h-4 w-4 mr-2" />
                Open Full Page Builder
              </LocaleLink>
            </Button>
            <Button asChild variant="outline">
              <LocaleLink href="/admin/content/home">
                Open Home CMS
                <ArrowRight className="h-4 w-4 ml-2" />
              </LocaleLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
