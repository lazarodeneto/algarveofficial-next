import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  CheckCircle2,
  Edit,
  ExternalLink,
  FileText,
  Globe,
  ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { ClaimStatusBadgeOwner } from "@/components/owner/ClaimStatusBadgeOwner";
import { OwnerTierUpgradeActions } from "@/components/owner/OwnerTierUpgradeActions";
import { StatusBadgeOwner } from "@/components/owner/StatusBadgeOwner";
import { TierBadgeOwner } from "@/components/owner/TierBadgeOwner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLocalePath } from "@/hooks/useLocalePath";
import {
  getBusinessClaimTierLabel,
  getOwnerDisplayTier,
  mapClaimTierToListingTier,
  type BusinessClaimTier,
} from "@/lib/listings/claim-tier";
import { isUuid } from "@/lib/slugify";

function getListingIdFromRoute(params: Record<string, string | string[] | undefined>) {
  if (typeof params.id === "string") {
    return params.id;
  }

  const slug = params.slug;
  if (Array.isArray(slug) && slug[0] === "listings" && typeof slug[1] === "string") {
    return slug[1];
  }

  return undefined;
}

function readName(value: unknown): string | null {
  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name;
    return typeof name === "string" ? name : null;
  }
  return null;
}

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  return new Date(value).toLocaleDateString();
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border/70 bg-muted/20 p-3">
      {icon ? <div className="mt-0.5 text-muted-foreground">{icon}</div> : null}
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-foreground">{value || "Not provided"}</p>
      </div>
    </div>
  );
}

