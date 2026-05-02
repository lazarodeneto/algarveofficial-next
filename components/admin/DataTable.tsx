import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string | ReactNode;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  tableClassName?: string;
  wrapperClassName?: string;
  density?: "default" | "compact";
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  emptyMessage = "No data found",
  tableClassName,
  wrapperClassName,
  density = "default",
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;
  const isCompact = density === "compact";

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(data.map((item) => item.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedIds, id]);
    } else {
      onSelectionChange?.(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  return (
    <div className={cn("overflow-x-auto rounded-sm border border-border/70 bg-card/95 shadow-sm", wrapperClassName)}>
      <Table className={cn("min-w-[720px]", tableClassName)}>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {selectable && (
              <TableHead className={cn("w-12", isCompact && "h-10 px-3")}>
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) {
                      (el as HTMLButtonElement).dataset.indeterminate = someSelected ? "true" : "false";
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "text-muted-foreground",
                  isCompact && "h-10 px-3 text-[11px] font-semibold uppercase tracking-[0.16em]",
                  column.className,
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="h-32 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow
                key={item.id}
                className={cn(
                  "transition-colors",
                  selectedIds.includes(item.id) && "bg-primary/5",
                  onRowClick && "cursor-pointer hover:bg-muted/50",
                )}
                onClick={() => onRowClick?.(item)}
              >
                {selectable && (
                  <TableCell
                    onClick={(event) => event.stopPropagation()}
                    className={cn(isCompact && "px-3 py-2.5")}
                  >
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={(checked) => handleSelectRow(item.id, checked as boolean)}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(isCompact && "px-3 py-2.5 align-middle", column.className)}
                  >
                    {column.render
                      ? column.render(item)
                      : (item as Record<string, unknown>)[column.key] as ReactNode}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
