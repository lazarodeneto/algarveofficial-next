"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe2,
  MapPin,
  Phone,
  X,
} from "lucide-react";
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
import {
  ClaimBusinessPricingCards,
  type ClaimPartnershipTier,
} from "@/components/claim-business/ClaimBusinessPartnershipSections";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";
import type {
  ClaimPricingBillingPeriod,
  ClaimTierPricingDetails,
} from "@/lib/claims/claim-pricing-types";
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
  pricing?: ClaimTierPricingDetails;
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

const PROOF_DOCUMENT_ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp";
const PROOF_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_PROOF_DOCUMENT_BYTES = 4 * 1024 * 1024;
const invalidFieldClassName = "border-destructive focus-visible:ring-destructive/35";
const fieldErrorOrder = [
  "claimantName",
  "claimantEmail",
  "message",
  "proofDocument",
] as const;

function isLikelyEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getProofDocumentError(file: File | null, tx: Record<string, string>) {
  if (!file) return tx["claimBusinessForm.validation.proofDocumentRequired"];
  if (file.size > MAX_PROOF_DOCUMENT_BYTES) return tx["claimBusinessForm.validation.proofDocumentSize"];
  if (!PROOF_DOCUMENT_TYPES.has(file.type)) return tx["claimBusinessForm.validation.proofDocumentType"];
  return null;
}

function getOptionalProofDocumentError(file: File | null, tx: Record<string, string>) {
  if (!file) return null;
  if (file.size > MAX_PROOF_DOCUMENT_BYTES) return tx["claimBusinessForm.validation.proofDocumentSize"];
  if (!PROOF_DOCUMENT_TYPES.has(file.type)) return tx["claimBusinessForm.validation.proofDocumentType"];
  return null;
}

function tierLabel(value: string, tx: Record<string, string>) {
  if (value === "free") return tx["claimBusinessPartnership.tiers.unverified.name"];
  if (value === "verified") return tx["claimBusinessPartnership.tiers.verified.name"];
  if (value === "signature") return tx["claimBusinessPartnership.tiers.signature.name"];
  return value;
}

function tierChipClassName(tier: ClaimPartnershipTier) {
  if (tier === "verified") {
    return "border-emerald-500/45 bg-emerald-500/10 text-emerald-700";
  }

  if (tier === "signature") {
    return "border-[#C7A35A]/55 bg-[#C7A35A]/15 text-[#7B5411]";
  }

  return "border-[#D4A62A]/45 bg-[#D4A62A]/12 text-[#8A6413]";
}

function isPaidTier(value: ClaimPartnershipTier): value is Exclude<ClaimPartnershipTier, "free"> {
  return value === "verified" || value === "signature";
}

type PaidClaimPartnershipTier = Exclude<ClaimPartnershipTier, "free">;
type BillingPeriodSelection = Partial<Record<PaidClaimPartnershipTier, ClaimPricingBillingPeriod>>;

