// framer-motion import removed - using CSS animations for LCP elements
import { ArrowRight, ChevronDown } from "lucide-react";
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
      unoptimized
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
  const overlayOpacity = overlayIntensity / 100;
  const localizedHeroHeadline = `${t("hero.headline")} ${t("hero.headlineHighlight")}`.trim();
  const localizedHeroSubtitle = t("hero.subtitle");
  // CMS SOURCE OF TRUTH: 1. cms_page_configs_v1 (getText), 2. homepage_settings (fallback)
  const heroHeadline =
    getText("home.hero.title", "") ||
    (locale === "en" ? settings?.hero_title?.trim() : null) ||
    localizedHeroHeadline;
  const heroHeadlineLines = useMemo(() => {
    const normalized = heroHeadline.replace(/\s+/g, " ").trim().toLowerCase();
    if (normalized === "discover the algarve through trusted local expertise") {
      return ["Discover the Algarve Through Trusted", "Local Expertise"];
    }
    return [heroHeadline];
  }, [heroHeadline]);
  const heroSubtitle =
    getText("home.hero.subtitle", "") ||
    (locale === "en" ? settings?.hero_subtitle?.trim() : null) ||
    localizedHeroSubtitle;
  const localizedTripPlannerButtonLabel = t("hero.planTripCta");
  const tripPlannerButtonLabel =
    getText("home.hero.cta.primary", "") ||
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

          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" style={{ opacity: overlayOpacity }} />
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

        <div className="relative z-10 mx-auto w-full max-w-[22rem] px-4 sm:max-w-4xl sm:px-4">
          <div className="space-y-1.5 px-3 pt-5 pb-14 text-center text-white sm:space-y-2 sm:px-8 sm:pt-6 sm:pb-16 md:px-10">

            <h1 className="text-shadow-hero font-serif text-[clamp(2rem,10vw,3.8rem)] sm:text-5xl md:text-6xl font-light leading-[0.95] sm:leading-tight tracking-[-0.03em] text-white">
              {heroHeadlineLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>

            <div className="mx-auto h-0.5 w-16 rounded-full bg-[var(--colour-card-outline-gold)] shadow-[var(--shadow-card)] sm:w-20" />

            <p className="text-shadow-hero mx-auto max-w-[17rem] text-[0.82rem] font-light leading-6 text-white/90 sm:max-w-xl sm:text-sm sm:leading-6 md:max-w-2xl md:text-base">
              {heroSubtitle}
            </p>

            <div className="flex flex-col items-center gap-3 sm:gap-3.5 w-full max-w-[22rem] sm:max-w-2xl mx-auto px-0">
              <button
                type="button"
                onClick={openTripPlanner}
                className="group inline-flex w-full max-w-[17.5rem] items-center justify-center gap-2 rounded-[16px] px-6 py-3.5 text-[1.05rem] font-semibold text-black shadow-[0_16px_28px_-18px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                style={{ backgroundImage: "var(--gradient-gold)" }}
              >
                <span>{tripPlannerButtonLabel}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
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
            onClick={() => scrollToSection("all-premium-listings")}
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
