// framer-motion import removed - using CSS animations for LCP elements
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { useHydrated } from "@/hooks/useHydrated";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { buildSupabaseImageUrl } from "@/lib/imageUrls";
import { STANDARD_PUBLIC_HERO_SURFACE_CLASS, STANDARD_PUBLIC_HERO_WRAPPER_CLASS } from "@/components/sections/hero-layout";

const HOMEPAGE_H1 = "Discover the Algarve – Hotels, Restaurants, Experiences & Real Estate";
const HOMEPAGE_SUBTITLE =
  "Discover the finest places to stay, eat and experience across Portugal’s most beautiful coastline.";
const HOMEPAGE_PRIMARY_CTA = "Explore curated places";
const HOMEPAGE_SECONDARY_CTA = "Search by location";

const parseYouTubeTimeToSeconds = (value: string | null): number | null => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;

  if (/^\d+$/.test(normalized)) {
    return Number.parseInt(normalized, 10);
  }

  if (/^\d+:\d{1,2}(:\d{1,2})?$/.test(normalized)) {
    const parts = normalized.split(":").map((part) => Number.parseInt(part, 10));
    if (parts.some((part) => Number.isNaN(part))) return null;
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  const match = normalized.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match) return null;

  const hours = match[1] ? Number.parseInt(match[1], 10) : 0;
  const minutes = match[2] ? Number.parseInt(match[2], 10) : 0;
  const seconds = match[3] ? Number.parseInt(match[3], 10) : 0;
  const total = hours * 3600 + minutes * 60 + seconds;
  return total > 0 ? total : null;
};

const extractYouTubeMeta = (url: string): { videoId: string | null; startSeconds: number | null } => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const segments = parsed.pathname.split("/").filter(Boolean);

    let videoId: string | null = null;

    if (host === "youtu.be") {
      videoId = segments[0] ?? null;
    } else if (host.endsWith("youtube.com")) {
      if (segments[0] === "watch") {
        videoId = parsed.searchParams.get("v");
      } else if (["embed", "shorts", "live"].includes(segments[0])) {
        videoId = segments[1] ?? null;
      }
    }

    const searchStart =
      parseYouTubeTimeToSeconds(parsed.searchParams.get("t")) ??
      parseYouTubeTimeToSeconds(parsed.searchParams.get("start"));

    let hashStart: number | null = null;
    if (parsed.hash) {
      const hash = parsed.hash.slice(1);
      const hashParams = new URLSearchParams(hash);
      hashStart =
        parseYouTubeTimeToSeconds(hashParams.get("t")) ??
        parseYouTubeTimeToSeconds(hashParams.get("start")) ??
        (hash.startsWith("t=") ? parseYouTubeTimeToSeconds(hash.slice(2)) : null);
    }

    const startSeconds = searchStart ?? hashStart;

    if (videoId && videoId.length === 11) {
      return { videoId, startSeconds };
    }

    return { videoId: null, startSeconds };
  } catch {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*)/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    const timeMatch = url.match(/[?&#](?:t|start)=([^&#]+)/);
    const startSeconds = parseYouTubeTimeToSeconds(timeMatch?.[1] ?? null);
    return { videoId, startSeconds };
  }
};

// YouTube embed helper
const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return "";

  const { videoId, startSeconds } = extractYouTubeMeta(url);
  if (!videoId) return url;

  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: videoId,
    controls: "0",
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
  });

  if (startSeconds && startSeconds > 0) {
    params.set("start", String(startSeconds));
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
};

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
  if (!hasPosterUrl) return <div className={`${className ?? ""} bg-gradient-to-b from-slate-900 to-black`} />;

  const posterSrc =
    buildSupabaseImageUrl(posterUrl, {
      width: 1920,
      quality: 54,
      format: "webp",
      resize: "cover",
    }) ?? posterUrl;

  return (
    <Image
      src={posterSrc}
      alt="Premium Algarve coastline"
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

const YouTubeEmbedPlayer = ({ youtubeUrl }: { youtubeUrl: string }) => {
  return (
    <iframe
      src={getYouTubeEmbedUrl(youtubeUrl)}
      className="pointer-events-none"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "177.77777778vh",
        height: "56.25vw",
        minWidth: "100%",
        minHeight: "100%",
        transform: "translate(-50%, -50%)",
      }}
      allow="autoplay; encrypted-media"
      allowFullScreen
      title="Hero background video"
    />
  );
};

