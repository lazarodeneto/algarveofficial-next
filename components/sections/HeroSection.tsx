// framer-motion import removed - using CSS animations for LCP elements
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useHeroSettings } from "@/hooks/useHomepageSettings";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { useTranslation } from "react-i18next";
import { useConnectionQuality } from "@/hooks/useConnectionQuality";
import { useTripPlanner } from "@/hooks/useTripPlanner";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { HERO_OVERLAY_INTENSITY_SETTING_KEY, normalizeHeroOverlayIntensity } from "@/lib/heroOverlay";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useHydrated } from "@/hooks/useHydrated";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { buildSupabaseImageUrl } from "@/lib/imageUrls";
import { heroAssets } from "@/lib/assetUrls";
import { STANDARD_PUBLIC_HERO_SURFACE_CLASS, STANDARD_PUBLIC_HERO_WRAPPER_CLASS } from "@/components/sections/hero-layout";

const CreateTripDialog = dynamic(
  () => import("@/components/trip-planner/CreateTripDialog").then((m) => m.CreateTripDialog),
  { ssr: false },
);
const LoginModal = dynamic(
  () => import("@/components/ui/login-modal").then((m) => m.LoginModal),
  { ssr: false },
);

function getInitialReducedMotionPreference() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getPrefersReducedData() {
  if (typeof window === "undefined") return false;

  if (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-data: reduce)").matches
  ) {
    return true;
  }

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  return Boolean(connection?.saveData);
}

function HeroPosterImage({
  hasPosterUrl,
  posterUrl,
  className,
  priority = false,
}: {
  hasPosterUrl: boolean;
  posterUrl: string;
  className?: string;
  priority?: boolean;
}) {
  const fallbackPosterUrl = heroAssets.poster;

  const posterSrc =
    buildSupabaseImageUrl(hasPosterUrl ? posterUrl : fallbackPosterUrl, {
      width: 1920,
      quality: 54,
      format: "webp",
      resize: "cover",
    }) ?? (hasPosterUrl ? posterUrl : fallbackPosterUrl);

  return (
    <Image
      src={posterSrc}
      alt=""
      width={1920}
      height={1080}
      quality={54}
      sizes="100vw"
      loading={priority ? "eager" : "lazy"}
      priority={priority}
      fetchPriority={priority ? "high" : "auto"}
      className={className}
    />
  );
}

const HeroVideoPlayer = ({
  videoUrl,
  posterUrl,
}: {
  videoUrl: string;
  posterUrl?: string;
}) => {
  return (
    <video
      autoPlay
      controls={false}
      controlsList="nodownload nofullscreen noplaybackrate noremoteplayback"
      disablePictureInPicture
      disableRemotePlayback
      loop
      muted
      playsInline
      preload="none"
      poster={posterUrl ?? undefined}
      crossOrigin="anonymous"
      tabIndex={-1}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
    >
      <source src={videoUrl} type="video/mp4" />
    </video>
  );
};

const HeroVideo = ({ videoUrl, posterUrl }: { videoUrl: string; posterUrl?: string }) => (
  <HeroVideoPlayer key={videoUrl} videoUrl={videoUrl} posterUrl={posterUrl} />
);


