"use client";

import { type SVGProps, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  MapPin,
  Globe,
  ConciergeBell,
  Instagram,
  Facebook,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import type { Tables } from "@/integrations/supabase/types";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/config";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RouteMessageState } from "@/components/layout/RouteMessageState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import { GoogleIcon } from "@/components/ui/google-icon";
import { useAuth } from "@/contexts/AuthContext";
import { useChatModal } from "@/components/chat/ChatProvider";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useHydrated } from "@/hooks/useHydrated";
import { useMobileMenu } from "@/contexts/MobileMenuContext";
import { LoginModal } from "@/components/ui/login-modal";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { translateCategoryName } from "@/lib/translateCategory";
import { translateCategoryValue } from "@/lib/translateCategoryValue";
import { useLocalePath } from "@/hooks/useLocalePath";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { formatRichTextDescription } from "@/lib/formatRichText";
import { sanitizeHtmlString } from "@/lib/sanitizeHtml";
import { getCanonicalCategorySlug } from "@/lib/categoryMerges";
import { getCategoryUrlSlug } from "@/lib/seo/programmatic/category-slugs";
import { getListingCategoryLanding } from "@/lib/listingCategoryLanding";
import { hasRealEstateSignals, isRealEstateCategorySlug } from "@/lib/realEstateDetection";
import { normalizePublicImageUrl } from "@/lib/imageUrls";
import { buildUniformLocalizedSlugMap } from "@/lib/i18n/localized-routing";
import { normalizePublicContentLocale } from "@/lib/publicContentLocale";
import ListingImage from "@/components/ListingImage";
import ListingTierBadge from "@/components/ui/ListingTierBadge";
import { ListingReviews } from "@/components/listing-details/ListingReviews";
import type { ListingReview } from "@/hooks/useListingReviews";
import { getListingTierRules } from "@/lib/listingTierRules";
import { PRIMARY_WHATSAPP_NUMBER, toWhatsAppDigits } from "@/lib/contactPhone";
import { cn } from "@/lib/utils";
import { PremiumAccommodationLayout } from "@/components/listing-details/PremiumAccommodationLayout";
import { FineDiningLayout } from "@/components/listing-details/FineDiningLayout";
import { GolfLayout } from "@/components/listing-details/GolfLayout";
import { BeachClubLayout } from "@/components/listing-details/BeachClubLayout";
import { ShoppingLayout } from "@/components/listing-details/ShoppingLayout";
import { WellnessLayout } from "@/components/listing-details/WellnessLayout";
import { PrivateChefLayout } from "@/components/listing-details/PrivateChefLayout";
import { VIPConciergeLayout } from "@/components/listing-details/VIPConciergeLayout";
import { PremiumExperienceLayout } from "@/components/listing-details/PremiumExperienceLayout";
import { FamilyFunLayout } from "@/components/listing-details/FamilyFunLayout";
import { VIPTransportationLayout } from "@/components/listing-details/VIPTransportationLayout";
import { RealEstateLayout } from "@/components/listing-details/RealEstateLayout";
import { PremierEventsLayout } from "@/components/listing-details/PremierEventsLayout";
import { ArchitectureDecorationLayout } from "@/components/listing-details/ArchitectureDecorationLayout";
import { ProtectionServicesLayout } from "@/components/listing-details/ProtectionServicesLayout";
import { RealEstateAgentContactCard } from "@/components/real-estate/RealEstateAgentContactCard";
import type { MapListingPoint } from "@/components/map/ListingsLeafletMap";

export type ListingTranslationRow = {
  listing_id: string;
  language_code: string;
  title: string | null;
  short_description?: string | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  translation_status?: string | null;
  updated_at?: string | null;
};

export type ListingImageRow = Pick<
  Tables<"listing_images">,
  "id" | "image_url" | "alt_text" | "display_order" | "is_featured"
>;

export type ListingWithRelations = Tables<"listings"> & {
  city?: Tables<"cities"> | null;
  region?: Tables<"regions"> | null;
  category?: Tables<"categories"> | null;
  images?: ListingImageRow[] | null;
};

export type RelatedListing = Tables<"listings"> & {
  city?: Tables<"cities"> | null;
  region?: Tables<"regions"> | null;
  category?: Tables<"categories"> | null;
};

export interface WhatsAppStatus {
  enabled: boolean;
  phone: string | null;
}

export type OtherRegion = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  image_url: string | null;
  hero_image_url: string | null;
};

export interface ListingDetailClientProps {
  locale?: string;
  localeSwitchPaths?: Partial<Record<Locale, string>>;
  listing: ListingWithRelations;
  initialTranslation: ListingTranslationRow | null;
  initialReviews: ListingReview[];
  initialRelatedListings: RelatedListing[];
  initialWhatsAppStatus: WhatsAppStatus;
  initialLookupValue: string;
  initialOtherRegions?: OtherRegion[];
}

const PUBLIC_LISTING_FIELDS = `
  id,
  slug,
  name,
  short_description,
  description,
  featured_image_url,
  price_from,
  price_to,
  price_currency,
  tier,
  is_curated,
  status,
  city_id,
  region_id,
  category_id,
  owner_id,
  latitude,
  longitude,
  address,
  contact_phone,
  contact_email,
  website_url,
  facebook_url,
  instagram_url,
  twitter_url,
  linkedin_url,
  youtube_url,
  tiktok_url,
  telegram_url,
  whatsapp_number,
  google_business_url,
  google_rating,
  google_review_count,
  tags,
  category_data,
  view_count,
  published_at,
  created_at,
  updated_at
`;

const PUBLIC_CITY_FIELDS = "id, name, slug, short_description, image_url, latitude, longitude";
const PUBLIC_REGION_FIELDS = "id, name, slug, short_description, image_url";
const PUBLIC_CATEGORY_FIELDS = "id, name, slug, icon, short_description, image_url";
const LISTING_REVIEW_FIELDS = `
  id, listing_id, user_id, rating, comment, status, rejection_reason,
  created_at, updated_at, approved_at, moderated_at, moderated_by
`;
const RELATED_LISTING_FIELDS = `
  id,
  slug,
  name,
  featured_image_url,
  city:cities(id, name)
`;

