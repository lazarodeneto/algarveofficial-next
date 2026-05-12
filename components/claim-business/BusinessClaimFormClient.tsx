"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, Globe2, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import ListingImage from "@/components/ListingImage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getBusinessClaimCtaState } from "@/components/listing/BusinessClaimCTA";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type ListingClaimStatus = Tables<"listings">["claim_status"];

export interface ClaimFormListing {
  id: string;
  slug: string | null;
  name: string;
  featured_image_url: string | null;
  address: string | null;
  website_url: string | null;
  contact_phone: string | null;
  claim_status: ListingClaimStatus;
  updated_at: string | null;
  city?: {
    name: string | null;
  } | null;
  category?: {
    name: string | null;
    image_url: string | null;
  } | null;
}

interface BusinessClaimFormClientProps {
  listing: ClaimFormListing;
  listingHref: string;
  searchHref: string;
  loginHref: string;
  tx: Record<string, string>;
}

interface ClaimSubmissionResponse {
  ok: boolean;
  data?: {
    id: string;
    status: string;
    selected_tier: string;
    created_at: string;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

const ROLE_OPTIONS = [
  ["owner", "claimBusinessForm.role.owner"],
  ["general_manager", "claimBusinessForm.role.generalManager"],
  ["marketing_manager", "claimBusinessForm.role.marketingManager"],
  ["employee", "claimBusinessForm.role.employee"],
  ["agency_representative", "claimBusinessForm.role.agencyRepresentative"],
  ["other", "claimBusinessForm.role.other"],
] as const;

const VERIFICATION_OPTIONS = [
  ["business_email_domain", "claimBusinessForm.verification.businessEmailDomain"],
  ["phone_verification", "claimBusinessForm.verification.phoneVerification"],
  ["website_contact_match", "claimBusinessForm.verification.websiteContactMatch"],
  ["official_social_media", "claimBusinessForm.verification.officialSocialMedia"],
  ["document_upload", "claimBusinessForm.verification.documentUpload"],
  ["manual_review", "claimBusinessForm.verification.manualReview"],
] as const;

const TIER_OPTIONS = [
  ["free", "claimBusinessForm.tier.free", "claimBusinessForm.tier.freeDescription"],
  ["verified", "claimBusinessForm.tier.verified", "claimBusinessForm.tier.verifiedDescription"],
  ["signature", "claimBusinessForm.tier.signature", "claimBusinessForm.tier.signatureDescription"],
] as const;

function isLikelyEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function tierLabel(value: string, tx: Record<string, string>) {
  const option = TIER_OPTIONS.find(([tier]) => tier === value);
  return option ? tx[option[1]] : value;
}

function getStatusMessage(status: ListingClaimStatus, tx: Record<string, string>) {
  const state = getBusinessClaimCtaState(status);
  if (state === "claimed") {
    return {
      title: tx["claimBusinessForm.unavailable.claimedTitle"],
      description: tx["claimBusinessForm.unavailable.claimedDescription"],
    };
  }

  if (state === "pending") {
    return {
      title: tx["claimBusinessForm.unavailable.pendingTitle"],
      description: tx["claimBusinessForm.unavailable.pendingDescription"],
    };
  }

  return null;
}

export function BusinessClaimFormClient({
  listing,
  listingHref,
  searchHref,
  loginHref,
  tx,
}: BusinessClaimFormClientProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const [claimantName, setClaimantName] = useState("");
  const [claimantEmail, setClaimantEmail] = useState("");
  const [claimantPhone, setClaimantPhone] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState(listing.website_url ?? "");
  const [message, setMessage] = useState("");
  const [proofNotes, setProofNotes] = useState("");
  const [claimantRole, setClaimantRole] = useState<(typeof ROLE_OPTIONS)[number][0]>("owner");
  const [verificationMethod, setVerificationMethod] =
    useState<(typeof VERIFICATION_OPTIONS)[number][0]>("business_email_domain");
  const [selectedTier, setSelectedTier] = useState<(typeof TIER_OPTIONS)[number][0]>("free");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submittedClaim, setSubmittedClaim] = useState<ClaimSubmissionResponse["data"] | null>(null);

  const unavailable = useMemo(
    () => getStatusMessage(listing.claim_status, tx),
    [listing.claim_status, tx],
  );

  useEffect(() => {
    if (!user) return;
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    setClaimantName((current) => current || fullName);
    setClaimantEmail((current) => current || user.email);
  }, [user]);

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (claimantName.trim().length < 2) {
      nextErrors.claimantName = tx["claimBusinessForm.validation.name"];
    }

    if (!isLikelyEmail(claimantEmail)) {
      nextErrors.claimantEmail = tx["claimBusinessForm.validation.email"];
    }

    if (message.trim().length < 10) {
      nextErrors.message = tx["claimBusinessForm.validation.message"];
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      router.push(loginHref);
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/business-claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId: listing.id,
          claimantName,
          claimantEmail,
          claimantPhone,
          claimantRole,
          companyWebsite,
          message,
          proofNotes,
          selectedTier,
          verificationMethod,
        }),
      });

      const payload = (await response.json()) as ClaimSubmissionResponse;

      if (response.status === 401) {
        router.push(loginHref);
        return;
      }

      if (!response.ok || !payload.ok || !payload.data) {
        setError(payload.error?.message ?? tx["claimBusinessForm.submitError"]);
        return;
      }

      setSubmittedClaim(payload.data);
      toast.success(tx["claimBusinessForm.submitSuccess"]);
    } catch {
      setError(tx["claimBusinessForm.submitError"]);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submittedClaim) {
    return (
      <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="space-y-5 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-background text-emerald-600">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {tx["claimBusinessForm.confirmationEyebrow"]}
              </p>
              <h2 className="mt-2 font-serif text-3xl text-foreground">
                {tx["claimBusinessForm.confirmationTitle"]}
              </h2>
            </div>
          </div>
          <dl className="grid gap-3 rounded-xl border border-border/60 bg-background/80 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">{tx["claimBusinessForm.confirmationReference"]}</dt>
              <dd className="font-mono font-semibold text-foreground">{submittedClaim.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{tx["claimBusinessForm.confirmationBusiness"]}</dt>
              <dd className="font-semibold text-foreground">{listing.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{tx["claimBusinessForm.confirmationTier"]}</dt>
              <dd className="font-semibold text-foreground">{tierLabel(submittedClaim.selected_tier, tx)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{tx["claimBusinessForm.confirmationStatus"]}</dt>
              <dd className="font-semibold text-foreground">{tx["claimBusinessForm.status.pending"]}</dd>
            </div>
          </dl>
          <p className="text-sm leading-6 text-muted-foreground">
            {tx["claimBusinessForm.confirmationNextStep"]}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href={listingHref}>{tx["claimBusinessForm.viewListing"]}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={searchHref}>{tx["claimBusinessForm.searchAgain"]}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
        <div className="relative h-56 bg-muted">
          <ListingImage
            src={listing.featured_image_url}
            categoryImageUrl={listing.category?.image_url ?? null}
            alt={listing.name}
            imageVersion={listing.updated_at}
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="h-full w-full"
          />
        </div>
        <CardHeader>
          <Badge variant="outline" className="w-fit border-[#D4A62A]/35 bg-[#D4A62A]/10 text-[#9C7417]">
            {tx["claimBusinessForm.selectedListingBadge"]}
          </Badge>
          <CardTitle className="font-serif text-3xl leading-tight">{listing.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p className="text-base font-semibold text-foreground">
            {tx["claimBusinessForm.claimingListing"]}
          </p>
          <div className="space-y-3">
            {[listing.city?.name, listing.category?.name].filter(Boolean).length > 0 ? (
              <p>{[listing.city?.name, listing.category?.name].filter(Boolean).join(" · ")}</p>
            ) : null}
            {listing.address ? (
              <p className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C6961C]" aria-hidden="true" />
                <span>{listing.address}</span>
              </p>
            ) : null}
            {listing.website_url ? (
              <p className="flex gap-2">
                <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C6961C]" aria-hidden="true" />
                <a className="break-all hover:text-primary" href={listing.website_url} target="_blank" rel="noreferrer">
                  {listing.website_url}
                </a>
              </p>
            ) : null}
            {listing.contact_phone ? (
              <p className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#C6961C]" aria-hidden="true" />
                <a className="hover:text-primary" href={`tel:${listing.contact_phone}`}>
                  {listing.contact_phone}
                </a>
              </p>
            ) : null}
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href={listingHref}>
              {tx["claimBusinessForm.publicListingLink"]}
              <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {unavailable ? (
          <Alert className="border-amber-500/35 bg-amber-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{unavailable.title}</AlertTitle>
            <AlertDescription>{unavailable.description}</AlertDescription>
          </Alert>
        ) : (
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardContent className="space-y-6 p-6 md:p-8">
              {!confirmed ? (
                <div className="space-y-5">
                  <div>
                    <h2 className="font-serif text-3xl text-foreground">
                      {tx["claimBusinessForm.isThisYourBusiness"]}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {tx["claimBusinessForm.confirmationPrompt"]}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="button" onClick={() => setConfirmed(true)}>
                      {tx["claimBusinessForm.yesContinue"]}
                    </Button>
                    <Button asChild variant="secondary">
                      <Link href={searchHref}>
                        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                        {tx["claimBusinessForm.noSearchAgain"]}
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form className="space-y-8" onSubmit={handleSubmit}>
                  {!isAuthenticated && !isLoading ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{tx["claimBusinessForm.loginRequiredTitle"]}</AlertTitle>
                      <AlertDescription>{tx["claimBusinessForm.loginRequiredDescription"]}</AlertDescription>
                    </Alert>
                  ) : null}

                  {error ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{tx["claimBusinessForm.submitErrorTitle"]}</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : null}

                  <section className="space-y-4">
                    <h2 className="font-serif text-2xl text-foreground">
                      {tx["claimBusinessForm.roleTitle"]}
                    </h2>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {ROLE_OPTIONS.map(([value, labelKey]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setClaimantRole(value)}
                          className={cn(
                            "rounded-xl border border-border/70 bg-background p-3 text-left text-sm transition hover:border-[#D4A62A]/50",
                            claimantRole === value && "border-[#D4A62A] bg-[#D4A62A]/10 text-[#8A6413]",
                          )}
                        >
                          {tx[labelKey]}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="font-serif text-2xl text-foreground">
                      {tx["claimBusinessForm.contactTitle"]}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="claimant-name">{tx["claimBusinessForm.fullName"]}</Label>
                        <Input
                          id="claimant-name"
                          value={claimantName}
                          onChange={(event) => setClaimantName(event.target.value)}
                          aria-invalid={Boolean(fieldErrors.claimantName)}
                        />
                        {fieldErrors.claimantName ? <p className="text-xs text-destructive">{fieldErrors.claimantName}</p> : null}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="claimant-email">{tx["claimBusinessForm.workEmail"]}</Label>
                        <Input
                          id="claimant-email"
                          type="email"
                          value={claimantEmail}
                          onChange={(event) => setClaimantEmail(event.target.value)}
                          aria-invalid={Boolean(fieldErrors.claimantEmail)}
                        />
                        {fieldErrors.claimantEmail ? <p className="text-xs text-destructive">{fieldErrors.claimantEmail}</p> : null}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="claimant-phone">{tx["claimBusinessForm.phoneNumber"]}</Label>
                        <Input
                          id="claimant-phone"
                          type="tel"
                          value={claimantPhone}
                          onChange={(event) => setClaimantPhone(event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company-website">{tx["claimBusinessForm.companyWebsite"]}</Label>
                        <Input
                          id="company-website"
                          type="url"
                          value={companyWebsite}
                          onChange={(event) => setCompanyWebsite(event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="claim-message">{tx["claimBusinessForm.message"]}</Label>
                      <Textarea
                        id="claim-message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        rows={5}
                        aria-invalid={Boolean(fieldErrors.message)}
                      />
                      {fieldErrors.message ? <p className="text-xs text-destructive">{fieldErrors.message}</p> : null}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="font-serif text-2xl text-foreground">
                      {tx["claimBusinessForm.verificationTitle"]}
                    </h2>
                    <Select
                      value={verificationMethod}
                      onValueChange={(value) => setVerificationMethod(value as typeof verificationMethod)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VERIFICATION_OPTIONS.map(([value, labelKey]) => (
                          <SelectItem key={value} value={value}>
                            {tx[labelKey]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="space-y-2">
                      <Label htmlFor="proof-notes">{tx["claimBusinessForm.proofNotes"]}</Label>
                      <Textarea
                        id="proof-notes"
                        value={proofNotes}
                        onChange={(event) => setProofNotes(event.target.value)}
                        rows={4}
                        placeholder={tx["claimBusinessForm.proofNotesPlaceholder"]}
                      />
                      {verificationMethod === "document_upload" ? (
                        <p className="text-xs leading-5 text-muted-foreground">
                          {tx["claimBusinessForm.documentUploadNote"]}
                        </p>
                      ) : null}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="font-serif text-2xl text-foreground">
                      {tx["claimBusinessForm.tierTitle"]}
                    </h2>
                    <div className="grid gap-3 md:grid-cols-3">
                      {TIER_OPTIONS.map(([value, labelKey, descriptionKey]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSelectedTier(value)}
                          className={cn(
                            "rounded-xl border border-border/70 bg-background p-4 text-left transition hover:border-[#D4A62A]/50",
                            selectedTier === value && "border-[#D4A62A] bg-[#D4A62A]/10",
                          )}
                        >
                          <span className="block font-semibold text-foreground">{tx[labelKey]}</span>
                          <span className="mt-2 block text-sm leading-5 text-muted-foreground">{tx[descriptionKey]}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">
                      {tx["claimBusinessForm.paymentLaterNote"]}
                    </p>
                  </section>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button type="submit" disabled={isSubmitting || isLoading}>
                      {isSubmitting ? tx["claimBusinessForm.submitting"] : tx["claimBusinessForm.submit"]}
                    </Button>
                    <Button asChild variant="secondary">
                      <Link href={searchHref}>{tx["claimBusinessForm.searchAgain"]}</Link>
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