function getSelectedBillingPeriod(
  tier: ClaimPartnershipTier,
  pricing: ClaimTierPricingDetails | undefined,
  selectedBillingPeriods: BillingPeriodSelection,
) {
  if (!isPaidTier(tier)) return null;

  const detail = pricing?.[tier];
  const selectedPeriod = selectedBillingPeriods[tier];
  if (selectedPeriod && detail?.options.some((option) => option.billingPeriod === selectedPeriod)) {
    return selectedPeriod;
  }

  return detail?.checkoutBillingPeriod ?? null;
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
  pricing,
}: BusinessClaimFormClientProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const formRef = useRef<HTMLFormElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [claimantName, setClaimantName] = useState("");
  const [claimantEmail, setClaimantEmail] = useState("");
  const [claimantPhone, setClaimantPhone] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState(listing.website_url ?? "");
  const [message, setMessage] = useState("");
  const [proofNotes, setProofNotes] = useState("");
  const [proofDocument, setProofDocument] = useState<File | null>(null);
  const [proofDocumentInputKey, setProofDocumentInputKey] = useState(0);
  const [claimantRole, setClaimantRole] = useState<(typeof ROLE_OPTIONS)[number][0]>("owner");
  const [verificationMethod, setVerificationMethod] =
    useState<(typeof VERIFICATION_OPTIONS)[number][0]>("business_email_domain");
  const [selectedTier, setSelectedTier] = useState<ClaimPartnershipTier>("verified");
  const [selectedBillingPeriods, setSelectedBillingPeriods] = useState<BillingPeriodSelection>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutInProgress, setCheckoutInProgress] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
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

  useEffect(() => {
    if (!isPaidTier(selectedTier)) return;

    const detail = pricing?.[selectedTier];
    const fallbackPeriod = detail?.checkoutBillingPeriod;
    if (!fallbackPeriod) return;

    setSelectedBillingPeriods((current) => {
      const currentPeriod = current[selectedTier];
      if (currentPeriod && detail.options.some((option) => option.billingPeriod === currentPeriod)) {
        return current;
      }

      return {
        ...current,
        [selectedTier]: fallbackPeriod,
      };
    });
  }, [pricing, selectedTier]);

  function clearFieldError(field: string) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function setFieldRef(field: string) {
    return (node: HTMLElement | null) => {
      fieldRefs.current[field] = node;
    };
  }

  function scrollToFirstFieldError(errors: Record<string, string>) {
    const firstErrorField = fieldErrorOrder.find((field) => Boolean(errors[field]));
    if (!firstErrorField) return;

    const target = fieldRefs.current[firstErrorField];
    if (!target) return;

    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.focus({ preventScroll: true });
    });
  }

  function scrollToSubmitAction() {
    const target = submitButtonRef.current;
    if (!target) return;

    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.focus({ preventScroll: true });
    });
  }

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

    const proofDocumentError =
      verificationMethod === "document_upload"
        ? getProofDocumentError(proofDocument, tx)
        : getOptionalProofDocumentError(proofDocument, tx);
    if (proofDocumentError) {
      nextErrors.proofDocument = proofDocumentError;
    }

    setFieldErrors(nextErrors);
    const isValid = Object.keys(nextErrors).length === 0;
    if (!isValid) {
      scrollToFirstFieldError(nextErrors);
    }
    return isValid;
  }

  function clearProofDocument() {
    setProofDocument(null);
    setProofDocumentInputKey((current) => current + 1);
  }

  function buildSubmissionRequest(tier: ClaimPartnershipTier) {
    const basePayload = {
      listingId: listing.id,
      claimantName,
      claimantEmail,
      claimantPhone,
      claimantRole,
      companyWebsite,
      message,
      proofNotes,
      selectedTier: tier,
      verificationMethod,
    };

    if (!proofDocument) {
      return {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(basePayload),
      };
    }

    const formData = new FormData();
    Object.entries(basePayload).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("proofDocument", proofDocument);

    return {
      headers: undefined,
      body: formData,
    };
  }

  async function startPaidCheckout(
    claimId: string,
    tier: PaidClaimPartnershipTier,
    billingPeriod: ClaimPricingBillingPeriod,
  ) {
    setCheckoutInProgress(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tier,
          billing_period: billingPeriod,
          claim_id: claimId,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;

      if (response.status === 401) {
        router.push(loginHref);
        return;
      }

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error ?? tx["claimBusinessForm.checkoutError"]);
      }

      window.location.href = payload.url;
    } catch (checkoutErrorValue) {
      const message =
        checkoutErrorValue instanceof Error
          ? checkoutErrorValue.message
          : tx["claimBusinessForm.checkoutError"];
      setCheckoutError(message);
      toast.error(tx["claimBusinessForm.checkoutErrorTitle"], {
        description: message,
      });
    } finally {
      setCheckoutInProgress(false);
    }
  }

  async function submitClaim(intendedTier: ClaimPartnershipTier) {
    setError(null);
    setCheckoutError(null);

    if (isSubmitting || checkoutInProgress || isLoading) {
      return;
    }

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
        ...buildSubmissionRequest(intendedTier),
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

      if (isPaidTier(intendedTier)) {
        const checkoutBillingPeriod = getSelectedBillingPeriod(
          intendedTier,
          pricing,
          selectedBillingPeriods,
        );

        if (!checkoutBillingPeriod) {
          setCheckoutError(tx["claimBusinessForm.checkoutError"]);
          toast.error(tx["claimBusinessForm.checkoutErrorTitle"], {
            description: tx["claimBusinessForm.checkoutError"],
          });
          return;
        }

        await startPaidCheckout(payload.data.id, intendedTier, checkoutBillingPeriod);
      }
    } catch {
      setError(tx["claimBusinessForm.submitError"]);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitClaim(selectedTier);
  }

  function handleTierSelect(tier: ClaimPartnershipTier) {
    setSelectedTier(tier);
    if (validate()) {
      scrollToSubmitAction();
    }
  }

  if (submittedClaim) {
    const submittedTier = submittedClaim.selected_tier as ClaimPartnershipTier;
    const submittedPaidTier = isPaidTier(submittedTier) ? submittedTier : null;
    const submittedBillingPeriod = submittedPaidTier
      ? getSelectedBillingPeriod(submittedPaidTier, pricing, selectedBillingPeriods)
      : null;

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
            {submittedPaidTier
              ? tx["claimBusinessForm.confirmationPaidNextStep"]
              : tx["claimBusinessForm.confirmationNextStep"]}
          </p>
          {checkoutError ? (
            <Alert className="border-amber-500/35 bg-amber-500/10">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{tx["claimBusinessForm.checkoutErrorTitle"]}</AlertTitle>
              <AlertDescription>{checkoutError}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            {submittedPaidTier ? (
              <Button
                type="button"
                disabled={checkoutInProgress || !submittedBillingPeriod}
                onClick={() => {
                  if (submittedBillingPeriod) {
                    startPaidCheckout(submittedClaim.id, submittedPaidTier, submittedBillingPeriod);
                  }
                }}
                className={cn(
                  "w-full whitespace-normal text-center leading-5 sm:w-auto",
                  submittedPaidTier === "verified" &&
                    "bg-emerald-600 text-white shadow-lg shadow-emerald-600/15 hover:bg-emerald-700",
                  submittedPaidTier === "signature" &&
                    "bg-[#C7A35A] text-amber-950 shadow-lg shadow-amber-700/15 hover:bg-[#B79245]",
                )}
              >
                {checkoutInProgress
                  ? tx["claimBusinessForm.checkoutRedirecting"]
                  : tx["claimBusinessForm.continueToCheckout"]}
              </Button>
            ) : null}
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
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.18fr)] lg:items-start">
      <Card className="min-w-0 overflow-hidden rounded-2xl border-border/70 shadow-sm lg:sticky lg:top-28">
        <div className="relative h-56 bg-muted sm:h-64 lg:h-60">
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
          <CardTitle className="break-words font-serif text-3xl leading-tight">{listing.name}</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 space-y-4 text-sm text-muted-foreground">
          <p className="text-base font-semibold text-foreground">
            {tx["claimBusinessForm.claimingListing"]}
          </p>
          <div className="space-y-3">
            {[listing.city?.name, listing.category?.name].filter(Boolean).length > 0 ? (
              <p>{[listing.city?.name, listing.category?.name].filter(Boolean).join(" · ")}</p>
            ) : null}
            {listing.address ? (
              <p className="flex min-w-0 gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C6961C]" aria-hidden="true" />
                <span className="min-w-0 break-words">{listing.address}</span>
              </p>
            ) : null}
            {listing.website_url ? (
              <p className="flex min-w-0 gap-2">
                <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C6961C]" aria-hidden="true" />
                <a className="min-w-0 break-all hover:text-primary" href={listing.website_url} target="_blank" rel="noreferrer">
                  {listing.website_url}
                </a>
              </p>
            ) : null}
            {listing.contact_phone ? (
              <p className="flex min-w-0 gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#C6961C]" aria-hidden="true" />
                <a className="min-w-0 break-words hover:text-primary" href={`tel:${listing.contact_phone}`}>
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

      <div className="min-w-0 space-y-6">
        {unavailable ? (
          <Alert className="border-amber-500/35 bg-amber-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{unavailable.title}</AlertTitle>
            <AlertDescription>{unavailable.description}</AlertDescription>
          </Alert>
        ) : (
          <Card className="min-w-0 rounded-2xl border-border/70 shadow-sm">
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
                <form ref={formRef} className="space-y-8" onSubmit={handleSubmit}>
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
                          ref={setFieldRef("claimantName")}
                          id="claimant-name"
                          value={claimantName}
                          onChange={(event) => {
                            setClaimantName(event.target.value);
                            clearFieldError("claimantName");
                          }}
                          aria-invalid={Boolean(fieldErrors.claimantName)}
                          className={cn(fieldErrors.claimantName && invalidFieldClassName)}
                        />
                        {fieldErrors.claimantName ? <p className="text-xs text-destructive">{fieldErrors.claimantName}</p> : null}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="claimant-email">{tx["claimBusinessForm.workEmail"]}</Label>
                        <Input
                          ref={setFieldRef("claimantEmail")}
                          id="claimant-email"
                          type="email"
                          value={claimantEmail}
                          onChange={(event) => {
                            setClaimantEmail(event.target.value);
                            clearFieldError("claimantEmail");
                          }}
                          aria-invalid={Boolean(fieldErrors.claimantEmail)}
                          className={cn(fieldErrors.claimantEmail && invalidFieldClassName)}
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
                        ref={setFieldRef("message")}
                        id="claim-message"
                        value={message}
                        onChange={(event) => {
                          setMessage(event.target.value);
                          clearFieldError("message");
                        }}
                        rows={5}
                        aria-invalid={Boolean(fieldErrors.message)}
                        className={cn(fieldErrors.message && invalidFieldClassName)}
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
                      <div className="space-y-3 rounded-xl border border-border/70 bg-background/70 p-3">
                        <div className="space-y-2">
                          <Label htmlFor="proof-document">{tx["claimBusinessForm.proofDocumentLabel"]}</Label>
                          <Input
                            ref={setFieldRef("proofDocument")}
                            key={proofDocumentInputKey}
                            id="proof-document"
                            type="file"
                            accept={PROOF_DOCUMENT_ACCEPT}
                            aria-describedby="proof-document-help"
                            aria-invalid={Boolean(fieldErrors.proofDocument)}
                            className={cn(fieldErrors.proofDocument && invalidFieldClassName)}
                            onChange={(event) => {
                              const nextFile = event.target.files?.[0] ?? null;
                              setProofDocument(nextFile);
                              clearFieldError("proofDocument");
                            }}
                          />
                          <p id="proof-document-help" className="text-xs leading-5 text-muted-foreground">
                            {tx["claimBusinessForm.documentUploadNote"]}
                          </p>
                          {fieldErrors.proofDocument ? (
                            <p className="text-xs text-destructive">{fieldErrors.proofDocument}</p>
                          ) : null}
                        </div>
                        {proofDocument ? (
                          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm">
                            <span className="flex min-w-0 items-center gap-2">
                              <FileText className="h-4 w-4 shrink-0 text-[#C6961C]" aria-hidden="true" />
                              <span className="min-w-0 truncate">
                                {tx["claimBusinessForm.proofDocumentSelected"].replace("{{filename}}", proofDocument.name)}
                              </span>
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={clearProofDocument}
                            >
                              <X className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">{tx["claimBusinessForm.proofDocumentRemove"]}</span>
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <ClaimBusinessPricingCards
                      tx={tx}
                      pricing={pricing}
                      selectedTier={selectedTier}
                      selectedBillingPeriods={selectedBillingPeriods}
                      onSelectTier={handleTierSelect}
                      compact
                    />
                    {isPaidTier(selectedTier) && (pricing?.[selectedTier]?.options.length ?? 0) > 1 ? (
                      <div
                        className="grid gap-2 sm:grid-cols-2"
                        role="radiogroup"
                        aria-label={tx["claimBusinessPartnership.pricing.selectionHint"]}
                      >
                        {pricing?.[selectedTier]?.options.map((option) => {
                          const selectedPeriod =
                            getSelectedBillingPeriod(selectedTier, pricing, selectedBillingPeriods) ===
                            option.billingPeriod;
                          return (
                            <button
                              key={option.billingPeriod}
                              type="button"
                              role="radio"
                              aria-checked={selectedPeriod}
                              onClick={() =>
                                setSelectedBillingPeriods((current) => ({
                                  ...current,
                                  [selectedTier]: option.billingPeriod,
                                }))
                              }
                              className={cn(
                                "rounded-xl border border-border/70 bg-background p-3 text-left text-sm transition hover:border-[#D4A62A]/50",
                                selectedPeriod && "border-[#D4A62A] bg-[#D4A62A]/10 text-[#8A6413]",
                              )}
                            >
                              <span className="font-semibold text-foreground">{option.priceLabel}</span>
                              <span className="ml-1 text-muted-foreground">{option.cadenceLabel}</span>
                              {option.supportingLabel ? (
                                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                  {option.supportingLabel}
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                    <p className="text-xs leading-5 text-muted-foreground">
                      {isPaidTier(selectedTier)
                        ? tx["claimBusinessForm.paymentCheckoutNote"]
                        : tx["claimBusinessForm.paymentFreeNote"]}
                    </p>
                  </section>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <span
                      data-testid="selected-tier-chip"
                      className={cn(
                        "inline-flex w-fit items-center rounded-full border px-4 py-2 text-sm font-semibold",
                        tierChipClassName(selectedTier),
                      )}
                    >
                      {tierLabel(selectedTier, tx)}
                    </span>
                    <Button
                      ref={submitButtonRef}
                      type="submit"
                      disabled={isSubmitting || isLoading || checkoutInProgress}
                      className="w-full whitespace-normal text-center leading-5 sm:w-auto"
                    >
                      {isSubmitting
                        ? tx["claimBusinessForm.submitting"]
                        : isPaidTier(selectedTier)
                          ? tx["claimBusinessForm.submitPaid"]
                          : tx["claimBusinessForm.submitFree"]}
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