const ListingsLeafletMap = dynamic(() => import("@/components/map/ListingsLeafletMap"), {
  ssr: false,
});

const getCategoryLayout = (
  categorySlug: string,
  details: Record<string, unknown>,
  bookingUrl?: string,
  onInquire?: () => void,
) => {
  const props = { details, bookingUrl, onInquire };
  const hasPropertySignals = hasRealEstateSignals(details);

  switch (categorySlug) {
    case "places-to-stay":
    case "premium-accommodation":
      return <PremiumAccommodationLayout {...props} />;
    case "restaurants":
    case "fine-dining":
      return <FineDiningLayout {...props} />;
    case "golf":
      return <GolfLayout details={details} bookingUrl={bookingUrl} />;
    case "beaches-clubs":
    case "beaches":
      return <BeachClubLayout {...props} />;
    case "wellness-spas":
      return <WellnessLayout {...props} />;
    case "shopping-boutiques":
      return <ShoppingLayout {...props} />;
    case "private-chefs":
      return <PrivateChefLayout {...props} />;
    case "vip-concierge":
      return <VIPConciergeLayout {...props} />;
    case "things-to-do":
    case "premium-experiences":
      return <PremiumExperienceLayout {...props} />;
    case "family-fun":
      return <FamilyFunLayout {...props} />;
    case "vip-transportation":
      return <VIPTransportationLayout {...props} />;
    case "real-estate":
    case "prime-real-estate":
      return <RealEstateLayout details={details} onInquire={onInquire} />;
    case "algarve-services":
      return hasPropertySignals ? (
        <RealEstateLayout details={details} onInquire={onInquire} />
      ) : (
        <VIPConciergeLayout {...props} />
      );
    case "whats-on":
    case "premier-events":
    case "events":
      return <PremierEventsLayout details={details} />;
    case "architecture-decoration":
      return <ArchitectureDecorationLayout {...props} />;
    case "protection-services":
      return <ProtectionServicesLayout {...props} />;
    default:
      return <ShoppingLayout {...props} />;
  }
};

const normalizeImageUrl = (value?: string | null): string | null => normalizePublicImageUrl(value);

const WHATSAPP_CTA_CLASSNAME =
  "w-full border-[#25D366] bg-[#25D366] text-white hover:border-[#1EBE5D] hover:bg-[#1EBE5D] hover:text-white focus-visible:ring-[#25D366]/60";
const MOBILE_BOTTOM_NAV_FALLBACK_HEIGHT = 78;
const CONCIERGE_DEFAULT_MESSAGE = "Hello! I'm interested in learning more about your premium services in Algarve.";

function WhatsAppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M13.601 2.326A7.854 7.854 0 0 0 8.047 0C3.623 0 .027 3.594.026 8.018a7.94 7.94 0 0 0 1.078 3.96L0 16l4.126-1.081a7.95 7.95 0 0 0 3.921 1h.003c4.423 0 8.02-3.595 8.021-8.019A7.935 7.935 0 0 0 13.6 2.326ZM8.05 14.586h-.002a6.54 6.54 0 0 1-3.329-.91l-.239-.142-2.448.642.653-2.387-.155-.245a6.547 6.547 0 0 1-1-3.506c.001-3.62 2.946-6.565 6.57-6.565 1.75 0 3.398.682 4.634 1.918a6.532 6.532 0 0 1 1.919 4.633c-.001 3.621-2.946 6.566-6.57 6.566Z" />
      <path d="M11.815 10.588c-.198-.099-1.17-.578-1.351-.644-.181-.066-.312-.099-.444.1-.132.198-.511.644-.627.776-.115.132-.23.149-.428.05-.198-.099-.836-.308-1.592-.983-.588-.525-.985-1.173-1.1-1.371-.115-.198-.012-.305.087-.404.089-.089.198-.23.297-.346.099-.115.132-.198.198-.33.066-.132.033-.248-.017-.347-.05-.099-.444-1.07-.608-1.468-.16-.387-.323-.335-.444-.341l-.378-.007a.73.73 0 0 0-.528.248c-.181.198-.692.677-.692 1.65 0 .974.709 1.915.808 2.047.099.132 1.397 2.133 3.387 2.992.474.204.844.326 1.132.417.476.151.909.13 1.251.079.382-.057 1.17-.479 1.335-.941.165-.462.165-.858.116-.941-.05-.083-.182-.132-.38-.231Z" />
    </svg>
  );
}

