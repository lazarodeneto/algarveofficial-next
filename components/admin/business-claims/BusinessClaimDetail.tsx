import Link from "next/link";
import { ArrowLeft, ExternalLink, ShieldCheck, Users } from "lucide-react";

import type { AdminBusinessClaimListItem, BusinessClaimStatus } from "@/lib/admin/business-claims/types";
import { BusinessClaimReviewActions } from "@/components/admin/business-claims/BusinessClaimReviewActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildLocalizedPath } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<BusinessClaimStatus, string> = {
  pending: "Pending",
  needs_more_info: "Needs more info",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

const TIER_LABELS = {
  free: "Free Claim",
  verified: "Verified Business",
  signature: "Signature Partner",
} as const;

const METHOD_LABELS: Record<string, string> = {
  business_email_domain: "Business email domain",
  phone_verification: "Phone verification",
  website_contact_match: "Website contact match",
  official_social_account: "Official social account",
  document_upload: "Document upload",
  manual_review: "Manual review",
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

function formatMethod(value: string) {
  return METHOD_LABELS[value] ?? value.replace(/_/g, " ");
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/60 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

export function BusinessClaimDetail({
  claim,
  locale,
}: {
  claim: AdminBusinessClaimListItem;
  locale: string;
}) {
  const adminClaimsHref = buildLocalizedPath(locale, "/admin/business-claims");
  const adminCrmHref = buildLocalizedPath(locale, "/admin/crm");
  const listingHref = claim.listing?.slug
    ? buildLocalizedPath(locale, `/listing/${claim.listing.slug}`)
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="-ml-2 mb-3 flex flex-wrap items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={adminClaimsHref}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to claims
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href={adminCrmHref}>
                <Users className="mr-2 h-4 w-4" />
                Owner CRM
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-sm border border-primary/20 bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-serif text-3xl font-semibold text-foreground lg:text-4xl">
                {claim.listing?.name ?? "Business claim"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Claim reference {claim.id}
              </p>
            </div>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "w-fit text-sm",
            claim.status === "pending" && "border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
            claim.status === "approved" && "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
            claim.status === "rejected" && "border-red-400/40 bg-red-500/10 text-red-700 dark:text-red-300",
          )}
        >
          {STATUS_LABELS[claim.status]}
        </Badge>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="h-fit border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Current listing</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <DetailRow label="Listing name" value={claim.listing?.name} />
            <DetailRow label="Listing ID" value={claim.listingId} />
            <DetailRow label="Slug" value={claim.listing?.slug} />
            <DetailRow label="City" value={claim.listing?.city} />
            <DetailRow label="Category" value={claim.listing?.category} />
            <DetailRow label="Claim status" value={claim.listing?.claimStatus} />
            <DetailRow label="Current owner ID" value={claim.listing?.ownerId} />
            <DetailRow label="Website" value={claim.listing?.websiteUrl} />
            <DetailRow label="Phone" value={claim.listing?.phone} />
            <DetailRow label="Email" value={claim.listing?.email} />
            <div className="md:col-span-2">
              <DetailRow label="Address" value={claim.listing?.address} />
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
              <CardTitle>Claim request</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <DetailRow label="Claimant name" value={claim.claimantName} />
              <DetailRow label="Claimant email" value={claim.claimantEmail} />
              <DetailRow label="Claimant phone" value={claim.claimantPhone} />
              <DetailRow label="Claimant role" value={claim.claimantRole} />
              <DetailRow label="Business email" value={claim.businessEmail} />
              <DetailRow label="Company website" value={claim.companyWebsite} />
              <DetailRow label="Selected tier" value={TIER_LABELS[claim.selectedTier]} />
              <DetailRow label="Verification method" value={formatMethod(claim.verificationMethod)} />
              <DetailRow label="Confidence score" value={`${claim.confidenceScore ?? 0}%`} />
              <DetailRow label="Status" value={STATUS_LABELS[claim.status]} />
              <DetailRow label="Submitted" value={formatDate(claim.createdAt)} />
              <DetailRow label="Reviewed at" value={formatDate(claim.reviewedAt)} />
              <DetailRow label="Reviewed by" value={claim.reviewedBy} />
              <div className="md:col-span-2">
                <DetailRow label="Proof URL" value={claim.proofUrl} />
              </div>
              <div className="md:col-span-2 rounded-lg border border-border/70 bg-background/60 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Proof notes</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{claim.proofNotes || "—"}</p>
              </div>
              <div className="md:col-span-2 rounded-lg border border-border/70 bg-background/60 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Message</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{claim.message || "—"}</p>
              </div>
              <div className="md:col-span-2 rounded-lg border border-border/70 bg-background/60 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Admin review note</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{claim.reviewNote || "—"}</p>
              </div>
              <div className="md:col-span-2 rounded-lg border border-border/70 bg-background/60 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Rejection reason</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{claim.rejectionReason || "—"}</p>
              </div>
            </CardContent>
          </Card>

          <BusinessClaimReviewActions claimId={claim.id} status={claim.status} />
        </div>
      </div>
    </div>
  );
}
