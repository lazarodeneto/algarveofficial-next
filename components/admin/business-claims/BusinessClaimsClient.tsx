"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import {
  BUSINESS_CLAIM_STATUSES,
  BUSINESS_CLAIM_TIERS,
  BUSINESS_CLAIM_VERIFICATION_METHODS,
  type AdminBusinessClaimListItem,
  type AdminBusinessClaimsListResponse,
  type BusinessClaimStatus,
  type BusinessClaimTier,
} from "@/lib/admin/business-claims/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { OwnerWorkspaceSwitcher } from "@/components/admin/OwnerWorkspaceSwitcher";
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

type StatusFilter = BusinessClaimStatus | "all";
type TierFilter = BusinessClaimTier | "all";

interface ClaimsApiResponse {
  ok: true;
  claims: AdminBusinessClaimsListResponse;
}

const QUERY_KEY = ["admin-business-claims"] as const;
const PAGE_SIZE = 25;

const STATUS_LABELS: Record<BusinessClaimStatus, string> = {
  pending: "Pending",
  needs_more_info: "Needs more info",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

const STATUS_STYLES: Record<BusinessClaimStatus, string> = {
  pending: "border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  needs_more_info: "border-sky-400/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  approved: "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected: "border-red-400/40 bg-red-500/10 text-red-700 dark:text-red-300",
  cancelled: "border-muted-foreground/30 bg-muted/40 text-muted-foreground",
  disputed: "border-purple-400/40 bg-purple-500/10 text-purple-700 dark:text-purple-300",
};

const TIER_LABELS: Record<BusinessClaimTier, string> = {
  free: "Free Claim",
  verified: "Verified Business",
  signature: "Signature Partner",
};

const METHOD_LABELS: Record<string, string> = {
  business_email_domain: "Business email domain",
  phone_verification: "Phone verification",
  website_contact_match: "Website contact match",
  official_social_account: "Official social account",
  document_upload: "Document upload",
  manual_review: "Manual review",
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

function formatMethod(value: string) {
  return METHOD_LABELS[value] ?? value.replace(/_/g, " ");
}

function scoreTone(score: number | null) {
  if (score === null) return "text-muted-foreground";
  if (score >= 60) return "text-emerald-600 dark:text-emerald-300";
  if (score >= 30) return "text-amber-600 dark:text-amber-300";
  return "text-muted-foreground";
}

async function fetchBusinessClaims({
  status,
  selectedTier,
  verificationMethod,
  page,
}: {
  status: StatusFilter;
  selectedTier: TierFilter;
  verificationMethod: string;
  page: number;
}): Promise<AdminBusinessClaimsListResponse> {
  const params = new URLSearchParams({
    status,
    selectedTier,
    verificationMethod,
    page: String(page),
    pageSize: String(PAGE_SIZE),
  });

  const response = await fetch(`/api/admin/business-claims?${params}`, {
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as
    | ClaimsApiResponse
    | { ok?: false; error?: { message?: string } }
    | null;

  if (!response.ok || body?.ok !== true) {
    throw new Error(
      body && "error" in body
        ? body.error?.message ?? "Failed to load business claims."
        : "Failed to load business claims.",
    );
  }

  return body.claims;
}

function ClaimStatusBadge({ status }: { status: BusinessClaimStatus }) {
  return (
    <Badge variant="outline" className={cn("whitespace-nowrap", STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
      <ShieldCheck className="mb-4 h-10 w-10 text-muted-foreground/70" />
      <h2 className="font-serif text-xl font-semibold text-foreground">
        {hasFilters ? "No matching claims" : "No business claims yet"}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {hasFilters
          ? "Try changing the status, tier, or verification method filters."
          : "Structured claim requests submitted from public listing pages will appear here."}
      </p>
    </div>
  );
}

function ClaimMobileCard({ claim }: { claim: AdminBusinessClaimListItem }) {
  const l = useLocalePath();

  return (
    <Card className="border-border/70 bg-card/90 shadow-sm lg:hidden">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">
              {claim.listing?.name ?? "Missing listing"}
            </p>
            <p className="text-xs text-muted-foreground">
              {[claim.listing?.city, claim.listing?.category].filter(Boolean).join(" · ") || "No location metadata"}
            </p>
          </div>
          <ClaimStatusBadge status={claim.status} />
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Claimant</p>
            <p className="font-medium text-foreground">{claim.claimantName}</p>
            <p className="text-muted-foreground">{claim.claimantEmail}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Review</p>
            <p className="font-medium text-foreground">{TIER_LABELS[claim.selectedTier]}</p>
            <p className={cn("font-medium", scoreTone(claim.confidenceScore))}>
              {claim.confidenceScore ?? 0}% confidence
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={l(`/admin/business-claims/${claim.id}`)}>
            View claim
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function BusinessClaimsClient() {
  const l = useLocalePath();
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [selectedTier, setSelectedTier] = useState<TierFilter>("all");
  const [verificationMethod, setVerificationMethod] = useState<string>("all");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: [...QUERY_KEY, status, selectedTier, verificationMethod, page],
    queryFn: () => fetchBusinessClaims({ status, selectedTier, verificationMethod, page }),
    staleTime: 0,
    refetchOnReconnect: true,
  });

  const claims = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 1;
  const hasFilters = status !== "pending" || selectedTier !== "all" || verificationMethod !== "all";
  const claimsWorkspaceBadge = query.isError
    ? "Setup needed"
    : query.isFetching && !query.data
      ? "Checking..."
      : `${total} ${total === 1 ? "claim" : "claims"}`;

  const methodOptions = useMemo(
    () => ["all", ...BUSINESS_CLAIM_VERIFICATION_METHODS],
    [],
  );

  const resetPage = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <OwnerWorkspaceSwitcher
        active="claims"
        ownerBadge="CRM"
        claimsBadge={claimsWorkspaceBadge}
        claimsBadgeTone={query.isError ? "destructive" : total > 0 ? "warning" : "default"}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-sm border border-primary/20 bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-serif text-3xl font-semibold text-foreground lg:text-4xl">
                Business Claims
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review structured ownership claims linked to existing AlgarveOfficial listings.
              </p>
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => query.refetch()}
          disabled={query.isFetching}
        >
          {query.isFetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur">
        <CardHeader className="gap-4 border-b border-border/70">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Claim queue</CardTitle>
              <CardDescription>
                Pending claims are shown by default, newest first.
              </CardDescription>
            </div>
            <Badge variant="outline" className="w-fit">
              {total} {total === 1 ? "claim" : "claims"}
            </Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Select value={status} onValueChange={(value) => resetPage(() => setStatus(value as StatusFilter))}>
              <SelectTrigger className="h-10 border-border/70 bg-background/80">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {BUSINESS_CLAIM_STATUSES.filter((item) => item !== "cancelled").map((item) => (
                  <SelectItem key={item} value={item}>
                    {STATUS_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedTier}
              onValueChange={(value) => resetPage(() => setSelectedTier(value as TierFilter))}
            >
              <SelectTrigger className="h-10 border-border/70 bg-background/80">
                <SelectValue placeholder="Selected tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tiers</SelectItem>
                {BUSINESS_CLAIM_TIERS.map((tier) => (
                  <SelectItem key={tier} value={tier}>
                    {TIER_LABELS[tier]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={verificationMethod}
              onValueChange={(value) => resetPage(() => setVerificationMethod(value))}
            >
              <SelectTrigger className="h-10 border-border/70 bg-background/80">
                <SelectValue placeholder="Verification method" />
              </SelectTrigger>
              <SelectContent>
                {methodOptions.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method === "all" ? "All verification methods" : formatMethod(method)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {query.isLoading ? (
            <div className="flex min-h-[360px] items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading business claims...
            </div>
          ) : query.isError ? (
            <div className="p-6">
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {query.error instanceof Error ? query.error.message : "Failed to load business claims."}
              </div>
            </div>
          ) : claims.length === 0 ? (
            <div className="p-6">
              <EmptyState hasFilters={hasFilters} />
            </div>
          ) : (
            <>
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Claimant</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell className="min-w-[220px]">
                          <div>
                            <p className="font-medium text-foreground">
                              {claim.listing?.name ?? "Missing listing"}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {claim.listing?.slug ?? claim.listingId}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{claim.listing?.city ?? "—"}</TableCell>
                        <TableCell>{claim.listing?.category ?? "—"}</TableCell>
                        <TableCell className="min-w-[220px]">
                          <div>
                            <p className="font-medium text-foreground">{claim.claimantName}</p>
                            <p className="text-xs text-muted-foreground">{claim.claimantEmail}</p>
                            {claim.claimantRole ? (
                              <p className="text-xs text-muted-foreground">{claim.claimantRole}</p>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>{TIER_LABELS[claim.selectedTier]}</TableCell>
                        <TableCell>{formatMethod(claim.verificationMethod)}</TableCell>
                        <TableCell className={cn("font-semibold", scoreTone(claim.confidenceScore))}>
                          {claim.confidenceScore ?? 0}%
                        </TableCell>
                        <TableCell>
                          <ClaimStatusBadge status={claim.status} />
                        </TableCell>
                        <TableCell className="min-w-[150px] text-sm text-muted-foreground">
                          {formatDate(claim.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={l(`/admin/business-claims/${claim.id}`)}>
                              View
                              <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 p-4 lg:hidden">
                {claims.map((claim) => (
                  <ClaimMobileCard key={claim.id} claim={claim} />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Page {query.data?.page ?? page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || query.isFetching}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages || query.isFetching}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
