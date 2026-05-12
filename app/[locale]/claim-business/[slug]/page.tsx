import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  BusinessClaimFormClient,
  type ClaimFormListing,
} from "@/components/claim-business/BusinessClaimFormClient";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/localized-routing";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { createPublicServerClient } from "@/lib/supabase/public-server";

export const dynamic = "force-dynamic";

const CLAIM_FORM_LISTING_FIELDS = `
  id,
  slug,
  name,
  featured_image_url,
  address,
  website_url,
  contact_phone,
  status,
  claim_status,
  updated_at,
  city:cities(name),
  category:categories(name, image_url)
`;

const CLAIM_FORM_TRANSLATION_KEYS = [
  "claimBusinessForm.title",
  "claimBusinessForm.description",
  "claimBusinessForm.selectedListingBadge",
  "claimBusinessForm.claimingListing",
  "claimBusinessForm.publicListingLink",
  "claimBusinessForm.isThisYourBusiness",
  "claimBusinessForm.confirmationPrompt",
  "claimBusinessForm.yesContinue",
  "claimBusinessForm.noSearchAgain",
  "claimBusinessForm.loginRequiredTitle",
  "claimBusinessForm.loginRequiredDescription",
  "claimBusinessForm.roleTitle",
  "claimBusinessForm.role.owner",
  "claimBusinessForm.role.generalManager",
  "claimBusinessForm.role.marketingManager",
  "claimBusinessForm.role.employee",
  "claimBusinessForm.role.agencyRepresentative",
  "claimBusinessForm.role.other",
  "claimBusinessForm.contactTitle",
  "claimBusinessForm.fullName",
  "claimBusinessForm.workEmail",
  "claimBusinessForm.phoneNumber",
  "claimBusinessForm.companyWebsite",
  "claimBusinessForm.message",
  "claimBusinessForm.verificationTitle",
  "claimBusinessForm.verification.businessEmailDomain",
  "claimBusinessForm.verification.phoneVerification",
  "claimBusinessForm.verification.websiteContactMatch",
  "claimBusinessForm.verification.officialSocialMedia",
  "claimBusinessForm.verification.documentUpload",
  "claimBusinessForm.verification.manualReview",
  "claimBusinessForm.proofNotes",
  "claimBusinessForm.proofNotesPlaceholder",
  "claimBusinessForm.documentUploadNote",
  "claimBusinessForm.tierTitle",
  "claimBusinessForm.tier.free",
  "claimBusinessForm.tier.freeDescription",
  "claimBusinessForm.tier.verified",
  "claimBusinessForm.tier.verifiedDescription",
  "claimBusinessForm.tier.signature",
  "claimBusinessForm.tier.signatureDescription",
  "claimBusinessForm.paymentLaterNote",
  "claimBusinessForm.submit",
  "claimBusinessForm.submitting",
  "claimBusinessForm.submitSuccess",
  "claimBusinessForm.submitError",
  "claimBusinessForm.submitErrorTitle",
  "claimBusinessForm.searchAgain",
  "claimBusinessForm.viewListing",
  "claimBusinessForm.validation.name",
  "claimBusinessForm.validation.email",
  "claimBusinessForm.validation.message",
  "claimBusinessForm.unavailable.claimedTitle",
  "claimBusinessForm.unavailable.claimedDescription",
  "claimBusinessForm.unavailable.pendingTitle",
  "claimBusinessForm.unavailable.pendingDescription",
  "claimBusinessForm.confirmationEyebrow",
  "claimBusinessForm.confirmationTitle",
  "claimBusinessForm.confirmationReference",
  "claimBusinessForm.confirmationBusiness",
  "claimBusinessForm.confirmationTier",
  "claimBusinessForm.confirmationStatus",
  "claimBusinessForm.confirmationNextStep",
  "claimBusinessForm.status.pending",
] as const;

interface ClaimBusinessSlugPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function resolveListingId(slugOrId: string) {
  if (isUuid(slugOrId)) return slugOrId;

  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("listing_slugs")
    .select("listing_id")
    .eq("slug", slugOrId)
    .maybeSingle();

  if (error) throw error;
  return data?.listing_id ?? null;
}

async function getClaimListing(slugOrId: string) {
  const supabase = createPublicServerClient();
  const resolvedListingId = await resolveListingId(slugOrId);

  let query = supabase.from("listings").select(CLAIM_FORM_LISTING_FIELDS);
  query = resolvedListingId ? query.eq("id", resolvedListingId) : query.eq("slug", slugOrId);

  const { data, error } = await query.eq("status", "published").maybeSingle();
  if (error) throw error;
  return (data as unknown as ClaimFormListing | null) ?? null;
}

export async function generateMetadata({
  params,
}: ClaimBusinessSlugPageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const tx = await getServerTranslations(locale, [
    "claimBusinessForm.title",
    "claimBusinessForm.description",
  ]);
  const listing = await getClaimListing(slug).catch(() => null);

  if (!listing) {
    return buildLocalizedMetadata({
      locale,
      path: `/claim-business/${slug}`,
      title: tx["claimBusinessForm.title"],
      description: tx["claimBusinessForm.description"],
      noIndex: true,
    });
  }

  return buildLocalizedMetadata({
    locale,
    path: `/claim-business/${listing.slug ?? listing.id}`,
    title: `${tx["claimBusinessForm.title"]} | ${listing.name}`,
    description: tx["claimBusinessForm.description"],
    noIndex: true,
  });
}

export default async function ClaimBusinessSlugPage({
  params,
}: ClaimBusinessSlugPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const [listing, tx] = await Promise.all([
    getClaimListing(slug),
    getServerTranslations(locale, [...CLAIM_FORM_TRANSLATION_KEYS]),
  ]);

  if (!listing) {
    notFound();
  }

  const canonicalSlug = listing.slug ?? listing.id;
  const claimPath = `/claim-business/${canonicalSlug}`;
  const listingHref = buildLocalizedPath(locale, `/listing/${canonicalSlug}`);
  const searchHref = buildLocalizedPath(locale, "/claim-business");
  const loginHref = buildLocalizedPath(locale, "/login", {
    query: {
      next: buildLocalizedPath(locale, claimPath),
    },
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="app-container space-y-8 pb-20 pt-28 lg:pt-32">
        <section className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C6961C]">
            AlgarveOfficial
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground md:text-5xl">
            {tx["claimBusinessForm.title"]}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
            {tx["claimBusinessForm.description"]}
          </p>
        </section>

        <BusinessClaimFormClient
          listing={listing}
          listingHref={listingHref}
          searchHref={searchHref}
          loginHref={loginHref}
          tx={tx}
        />
      </div>
    </main>
  );
}
