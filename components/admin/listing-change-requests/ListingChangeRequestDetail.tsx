import Link from "next/link";
import { ArrowLeft, ExternalLink, FilePenLine } from "lucide-react";

import type { AdminListingChangeRequestListItem } from "@/lib/admin/listing-change-requests/types";
import { ListingChangeRequestReviewActions } from "@/components/admin/listing-change-requests/ListingChangeRequestReviewActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildLocalizedPath } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "—";
  }
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/60 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

function ValueBox({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/60 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <pre className="mt-2 max-h-52 whitespace-pre-wrap break-words font-sans text-sm text-foreground">
        {formatValue(value)}
      </pre>
    </div>
  );
}

export function ListingChangeRequestDetail({
  request,
  locale,
}: {
  request: AdminListingChangeRequestListItem;
  locale: string;
}) {
  const adminRequestsHref = buildLocalizedPath(locale, "/admin/listing-change-requests");
  const listingHref = request.listing?.slug
    ? buildLocalizedPath(locale, `/listing/${request.listing.slug}`)
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
            <Link href={adminRequestsHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to change requests
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-sm border border-primary/20 bg-primary/10 text-primary">
              <FilePenLine className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-serif text-3xl font-semibold text-foreground lg:text-4xl">
                {request.listing?.name ?? "Listing change request"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Request reference {request.id}
              </p>
            </div>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "w-fit text-sm",
            request.status === "pending" &&
              "border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
            request.status === "approved" &&
              "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
            request.status === "rejected" &&
              "border-red-400/40 bg-red-500/10 text-red-700 dark:text-red-300",
          )}
        >
          {STATUS_LABELS[request.status] ?? request.status}
        </Badge>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="h-fit border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Current listing</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <DetailRow label="Listing name" value={request.listing?.name} />
            <DetailRow label="Listing ID" value={request.listingId} />
            <DetailRow label="Slug" value={request.listing?.slug} />
            <DetailRow label="City" value={request.listing?.city} />
            <DetailRow label="Category" value={request.listing?.category} />
            <DetailRow label="Claim status" value={request.listing?.claimStatus} />
            <DetailRow label="Owner ID" value={request.listing?.ownerId} />
            <DetailRow label="Website" value={request.listing?.websiteUrl} />
            <DetailRow label="Phone" value={request.listing?.phone} />
            <DetailRow label="Email" value={request.listing?.email} />
            <div className="md:col-span-2">
              <DetailRow label="Address" value={request.listing?.address} />
            </div>
            {listingHref ? (
              <div className="md:col-span-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href={listingHref}>
                    Open public listing
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Owner request</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <DetailRow label="Owner name" value={request.owner?.name} />
              <DetailRow label="Owner email" value={request.owner?.email} />
              <DetailRow label="Owner phone" value={request.owner?.phone} />
              <DetailRow label="Owner ID" value={request.ownerId} />
              <DetailRow label="Requested field" value={request.fieldLabel} />
              <DetailRow label="Status" value={STATUS_LABELS[request.status] ?? request.status} />
              <DetailRow label="Submitted" value={formatDate(request.createdAt)} />
              <DetailRow label="Reviewed at" value={formatDate(request.reviewedAt)} />
              <DetailRow label="Reviewed by" value={request.reviewer?.name || request.reviewedBy} />
              <div className="md:col-span-2">
                <ValueBox label="Current value" value={request.listing?.currentValue} />
              </div>
              <div className="md:col-span-2">
                <ValueBox label="Value at request time" value={request.oldValue} />
              </div>
              <div className="md:col-span-2">
                <ValueBox label="Requested value" value={request.requestedValue} />
              </div>
              <div className="md:col-span-2 rounded-lg border border-border/70 bg-background/60 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Admin note</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                  {request.adminNote || "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          <ListingChangeRequestReviewActions requestId={request.id} status={request.status} />
        </div>
      </div>
    </div>
  );
}

