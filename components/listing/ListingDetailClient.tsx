"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  MapPin,
  Globe,
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
import DOMPurify from "dompurify";
import { toast } from "sonner";

import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import { GoogleIcon } from "@/components/ui/google-icon";
import { useAuth } from "@/contexts/AuthContext";
import { useChatModal } from "@/components/chat/ChatProvider";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { LoginModal } from "@/components/ui/login-modal";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { translateCategoryName } from "@/lib/translateCategory";
import { translateCategoryValue } from "@/lib/translateCategoryValue";
import { useLocalePath } from "@/hooks/useLocalePath";
import { formatRichTextDescription } from "@/lib/formatRichText";
import { getCanonicalCategorySlug } from "@/lib/categoryMerges";
import { hasRealEstateSignals, isRealEstateCategorySlug } from "@/lib/realEstateDetection";
import { normalizePublicImageUrl } from "@/lib/imageUrls";
import { normalizePublicContentLocale, type PublicContentLocale } from "@/lib/publicContentLocale";
import ListingImage from "@/components/ListingImage";
import ListingTierBadge from "@/components/ui/ListingTierBadge";
import { ListingReviews } from "@/components/listing-details/ListingReviews";
import type { ListingReview } from "@/hooks/useListingReviews";
import { LuxuryAccommodationLayout } from "@/components/listing-details/LuxuryAccommodationLayout";
import { FineDiningLayout } from "@/components/listing-details/FineDiningLayout";
import { GolfLayout } from "@/components/listing-details/GolfLayout";
import { BeachClubLayout } from "@/components/listing-details/BeachClubLayout";
import { ShoppingLayout } from "@/components/listing-details/ShoppingLayout";
import { WellnessLayout } from "@/components/listing-details/WellnessLayout";
import { PrivateChefLayout } from "@/components/listing-details/PrivateChefLayout";
import { VIPConciergeLayout } from "@/components/listing-details/VIPConciergeLayout";
import { LuxuryExperienceLayout } from "@/components/listing-details/LuxuryExperienceLayout";
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

export interface ListingDetailClientProps {
  locale?: string;
  listing: ListingWithRelations;
  initialTranslation: ListingTranslationRow | null;
  initialReviews: ListingReview[];
  initialRelatedListings: RelatedListing[];
  initialWhatsAppStatus: WhatsAppStatus;
  initialLookupValue: string;
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
    case "luxury-accommodation":
      return <LuxuryAccommodationLayout {...props} />;
    case "restaurants":
    case "fine-dining":
      return <FineDiningLayout {...props} />;
    case "golf":
      return <GolfLayout details={details} />;
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
    case "luxury-experiences":
      return <LuxuryExperienceLayout {...props} />;
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
    .select("*")
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
    .select(`
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
      website_url,
      facebook_url,
      instagram_url,
      twitter_url,
      linkedin_url,
      youtube_url,
      tiktok_url,
      telegram_url,
      google_business_url,
      google_rating,
      google_review_count,
      tags,
      category_data,
      view_count,
      published_at,
      created_at,
      updated_at,
      city:cities(${PUBLIC_CITY_FIELDS}),
      region:regions(${PUBLIC_REGION_FIELDS}),
      category:categories(${PUBLIC_CATEGORY_FIELDS})
    `)
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
    phone: data?.business_phone_e164 || null,
  } satisfies WhatsAppStatus;
}

