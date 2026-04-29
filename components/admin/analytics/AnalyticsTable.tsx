import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface AnalyticsTableProps<T> {
  title: string;
  description?: string;
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  className?: string;
  showExport?: boolean;
  onExport?: () => void;
  emptyMessage?: string;
}

export function AnalyticsTable<T extends Record<string, unknown>>({
  title,
  description,
  data,
  columns,
  loading = false,
  className,
  showExport = false,
  onExport,
  emptyMessage = "No data available",
}: AnalyticsTableProps<T>) {
  const handleExport = () => {
    if (onExport) {
      onExport();
      return;
    }

    // Default CSV export
    const headers = columns.map((c) => c.header).join(",");
    const rows = data.map((item) =>
      columns
        .map((c) => {
          const value = item[c.key as keyof T];
          return typeof value === "string" ? `"${value}"` : value;
        })
        .join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className={cn("bg-card border-border", className)}>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-serif text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {showExport && data.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  {columns.map((column, i) => (
                    <TableHead key={i} className={cn("text-foreground", column.className)}>
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, rowIndex) => (
                  <TableRow key={rowIndex} className="hover:bg-muted/20">
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex} className={column.className}>
                        {column.render
                          ? column.render(item)
                          : (item[column.key as keyof T] as ReactNode)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
