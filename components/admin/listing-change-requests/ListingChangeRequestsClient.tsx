"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  FilePenLine,
  List,
  Loader2,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

import type {
  AdminListingChangeRequestListItem,
  AdminListingChangeRequestsListResponse,
} from "@/lib/admin/listing-change-requests/types";
import {
  LISTING_CHANGE_REQUEST_STATUSES,
  type ListingChangeRequestStatus,
} from "@/lib/admin/listing-change-requests/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocalePath } from "@/hooks/useLocalePath";
import { cn } from "@/lib/utils";

type StatusFilter = ListingChangeRequestStatus | "all";

interface RequestsApiResponse {
  ok: true;
  requests: AdminListingChangeRequestsListResponse;
}

const QUERY_KEY = ["admin-listing-change-requests"] as const;
const PAGE_SIZE = 25;

const STATUS_LABELS: Record<ListingChangeRequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_STYLES: Record<ListingChangeRequestStatus, string> = {
  pending: "border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  approved: "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected: "border-red-400/40 bg-red-500/10 text-red-700 dark:text-red-300",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return "—";
  }
}

async function fetchListingChangeRequests({
  status,
  page,
}: {
  status: StatusFilter;
  page: number;
}): Promise<AdminListingChangeRequestsListResponse> {
  const params = new URLSearchParams({
    status,
    page: String(page),
    pageSize: String(PAGE_SIZE),
  });

  const response = await fetch(`/api/admin/listing-change-requests?${params}`, {
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as
    | RequestsApiResponse
    | { ok?: false; error?: { message?: string } }
    | null;

  if (!response.ok || body?.ok !== true) {
    throw new Error(
      body && "error" in body
        ? body.error?.message ?? "Failed to load listing change requests."
        : "Failed to load listing change requests.",
    );
  }

  return body.requests;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = LISTING_CHANGE_REQUEST_STATUSES.includes(status as ListingChangeRequestStatus)
    ? (status as ListingChangeRequestStatus)
    : "pending";

  return (
    <Badge variant="outline" className={cn("whitespace-nowrap", STATUS_STYLES[normalized])}>
      {STATUS_LABELS[normalized]}
    </Badge>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
      <FilePenLine className="mb-4 h-10 w-10 text-muted-foreground/70" />
      <h2 className="font-serif text-xl font-semibold text-foreground">
        {hasFilters ? "No matching change requests" : "No owner change requests yet"}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {hasFilters
          ? "Try changing the status filter."
          : "Owner-submitted listing edits will appear here for admin review."}
      </p>
    </div>
  );
}

function SetupRequiredState({ message }: { message?: string | null }) {
  return (
    <div className="rounded-lg border border-amber-400/35 bg-amber-500/10 p-5 text-sm text-amber-950 dark:text-amber-100">
      <div className="flex gap-3">
        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" />
        <div>
          <h2 className="font-semibold text-foreground">
            Listing change request storage is not ready
          </h2>
          <p className="mt-1 text-muted-foreground">
            {message ??
              "The database table is missing from the Supabase schema cache. Apply the listing change requests migration and refresh this page."}
          </p>
        </div>
      </div>
    </div>
  );
}

function MobileRequestCard({ request }: { request: AdminListingChangeRequestListItem }) {
  const l = useLocalePath();

  return (
    <Card className="border-border/70 bg-card/90 shadow-sm lg:hidden">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">
              {request.listing?.name ?? "Missing listing"}
            </p>
            <p className="text-xs text-muted-foreground">
              {[request.listing?.city, request.listing?.category].filter(Boolean).join(" · ") ||
                "No location metadata"}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Field:</span>{" "}
            <span className="font-medium text-foreground">{request.fieldLabel}</span>
          </p>
          <p className="line-clamp-2">
            <span className="text-muted-foreground">Requested:</span>{" "}
            {formatValue(request.requestedValue)}
          </p>
          <p className="text-muted-foreground">
            Owner: {request.owner?.name || request.owner?.email || request.ownerId}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={l(`/admin/listing-change-requests/${request.id}`)}>
            Review request
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function ListingChangeRequestsClient() {
  const l = useLocalePath();
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: [...QUERY_KEY, status, page],
    queryFn: () => fetchListingChangeRequests({ status, page }),
    staleTime: 0,
    refetchOnReconnect: true,
  });

  const requests = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 1;
  const setupRequired = query.data?.setupRequired === true;
  const hasFilters = status !== "pending";

  const resetPage = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-card/85 p-2 shadow-sm backdrop-blur">
        <div className="grid gap-2 lg:grid-cols-2">
          <Link
            href={l("/admin/listings")}
            className="group rounded-xl border border-border/70 bg-background/70 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <List className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">All listings</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Return to search, status, tiers and ranking controls.
                </p>
              </div>
              <span className="ml-auto text-primary transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </div>
          </Link>

          <div className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-background/80 text-primary">
                  <FilePenLine className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Owner change requests
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Review proposed owner edits before publishing changes.
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="shrink-0 bg-background/80">
                {query.isFetching ? "Checking..." : `${total} shown`}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-sm border border-primary/20 bg-primary/10 text-primary">
              <FilePenLine className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-serif text-3xl font-semibold text-foreground lg:text-4xl">
                Listing Change Requests
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review owner-submitted edits before applying them to public listings.
              </p>
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => query.refetch()}
          disabled={query.isFetching}
          className="w-fit"
        >
          {query.isFetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>Review queue</CardTitle>
            <CardDescription>
              Pending requests are shown first by default. Approval updates the linked listing.
            </CardDescription>
          </div>
          <div className="w-full max-w-xs">
            <Select
              value={status}
              onValueChange={(value) => resetPage(() => setStatus(value as StatusFilter))}
            >
              <SelectTrigger aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {LISTING_CHANGE_REQUEST_STATUSES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {STATUS_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : query.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {query.error instanceof Error
                ? query.error.message
                : "Failed to load listing change requests."}
            </div>
          ) : setupRequired ? (
            <SetupRequiredState message={query.data?.setupMessage} />
          ) : requests.length === 0 ? (
            <EmptyState hasFilters={hasFilters} />
          ) : (
            <>
              <div className="space-y-3 lg:hidden">
                {requests.map((request) => (
                  <MobileRequestCard key={request.id} request={request} />
                ))}
              </div>

              <div className="hidden overflow-hidden rounded-lg border border-border/70 lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>Old value</TableHead>
                      <TableHead>Requested value</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="max-w-[240px]">
                            <p className="font-medium text-foreground">
                              {request.listing?.name ?? "Missing listing"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {[request.listing?.city, request.listing?.category]
                                .filter(Boolean)
                                .join(" · ") || request.listingId}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{request.fieldLabel}</TableCell>
                        <TableCell className="max-w-[220px] truncate text-muted-foreground">
                          {formatValue(request.oldValue)}
                        </TableCell>
                        <TableCell className="max-w-[260px] truncate">
                          {formatValue(request.requestedValue)}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[220px]">
                            <p className="font-medium text-foreground">
                              {request.owner?.name || "Owner"}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {request.owner?.email || request.ownerId}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={request.status} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDate(request.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={l(`/admin/listing-change-requests/${request.id}`)}>
                              Review
                              <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {requests.length} of {total} request{total === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || query.isFetching}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages || query.isFetching}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