export function HeroSection() {
  const hydrated = useHydrated();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    getInitialReducedMotionPreference,
  );
  const [canEnhanceHeroVideo, setCanEnhanceHeroVideo] = useState(false);
  const { settings, isLoading: isHeroSettingsLoading } = useHeroSettings();
  const { settings: runtimeSettings } = useGlobalSettings({
    keys: [HERO_OVERLAY_INTENSITY_SETTING_KEY],
  });
  const locale = useCurrentLocale();
  const { t } = useTranslation();
  const { isSlow, isMobile } = useConnectionQuality();
  const { createTrip } = useTripPlanner();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const l = useLocalePath();

  // CMS SOURCE OF TRUTH:
  // 1. cms_page_configs_v1 text overrides (primary)
  // 2. homepage_settings (fallback only)
  const { getText } = useCmsPageBuilder("home");

  // Determine if video should be skipped for performance
  // Skip video on: reduced motion preference, slow connections, or mobile devices
  const shouldSkipVideo = prefersReducedMotion || isSlow;

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Trip planner dialog/auth state
  const [tripPlannerOpen, setTripPlannerOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleCreateTrip = (data: { title: string; description?: string; start_date: string; end_date: string }) => {
    if (!isAuthenticated) {
      toast.info(t("hero.loginRequired"));
      setShowLoginModal(true);
      return;
    }

    const newTrip = createTrip(data);
    toast.success(t("hero.tripCreated"));
    router.push(`${l("/dashboard/trips")}?trip=${encodeURIComponent(newTrip.id)}`);
  };

  const cmsMediaType = getText("hero.mediaType", "").trim();
  const cmsImageUrl = getText("hero.imageUrl", "").trim();
  const cmsVideoUrl = getText("hero.videoUrl", "").trim();
  const cmsPosterUrl = getText("hero.posterUrl", "").trim();

  // Full Page Builder media wins when provided; homepage_settings remains fallback.
  const mediaType = cmsMediaType || settings?.hero_media_type || (cmsImageUrl ? "poster" : "video");
  const videoUrl = cmsVideoUrl || settings?.hero_video_url?.trim() || "";
  const posterUrl = cmsPosterUrl || cmsImageUrl || settings?.hero_poster_url?.trim() || "";
  const hasVideoUrl = videoUrl.length > 0;
  const hasPosterUrl = posterUrl.length > 0;
  const heroVideoPosterSrc =
    buildSupabaseImageUrl(posterUrl, {
      width: 1600,
      quality: 50,
      format: "webp",
      resize: "cover",
    }) ?? posterUrl;

  useEffect(() => {
    setCanEnhanceHeroVideo(false);

    if (
      !hydrated ||
      !hasVideoUrl ||
      shouldSkipVideo ||
      isMobile ||
      getPrefersReducedData() ||
      (typeof window.matchMedia === "function" &&
        window.matchMedia("(max-width: 1023px)").matches)
    ) {
      return undefined;
    }

    let cancelled = false;
    const enableVideo = () => {
      if (!cancelled) {
        setCanEnhanceHeroVideo(true);
      }
    };

    const interactionEvents = ["pointerdown", "keydown", "touchstart", "wheel", "scroll"] as const;
    for (const eventName of interactionEvents) {
      window.addEventListener(eventName, enableVideo, { once: true, passive: true });
    }

    return () => {
      cancelled = true;
      for (const eventName of interactionEvents) {
        window.removeEventListener(eventName, enableVideo);
      }
    };
  }, [hasVideoUrl, hydrated, isMobile, shouldSkipVideo, videoUrl]);
  const overlayBackup = runtimeSettings.find(
    (setting) => setting.key === HERO_OVERLAY_INTENSITY_SETTING_KEY,
  )?.value;
  const overlayIntensity = normalizeHeroOverlayIntensity(
    (settings as { hero_overlay_intensity?: unknown } | undefined)?.hero_overlay_intensity ?? overlayBackup,
    50,
  );
  const cmsHeroTitle =
    getText("hero.title", "") ||
    getText("home.hero.title", "") ||
    (locale === "en" ? settings?.hero_title?.trim() : "");
  const cmsHeroSubtitle =
    getText("hero.subtitle", "") ||
    getText("home.hero.subtitle", "") ||
    (locale === "en" ? settings?.hero_subtitle?.trim() : "");
  const cmsPrimaryCta =
    getText("hero.cta.primary", "") ||
    getText("home.hero.cta.primary", "") ||
    (locale === "en" ? settings?.hero_cta_primary_text?.trim() : "");
  const cmsPrimaryCtaHref = getText("hero.cta.primary.href", "").trim();
  const cmsSecondaryCta = getText("hero.cta.secondary", "") || getText("home.hero.cta.secondary", "");
  const cmsSecondaryCtaHref = getText("hero.cta.secondary.href", "").trim();
  const heroTitleLead = cmsHeroTitle
    ? cmsHeroTitle.replace(/\s*,?\s*Curated\s*$/i, "").trim()
    : t("sections.homepage.hero.titleLead");
  const heroTitleHighlight =
    cmsHeroTitle?.match(/\bCurated\b/i)?.[0] ?? t("sections.homepage.hero.titleHighlight");
  const heroSubtitle = cmsHeroSubtitle || t("sections.homepage.hero.subtitle");
  const heroBadge = getText("hero.badge", t("sections.homepage.hero.label"));
  const primaryCtaLabel = cmsPrimaryCta || t("sections.homepage.smartSearch.cta");
  const secondaryCtaLabel = cmsSecondaryCta || t("sections.homepage.hero.secondaryCta");
  const primaryCtaTarget = cmsPrimaryCtaHref || "/directory";
  const secondaryCtaTarget = cmsSecondaryCtaHref || "/map";
  const resolveCtaHref = (href: string) => {
    if (/^(#|https?:\/\/|mailto:|tel:)/i.test(href)) {
      return href;
    }
    return l(href);
  };

  const primaryCtaHref = resolveCtaHref(primaryCtaTarget);
  const secondaryCtaHref = resolveCtaHref(secondaryCtaTarget);
  const primaryCtaIsExternal = /^https?:\/\//i.test(primaryCtaTarget);
  const secondaryCtaIsExternal = /^https?:\/\//i.test(secondaryCtaTarget);
  const mediaMode = useMemo<"video" | "poster" | "none" | "loading">(() => {
    if (isHeroSettingsLoading) return "loading";

    if (shouldSkipVideo) {
      return hasPosterUrl ? "poster" : "none";
    }

    if (mediaType === "video" && hasVideoUrl) return "video";
    if (mediaType === "poster" && hasPosterUrl) return "poster";
    if (mediaType === "youtube") return hasPosterUrl ? "poster" : hasVideoUrl ? "video" : "none";

    if (hasVideoUrl) return "video";
    if (hasPosterUrl) return "poster";
    return "none";
  }, [hasPosterUrl, hasVideoUrl, isHeroSettingsLoading, mediaType, shouldSkipVideo]);

  return (
    <div className={STANDARD_PUBLIC_HERO_WRAPPER_CLASS}>
      <section className={STANDARD_PUBLIC_HERO_SURFACE_CLASS}>
        {/* Video Background */}
        <div className="absolute inset-0">
          <HeroPosterImage
            hasPosterUrl={hasPosterUrl}
            posterUrl={posterUrl}
            className="absolute inset-0 w-full h-full object-cover"
            priority={true}
          />
          {mediaMode === "video" && canEnhanceHeroVideo ? (
            <HeroVideo videoUrl={videoUrl} posterUrl={hasPosterUrl ? heroVideoPosterSrc : undefined} />
          ) : null}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.68)_0%,rgba(0,0,0,0.46)_42%,rgba(0,0,0,0.18)_72%,rgba(0,0,0,0.32)_100%)]" />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.16)_48%,rgba(0,0,0,0.66)_100%)]"
            style={{ opacity: Math.max(0.68, overlayIntensity / 125) }}
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[inherit] w-full max-w-7xl items-center px-5 py-16 sm:px-8 sm:py-24 lg:px-16 lg:py-24">
          <div className="max-w-3xl space-y-4 text-left text-white sm:space-y-5">
            <p className="inline-flex rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/82 backdrop-blur-md sm:text-xs">
              {heroBadge}
            </p>

            <h1 className="font-serif text-[clamp(2.75rem,10vw,6.75rem)] font-semibold leading-[0.92] tracking-normal text-white">
              <span className="block">{heroTitleLead},</span>
              <span className="block italic text-primary">{heroTitleHighlight}</span>
            </h1>

            <p className="max-w-xl text-base font-light leading-7 text-white/88 sm:text-lg">
              {heroSubtitle}
            </p>

            <div className="flex w-full flex-col gap-3 pt-1 sm:max-w-[42rem] sm:flex-row sm:items-center sm:gap-4 sm:pt-3">
              <Button
                variant="gold"
                size="lg"
                className="min-h-12 w-full max-w-full whitespace-normal px-5 text-center leading-tight sm:w-auto sm:whitespace-nowrap sm:px-7"
                asChild
              >
                <Link
                  href={primaryCtaHref}
                  target={primaryCtaIsExternal ? "_blank" : undefined}
                  rel={primaryCtaIsExternal ? "noopener noreferrer" : undefined}
                >
                  <span className="min-w-0 flex-1 break-words sm:flex-none">
                    {primaryCtaLabel}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                variant="heroOutline"
                size="lg"
                className="hidden min-h-12 w-full px-7 sm:inline-flex sm:w-auto"
                asChild
              >
                <Link
                  href={secondaryCtaHref}
                  target={secondaryCtaIsExternal ? "_blank" : undefined}
                  rel={secondaryCtaIsExternal ? "noopener noreferrer" : undefined}
                >
                  {secondaryCtaLabel}
                </Link>
              </Button>
            </div>
            <Link
              href={secondaryCtaHref}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-white/75 underline underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:hidden"
              target={secondaryCtaIsExternal ? "_blank" : undefined}
              rel={secondaryCtaIsExternal ? "noopener noreferrer" : undefined}
            >
              {secondaryCtaLabel} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <div className="flex max-w-2xl flex-wrap items-center gap-x-5 gap-y-2 pt-3 text-xs font-semibold text-white/78 sm:pt-4">
              <span>{t("sections.homepage.hero.proof.curated")}</span>
              <span>{t("sections.homepage.hero.proof.verified")}</span>
              <span>{t("sections.homepage.hero.proof.intent")}</span>
            </div>
          </div>
        </div>

        {/* Trip Planner Dialog */}
        {hydrated && tripPlannerOpen ? (
          <CreateTripDialog
            open={tripPlannerOpen}
            onClose={() => setTripPlannerOpen(false)}
            onSave={handleCreateTrip}
          />
        ) : null}
        {hydrated && showLoginModal ? (
          <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
        ) : null}

        {/* Mobile scroll hint — fading bottom edge */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent lg:hidden" />

        {/* Scroll Indicator - keep above overlapping quick-links cards */}
        <div className="pointer-events-none absolute bottom-8 right-8 hidden z-30 lg:flex">
          <button
            onClick={() => scrollToSection("signature-collection")}
            aria-label={t("sections.homepage.hero.scroll")}
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-black/20 text-white/70 backdrop-blur-md transition-colors cursor-pointer hover:text-white"
          >
            <ChevronDown className="h-5 w-5 text-white/70" />
          </button>
        </div>
      </section>
    </div>
  );
}
