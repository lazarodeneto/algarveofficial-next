import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, ExternalLink, RefreshCw, Wrench } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { fetchAdmin } from "@/lib/api/fetchAdmin";
import { useLocalePath } from "@/hooks/useLocalePath";

type UrlHealthIssue = {
  listing_id: string;
  listing_name: string;
  current_slug: string;
  suggested_slug?: string;
  current_path?: string;
  suggested_path?: string;
  conflict_slug?: string;
  conflict_listing_id?: string;
  aliases?: Array<{
    id: string;
    slug: string;
    is_current: boolean;
  }>;
};

type UrlHealthResponse = {
  counts: {
    listings: number;
    aliases: number;
    suggested_slug_mismatches: number;
    missing_current_slug_rows: number;
    multiple_current_slug_rows: number;
    alias_conflicts: number;
  };
  suggested_slug_mismatches: UrlHealthIssue[];
  missing_current_slug_rows: UrlHealthIssue[];
  multiple_current_slug_rows: UrlHealthIssue[];
  alias_conflicts: UrlHealthIssue[];
};

function IssuePanel({
  title,
  description,
  issues,
  actionLabel,
  action,
  onRepair,
  isRepairing,
}: {
  title: string;
  description: string;
  issues: UrlHealthIssue[];
  actionLabel?: string;
  action?: "repair-current-alias" | "update-to-suggested";
  onRepair: (action: "repair-current-alias" | "update-to-suggested", listingId: string) => void;
  isRepairing: boolean;
}) {
  const l = useLocalePath();

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-medium text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant={issues.length > 0 ? "outline" : "secondary"}>
          {issues.length} issue{issues.length === 1 ? "" : "s"}
        </Badge>
      </div>

      {issues.length === 0 ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Clear
        </div>
      ) : (
        <div className="mt-5 divide-y divide-border">
          {issues.slice(0, 25).map((issue) => (
            <div key={`${title}-${issue.listing_id}-${issue.suggested_slug ?? issue.conflict_slug ?? issue.current_slug}`} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{issue.listing_name}</p>
                  <p className="mt-1 break-all text-xs text-muted-foreground">
                    Current: {issue.current_path ?? issue.current_slug}
                  </p>
                  {issue.suggested_slug ? (
                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      Suggested: {issue.suggested_path ?? issue.suggested_slug}
                    </p>
                  ) : null}
                  {issue.conflict_slug ? (
                    <p className="mt-1 break-all text-xs text-destructive">
                      Conflict: {issue.conflict_slug} is tied to {issue.conflict_listing_id}
                    </p>
                  ) : null}
                  {issue.aliases && issue.aliases.length > 0 ? (
                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      Current rows: {issue.aliases.map((alias) => alias.slug).join(", ")}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={l(`/admin/listings/${issue.listing_id}/edit`)}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  {action && actionLabel ? (
                    <Button
                      size="sm"
                      onClick={() => onRepair(action, issue.listing_id)}
                      disabled={isRepairing}
                    >
                      <Wrench className="mr-2 h-4 w-4" />
                      {actionLabel}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
          {issues.length > 25 ? (
            <p className="pt-4 text-xs text-muted-foreground">Showing first 25 issues.</p>
          ) : null}
        </div>
      )}
    </section>
  );
}

export default function AdminUrlHealth() {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["admin-url-health"],
    queryFn: async () => {
      const response = await fetchAdmin("/api/admin/listings/url-health");
      return response.data as UrlHealthResponse;
    },
  });

  const repairMutation = useMutation({
    mutationFn: async ({
      action,
      listingId,
    }: {
      action: "repair-current-alias" | "update-to-suggested";
      listingId: string;
    }) => {
      return fetchAdmin("/api/admin/listings/url-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, listing_id: listingId }),
      });
    },
    onSuccess: () => {
      toast.success("URL health repaired.");
      void queryClient.invalidateQueries({ queryKey: ["admin-url-health"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-listings"], exact: false });
      void queryClient.invalidateQueries({ queryKey: ["listing", "admin"], exact: false });
    },
    onError: (repairError) => {
      toast.error(repairError instanceof Error ? repairError.message : "Repair failed.");
    },
  });

  const handleRepair = (
    action: "repair-current-alias" | "update-to-suggested",
    listingId: string,
  ) => {
    const confirmed = window.confirm(
      action === "update-to-suggested"
        ? "Update this listing URL to the suggested slug and preserve the old URL as a redirect?"
        : "Repair this listing's current slug alias row?",
    );
    if (!confirmed) return;
    repairMutation.mutate({ action, listingId });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-destructive">
        <AlertTriangle className="mb-3 h-6 w-6" />
        Unable to load URL health.
      </div>
    );
  }

  const totalIssues =
    data.counts.suggested_slug_mismatches +
    data.counts.missing_current_slug_rows +
    data.counts.multiple_current_slug_rows +
    data.counts.alias_conflicts;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-foreground">URL Health</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review canonical listing slugs, redirect aliases, and current slug row integrity.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void queryClient.invalidateQueries({ queryKey: ["admin-url-health"] })}
          disabled={isFetching}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Listings</p>
          <p className="mt-1 text-2xl font-semibold">{data.counts.listings}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Aliases</p>
          <p className="mt-1 text-2xl font-semibold">{data.counts.aliases}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Suggestions</p>
          <p className="mt-1 text-2xl font-semibold">{data.counts.suggested_slug_mismatches}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Alias Rows</p>
          <p className="mt-1 text-2xl font-semibold">
            {data.counts.missing_current_slug_rows + data.counts.multiple_current_slug_rows}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Issues</p>
          <p className="mt-1 text-2xl font-semibold">{totalIssues}</p>
        </div>
      </div>

      <IssuePanel
        title="Suggested Slug Differences"
        description="Listings whose canonical slug differs from the current slug policy. These require intentional URL changes."
        issues={data.suggested_slug_mismatches}
        action="update-to-suggested"
        actionLabel="Use Suggested URL"
        onRepair={handleRepair}
        isRepairing={repairMutation.isPending}
      />
      <IssuePanel
        title="Missing Current Slug Rows"
        description="Listings where listings.slug has no matching current row in listing_slugs."
        issues={data.missing_current_slug_rows}
        action="repair-current-alias"
        actionLabel="Repair Current Row"
        onRepair={handleRepair}
        isRepairing={repairMutation.isPending}
      />
      <IssuePanel
        title="Multiple Current Slug Rows"
        description="Listings with more than one current alias. Repair keeps listings.slug current and marks the others historical."
        issues={data.multiple_current_slug_rows}
        action="repair-current-alias"
        actionLabel="Repair Current Rows"
        onRepair={handleRepair}
        isRepairing={repairMutation.isPending}
      />
      <IssuePanel
        title="Alias Conflicts"
        description="Slug aliases that collide with another listing's canonical slug. These need manual review."
        issues={data.alias_conflicts}
        onRepair={handleRepair}
        isRepairing={repairMutation.isPending}
      />
    </div>
  );
}
