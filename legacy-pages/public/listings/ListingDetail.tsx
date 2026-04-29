"use client";

// src/pages/ListingDetail.tsx
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RouteMessageState } from "@/components/layout/RouteMessageState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type MapListingPoint } from "@/components/map/ListingsLeafletMap";
import dynamic from "next/dynamic";
const ListingsLeafletMap = dynamic(() => import("@/components/map/ListingsLeafletMap"), { 
  ssr: false,
  loading: () => <div className="h-full min-h-[300px] w-full bg-muted animate-pulse rounded-xl" />
});
import {
  ArrowLeft,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  Crown,
  ShieldCheck,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import { GoogleIcon } from "@/components/ui/google-icon";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useChatModal } from "@/components/chat/ChatProvider";
import { useOwnerWhatsAppStatus } from "@/hooks/useChat";
import { useListing, useIncrementListingViews, useResolveSlug } from "@/hooks/useListings";
import { getSessionId } from "@/lib/sessionId";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { useHydrated } from "@/hooks/useHydrated";
import { LoginModal } from "@/components/ui/login-modal";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { toast } from "sonner";
import { LocalBusinessJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useLocalePath } from "@/hooks/useLocalePath";
import { translateCategoryName } from "@/lib/translateCategory";
import { translateCategoryValue } from "@/lib/translateCategoryValue";
import { isUuid } from "@/lib/slugify";
import { formatRichTextDescription } from "@/lib/formatRichText";
import { sanitizeHtmlString } from "@/lib/sanitizeHtml";
import { getCanonicalCategorySlug } from "@/lib/categoryMerges";
import { getListingCategoryLanding } from "@/lib/listingCategoryLanding";
import ListingImage from "@/components/ListingImage";

// Category-specific detail renderers
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

type Lang = "en" | "pt-pt" | "fr" | "de" | "es" | "it" | "nl" | "sv" | "no" | "da";

const normalizeLang = (raw?: string | null): Lang => {
  if (!raw) return "en";
  const v = raw.toLowerCase().replace("_", "-").trim();

  if (v === "pt" || v === "pt-pt" || v === "pt_pt") return "pt-pt";
  if (v.startsWith("fr")) return "fr";
  if (v.startsWith("de")) return "de";
  if (v.startsWith("es")) return "es";
  if (v.startsWith("it")) return "it";
  if (v.startsWith("nl")) return "nl";
  if (v.startsWith("sv")) return "sv";
  if (v === "no" || v.startsWith("nb") || v.startsWith("nn")) return "no";
  if (v.startsWith("da")) return "da";
  if (v.startsWith("en")) return "en";
  return "en";
};

const getCategoryLayout = (
  categorySlug: string,
  details: Record<string, unknown>,
  bookingUrl?: string,
  onInquire?: () => void,
) => {
  const props = { details, bookingUrl, onInquire };
  switch (categorySlug) {
    case "premium-accommodation":
      return <PremiumAccommodationLayout {...props} />;
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
    case "premium-experiences":
      return <PremiumExperienceLayout {...props} />;
    case "family-fun":
      return <FamilyFunLayout {...props} />;
    case "vip-transportation":
      return <VIPTransportationLayout {...props} />;
    case "real-estate":
      return <RealEstateLayout details={details} onInquire={onInquire} />;
    case "premier-events":
    case "events": // legacy slug — merged into premier-events
      return <PremierEventsLayout details={details} />;
    case "architecture-decoration":
      return <ArchitectureDecorationLayout {...props} />;
    case "protection-services":
      return <ProtectionServicesLayout {...props} />;
    default:
      return <ShoppingLayout {...props} />;
  }
};

type ListingTranslationRow = {
  listing_id: string;
  language_code: string;
  title: string | null;
  short_description: string | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  translation_status?: string | null;
  updated_at?: string | null;
};