export default function OwnerListingDetail() {
  const params = useParams<Record<string, string | string[] | undefined>>();
  const listingId = getListingIdFromRoute(params);
  const router = useRouter();
  const l = useLocalePath();
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data, error, isLoading } = useQuery({
    queryKey: ["owner-listing-detail", user?.id, listingId],
    queryFn: async () => {
      if (!user?.id || !listingId || !isUuid(listingId)) return null;

      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select(`
          *,
          city:cities(id, name, slug),
          category:categories(id, name, slug),
          region:regions(id, name, slug),
          images:listing_images(id, image_url, alt_text, is_featured, display_order)
        `)
        .eq("id", listingId)
        .eq("owner_id", user.id)
        .maybeSingle();

      if (listingError) throw listingError;
      if (!listing) return null;

      const { data: claims, error: claimsError } = await supabase
        .from("business_claims")
        .select("id, selected_tier, status, verification_method, created_at")
        .eq("listing_id", listing.id)
        .eq("claimant_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (claimsError) {
        console.warn("[owner-listing-detail] claim summary unavailable", claimsError.message);
      }

      return {
        listing,
        latestClaim: claims?.[0] ?? null,
      };
    },
    enabled: !!user?.id && !!listingId,
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="mb-2 text-lg font-semibold text-foreground">
          {t("owner.listingDetail.loadFailed", { defaultValue: "Could not load this listing" })}
        </p>
        <p className="mb-4 text-sm text-muted-foreground">{(error as Error).message}</p>
        <Button onClick={() => router.push(l("/owner/listings"))}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("owner.listingDetail.backToListings", { defaultValue: "Back to listings" })}
        </Button>
      </div>
    );
  }

  if (!data?.listing) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="mb-2 text-lg font-semibold text-foreground">
          {t("owner.listingDetail.notFound", { defaultValue: "Listing not found" })}
        </p>
        <p className="mb-4 max-w-md text-sm text-muted-foreground">
          {t("owner.listingDetail.notFoundDescription", {
            defaultValue: "This listing is not assigned to your owner account.",
          })}
        </p>
        <Button onClick={() => router.push(l("/owner/listings"))}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("owner.listingDetail.backToListings", { defaultValue: "Back to listings" })}
        </Button>
      </div>
    );
  }

  const { listing, latestClaim } = data;
  const city = readName(listing.city);
  const category = readName(listing.category);
  const region = readName(listing.region);
  const selectedTier = latestClaim?.selected_tier as BusinessClaimTier | null | undefined;
  const displayTier = getOwnerDisplayTier(listing.tier, selectedTier);
  const selectedTierAsListingTier = mapClaimTierToListingTier(selectedTier);
  const images = Array.isArray(listing.images) ? listing.images : [];
  const galleryCount = images.length;
  const claimSubmittedAt = formatDate(latestClaim?.created_at);
  const showUpgradePrompts = listing.claim_status === "claimed" && displayTier !== "signature";

  return (
    <div className="space-y-6 pb-24">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <Button variant="ghost" size="sm" onClick={() => router.push(l("/owner/listings"))} className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("owner.listingDetail.backToListings", { defaultValue: "Back to listings" })}
        </Button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-foreground">
              {t("owner.listingDetail.title", { defaultValue: "Manage listing" })}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("owner.listingDetail.subtitle", {
                defaultValue: "Read-only owner workspace for this claimed business profile.",
              })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={l(`/listing/${listing.slug}`)} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                {t("owner.listingDetail.publicListing", { defaultValue: "Public listing" })}
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={l(`/owner/listings/${listing.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                {t("owner.listingDetail.editContent", { defaultValue: "Edit content" })}
              </Link>
            </Button>
          </div>
        </div>
      </m.div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row">
                <div className="h-56 w-full overflow-hidden rounded-lg bg-muted lg:h-64 lg:w-80 lg:flex-shrink-0">
                  {listing.featured_image_url ? (
                    <ImageWithFallback
                      src={listing.featured_image_url}
                      alt={listing.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <TierBadgeOwner tier={displayTier} size="sm" />
                      <StatusBadgeOwner status={listing.status} size="sm" />
                      <ClaimStatusBadgeOwner status={listing.claim_status} size="sm" />
                    </div>
                    <h2 className="text-2xl font-serif font-semibold text-foreground">{listing.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {listing.short_description ||
                        listing.description ||
                        t("owner.listingDetail.noDescription", { defaultValue: "No description has been added yet." })}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailRow
                      label={t("owner.listingDetail.city", { defaultValue: "City" })}
                      value={city}
                      icon={<MapPin className="h-4 w-4" />}
                    />
                    <DetailRow
                      label={t("owner.listingDetail.category", { defaultValue: "Category" })}
                      value={category}
                      icon={<Sparkles className="h-4 w-4" />}
                    />
                    <DetailRow
                      label={t("owner.listingDetail.region", { defaultValue: "Region" })}
                      value={region}
                      icon={<MapPin className="h-4 w-4" />}
                    />
                    <DetailRow
                      label={t("owner.listingDetail.address", { defaultValue: "Address" })}
                      value={listing.address}
                      icon={<MapPin className="h-4 w-4" />}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                {t("owner.listingDetail.descriptionTitle", { defaultValue: "Description" })}
              </CardTitle>
              <CardDescription>
                {t("owner.listingDetail.descriptionSubtitle", {
                  defaultValue: "Public profile copy currently attached to this listing.",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("owner.listingDetail.shortDescription", { defaultValue: "Short description" })}
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {listing.short_description ||
                    t("owner.listingDetail.emptyShortDescription", { defaultValue: "No short description yet." })}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("owner.listingDetail.fullDescription", { defaultValue: "Full description" })}
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground">
                  {listing.description ||
                    t("owner.listingDetail.emptyFullDescription", { defaultValue: "No full description yet." })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="h-5 w-5 text-primary" />
                {t("owner.listingDetail.photosTitle", { defaultValue: "Photos" })}
              </CardTitle>
              <CardDescription>
                {t("owner.listingDetail.photosSubtitle", {
                  defaultValue: "Photo editing will stay in the dedicated Photos & Media workspace.",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
                {t("owner.listingDetail.photosPlaceholder", {
                  count: galleryCount,
                  defaultValue:
                    galleryCount > 0
                      ? "{{count}} gallery image(s) are attached. Use Photos & Media to manage uploads."
                      : "No gallery images are attached yet. Use Photos & Media to add photos.",
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="h-5 w-5 text-primary" />
                {t("owner.listingDetail.contactTitle", { defaultValue: "Contact details" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow
                label={t("owner.listingDetail.phone", { defaultValue: "Phone" })}
                value={listing.contact_phone}
                icon={<Phone className="h-4 w-4" />}
              />
              <DetailRow
                label={t("owner.listingDetail.email", { defaultValue: "Email" })}
                value={listing.contact_email}
                icon={<Mail className="h-4 w-4" />}
              />
              <DetailRow
                label={t("owner.listingDetail.website", { defaultValue: "Website" })}
                value={listing.website_url}
                icon={<Globe className="h-4 w-4" />}
              />
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
                {t("owner.listingDetail.claimTitle", { defaultValue: "Claim & verification" })}
              </CardTitle>
              <CardDescription>
                {t("owner.listingDetail.claimSubtitle", {
                  defaultValue: "Ownership status for this business profile.",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <ClaimStatusBadgeOwner status={listing.claim_status} />
                {listing.claim_status === "claimed" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    {t("owner.listingDetail.officialRepresentative", { defaultValue: "Official representative" })}
                  </span>
                ) : null}
              </div>

              <div className="grid gap-3">
                <DetailRow
                  label={t("owner.listingDetail.verificationMethod", { defaultValue: "Verification method" })}
                  value={listing.claim_verification_method || latestClaim?.verification_method}
                  icon={<ShieldCheck className="h-4 w-4" />}
                />
                <DetailRow
                  label={t("owner.listingDetail.claimedAt", { defaultValue: "Claimed at" })}
                  value={formatDate(listing.claimed_at)}
                  icon={<CheckCircle2 className="h-4 w-4" />}
                />
                <DetailRow
                  label={t("owner.listingDetail.claimSubmittedAt", { defaultValue: "Claim submitted" })}
                  value={claimSubmittedAt}
                  icon={<FileText className="h-4 w-4" />}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                {t("owner.listingDetail.tierTitle", { defaultValue: "Tier & subscription" })}
              </CardTitle>
              <CardDescription>
                {t("owner.listingDetail.tierSubtitle", {
                  defaultValue: "Commercial tier selected during claim review and current listing visibility.",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("owner.listingDetail.currentTier", { defaultValue: "Current tier" })}
                </p>
                <div className="mt-2">
                  <TierBadgeOwner tier={displayTier} />
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("owner.listingDetail.selectedTier", { defaultValue: "Selected tier" })}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {selectedTierAsListingTier ? <TierBadgeOwner tier={selectedTierAsListingTier} /> : null}
                  <span className="text-sm text-muted-foreground">
                    {getBusinessClaimTierLabel(selectedTier) ||
                      t("owner.listingDetail.noSelectedTier", { defaultValue: "No claim tier recorded." })}
                  </span>
                </div>
              </div>
              {showUpgradePrompts ? (
                <div className="rounded-lg border border-dashed border-primary/25 bg-primary/5 p-4">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("owner.listingDetail.upgradePrompts", { defaultValue: "Upgrade prompts" })}
                  </p>
                  <OwnerTierUpgradeActions listingId={listing.id} currentTier={displayTier} />
                </div>
              ) : null}
              <p className="text-sm leading-6 text-muted-foreground">
                {t("owner.listingDetail.subscriptionPlaceholder", {
                  defaultValue:
                    "Subscription management stays in Membership for now. Editing and billing upgrades can be added in a later phase.",
                })}
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
