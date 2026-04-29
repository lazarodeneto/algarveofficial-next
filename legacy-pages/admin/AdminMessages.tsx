import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, RefreshCw, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ThreadFilters } from "@/components/admin/messages/ThreadFilters";
import { ThreadDetailDialog } from "@/components/admin/messages/ThreadDetailDialog";
import {
  ChatThread,
  useAdminChatThreads,
  useAdminOwners,
  useDeleteThread,
} from "@/hooks/useAdminChat";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export default function AdminMessages() {
  const [status, setStatus] = useState("all");
  const router = useRouter();
  const pathname = usePathname() || "/admin/messages";
  const searchParams = useSearchParams();
  const ownerFromQuery = searchParams.get("ownerId") || "";
  const [ownerId, setOwnerId] = useState(ownerFromQuery);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<ChatThread | null>(null);

  const setSearchParams = useCallback(
    (
      nextInit: URLSearchParams | ((current: URLSearchParams) => URLSearchParams),
      options?: { replace?: boolean }
    ) => {
      const current = new URLSearchParams(searchParams.toString());
      const nextParams = typeof nextInit === "function" ? nextInit(current) : nextInit;
      const query = nextParams.toString();
      const href = query ? `${pathname}?${query}` : pathname;
      if (options?.replace) {
        router.replace(href);
        return;
      }
      router.push(href);
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    setOwnerId(ownerFromQuery);
  }, [ownerFromQuery]);

  const filters = {
    status: status !== "all" ? status : undefined,
    ownerId: ownerId || undefined,
    dateFrom,
    dateTo,
  };

  const { data: threads = [], isLoading, refetch } = useAdminChatThreads(filters);
  const { data: owners = [] } = useAdminOwners();
  const deleteThread = useDeleteThread();

  const hasFilters = status !== "all" || ownerId !== "" || dateFrom !== undefined || dateTo !== undefined;

  const handleOwnerChange = (nextOwnerId: string) => {
    setOwnerId(nextOwnerId);

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextOwnerId) {
        next.set("ownerId", nextOwnerId);
      } else {
        next.delete("ownerId");
      }
      return next;
    }, { replace: true });
  };

  const clearFilters = () => {
    setStatus("all");
    handleOwnerChange("");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const handleRowClick = (thread: ChatThread) => {
    setSelectedThread(thread);
    setDialogOpen(true);
  };

  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-green-500/20 text-green-400 border-green-500/30" },
    closed: { label: "Closed", className: "bg-muted text-muted-foreground border-border" },
    blocked: { label: "Blocked", className: "bg-destructive/20 text-destructive border-destructive/30" },
  };

  const columns: Column<ChatThread>[] = [
    {
      key: "viewer",
      label: "Viewer",
      render: (thread) => (
        <div>
          <p className="font-medium">
            {thread.viewer?.full_name || thread.contact_name || "Guest"}
          </p>
          {thread.contact_email && !thread.viewer && (
            <p className="text-xs text-muted-foreground">{thread.contact_email}</p>
          )}
        </div>
      ),
    },
    {
      key: "owner",
      label: "Owner",
      render: (thread) => (
        <div>
          <p className="font-medium">{thread.owner?.full_name || "Unknown"}</p>
        </div>
      ),
    },
    {
      key: "listing",
      label: "Listing",
      render: (thread) => (
        <p className="max-w-[200px] truncate">
          {thread.listing?.name || "General Inquiry"}
        </p>
      ),
    },
    {
      key: "channel",
      label: "Channel",
      render: (thread) => (
        <Badge variant="outline" className="capitalize">
          {thread.channel}
        </Badge>
      ),
    },
    {
      key: "message_count",
      label: "Messages",
      render: (thread) => (
        <span className="text-muted-foreground">{thread.message_count || 0}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (thread) => {
        const config = statusConfig[thread.status] || statusConfig.active;
        return (
          <Badge variant="outline" className={cn("capitalize", config.className)}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: "last_message_at",
      label: "Last Activity",
      render: (thread) => (
        <span className="text-muted-foreground text-sm">
          {thread.last_message_at
            ? format(new Date(thread.last_message_at), "PP p")
            : "No messages"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (thread) => (
        <span className="text-muted-foreground text-sm">
          {format(new Date(thread.created_at), "PP")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-12",
      render: (thread) => (
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            setThreadToDelete(thread);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-semibold text-foreground">
            Messages
          </h1>
          <p className="text-muted-foreground mt-1">
            View and moderate all chat threads across the platform
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading} className="w-full sm:w-auto">
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Threads</p>
            <p className="text-2xl font-semibold">{threads.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-semibold text-green-400">
              {threads.filter((t) => t.status === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Closed</p>
            <p className="text-2xl font-semibold">
              {threads.filter((t) => t.status === "closed").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Blocked</p>
            <p className="text-2xl font-semibold text-destructive">
              {threads.filter((t) => t.status === "blocked").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ThreadFilters
        status={status}
        onStatusChange={setStatus}
        ownerId={ownerId}
        onOwnerChange={handleOwnerChange}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        owners={owners}
        onClearFilters={clearFilters}
        hasFilters={hasFilters}
      />

      {/* Threads Table */}
      {isLoading ? (
        <Card className="bg-card border-border">
          <CardContent className="flex items-center justify-center py-16">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : threads.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-1">No threads found</p>
            <p className="text-muted-foreground text-center max-w-md">
              {hasFilters
                ? "No threads match your current filters. Try adjusting or clearing them."
                : "Chat threads will appear here when viewers start conversations with listing owners."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={threads}
          onRowClick={handleRowClick}
          emptyMessage="No threads found"
        />
      )}

      {/* Thread Detail Dialog */}
      <ThreadDetailDialog
        thread={selectedThread}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <ConfirmDialog
        open={!!threadToDelete}
        onOpenChange={(open) => !open && setThreadToDelete(null)}
        title="Delete thread"
        description="This will permanently delete the conversation and all its messages."
        confirmLabel={deleteThread.isPending ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={() => {
          if (!threadToDelete) return;
          deleteThread.mutate(threadToDelete.id, {
            onSuccess: () => {
              if (selectedThread?.id === threadToDelete.id) {
                setDialogOpen(false);
                setSelectedThread(null);
              }
              setThreadToDelete(null);
            },
          });
        }}
      />
    </div>
  );
}