function normalizeExternalUrl(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function buildWhatsAppUrl(rawValue: string | null | undefined, message: string): string | null {
  const trimmed = rawValue?.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (url.hostname.includes("wa.me") || url.hostname.includes("whatsapp.com")) {
        if (!url.searchParams.get("text")) {
          url.searchParams.set("text", message);
        }
        return url.toString();
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatListingPrice({
  locale,
  priceFrom,
  priceTo,
  currency,
  unit,
}: {
  locale: string;
  priceFrom: number;
  priceTo?: number | null;
  currency?: string | null;
  unit?: string | null;
}) {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency || "EUR",
    maximumFractionDigits: 0,
  });
  const formattedFrom = formatter.format(priceFrom);
  const formattedTo = priceTo ? formatter.format(priceTo) : null;
  const formatted = formattedTo ? `${formattedFrom} – ${formattedTo}` : formattedFrom;

  switch (unit) {
    case "per_month":
      return `${formatted}/month`;
    case "per_week":
      return `${formatted}/week`;
    default:
      return formatted;
  }
}

async function fetchListingByIdOrSlug(idOrSlug: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  let query = supabase.from("listings").select(`
      ${PUBLIC_LISTING_FIELDS},
      city:cities(${PUBLIC_CITY_FIELDS}),
      region:regions(${PUBLIC_REGION_FIELDS}),
      category:categories(${PUBLIC_CATEGORY_FIELDS}),
      images:listing_images(id, image_url, alt_text, display_order, is_featured)
    `);

  query = isUuid ? query.eq("id", idOrSlug) : query.eq("slug", idOrSlug);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;

  return (data as unknown as ListingWithRelations | null) ?? null;
}

async function fetchApprovedListingReviews(listingId: string) {
  const { data, error } = await supabase
    .from("listing_reviews")
    .select(LISTING_REVIEW_FIELDS)
    .eq("listing_id", listingId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const reviews = ((data ?? []) as ListingReview[]) ?? [];
  const userIds = Array.from(new Set(reviews.map((review) => review.user_id).filter(Boolean)));

  if (userIds.length === 0) {
    return reviews;
  }

  const { data: profileRows, error: profileError } = await supabase
    .from("public_profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds);

  if (profileError) throw profileError;

  const profilesById = new Map(
    (profileRows ?? []).map((profile) => [
      profile.id as string,
      {
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      },
    ]),
  );

  return reviews.map((review) => ({
    ...review,
    profile: profilesById.get(review.user_id) ?? null,
  }));
}

async function fetchRelatedListings(listing: ListingWithRelations) {
  if (!listing.category_id) {
    return [];
  }

  const { data, error } = await supabase
    .from("listings")
    .select(RELATED_LISTING_FIELDS)
    .eq("status", "published")
    .eq("category_id", listing.category_id)
    .neq("id", listing.id)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) throw error;
  return (data ?? []) as unknown as RelatedListing[];
}

async function fetchOwnerWhatsAppStatus(ownerId: string | null) {
  if (!ownerId) {
    return { enabled: false, phone: null };
  }

  const { data, error } = await supabase
    .from("whatsapp_accounts")
    .select("wa_enabled, business_phone_e164")
    .eq("owner_id", ownerId)
    .eq("wa_enabled", true)
    .maybeSingle();

  if (error) throw error;

  return {
    enabled: !!data,
    phone: data?.business_phone_e164 ?? null,
  } satisfies WhatsAppStatus;
}

function ListingDetailClientInner({
  locale: _initialLocaleProp,
  localeSwitchPaths,
  listing: initialListing,
  initialTranslation,
  initialReviews,
  initialRelatedListings,
  initialWhatsAppStatus,
  initialLookupValue,
  initialOtherRegions = [],
}: ListingDetailClientProps) {
  const { t } = useTranslation();
  const l = useLocalePath();
  const hydrated = useHydrated();
  const currentLocale = useCurrentLocale();
  const routeLocale = normalizePublicContentLocale(currentLocale);
  const { user } = useAuth();
  const { openChat } = useChatModal();
  const { isFavorite, toggleFavorite } = useFavoriteListings();
  const { mobileMenuOpen } = useMobileMenu();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [agentContactModalOpen, setAgentContactModalOpen] = useState(false);
  const [prefillScheduleVisit, setPrefillScheduleVisit] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [tr, setTr] = useState<ListingTranslationRow | null>(initialTranslation);
  const [trLoading, setTrLoading] = useState(false);
  const [trError, setTrError] = useState<string | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [mobileBottomNavHeight, setMobileBottomNavHeight] = useState(MOBILE_BOTTOM_NAV_FALLBACK_HEIGHT);
  const scrollTimeoutRef = useRef<number | null>(null);

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ["listing", initialLookupValue, routeLocale],
    queryFn: async () => {
      const data = await fetchListingByIdOrSlug(initialLookupValue);
      if (!data) {
        throw new Error("Listing not found");
      }
      return data;
    },
    initialData: initialListing,
    staleTime: 1000 * 60 * 5,
  });

  useQuery({
    queryKey: ["listing-reviews", listing.id],
    queryFn: () => fetchApprovedListingReviews(listing.id),
    initialData: initialReviews,
    staleTime: 1000 * 60 * 2,
  });

  const { data: relatedListings = initialRelatedListings } = useQuery({
    queryKey: ["listing-related", listing.id, listing.category_id],
    queryFn: () => fetchRelatedListings(listing),
    initialData: initialRelatedListings,
    staleTime: 1000 * 60 * 5,
  });

  const { data: waStatus = initialWhatsAppStatus } = useQuery({
    queryKey: ["owner-whatsapp-status", listing.owner_id],
    queryFn: () => fetchOwnerWhatsAppStatus(listing.owner_id),
    initialData: initialWhatsAppStatus,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!listing?.id) return;

    const targetLang = routeLocale;

    if (!targetLang || targetLang === "en") {
      setTr(initialTranslation);
      setTrError(null);
      setTrLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setTrLoading(true);
      setTrError(null);

      try {
        const { data: target, error: targetError } = await supabase
          .from("listing_translations")
          .select(
            "listing_id, language_code, title, short_description, description, seo_title, seo_description, translation_status, updated_at",
          )
          .eq("listing_id", listing.id)
          .eq("language_code", targetLang)
          .maybeSingle();

        if (targetError) throw targetError;

        if (!target) {
          const { data: enRow, error: englishError } = await supabase
            .from("listing_translations")
            .select(
              "listing_id, language_code, title, short_description, description, seo_title, seo_description, translation_status, updated_at",
            )
            .eq("listing_id", listing.id)
            .eq("language_code", "en")
            .maybeSingle();

          if (englishError) throw englishError;
          if (!cancelled) setTr((enRow as ListingTranslationRow | null) ?? initialTranslation);
        } else if (!cancelled) {
          setTr(target as ListingTranslationRow);
        }
      } catch (fetchError) {
        if (!cancelled) setTrError(String((fetchError as Error)?.message ?? fetchError));
      } finally {
        if (!cancelled) setTrLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialTranslation, listing?.id, routeLocale]);

  useEffect(() => {
    const handleScroll = () => {
      setIsUserScrolling(true);
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsUserScrolling(false);
      }, 180);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let frameId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const updateBottomNavHeight = () => {
      const mobileNav = document.querySelector<HTMLElement>(".bottom-nav");
      if (!mobileNav) return;

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        const measuredHeight = mobileNav.offsetHeight;
        if (measuredHeight > 0) {
          const normalizedHeight = Math.ceil(measuredHeight);
          setMobileBottomNavHeight((currentHeight) =>
            currentHeight === normalizedHeight ? currentHeight : normalizedHeight,
          );
        }
      });
    };

    updateBottomNavHeight();
    window.addEventListener("resize", updateBottomNavHeight);
    window.addEventListener("orientationchange", updateBottomNavHeight);
    if (typeof ResizeObserver !== "undefined") {
      const mobileNav = document.querySelector<HTMLElement>(".bottom-nav");
      if (mobileNav) {
        resizeObserver = new ResizeObserver(updateBottomNavHeight);
        resizeObserver.observe(mobileNav);
      }
    }

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateBottomNavHeight);
      window.removeEventListener("orientationchange", updateBottomNavHeight);
    };
  }, []);

  const isAdminOrEditor = user?.role === "admin" || user?.role === "editor";

  const effectiveTitle = useMemo(() => tr?.title?.trim() || listing?.name || "", [listing?.name, tr?.title]);
  const effectiveShort = useMemo(
    () => tr?.short_description?.trim() || listing?.short_description || null,
    [listing?.short_description, tr?.short_description],
  );
  const effectiveDescription = useMemo(
    () => tr?.description?.trim() || listing?.description || listing?.short_description || null,
    [listing?.description, listing?.short_description, tr?.description],
  );
  const listingTitle = effectiveTitle ?? listing.name;
  const details = listing.category_data as Record<string, unknown> ?? {};
  const tierRules = getListingTierRules(listing.tier);

  const contactPrefillMessage = `Hi! I'm interested in "${listingTitle}" in ${listing.city?.name || "Algarve"}.`;
  const directWhatsAppUrl = tierRules.allowDirectContactButton
    ? (
      buildWhatsAppUrl(listing.whatsapp_number, contactPrefillMessage)
      ?? buildWhatsAppUrl(waStatus?.phone, contactPrefillMessage)
    )
    : null;
  const directTelegramUrl = tierRules.allowDirectContactButton
    ? normalizeExternalUrl(listing.telegram_url)
    : null;
  const directContactUrl = directWhatsAppUrl ?? directTelegramUrl;
  const hasWhatsAppDirectContact = Boolean(directWhatsAppUrl);
  const directContactLabel = directWhatsAppUrl ? t("listing.messageWhatsApp") : t("listing.social.telegram");
  const bookingUrl = normalizeExternalUrl(details.booking_url as string | undefined);
  const websiteUrl = normalizeExternalUrl(listing.website_url);
  const ctaUrl = tierRules.allowCtaButton ? (bookingUrl ?? websiteUrl) : null;
  const ctaLabel = bookingUrl ? t("listing.bookNow") : t("listing.visitWebsite");
  const ctaAriaLabel = bookingUrl ? t("listing.bookNow") : t("listing.visitWebsite");
  const isSignatureOrVerifiedTier = listing.tier === "signature" || listing.tier === "verified";
  const shouldShowMobileConciergeAction = !isSignatureOrVerifiedTier;
  const shouldShowMobileWhatsAppAction = isSignatureOrVerifiedTier && Boolean(directWhatsAppUrl);
  const shouldShowMobileWebsiteAction = isSignatureOrVerifiedTier && Boolean(ctaUrl);
  const mobileActionBarBottomOffset = Math.max(mobileBottomNavHeight - 1, 0);
  const conciergeWhatsAppUrl = `https://wa.me/${toWhatsAppDigits(PRIMARY_WHATSAPP_NUMBER)}?text=${encodeURIComponent(CONCIERGE_DEFAULT_MESSAGE)}`;

  const handleMessageClick = () => {
    if (!listing) return;

    if (user) {
      openChat({
        listingId: listing.id,
        ownerId: listing.owner_id,
        listingName: effectiveTitle ?? listing.name,
      });
      return;
    }

    if (waStatus?.phone) {
      const message = `Hi! I'm interested in "${effectiveTitle || listing.name}" in ${listing.city?.name || "Algarve"}.`;
      window.open(`https://wa.me/${waStatus.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      return;
    }

    setShowLoginModal(true);
  };

  const openAgentContactModal = (scheduleVisit = false) => {
    setPrefillScheduleVisit(scheduleVisit);
    setAgentContactModalOpen(true);
  };

  const handleSaveClick = () => {
    if (!listing) return;
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const alreadyFavorite = isFavorite(listing.id);
    void toggleFavorite(listing.id);
    toast.success(alreadyFavorite ? "Removed from favorites" : "Saved to favorites");
  };

  const handleShareClick = async () => {
    if (!listing) return;

    const shareData = {
      title: effectiveTitle ?? listing.name,
      text: effectiveShort ?? `Check out ${effectiveTitle || listing.name} in ${listing.city?.name || "Algarve"}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    } catch (shareError) {
      if ((shareError as Error).name === "AbortError") {
        return;
      }

      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      } catch {
        toast.error("Clipboard permission denied");
      }
    }
  };

  const hasPropertySignals = hasRealEstateSignals(details);
  const isRealEstateListing =
    isRealEstateCategorySlug(listing.category?.slug) || (listing.category?.slug === "algarve-services" && hasPropertySignals);
  const listingPriceFrom = toFiniteNumber(listing.price_from) ?? toFiniteNumber(details.price) ?? toFiniteNumber(details.price_eur);
  const listingPriceTo = toFiniteNumber(listing.price_to);
  const listingPriceCurrency =
    listing.price_currency ||
    (typeof details.currency === "string" ? details.currency : null) ||
    "EUR";
  const listingPriceUnit = typeof details.price_unit === "string" ? details.price_unit : null;
  const realEstatePriceLabel = listingPriceUnit === "per_month" || listingPriceUnit === "per_week"
    ? t("categoryLayouts.realEstate.rentalPrice")
    : t("categoryLayouts.realEstate.askingPrice");
  const realEstatePrice = isRealEstateListing && listingPriceFrom
    ? formatListingPrice({
        locale: routeLocale,
        priceFrom: listingPriceFrom,
        priceTo: listingPriceTo,
        currency: listingPriceCurrency,
        unit: listingPriceUnit,
      })
    : null;

  const handleScheduleViewingClick = () => {
    if (!isRealEstateListing) {
      handleMessageClick();
      return;
    }

    openAgentContactModal(true);
  };

  const baseLatitude = Number(listing?.latitude ?? listing?.city?.latitude ?? NaN);
  const baseLongitude = Number(listing?.longitude ?? listing?.city?.longitude ?? NaN);
  const normalizedFeaturedImageUrl = normalizeImageUrl(listing?.featured_image_url);
  const normalizedCategoryImageUrl = normalizeImageUrl(listing?.category?.image_url);

  const listingMapPoints = useMemo<MapListingPoint[]>(() => {
    if (!listing || !Number.isFinite(baseLatitude) || !Number.isFinite(baseLongitude)) return [];

    return [
      {
        id: listing.id,
        name: effectiveTitle ?? listing.name,
        slug: listing.slug,
        latitude: baseLatitude,
        longitude: baseLongitude,
        categorySlug: listing.category?.slug,
        categoryName: translateCategoryName(t, listing.category?.slug, listing.category?.name),
        categoryImageUrl: normalizedCategoryImageUrl ?? undefined,
        cityName: listing.city?.name ?? "Algarve",
        tier: listing.tier,
        featuredImageUrl: (normalizedFeaturedImageUrl || normalizedCategoryImageUrl) ?? undefined,
        href: l({
          routeType: "listing",
          slugs: buildUniformLocalizedSlugMap(listing.slug || listing.id),
        }),
        isPrimary: true,
      },
    ];
  }, [
    baseLatitude,
    baseLongitude,
    effectiveTitle,
    listing,
    l,
    normalizedCategoryImageUrl,
    normalizedFeaturedImageUrl,
    t,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header localeSwitchPaths={localeSwitchPaths} />
        <main id="main-content" className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !listing || (listing.status !== "published" && !isAdminOrEditor)) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header localeSwitchPaths={localeSwitchPaths} />
        <main id="main-content" className="flex-1 flex items-center justify-center">
          <RouteMessageState
            title={t("listing.notFound")}
            description={t("listing.notFoundMessage")}
            actions={(
              <Link href={l("/")}>
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("listing.backToHome")}
                </Button>
              </Link>
            )}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const galleryImages = ((listing.images || []) as ListingImageRow[])
    .map((image) => ({
      ...image,
      image_url: normalizeImageUrl(image?.image_url) ?? "",
    }))
    .filter((image) => !!image.image_url)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .slice(0, tierRules.maxGalleryImages);

  if (galleryImages.length === 0 && normalizedFeaturedImageUrl) {
    galleryImages.push({
      id: "featured",
      image_url: normalizedFeaturedImageUrl,
      alt_text: listing.name,
      display_order: 0,
      is_featured: true,
    });
  }

  if (galleryImages.length === 0 && normalizedCategoryImageUrl) {
    galleryImages.push({
      id: "category-fallback",
      image_url: normalizedCategoryImageUrl,
      alt_text: listing.name,
      display_order: 0,
      is_featured: false,
    });
  }

  const directoryLabel = t("nav.directory");
  const categoryLabel = translateCategoryName(t, listing.category?.slug, listing.category?.name) ?? directoryLabel;
  const canonicalCategorySlug = getCanonicalCategorySlug(listing.category?.slug);
  const landingPage = getListingCategoryLanding(canonicalCategorySlug);
  const landingLabel = t(landingPage.labelKey, landingPage.fallbackLabel);
  const categoryDirectoryPath = canonicalCategorySlug ? `/stay?category=${canonicalCategorySlug}` : "/stay";
  const cityRouteData = listing.city?.slug
    ? {
        routeType: "city" as const,
        citySlugs: buildUniformLocalizedSlugMap(listing.city.slug),
      }
    : null;
  const categorySlugMap = canonicalCategorySlug
    ? (Object.fromEntries(
        SUPPORTED_LOCALES.map((locale) => [
          locale,
          getCategoryUrlSlug(canonicalCategorySlug, locale),
        ]),
      ) as Partial<Record<Locale, string>>)
    : null;
  const cityCategoryRouteData =
    cityRouteData && categorySlugMap
      ? ({
          routeType: "city-category" as const,
          citySlugs: cityRouteData.citySlugs,
          categorySlugs: categorySlugMap,
        })
      : null;

  const visualBreadcrumbs = [
    { name: t("nav.home"), to: l("/"), current: false },
    { name: landingLabel, to: l(landingPage.path), current: false },
    ...(canonicalCategorySlug
      ? [{ name: categoryLabel, to: l(categoryDirectoryPath), current: false }]
      : []),
    {
      name: listingTitle,
      to: l({
        routeType: "listing",
        slugs: buildUniformLocalizedSlugMap(listing.slug || listing.id),
      }),
      current: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header localeSwitchPaths={localeSwitchPaths} />

      <main id="main-content" className="flex-1 pt-[10px] pb-44 sm:pb-48 lg:pb-0">
        <nav className="bg-card border-b border-border" aria-label={t("guides.breadcrumbLabel")}>
          <div className="container mx-auto max-w-7xl px-4 py-3">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              {visualBreadcrumbs.map((crumb, index) => (
                <li key={`${crumb.name}-${index}`} className="flex items-center gap-1.5 min-w-0">
                  {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/70 flex-shrink-0" />}
                  {crumb.current ? (
                    <span className="text-foreground font-medium truncate max-w-[180px] sm:max-w-[260px] lg:max-w-[420px]">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link href={crumb.to} className="hover:text-foreground transition-colors">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </nav>

        {(trLoading || trError) ? (
          <div className="bg-muted/40 border-b border-border">
            <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
              {trLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  {t("common.error")}
                </>
              )}
            </div>
          </div>
        ) : null}

        <section className="relative bg-muted">
          <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-10">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div
                className="relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl group sm:aspect-[16/10] lg:col-span-2"
                onClick={() => setLightboxOpen(true)}
              >
                <ListingImage
                  src={galleryImages[currentImageIndex]?.image_url ?? normalizedFeaturedImageUrl}
                  categoryImageUrl={normalizedCategoryImageUrl}
                  fallbackSrc="/placeholder.svg"
                  alt={galleryImages[currentImageIndex]?.alt_text ?? listing.name}
                  width={1600}
                  height={1000}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority={true}
                  loading="eager"
                  fetchPriority="high"
                  className="transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
                    {t("listing.viewGallery")}
                  </span>
                </div>

                {galleryImages.length > 1 ? (
                  <>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setCurrentImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {galleryImages.map((_, index) => (
                        <button
                          key={`${galleryImages[index]?.id ?? index}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? "bg-white" : "bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : null}

                <div className="absolute top-4 left-4 flex gap-2">
                  {(listing.tier === "signature" || listing.tier === "verified") ? (
                    <ListingTierBadge tier={listing.tier} />
                  ) : null}
                  {listing.tier === "signature" ? <ListingTierBadge tier="verified" /> : null}
                </div>

                {listing.google_rating ? (
                  <GoogleRatingBadge
                    rating={listing.google_rating}
                    reviewCount={listing.google_review_count}
                    variant="overlay"
                    className="absolute bottom-4 right-4"
                  />
                ) : null}
              </div>

              <div className="hidden lg:block h-full min-h-0">
                {listingMapPoints.length === 0 ? (
                  <div className="grid grid-cols-2 gap-4 h-full">
                    {galleryImages.slice(1, 5).map((image, index) => (
                      <div
                        key={image.id}
                        onClick={() => setCurrentImageIndex(index + 1)}
                        className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-opacity hover:opacity-80 ${
                          currentImageIndex === index + 1 ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <ListingImage
                          src={image.image_url}
                          categoryImageUrl={normalizedCategoryImageUrl}
                          fallbackSrc="/placeholder.svg"
                          alt={image.alt_text ?? listing.name}
                          fill
                        />
                        {index === 3 && galleryImages.length > 5 ? (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-lg font-medium">+{galleryImages.length - 5}</span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full rounded-xl overflow-hidden">
                    {hydrated ? (
                      <ListingsLeafletMap
                        points={listingMapPoints}
                        activeListingId={listing.id}
                        focusListingId={listing.id}
                        enableClustering={false}
                        scrollWheelZoom={false}
                        showPopups
                        className="h-full"
                        mapClassName="h-full min-h-0"
                        emptyMessage={t("listing.locationUnavailable")}
                      />
                    ) : (
                      <div className="h-full min-h-[300px] w-full bg-muted animate-pulse rounded-xl" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:hidden mt-4">
              {listingMapPoints.length > 0 ? (
                <div className="rounded-xl overflow-hidden">
                  {hydrated ? (
                    <ListingsLeafletMap
                      points={listingMapPoints}
                      activeListingId={listing.id}
                      focusListingId={listing.id}
                      enableClustering={false}
                      scrollWheelZoom={false}
                      showPopups
                      mapClassName="aspect-video"
                      emptyMessage={t("listing.locationUnavailable")}
                    />
                  ) : (
                    <div className="aspect-video w-full bg-muted animate-pulse rounded-xl" />
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {listing.category?.slug ? (
                      <LocaleLink
                        href={
                          cityCategoryRouteData ??
                          `/stay?category=${listing.category.slug}`
                        }
                        className="hover:opacity-80"
                      >
                        <Badge variant="secondary" className="text-body-xs">
                          {translateCategoryName(t, listing.category?.slug, listing.category?.name)}
                        </Badge>
                      </LocaleLink>
                    ) : listing.category ? (
                      <Badge variant="secondary" className="text-body-xs">
                        {translateCategoryName(t, listing.category?.slug, listing.category?.name)}
                      </Badge>
                    ) : null}
                    {listing.region ? (
                      <Badge variant="outline" className="text-body-xs">
                        {listing.region.name}
                      </Badge>
                    ) : null}
                  </div>

                  <h1 className="mb-3 font-serif text-2xl font-medium sm:text-3xl md:text-4xl">{listingTitle}</h1>

                  <div className="flex flex-wrap items-center gap-2 text-body-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {cityRouteData ? (
                      <LocaleLink href={cityRouteData} className="hover:text-primary transition-colors">
                        {listing.city?.name}
                        {t("common.algarvePortugalSuffix")}
                      </LocaleLink>
                    ) : (
                      <span>
                        {listing.city?.name}
                        {t("common.algarvePortugalSuffix")}
                      </span>
                    )}
                  </div>

                  {(listing.google_rating || listing.tier === "signature" || listing.tier === "verified") ? (
                    <div className="mt-3">
                      {(listing.tier === "signature" || listing.tier === "verified") ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <ListingTierBadge tier={listing.tier} />
                          {listing.tier === "signature" ? <ListingTierBadge tier="verified" /> : null}
                        </div>
                      ) : null}
                      {listing.google_rating ? (
                        <div className={listing.tier === "signature" || listing.tier === "verified" ? "mt-2" : ""}>
                          <GoogleRatingBadge
                            rating={listing.google_rating}
                            reviewCount={listing.google_review_count}
                            variant="themed"
                          />
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {realEstatePrice ? (
                    <div className="mt-5 inline-flex min-w-[220px] flex-col rounded-sm border border-[hsl(43_74%_49%/0.28)] bg-[hsl(43_74%_49%/0.08)] px-5 py-4 shadow-sm">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(43_74%_36%)]">
                        {realEstatePriceLabel}
                      </span>
                      <span className="mt-1 font-serif text-2xl font-medium leading-none text-foreground sm:text-3xl">
                        {realEstatePrice}
                      </span>
                    </div>
                  ) : null}
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-serif font-medium mb-4">{t("listing.about")}</h2>
                <div
                  className="text-body-sm text-muted-foreground leading-relaxed [&_p]:mb-5 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-foreground"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtmlString(formatRichTextDescription(effectiveDescription)),
                  }}
                />
                </div>

                <Separator />

                {listing.category
                  ? getCategoryLayout(
                      listing.category.slug,
                      details,
                      details.booking_url as string | undefined,
                      (tierRules.allowDirectContactButton || tierRules.allowCtaButton)
                        ? (isRealEstateListing ? handleScheduleViewingClick : handleMessageClick)
                        : undefined,
                    )
                  : null}
              </div>

              <div className="space-y-6">
                <div className="premium-card p-6 lg:sticky lg:top-24">
                  <div className="flex gap-3 mb-6">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSaveClick}
                      aria-label={t("listing.saveToFavorites")}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite(listing.id) ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleShareClick}>
                      <Share2 className="h-4 w-4 mr-2" />
                      {t("listing.share")}
                    </Button>
                  </div>

                  <Separator className="my-6" />

                  <h4 className="text-body-sm font-medium text-muted-foreground mb-4">{t("listing.contact")}</h4>
                  {(listing.tier === "signature" || listing.tier === "verified") ? (
                    <div className="mb-4 rounded-sm border border-border/70 bg-muted/30 p-3">
                      <p className="text-sm font-medium text-foreground">
                        {listing.tier === "signature"
                          ? t("listing.trust.signatureTitle")
                          : t("listing.trust.verifiedTitle")}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {listing.tier === "signature"
                          ? t("listing.trust.signatureDescription")
                          : t("listing.trust.verifiedDescription")}
                      </p>
                    </div>
                  ) : null}
                  {(tierRules.allowDirectContactButton || tierRules.allowCtaButton) ? (
                    <div className="space-y-2 mb-4">
                      {ctaUrl ? (
                        <Button variant="gold" asChild className="w-full">
                          <a href={ctaUrl} target="_blank" rel="noopener noreferrer" aria-label={ctaAriaLabel}>
                            <Globe className="h-4 w-4 mr-2" />
                            {ctaLabel}
                          </a>
                        </Button>
                      ) : null}
                      {directContactUrl ? (
                        <Button
                          asChild
                          variant={hasWhatsAppDirectContact ? "outline" : ctaUrl ? "outline" : "default"}
                          className={hasWhatsAppDirectContact ? WHATSAPP_CTA_CLASSNAME : "w-full"}
                        >
                          <a href={directContactUrl} target="_blank" rel="noopener noreferrer">
                            {hasWhatsAppDirectContact ? (
                              <WhatsAppLogo className="mr-2" />
                            ) : (
                              <MessageCircle className="mr-2" />
                            )}
                            {directContactLabel}
                          </a>
                        </Button>
                      ) : null}
                      {listing.contact_phone ? (
                        <Button variant="outline" asChild className="w-full">
                          <a href={`tel:${listing.contact_phone}`}>
                            {t("listing.call")}
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-3">
                    {listing.instagram_url ? (
                      <a
                        href={listing.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-muted hover:bg-pink-500/20 transition-all duration-200 hover:scale-110"
                        title={t("listing.social.instagram")}
                      >
                        <Instagram className="h-5 w-5 text-[#E1306C]" />
                      </a>
                    ) : null}
                    {listing.facebook_url ? (
                      <a
                        href={listing.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-muted hover:bg-blue-500/20 transition-all duration-200 hover:scale-110"
                        title={t("listing.social.facebook")}
                      >
                        <Facebook className="h-5 w-5 text-[#1877F2]" />
                      </a>
                    ) : null}
                    {listing.google_business_url ? (
                      <a
                        href={listing.google_business_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-muted transition-all duration-200 hover:scale-110"
                        title={t("listing.social.googleBusiness")}
                      >
                        <GoogleIcon className="h-5 w-5" />
                      </a>
                    ) : null}
                  </div>

                  {listing.status === "published" && listing.tier !== "verified" && listing.tier !== "signature" ? (
                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="text-body-xs text-muted-foreground mb-2">
                        {t("listing.isYourBusiness")}
                      </p>
                      <Link
                        href={l("/partner?type=claim-business")}
                        className="text-body-xs text-primary hover:underline font-medium"
                      >
                        {t("listing.claimThisListing")} →
                      </Link>
                    </div>
                  ) : null}

                  {isRealEstateListing && !agentContactModalOpen ? (
                    <RealEstateAgentContactCard
                      listingId={listing.id}
                      listingName={listingTitle}
                      agentName={(details.agent_name as string | undefined) ?? null}
                      agentRole={(details.agent_role as string | undefined) ?? null}
                      agentEmail={(details.agent_email as string | undefined) ?? null}
                      agentPhone={(details.agent_phone as string | undefined) ?? null}
                      agentImageUrl={(details.agent_image as string | undefined) ?? null}
                    />
                  ) : null}
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                {listing.tags && listing.tags.length > 0 ? (
                  <>
                    <Separator />
                    <div>
                      <h2 className="text-xl font-serif font-medium mb-4">{t("listing.tags")}</h2>
                      <div className="flex flex-wrap gap-2">
                        {listing.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-sm">
                            {translateCategoryValue(t, tag)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}

                <Separator />
                <ListingReviews listingId={listing.id} userId={user?.id} onRequestLogin={() => setShowLoginModal(true)} />
              </div>
            </div>
          </div>
        </section>

        {relatedListings.length > 0 ? (
          <section className="border-t border-border py-8">
            <div className="container mx-auto max-w-7xl px-4">
              <h2 className="text-2xl font-serif font-medium mb-6">
                {t("listing.relatedListings", { category: categoryLabel })}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedListings.map((related) => {
                  const relatedImage = normalizeImageUrl(related.featured_image_url);

                  return (
                    <Link
                      key={related.id}
                      href={l({
                        routeType: "listing",
                        slugs: buildUniformLocalizedSlugMap(related.slug || related.id),
                      })}
                      className="group block rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-colors bg-card"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-muted">
                        <ListingImage
                          src={relatedImage ?? null}
                          fallbackSrc="/placeholder.svg"
                          alt={related.name}
                          fill
                          className="transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-body-xs text-muted-foreground mb-1">{related.city?.name}</p>
                        <h3 className="font-medium text-body-sm group-hover:text-primary transition-colors line-clamp-2">
                          {related.name}
                        </h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}


        {initialOtherRegions.length > 0 && (
          <section className="py-16 lg:py-24 bg-card border-t border-border">
            <div className="app-container content-max">
              <h2 className="text-title font-serif font-medium text-foreground text-center mb-2">
                {t("listing.relatedDestinations")}
              </h2>
              <p className="text-body text-muted-foreground text-center mb-10">
                {t("listing.relatedDestinationsDescription")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {initialOtherRegions.map((r) => {
                  const imgSrc = normalizeImageUrl(r.image_url ?? r.hero_image_url);
                  return (
                    <Link
                      key={r.id}
                      href={l(`/destinations/${r.slug}`)}
                      className="group block rounded-xl overflow-hidden bg-background border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="relative w-full h-36 bg-muted overflow-hidden">
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={r.name}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10" />
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-serif font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {r.name}
                        </h3>
                        {r.short_description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {r.short_description}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section className="border-t border-border py-8">
          <div className="container mx-auto max-w-7xl px-4">
            <Link href={l("/")}>
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("listing.backToListings")}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />

      <ImageLightbox
        images={galleryImages.map((image) => ({
          ...image,
          alt_text: image.alt_text ?? undefined,
        }))}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setCurrentImageIndex}
      />

      {isRealEstateListing ? (
        <Dialog
          open={agentContactModalOpen}
          onOpenChange={(open) => {
            setAgentContactModalOpen(open);
            if (!open) setPrefillScheduleVisit(false);
          }}
        >
          <DialogContent className="w-[95vw] max-w-[430px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {t("categoryLayouts.realEstate.scheduleViewing")}
              </DialogTitle>
            </DialogHeader>
            <RealEstateAgentContactCard
              listingId={listing.id}
              listingName={listingTitle}
              agentName={(details.agent_name as string | undefined) ?? null}
              agentRole={(details.agent_role as string | undefined) ?? null}
              agentEmail={(details.agent_email as string | undefined) ?? null}
              agentPhone={(details.agent_phone as string | undefined) ?? null}
              agentImageUrl={(details.agent_image as string | undefined) ?? null}
              showTopDivider={false}
              initialScheduleVisit={prefillScheduleVisit}
              onSubmitted={() => setAgentContactModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      ) : null}

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />

      {!mobileMenuOpen ? (
        <div
          className={cn(
            "fixed z-40 border-t border-border bg-background/92 px-1.5 py-2 backdrop-blur-md transition-transform duration-200 ease-out lg:hidden",
            isUserScrolling && "translate-y-[calc(100%+var(--listing-mobile-actions-offset))]",
          )}
          style={{
            bottom: `${mobileActionBarBottomOffset}px`,
            left: "max(env(safe-area-inset-left), 0.375rem)",
            right: "max(env(safe-area-inset-right), 0.375rem)",
            ["--listing-mobile-actions-offset" as string]: `${mobileBottomNavHeight}px`,
          }}
        >
          <div className="mx-auto flex w-full max-w-[34rem] items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-2 px-0.5">
              {shouldShowMobileConciergeAction ? (
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className="h-11 w-11 shrink-0 rounded-xl p-0 border-[hsl(43_74%_49%/0.35)] text-[hsl(43_74%_49%)] hover:border-[hsl(43_74%_49%/0.55)] hover:text-[hsl(43_74%_49%)] sm:h-12 sm:w-12"
                >
                  <a
                    href={conciergeWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("realEstate.conciergeButton")}
                  >
                    <ConciergeBell className="h-6 w-6" />
                  </a>
                </Button>
              ) : null}

              <Button
                variant="outline"
                size="icon"
                onClick={handleSaveClick}
                className="h-11 w-11 shrink-0 rounded-xl p-0 sm:h-12 sm:w-12"
                aria-label={t("listing.saveToFavorites")}
              >
                <Heart className={`h-6 w-6 ${isFavorite(listing.id) ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShareClick}
                className="h-11 w-11 shrink-0 rounded-xl p-0 sm:h-12 sm:w-12"
                aria-label={t("listing.share")}
              >
                <Share2 className="h-6 w-6" />
              </Button>

              {shouldShowMobileWebsiteAction ? (
                <Button variant="outline" size="icon" asChild className="h-11 w-11 shrink-0 rounded-xl p-0 sm:h-12 sm:w-12">
                  <a href={ctaUrl ?? undefined} target="_blank" rel="noopener noreferrer" aria-label={ctaAriaLabel}>
                    <Globe className="h-6 w-6" />
                  </a>
                </Button>
              ) : null}
            </div>

            {shouldShowMobileWhatsAppAction ? (
              <Button
                variant="outline"
                size="icon"
                asChild
                className="h-11 min-w-[8rem] flex-1 shrink-0 gap-1 rounded-xl border-[#25D366] bg-[#25D366] px-2 text-white hover:border-[#1EBE5D] hover:bg-[#1EBE5D] hover:text-white sm:h-12 sm:px-2.5"
              >
                <a href={directWhatsAppUrl ?? undefined} target="_blank" rel="noopener noreferrer" aria-label={t("listing.messageWhatsApp")}>
                  <WhatsAppLogo className="h-7 w-7" />
                  <span className="text-[11px] font-semibold tracking-[0.08em] leading-none">
                    {t("listing.social.whatsapp", "WhatsApp").toUpperCase()}
                  </span>
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ListingDetailClient(props: ListingDetailClientProps) {
  return <ListingDetailClientInner {...props} />;
}

export default ListingDetailClient;