function ListingDetailClientInner({
  locale: initialLocaleProp,
  listing: initialListing,
  initialTranslation,
  initialReviews,
  initialRelatedListings,
  initialWhatsAppStatus,
  initialLookupValue,
}: ListingDetailClientProps) {
  const { t, i18n } = useTranslation();
  const l = useLocalePath();
  const { user } = useAuth();
  const { openChat } = useChatModal();
  const { isFavorite, toggleFavorite } = useFavoriteListings();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [agentContactModalOpen, setAgentContactModalOpen] = useState(false);
  const [prefillScheduleVisit, setPrefillScheduleVisit] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [lang, setLang] = useState<PublicContentLocale>(() =>
    normalizePublicContentLocale(initialLocaleProp || i18n.language),
  );
  const [tr, setTr] = useState<ListingTranslationRow | null>(initialTranslation);
  const [trLoading, setTrLoading] = useState(false);
  const [trError, setTrError] = useState<string | null>(null);

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ["listing", initialLookupValue, normalizePublicContentLocale(initialLocaleProp || i18n.language)],
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
    setLang(normalizePublicContentLocale(initialLocaleProp || i18n.language));
  }, [i18n.language, initialLocaleProp]);

  useEffect(() => {
    if (!listing?.id) return;

    const targetLang = lang;

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
  }, [initialTranslation, lang, listing?.id]);

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

  const handleMessageClick = () => {
    if (!listing) return;

    if (user) {
      openChat({
        listingId: listing.id,
        ownerId: listing.owner_id,
        listingName: effectiveTitle || listing.name,
      });
      return;
    }

    if (waStatus?.phone) {
      const message = `Hi! I'm interested in "${effectiveTitle || listing.name}" in ${listing.city?.name || "Algarve"}.`;
      window.open(`https://wa.me/${waStatus.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
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
      title: effectiveTitle || listing.name,
      text: effectiveShort || `Check out ${effectiveTitle || listing.name} in ${listing.city?.name || "Algarve"}`,
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
      if ((shareError as Error).name !== "AbortError") {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    }
  };

  const details = (listing.category_data as Record<string, unknown>) || {};
  const hasPropertySignals = hasRealEstateSignals(details);
  const isRealEstateListing =
    isRealEstateCategorySlug(listing.category?.slug) ||
    (listing.category?.slug === "algarve-services" && hasPropertySignals);

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
        name: effectiveTitle || listing.name,
        slug: listing.slug,
        latitude: baseLatitude,
        longitude: baseLongitude,
        categorySlug: listing.category?.slug,
        categoryName: translateCategoryName(t, listing.category?.slug, listing.category?.name),
        categoryImageUrl: normalizedCategoryImageUrl || undefined,
        cityName: listing.city?.name || "Algarve",
        tier: listing.tier,
        featuredImageUrl: normalizedFeaturedImageUrl || normalizedCategoryImageUrl || undefined,
        href: l(`/listing/${listing.slug || listing.id}`),
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
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !listing || (listing.status !== "published" && !isAdminOrEditor)) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-serif mb-4">{t("listing.notFound")}</h1>
            <p className="text-muted-foreground mb-6">{t("listing.notFoundMessage")}</p>
            <Link href={l("/")}>
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("listing.backToHome")}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const galleryImages = ((listing.images || []) as ListingImageRow[])
    .map((image) => ({
      ...image,
      image_url: normalizeImageUrl(image?.image_url) || "",
    }))
    .filter((image) => !!image.image_url)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

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

  const listingTitle = effectiveTitle || listing.name;
  const directoryLabel = t("nav.directory");
  const categoryLabel = translateCategoryName(t, listing.category?.slug, listing.category?.name) || directoryLabel;
  const canonicalCategorySlug = getCanonicalCategorySlug(listing.category?.slug);
  const categoryDirectoryPath = canonicalCategorySlug ? `/directory?category=${canonicalCategorySlug}` : "/directory";

  const visualBreadcrumbs = [
    { name: t("nav.home"), to: l("/"), current: false },
    { name: directoryLabel, to: l("/directory"), current: false },
    ...(canonicalCategorySlug
      ? [{ name: categoryLabel, to: l(categoryDirectoryPath), current: false }]
      : []),
    { name: listingTitle, to: l(`/listing/${listing.slug || listing.id}`), current: true },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-[10px] pb-24 lg:pb-0">
        <nav className="bg-card border-b border-border" aria-label="Breadcrumb">
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
          <div className="container mx-auto max-w-7xl px-4 py-[40px]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div
                className="lg:col-span-2 relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => setLightboxOpen(true)}
              >
                <ListingImage
                  src={galleryImages[currentImageIndex]?.image_url || normalizedFeaturedImageUrl}
                  categoryImageUrl={normalizedCategoryImageUrl}
                  fallbackSrc="/placeholder.svg"
                  alt={galleryImages[currentImageIndex]?.alt_text || listing.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                    className="absolute top-4 right-4"
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
                          className="w-full h-full object-cover"
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
                    <ListingsLeafletMap
                      points={listingMapPoints}
                      activeListingId={listing.id}
                      focusListingId={listing.id}
                      enableClustering={false}
                      scrollWheelZoom={false}
                      showPopups
                      className="h-full"
                      mapClassName="h-full min-h-0"
                      emptyMessage={t("listing.locationUnavailable", "Location unavailable for this listing.")}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="lg:hidden mt-4">
              {listingMapPoints.length > 0 ? (
                <div className="rounded-xl overflow-hidden">
                  <ListingsLeafletMap
                    points={listingMapPoints}
                    activeListingId={listing.id}
                    focusListingId={listing.id}
                    enableClustering={false}
                    scrollWheelZoom={false}
                    showPopups
                    mapClassName="aspect-video"
                    emptyMessage={t("listing.locationUnavailable", "Location unavailable for this listing.")}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="py-8 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="text-body-xs">
                      {translateCategoryName(t, listing.category?.slug, listing.category?.name)}
                    </Badge>
                    {listing.region ? (
                      <Badge variant="outline" className="text-body-xs">
                        {listing.region.name}
                      </Badge>
                    ) : null}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-serif font-medium mb-3">{listingTitle}</h1>

                  <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.city?.name}, Algarve, Portugal</span>
                  </div>

                  {(listing.google_rating || listing.tier === "signature" || listing.tier === "verified") ? (
                    <div className="flex items-center gap-2 mt-3">
                      {(listing.tier === "signature" || listing.tier === "verified") ? (
                        <ListingTierBadge tier={listing.tier} />
                      ) : null}
                      {listing.tier === "signature" ? <ListingTierBadge tier="verified" /> : null}
                      {listing.google_rating ? (
                        <GoogleRatingBadge
                          rating={listing.google_rating}
                          reviewCount={listing.google_review_count}
                          variant="themed"
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-serif font-medium mb-4">{t("listing.about")}</h2>
                  <div
                    className="text-body-sm text-muted-foreground leading-relaxed [&_p]:mb-5 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-foreground"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(formatRichTextDescription(effectiveDescription)),
                    }}
                  />
                </div>

                <Separator />

                {listing.category
                  ? getCategoryLayout(
                      listing.category.slug,
                      details,
                      details.booking_url as string | undefined,
                      isRealEstateListing ? handleScheduleViewingClick : handleMessageClick,
                    )
                  : null}

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

              <div className="space-y-6">
                <div className="luxury-card p-6 sticky top-24">
                  <div className="flex gap-3 mb-6">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSaveClick}
                      aria-label={t("listing.saveToFavorites", "Save to favorites")}
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
                  <div className="flex flex-wrap items-center gap-3">
                    {listing.website_url ? (
                      <a
                        href={listing.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-muted hover:bg-sky-500/20 transition-all duration-200 hover:scale-110"
                        title={t("listing.visitWebsite")}
                      >
                        <Globe className="h-5 w-5 text-sky-500" />
                      </a>
                    ) : null}
                    {listing.instagram_url ? (
                      <a
                        href={listing.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-muted hover:bg-pink-500/20 transition-all duration-200 hover:scale-110"
                        title="Instagram"
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
                        title="Facebook"
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
                        title="Google Business"
                      >
                        <GoogleIcon className="h-5 w-5" />
                      </a>
                    ) : null}
                  </div>

                  {listing.status === "published" && listing.tier !== "verified" && listing.tier !== "signature" ? (
                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="text-body-xs text-muted-foreground mb-2">
                        {t("listing.isYourBusiness", "Is this your business?")}
                      </p>
                      <Link
                        href={l("/partner?type=claim-business")}
                        className="text-body-xs text-primary hover:underline font-medium"
                      >
                        {t("listing.claimThisListing", "Claim this listing")} →
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
            </div>
          </div>
        </section>

        {relatedListings.length > 0 ? (
          <section className="py-8 px-4 border-t border-border">
            <div className="container mx-auto max-w-7xl">
              <h2 className="text-2xl font-serif font-medium mb-6">
                {t("listing.relatedListings", "More in {{category}}", { category: categoryLabel })}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedListings.map((related) => {
                  const relatedImage = normalizeImageUrl(related.featured_image_url);

                  return (
                    <Link
                      key={related.id}
                      href={l(`/listing/${related.slug || related.id}`)}
                      className="group block rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-colors bg-card"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-muted">
                        <ListingImage
                          src={relatedImage || null}
                          fallbackSrc="/placeholder.svg"
                          alt={related.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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

        <section className="py-8 px-4 border-t border-border">
          <div className="container mx-auto max-w-7xl">
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

      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border z-40 safe-area-bottom">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSaveClick}
            className="shrink-0"
            aria-label={t("listing.saveToFavorites", "Save to favorites")}
          >
            <Heart className={`h-5 w-5 ${isFavorite(listing.id) ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleShareClick}
            className="shrink-0"
            aria-label={t("listing.share", "Share listing")}
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <Button onClick={handleMessageClick} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
            <MessageCircle className="h-5 w-5 mr-2" />
            {t("listing.contact")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ListingDetailClient(props: ListingDetailClientProps) {
  return <ListingDetailClientInner {...props} />;
}

export default ListingDetailClient;