const YouTubeEmbed = ({ youtubeUrl }: { youtubeUrl: string }) => (
  <YouTubeEmbedPlayer key={youtubeUrl} youtubeUrl={youtubeUrl} />
);

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
      loop
      muted
      playsInline
      preload="metadata"
      poster={posterUrl ?? undefined}
      crossOrigin="anonymous"
      className="absolute inset-0 h-full w-full object-cover"
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
  const { settings, isLoading: isHeroSettingsLoading } = useHeroSettings();
  const { settings: runtimeSettings } = useGlobalSettings({
    keys: [HERO_OVERLAY_INTENSITY_SETTING_KEY],
  });
  const locale = useCurrentLocale();
  const { t } = useTranslation();
  const { isSlow } = useConnectionQuality();
  const { createTrip } = useTripPlanner();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const l = useLocalePath();
  const { canUseCategory, isLoaded: isCookieConsentLoaded, openPreferences } = useCookieConsent();
  const hasFunctionalConsent = canUseCategory("functional");

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

  const openTripPlanner = () => {
    setTripPlannerOpen(true);
  };

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

  // Use only admin-configured media (no local fallback assets).
  const mediaType = settings?.hero_media_type ?? 'video';
  const videoUrl = settings?.hero_video_url?.trim() ?? "";
  const posterUrl = settings?.hero_poster_url?.trim() ?? "";
  const youtubeUrl = settings?.hero_youtube_url?.trim() ?? "";
  const hasVideoUrl = videoUrl.length > 0;
  const hasPosterUrl = posterUrl.length > 0;
  const hasYoutubeUrl = youtubeUrl.length > 0;
  const heroVideoPosterSrc =
    buildSupabaseImageUrl(posterUrl, {
      width: 1600,
      quality: 50,
      format: "webp",
      resize: "cover",
    }) ?? posterUrl;
  const overlayBackup = runtimeSettings.find(
    (setting) => setting.key === HERO_OVERLAY_INTENSITY_SETTING_KEY,
  )?.value;
  const overlayIntensity = normalizeHeroOverlayIntensity(
    (settings as { hero_overlay_intensity?: unknown } | undefined)?.hero_overlay_intensity ?? overlayBackup,
    50,
  );
  const localizedHeroHeadline = `${t("hero.headline")} ${t("hero.headlineHighlight")}`.trim();
  const localizedHeroSubtitle = t("hero.subtitle");
  // CMS SOURCE OF TRUTH: 1. cms_page_configs_v1 (getText), 2. homepage_settings (fallback)
  const heroHeadline =
    getText("home.hero.title", "") ||
    HOMEPAGE_H1 ||
    (locale === "en" ? settings?.hero_title?.trim() : null) ||
    localizedHeroHeadline;
  const heroSubtitle =
    getText("home.hero.subtitle", "") ||
    HOMEPAGE_SUBTITLE ||
    (locale === "en" ? settings?.hero_subtitle?.trim() : null) ||
    localizedHeroSubtitle;
  const localizedTripPlannerButtonLabel = t("hero.planTripCta");
  const primaryCtaLabel =
    getText("home.hero.cta.primary", "") ||
    HOMEPAGE_PRIMARY_CTA ||
    (locale === "en" ? settings?.hero_cta_primary_text?.trim() : null) ||
    localizedTripPlannerButtonLabel;
  // ... inside the component function ...

  const mediaMode = useMemo<"youtube" | "video" | "poster" | "none" | "loading">(() => {
    if (isHeroSettingsLoading) return "loading";

    if (shouldSkipVideo) {
      return hasPosterUrl ? "poster" : "none";
    }

    if (mediaType === "youtube" && hasYoutubeUrl) {
      return hasFunctionalConsent ? "youtube" : hasPosterUrl ? "poster" : "none";
    }
    if (mediaType === "video" && hasVideoUrl) return "video";
    if (mediaType === "poster" && hasPosterUrl) return "poster";

    if (hasYoutubeUrl && hasFunctionalConsent) return "youtube";
    if (hasVideoUrl) return "video";
    if (hasPosterUrl) return "poster";
    return "none";
  }, [hasFunctionalConsent, hasPosterUrl, hasVideoUrl, hasYoutubeUrl, isHeroSettingsLoading, mediaType, shouldSkipVideo]);

  const showMediaConsentPrompt =
    isCookieConsentLoaded &&
    !hasFunctionalConsent &&
    !shouldSkipVideo &&
    hasYoutubeUrl &&
    mediaMode === "poster";

  return (
    <div className={STANDARD_PUBLIC_HERO_WRAPPER_CLASS}>
      <section className={STANDARD_PUBLIC_HERO_SURFACE_CLASS}>
        {/* Video Background */}
        <div className="absolute inset-0">
          {(mediaMode === "loading" || mediaMode !== "none") ? (
            <HeroPosterImage
              hasPosterUrl={hasPosterUrl}
              posterUrl={posterUrl}
              className="absolute inset-0 w-full h-full object-cover"
              priority={true}
            />
          ) : (
            <div className="absolute inset-0 bg-black" aria-hidden="true" />
          )}
          {mediaMode === "youtube" && <YouTubeEmbed youtubeUrl={youtubeUrl} />}
          {mediaMode === "video" && <HeroVideo videoUrl={videoUrl} posterUrl={hasPosterUrl ? heroVideoPosterSrc : undefined} />}

          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.28)_38%,rgba(0,0,0,0.72)_100%)]"
            style={{ opacity: Math.max(0.82, overlayIntensity / 100) }}
          />
          {showMediaConsentPrompt ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center px-4">
              <button
                type="button"
                onClick={openPreferences}
                className="pointer-events-auto inline-flex items-center justify-center rounded-full border border-white/35 bg-black/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md transition hover:bg-black/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                Enable Media Cookies
              </button>
            </div>
          ) : null}
        </div>

        <div className="relative z-10 mx-auto flex min-h-[inherit] w-full max-w-5xl items-center justify-center px-5 pb-12 pt-24 sm:px-8 sm:pb-16 sm:pt-28 lg:pb-20 lg:pt-32">
          <div className="mx-auto max-w-2xl space-y-5 text-center text-white">
            <h1 className="sr-only">
              {heroHeadline}
            </h1>

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/82 sm:text-base">
              AlgarveOfficial
            </p>

            <div className="font-serif text-[clamp(3rem,9vw,5.75rem)] font-semibold italic leading-[0.92] tracking-normal text-white">
              The Algarve, Curated
            </div>

            <p className="mx-auto max-w-xl text-base font-light leading-7 text-white/88 sm:text-lg">
              {heroSubtitle}
            </p>

            <div className="mx-auto flex w-full max-w-[38rem] flex-col items-center gap-3 pt-3 sm:flex-row sm:justify-center sm:gap-4">
              <Button
                variant="gold"
                size="lg"
                onClick={() => scrollToSection("signature-collection")}
                className="w-full max-w-[18rem] gap-2 sm:w-auto"
              >
                {primaryCtaLabel}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
              <Button
                variant="heroOutline"
                size="lg"
                onClick={() => router.push(l("/map"))}
                className="w-full max-w-[18rem] sm:w-auto"
              >
                {getText("home.hero.cta.secondary", "") || HOMEPAGE_SECONDARY_CTA}
              </Button>
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

        {/* Scroll Indicator - keep above overlapping quick-links cards */}
        <div className="pointer-events-none absolute bottom-8 right-8 hidden z-30 lg:flex">
          <button
            onClick={() => scrollToSection("signature-collection")}
            aria-label={t("hero.scroll")}
            className="pointer-events-auto flex flex-col items-end gap-2 text-white/70 transition-colors cursor-pointer animate-bounce hover:text-white"
          >
            <ChevronDown className="h-5 w-5 text-white/60" />
          </button>
        </div>
      </section>
    </div>
  );
}