const normalizeImageUrl = (value?: string | null): string | null => {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export default function ListingDetail() {
  const { id: paramSlugOrId } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const locale = useCurrentLocale();
  const l = useLocalePath();
  const router = useRouter();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { user } = useAuth();
  const { openChat } = useChatModal();
  const { isFavorite, toggleFavorite } = useFavoriteListings();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Resolve old slugs → current slug via listing_slugs table
  const paramIsUuid = paramSlugOrId ? isUuid(paramSlugOrId) : false;
  const { data: resolvedSlug } = useResolveSlug(!paramIsUuid ? paramSlugOrId : undefined);

  // Listing
  const { data: listing, isLoading, error } = useListing(paramSlugOrId);
  const incrementViews = useIncrementListingViews();

  // Redirect: UUID → slug, or old slug → current slug
  useEffect(() => {
    if (!listing) return;
    const currentSlug = listing.slug;
    if (!currentSlug) return;

    // If URL uses UUID, redirect to slug
    if (paramIsUuid && paramSlugOrId !== currentSlug) {
      const target = l(`/listing/${currentSlug}`);
      router.replace(target);
      return;
    }

    // If URL uses an old slug (not current), redirect to current slug
    if (!paramIsUuid && paramSlugOrId !== currentSlug && resolvedSlug?.listing_id === listing.id) {
      const target = l(`/listing/${currentSlug}`);
      router.replace(target);
    }
  }, [listing, paramSlugOrId, paramIsUuid, resolvedSlug, l, router]);

  // WhatsApp fallback
  const { data: waStatus } = useOwnerWhatsAppStatus(listing?.owner_id);

  // Translations
  const [lang, setLang] = useState<Lang>(() => normalizeLang(locale));
  const [tr, setTr] = useState<ListingTranslationRow | null>(null);
  const [trLoading, setTrLoading] = useState(false);
  const [trError, setTrError] = useState<string | null>(null);

  // Mirror the validated route locale for translated listing content.
  useEffect(() => {
    setLang(normalizeLang(locale));
  }, [locale]);

  // Fetch translation row (if lang != en)
  useEffect(() => {
    const listingId = listing?.id;
    if (!listingId) return;

    const targetLang = lang;

    if (!targetLang || targetLang === "en") {
      setTr(null);
      setTrError(null);
      setTrLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setTrLoading(true);
      setTrError(null);

      try {
        const { data: target, error: tErr } = await supabase
          .from("listing_translations")
          .select(
            "listing_id, language_code, title, short_description, description, seo_title, seo_description, translation_status, updated_at",
          )
          .eq("listing_id", listingId)
          .eq("language_code", targetLang)
          .maybeSingle();

        if (tErr) throw tErr;

        if (!target) {
          const { data: enRow, error: eErr } = await supabase
            .from("listing_translations")
            .select(
              "listing_id, language_code, title, short_description, description, seo_title, seo_description, translation_status, updated_at",
            )
            .eq("listing_id", listingId)
            .eq("language_code", "en")
            .maybeSingle();

          if (eErr) throw eErr;
          if (!cancelled) setTr(enRow ?? null);
        } else {
          if (!cancelled) setTr(target);
        }
      } catch (e: any) {
        if (!cancelled) setTrError(String(e?.message ?? e));
      } finally {
        if (!cancelled) setTrLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [listing?.id, lang]);

  // Increment view count
  useEffect(() => {
    if (listing?.id) {
      incrementViews.mutate({
        listingId: listing.id,
        sessionId: getSessionId(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing?.id]);

  const isAdminOrEditor = user?.role === "admin" || user?.role === "editor";

  const effectiveTitle = useMemo(() => {
    return listing?.name || "";
  }, [listing?.name]);

  const effectiveShort = useMemo(() => {
    return tr?.short_description?.trim() || listing?.short_description || null;
  }, [tr?.short_description, listing?.short_description]);

  const effectiveDescription = useMemo(() => {
    return tr?.description?.trim() || listing?.description || listing?.short_description || null;
  }, [tr?.description, listing?.description, listing?.short_description]);

  const effectiveSeoTitle = useMemo(() => {
    return tr?.seo_title?.trim() || effectiveTitle || null;
  }, [tr?.seo_title, effectiveTitle]);

  const effectiveSeoDescription = useMemo(() => {
    return (
      tr?.seo_description?.trim() ||
      effectiveShort ||
      (effectiveDescription ? effectiveDescription.substring(0, 160) : null)
    );
  }, [tr?.seo_description, effectiveShort, effectiveDescription]);

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

  const handleSaveClick = () => {
    if (!listing) return;
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    toggleFavorite(listing.id);
    if (isFavorite(listing.id)) toast.success("Removed from favorites");
    else toast.success("Saved to favorites");
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
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    }
  };

  const baseLatitude = Number(listing?.latitude ?? listing?.city?.latitude ?? NaN);
  const baseLongitude = Number(listing?.longitude ?? listing?.city?.longitude ?? NaN);
  const normalizedFeaturedImageUrl = normalizeImageUrl(listing?.featured_image_url);
  const normalizedCategoryImageUrl = normalizeImageUrl(listing?.category?.image_url);

  const listingMapPoints = useMemo<MapListingPoint[]>(() => {
    if (!listing || !Number.isFinite(baseLatitude) || !Number.isFinite(baseLongitude)) return [];

    const primaryListingPoint: MapListingPoint = {
      id: listing.id,
      name: listing.name,
      slug: listing.slug,
      latitude: baseLatitude,
      longitude: baseLongitude,
      categorySlug: listing.category?.slug,
      categoryName: translateCategoryName(t, listing.category?.slug, listing.category?.name),
      categoryImageUrl: normalizedCategoryImageUrl || undefined,
      cityName: listing.city?.name || "Algarve",
      tier: listing.tier,
      featuredImageUrl: normalizedFeaturedImageUrl || normalizedCategoryImageUrl || undefined,
      href: l(`/listing/${listing.slug}`),
      isPrimary: true,
    };

    return [primaryListingPoint];
  }, [baseLatitude, baseLongitude, l, listing, normalizedCategoryImageUrl, normalizedFeaturedImageUrl, t]);

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

  // Gallery images
  const galleryImages: Array<{
    id: string;
    image_url: string;
    alt_text?: string;
    display_order?: number;
  }> = ((((listing as any)?.images) || []) as any[])
    .map((img: any) => ({
      ...img,
      image_url: normalizeImageUrl(img?.image_url) || "",
    }))
    .filter((img: any) => !!img.image_url)
    .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));

  if (galleryImages.length === 0 && normalizedFeaturedImageUrl) {
    galleryImages.push({
      id: "featured",
      image_url: normalizedFeaturedImageUrl,
      alt_text: listing.name,
    });
  }

  if (galleryImages.length === 0 && normalizedCategoryImageUrl) {
    galleryImages.push({
      id: "category-fallback",
      image_url: normalizedCategoryImageUrl,
      alt_text: listing.name,
    });
  }

  const details = (listing.category_data as Record<string, unknown>) || {};

  const listingTitle = effectiveTitle || listing.name;
  const listingMetaDescription =
    effectiveSeoDescription || effectiveShort || listing.short_description || listing.description?.substring(0, 160);
  const listingOgTitle = listingTitle;
  const listingOgDescription = effectiveShort || listingMetaDescription;
  const listingOgImage = normalizedFeaturedImageUrl || normalizedCategoryImageUrl || undefined;
  const listingCanonicalUrl = `https://algarveofficial.com${l(`/listing/${listing.slug}`)}`;
  const directoryLabel = t("nav.directory");
  const categoryLabel = translateCategoryName(t, listing.category?.slug, listing.category?.name) || directoryLabel;
  const canonicalCategorySlug = getCanonicalCategorySlug(listing.category?.slug);
  const landingPage = getListingCategoryLanding(canonicalCategorySlug);
  const landingLabel = t(landingPage.labelKey, landingPage.fallbackLabel);
  const categoryDirectoryPath = canonicalCategorySlug ? `/stay?category=${canonicalCategorySlug}` : "/stay";

  const breadcrumbItems = [
    { name: t("nav.home"), url: `https://algarveofficial.com${l("/")}` },
    { name: landingLabel, url: `https://algarveofficial.com${l(landingPage.path)}` },
    ...(canonicalCategorySlug
      ? [{ name: categoryLabel, url: `https://algarveofficial.com${l(categoryDirectoryPath)}` }]
      : []),
    { name: listingTitle, url: listingCanonicalUrl },
  ];

  const visualBreadcrumbs = [
    { name: t("nav.home"), to: l("/"), current: false },
    { name: landingLabel, to: l(landingPage.path), current: false },
    ...(canonicalCategorySlug
      ? [{ name: categoryLabel, to: l(categoryDirectoryPath), current: false }]
      : []),
    { name: listingTitle, to: l(`/listing/${listing.slug}`), current: true },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* SEO */}

      <LocalBusinessJsonLd
        name={effectiveTitle || listing.name}
        description={(effectiveShort || effectiveDescription || "").substring(0, 300) || undefined}
        image={listingOgImage}
        url={listingCanonicalUrl}
        address={listing.address || undefined}
        city={listing.city?.name}
        telephone={(listing as any).contact_phone || undefined}
        email={(listing as any).contact_email || undefined}
        rating={listing.google_rating || undefined}
        reviewCount={listing.google_review_count || undefined}
        latitude={listing.latitude || listing.city?.latitude}
        longitude={listing.longitude || listing.city?.longitude}
        category={listing.category?.slug}
        tags={listing.tags || undefined}
        categoryData={(listing.category_data as Record<string, unknown>) || null}
        priceRange={
          listing.price_from ? `€${listing.price_from}${listing.price_to ? ` - €${listing.price_to}` : "+"}` : "€€€€"
        }
      />

      <BreadcrumbJsonLd items={breadcrumbItems} locale={locale} />

      <Header />

      <main className="flex-1 pb-24 lg:pb-0">
        {/* Breadcrumb Navigation */}
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

        {/* Translation status hint */}
        {(trLoading || trError) && (
          <div className="bg-muted/40 border-b border-border">
            <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
              {trLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />{t("common.loading")}
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  {t("common.error")}
                </>
              )}
            </div>
          </div>
        )}

        {/* Image Gallery */}
        <section className="relative bg-muted">
          <div className="container mx-auto max-w-7xl px-4 py-[40px]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Main Image */}
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

                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {galleryImages.map((_: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? "bg-white" : "bg-white/40"
                            }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Tier Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {listing.tier === "signature" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-[hsl(43,74%,49%)] to-[hsl(43,80%,35%)] text-black text-xs font-semibold uppercase tracking-wider">
                      <Crown className="h-3 w-3" />
                      {t("common.signature").toUpperCase()}
                    </span>
                  )}
                  {listing.tier === "verified" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-green-600 text-white text-xs font-semibold uppercase tracking-wider">
                      <ShieldCheck className="h-3 w-3" />
                      {t("common.verified").toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Google Rating */}
                {listing.google_rating && (
                  <GoogleRatingBadge
                    rating={listing.google_rating}
                    reviewCount={listing.google_review_count}
                    variant="overlay"
                    className="absolute top-4 right-4"
                  />
                )}
              </div>

              {/* Map (desktop) */}
              <div className="hidden lg:block">
                {(() => {
                  if (listingMapPoints.length === 0) {
                    return (
                      <div className="grid grid-cols-2 gap-4 h-full">
                        {galleryImages.slice(1, 5).map((img: any, idx: number) => (
                          <div
                            key={img.id}
                            onClick={() => setCurrentImageIndex(idx + 1)}
                            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-opacity hover:opacity-80 ${currentImageIndex === idx + 1 ? "ring-2 ring-primary" : ""
                              }`}
                          >
                            <ListingImage
                              src={img.image_url}
                              categoryImageUrl={normalizedCategoryImageUrl}
                              fallbackSrc="/placeholder.svg"
                              alt={img.alt_text}
                              className="w-full h-full object-cover"
                            />
                            {idx === 3 && galleryImages.length > 5 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-lg font-medium">+{galleryImages.length - 5}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  }

                  return (
                    <div className="h-full rounded-xl overflow-hidden">
                      {hydrated ? (
                        <ListingsLeafletMap
                          points={listingMapPoints}
                          activeListingId={listing.id}
                          focusListingId={listing.id}
                          enableClustering={false}
                          scrollWheelZoom={false}
                          showPopups
                          mapClassName="h-full min-h-[300px]"
                          emptyMessage="Location unavailable for this listing."
                        />
                      ) : (
                        <div className="h-full min-h-[300px] w-full bg-muted animate-pulse rounded-xl" />
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Mobile map */}
            <div className="lg:hidden mt-4">
              {(() => {
                if (listingMapPoints.length === 0) return null;

                return (
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
                        emptyMessage="Location unavailable for this listing."
                      />
                    ) : (
                      <div className="aspect-video w-full bg-muted animate-pulse rounded-xl" />
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left */}
              <div className="lg:col-span-2 space-y-8">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {translateCategoryName(t, listing.category?.slug, listing.category?.name)}
                    </Badge>
                    {listing.region && (
                      <Badge variant="outline" className="text-xs">
                        {listing.region.name}
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-serif font-medium mb-3">{effectiveTitle || listing.name}</h1>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.city?.name}, Algarve, Portugal</span>
                  </div>

                  {(listing.google_rating || listing.tier === "signature" || listing.tier === "verified") && (
                    <div className="flex items-center gap-2 mt-3">
                      {listing.tier === "signature" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-[hsl(43,74%,49%)] to-[hsl(43,80%,35%)] text-black text-xs font-semibold uppercase tracking-wider">
                          <Crown className="h-3 w-3" />
                          {t("common.signature").toUpperCase()}
                        </span>
                      )}
                      {(listing.tier === "signature" || listing.tier === "verified") && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-green-600 text-white text-xs font-semibold uppercase tracking-wider">
                          <ShieldCheck className="h-3 w-3" />
                          {t("common.verified").toUpperCase()}
                        </span>
                      )}
                      {listing.google_rating && (
                        <GoogleRatingBadge
                          rating={listing.google_rating}
                          reviewCount={listing.google_review_count}
                          variant="themed"
                        />
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h2 className="text-xl font-serif font-medium mb-4">{t("listing.about")}</h2>
                  <div
                    className="text-muted-foreground leading-relaxed [&_p]:mb-5 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-foreground"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtmlString(formatRichTextDescription(effectiveDescription)),
                    }}
                  />
                </div>

                <Separator />

                {/* Category Specific */}
                {listing.category &&
                  getCategoryLayout(
                    listing.category.slug,
                    details,
                    details.booking_url as string | undefined,
                    handleMessageClick,
                  )}

                {/* Tags */}
                {listing.tags && listing.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h2 className="text-xl font-serif font-medium mb-4">{t("listing.tags")}</h2>
                      <div className="flex flex-wrap gap-2">
                        {listing.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-sm">
                            {translateCategoryValue(t, tag)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Right */}
              <div className="space-y-6">
                <div className="premium-card p-6 sticky top-24">
                  <div className="flex gap-3 mb-6">
                    <Button variant="outline" size="icon" onClick={handleSaveClick}>
                      <Heart
                        className={`h-4 w-4 ${listing && isFavorite(listing.id) ? "fill-red-500 text-red-500" : ""}`}
                      />
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleShareClick}>
                      <Share2 className="h-4 w-4 mr-2" />
                      {t("listing.share")}
                    </Button>
                  </div>

                  <Separator className="my-6" />

                  <h4 className="text-sm font-medium text-muted-foreground mb-4">{t("listing.contact")}</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    {listing.website_url && (
                      <a
                        href={listing.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-muted hover:bg-sky-500/20 transition-all duration-200 hover:scale-110"
                        title={t("listing.visitWebsite")}
                      >
                        <Globe className="h-5 w-5 text-sky-500" />
                      </a>
                    )}
                    {listing.instagram_url && (
                      <a
                        href={listing.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-muted hover:bg-pink-500/20 transition-all duration-200 hover:scale-110"
                        title="Instagram"
                      >
                        <Instagram className="h-5 w-5 text-[#E1306C]" />
                      </a>
                    )}
                    {listing.facebook_url && (
                      <a
                        href={listing.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-muted hover:bg-blue-500/20 transition-all duration-200 hover:scale-110"
                        title="Facebook"
                      >
                        <Facebook className="h-5 w-5 text-[#1877F2]" />
                      </a>
                    )}
                    {listing.google_business_url && (
                      <a
                        href={listing.google_business_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-muted transition-all duration-200 hover:scale-110"
                        title="Google Business"
                      >
                        <GoogleIcon className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Back */}
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
        images={galleryImages}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setCurrentImageIndex}
      />

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      {/* Mobile Sticky CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border z-40 safe-area-bottom">
        <div className="flex gap-3">
          <Button variant="outline" size="icon" onClick={handleSaveClick} className="shrink-0">
            <Heart className={`h-5 w-5 ${listing && isFavorite(listing.id) ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button variant="outline" size="icon" onClick={handleShareClick} className="shrink-0">
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
