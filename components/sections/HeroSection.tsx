// framer-motion import removed - using CSS animations for LCP elements
import { Bot, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import { useHeroSettings } from "@/hooks/useHomepageSettings";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { useTranslation } from "react-i18next";
import { useConnectionQuality } from "@/hooks/useConnectionQuality";
import { CreateTripDialog } from "@/components/trip-planner/CreateTripDialog";
import { LoginModal } from "@/components/ui/login-modal";
import { useTripPlanner } from "@/hooks/useTripPlanner";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { HERO_OVERLAY_INTENSITY_SETTING_KEY, normalizeHeroOverlayIntensity } from "@/lib/heroOverlay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildLangPath, useLangPrefix } from "@/hooks/useLangPrefix";
import { useCookieConsent } from "@/hooks/useCookieConsent";

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
  if (!hasPosterUrl) return <div className={`${className ?? ""} bg-black`} />;

  return (
    <Image
      src={posterUrl}
      alt="Premium Algarve coastline"
      fill
      sizes="100vw"
      priority={priority}
      className={className}
      unoptimized={posterUrl.startsWith("data:")}
    />
  );
}

const YouTubeEmbedPlayer = ({ youtubeUrl, posterUrl }: { youtubeUrl: string; posterUrl?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoadIframe, setShouldLoadIframe] = useState(false);

  useEffect(() => {
    if (!youtubeUrl) return;

    const loadDelay = posterUrl ? 900 : 0;
    const timer = window.setTimeout(() => {
      setShouldLoadIframe(true);
    }, loadDelay);

    return () => window.clearTimeout(timer);
  }, [posterUrl, youtubeUrl]);

  return (
    <>
      {shouldLoadIframe ? (
        <iframe
          src={getYouTubeEmbedUrl(youtubeUrl)}
          className={`pointer-events-none transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '177.77777778vh',
            height: '56.25vw',
            minWidth: '100%',
            minHeight: '100%',
            transform: 'translate(-50%, -50%)',
          }}
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Hero background video"
          onLoad={() => {
            setIsLoaded(true);
          }}
        />
      ) : null}
    </>
  );
};

const YouTubeEmbed = ({ youtubeUrl, posterUrl }: { youtubeUrl: string; posterUrl?: string }) => (
  <YouTubeEmbedPlayer key={youtubeUrl} youtubeUrl={youtubeUrl} posterUrl={posterUrl} />
);

// Optimized video component with immediate autoplay
const HeroVideoPlayer = ({
  videoUrl,
  posterUrl,
}: {
  videoUrl: string;
  posterUrl?: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    if (!videoUrl) return;

    const loadDelay = posterUrl ? 900 : 0;
    const timer = window.setTimeout(() => {
      setShouldLoadVideo(true);
    }, loadDelay);

    return () => window.clearTimeout(timer);
  }, [posterUrl, videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoadVideo) return;

    const attemptPlay = async () => {
      try {
        video.muted = true;
        await video.play();
        setIsPlaying(true);
      } catch (error) {
        console.debug("Autoplay blocked, keeping hero poster visible");
      }
    };

    if (video.readyState >= 3) {
      attemptPlay();
    } else {
      video.addEventListener('canplay', attemptPlay, { once: true });
    }

    return () => {
      video.removeEventListener("canplay", attemptPlay);
    };
  }, [shouldLoadVideo, videoUrl]);

  return (
    <>
      {shouldLoadVideo ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={posterUrl || undefined}
          crossOrigin="anonymous"
          onPlaying={() => {
            setIsPlaying(true);
          }}
          onError={() => {
            setIsPlaying(false);
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : null}
    </>
  );
};

const HeroVideo = ({ videoUrl, posterUrl }: { videoUrl: string; posterUrl?: string }) => (
  <HeroVideoPlayer key={videoUrl} videoUrl={videoUrl} posterUrl={posterUrl} />
);


export function HeroSection() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const { settings, isLoading: isHeroSettingsLoading } = useHeroSettings();
  const { settings: runtimeSettings } = useGlobalSettings({
    keys: [HERO_OVERLAY_INTENSITY_SETTING_KEY],
  });
  const { t } = useTranslation();
  const { isSlow } = useConnectionQuality();
  const { createTrip } = useTripPlanner();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const langPrefix = useLangPrefix();
  const { canUseCategory, isLoaded: isCookieConsentLoaded, openPreferences } = useCookieConsent();
  const hasFunctionalConsent = canUseCategory("functional");

  // Determine if video should be skipped for performance
  // Skip video on: reduced motion preference, slow connections, or mobile devices
  const shouldSkipVideo = prefersReducedMotion || isSlow;

  useEffect(() => {
    if (typeof window === "undefined") return;

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
      toast.info(t("hero.loginRequired", "Log in or create an account to create and save your trip."));
      setShowLoginModal(true);
      return;
    }

    const newTrip = createTrip(data);
    toast.success(t("hero.tripCreated", "Trip created successfully."));
    navigate(`/dashboard/trips?trip=${encodeURIComponent(newTrip.id)}`);
  };

  // Use only admin-configured media (no local fallback assets).
  const mediaType = settings?.hero_media_type || 'video';
  const videoUrl = settings?.hero_video_url?.trim() || "";
  const posterUrl = settings?.hero_poster_url?.trim() || "";
  const youtubeUrl = settings?.hero_youtube_url?.trim() || "";
  const hasVideoUrl = videoUrl.length > 0;
  const hasPosterUrl = posterUrl.length > 0;
  const hasYoutubeUrl = youtubeUrl.length > 0;
  const overlayBackup = runtimeSettings.find(
    (setting) => setting.key === HERO_OVERLAY_INTENSITY_SETTING_KEY,
  )?.value;
  const overlayIntensity = normalizeHeroOverlayIntensity(
    (settings as { hero_overlay_intensity?: unknown } | undefined)?.hero_overlay_intensity ?? overlayBackup,
    50,
  );
  const overlayOpacity = overlayIntensity / 100;
  // Use CMS hero copy when available.
  const heroHeadline = settings?.hero_title?.trim() || `${t("hero.headline")} ${t("hero.headlineHighlight")}`;
  const heroHeadlineLines = useMemo(() => {
    const normalized = heroHeadline.replace(/\s+/g, " ").trim().toLowerCase();
    if (normalized === "discover the algarve through trusted local expertise") {
      return ["Discover the Algarve Through Trusted", "Local Expertise"];
    }
    return [heroHeadline];
  }, [heroHeadline]);
  const heroSubtitle = settings?.hero_subtitle?.trim() || t("hero.subtitle");
  const primaryCtaText = t("hero.tripPlannerCta", "Trip Planner");
  const directoryPath = buildLangPath(langPrefix, "/directory");
  const tripPlannerPrompt = t(
    "hero.tripPlannerPrompt",
    "Create your Algarve itinerary in minutes",
  );
  // ... inside the component function ...

  const mediaMode = useMemo<"youtube" | "video" | "poster" | "none">(() => {
    if (isHeroSettingsLoading) return "none";

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
    <div className="px-2.5 sm:px-4 lg:px-6 pt-[calc(4.5rem+0.85rem)] sm:pt-[calc(5rem+0.95rem)] lg:pt-[calc(5rem+1.1rem)] pb-3 sm:pb-4">
      <section className="hero-golden-outline relative min-h-[34rem] sm:min-h-[35rem] md:min-h-[40rem] flex items-center justify-center overflow-hidden rounded-[1.65rem] lg:rounded-3xl shadow-sm">
        {/* Video Background */}
        <div className="absolute inset-0">
          {mediaMode !== "none" ? (
            <HeroPosterImage
              hasPosterUrl={hasPosterUrl}
              posterUrl={posterUrl}
              className="absolute inset-0 w-full h-full object-cover"
              priority={true}
            />
          ) : (
            <div className="absolute inset-0 bg-black" aria-hidden="true" />
          )}
          {mediaMode === "youtube" && <YouTubeEmbed youtubeUrl={youtubeUrl} posterUrl={hasPosterUrl ? posterUrl : undefined} />}
          {mediaMode === "video" && <HeroVideo videoUrl={videoUrl} posterUrl={hasPosterUrl ? posterUrl : undefined} />}

          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" style={{ opacity: overlayOpacity }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/70" style={{ opacity: overlayOpacity }} />
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
          <div className="space-y-4 px-3 py-7 text-center text-white sm:space-y-6 sm:px-8 sm:py-8 md:px-10">
            <div className="flex justify-center">
              <Badge variant="gold" className="uppercase tracking-[0.18em] text-[10px] px-3.5 py-1.5 sm:tracking-[0.22em] sm:text-[11px] sm:px-4">
                {t("hero.location")}
              </Badge>
            </div>

            <h1 className="text-shadow-hero font-serif text-[clamp(2.35rem,12vw,4.3rem)] sm:text-5xl md:text-7xl font-light leading-[0.92] sm:leading-tight tracking-[-0.03em] text-white">
              {heroHeadlineLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>

            <div className="mx-auto h-1 w-20 rounded-full bg-[var(--colour-card-outline-gold)] shadow-[var(--shadow-card)] sm:w-24" />

            <p className="text-shadow-hero mx-auto max-w-[18.75rem] text-[0.92rem] font-light leading-7 text-white/90 sm:max-w-2xl sm:text-base sm:leading-relaxed md:text-xl">
              {heroSubtitle}
            </p>

            <div className="pt-1 sm:pt-2 flex flex-col items-center gap-3.5 sm:gap-4 w-full max-w-[22rem] sm:max-w-2xl mx-auto px-0">
              <button
                onClick={openTripPlanner}
                className="relative isolate w-full flex flex-col items-stretch rounded-[28px] border border-[var(--colour-card-outline-gold)] bg-white p-1.5 shadow-card transition-all duration-300 hover:shadow-elevated min-[460px]:flex-row min-[460px]:items-center"
              >
                <div className="relative z-10 flex items-center gap-2.5 sm:gap-3 px-3.5 py-1 min-[460px]:py-0 sm:px-4 flex-1 min-w-0">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--colour-teal)] flex-shrink-0" />
                  <span className="flex-1 text-left text-[rgba(11,31,58,0.72)] text-[0.92rem] sm:text-base leading-snug sm:leading-normal whitespace-normal min-[460px]:truncate">
                    {tripPlannerPrompt}
                  </span>
                </div>
                <span className="button button--primary relative z-10 inline-flex w-full min-[460px]:w-auto justify-center flex-shrink-0 rounded-full px-4 py-2.5 sm:px-8 sm:py-3 text-[10px] sm:text-sm tracking-[0.14em] sm:tracking-widest whitespace-nowrap">
                  {primaryCtaText}
                </span>
              </button>

              <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                  <Link to={directoryPath}>{t("hero.exploreDirectory", "Explore Directory")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Planner Dialog */}
        <CreateTripDialog
          open={tripPlannerOpen}
          onClose={() => setTripPlannerOpen(false)}
          onSave={handleCreateTrip}
        />
        <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />

        {/* Scroll Indicator - keep above overlapping quick-links cards */}
        <div className="pointer-events-none absolute bottom-8 right-8 hidden z-30 lg:flex">
          <button
            onClick={() => scrollToSection("home-quick-links")}
            className="pointer-events-auto flex flex-col items-end gap-2 text-white/70 transition-colors cursor-pointer animate-bounce hover:text-white"
          >
            <span className="text-xs tracking-widest uppercase text-white/60">{t("hero.scroll")}</span>
            <ChevronDown className="h-5 w-5 text-white/60" />
          </button>
        </div>
      </section>
    </div>
  );
}
