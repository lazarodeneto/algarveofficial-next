import { useCallback, useMemo, useState, type ComponentProps } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { ArrowRight, BedSingle, Binoculars, Building2, LucideIcon, UtensilsCrossed } from "lucide-react";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { useLocalePath } from "@/hooks/useLocalePath";
import {
  HOME_QUICK_LINK_CARDS,
  HOME_QUICK_LINK_SETTING_KEYS,
} from "@/lib/homeQuickLinks";
import { buildSupabaseImageUrl } from "@/lib/imageUrls";

function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}

const CARD_ICONS: Record<"stay" | "see-do" | "restaurants" | "real-estate", LucideIcon> = {
  "see-do": Binoculars,
  stay: BedSingle,
  restaurants: UtensilsCrossed,
  "real-estate": Building2,
};

export function HomeQuickLinksSection() {
  const l = useLocalePath();
  const { settings, isLoading } = useGlobalSettings({ keys: HOME_QUICK_LINK_SETTING_KEYS });
  const [failedVideoMedia, setFailedVideoMedia] = useState<Record<string, boolean>>({});
  const [failedImageMedia, setFailedImageMedia] = useState<Record<string, boolean>>({});

  const enforceMutedPlayback = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.volume = 0;
  }, []);

  const settingMap = useMemo(
    () =>
      settings.reduce<Record<string, string>>((acc, setting) => {
        acc[setting.key] = setting.value ?? "";
        return acc;
      }, {}),
    [settings],
  );

  const markVideoAsFailed = useCallback((cardId: string) => {
    setFailedVideoMedia((current) => (current[cardId] ? current : { ...current, [cardId]: true }));
  }, []);

  const markImageAsFailed = useCallback((cardId: string) => {
    setFailedImageMedia((current) => (current[cardId] ? current : { ...current, [cardId]: true }));
  }, []);

  const quickLinkCards = useMemo(
    () =>
      HOME_QUICK_LINK_CARDS.map((card) => ({
        ...card,
        imageUrl: settingMap[card.imageSettingKey]?.trim() ?? "",
        videoUrl: settingMap[card.videoSettingKey]?.trim() ?? "",
      })),
    [settingMap],
  );

  if (isLoading) {
    return (
      <section id="home-quick-links" className="relative z-10 bg-background pb-10 pt-8 sm:pb-14 sm:pt-10 lg:pb-16 lg:pt-12" aria-hidden="true">
        <div className="app-container">
          <div className="mx-auto grid w-full gap-4 px-1 sm:max-w-[1120px] sm:grid-cols-2 sm:gap-5 sm:px-0 lg:grid-cols-4">
            {HOME_QUICK_LINK_CARDS.map((card) => (
              <div
                key={card.id}
                className="relative isolate h-60 overflow-hidden rounded-2xl border border-border/50 bg-muted/35 shadow-sm sm:h-64"
              >
                <div className="absolute inset-0 animate-pulse bg-muted/45" />
                <div className="absolute bottom-5 left-5 h-7 w-28 rounded-md bg-background/35" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="home-quick-links" className="relative z-10 bg-background pb-10 pt-8 sm:pb-14 sm:pt-10 lg:pb-16 lg:pt-12">
      <div className="app-container">
        <div className="mx-auto grid w-full gap-4 px-1 sm:max-w-[1120px] sm:grid-cols-2 sm:gap-5 sm:px-0 lg:grid-cols-4">
          {quickLinkCards.map((card) => {
            const Icon = CARD_ICONS[card.id];
            const displayTitle = card.title;
            const customImageUrl = card.imageUrl.trim();
            const customVideoUrl = card.videoUrl.trim();
            const prefersFallbackImage = failedImageMedia[card.id] === true;
            const prefersFallbackVideo = failedVideoMedia[card.id] === true;
            const hasCustomImage = customImageUrl.length > 0;
            const resolvedImageSrc =
              !prefersFallbackImage && hasCustomImage
                ? buildSupabaseImageUrl(customImageUrl, {
                    width: 480,
                    quality: 56,
                    format: "webp",
                    resize: "cover",
                  }) || customImageUrl
                : null;
            const imageSrc = resolvedImageSrc;
            const videoPosterSrc =
              resolvedImageSrc
                ? buildSupabaseImageUrl(customImageUrl, {
                    width: 640,
                    quality: 52,
                    format: "webp",
                    resize: "cover",
                  }) || customImageUrl
                : undefined;
            const showVideo = customVideoUrl.length > 0 && !prefersFallbackVideo;
            const fallbackImageSrc = card.fallbackImageUrl;
            const showImage = !showVideo;

            return (
              <Link
                key={card.id}
                href={card.customHref ? l(card.customHref) : l(`/stay?category=${card.categorySlug}`)}
                className="group relative isolate h-60 overflow-hidden rounded-2xl border border-border/40 bg-black font-sans shadow-[0_18px_54px_-38px_rgba(0,0,0,0.75)] transition-shadow duration-300 [backface-visibility:hidden] hover:shadow-[0_24px_64px_-40px_rgba(0,0,0,0.86)] sm:h-64"
              >
                    {showVideo ? (
                      <video
                        src={customVideoUrl}
                        poster={videoPosterSrc ?? undefined}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        ref={enforceMutedPlayback}
                        onLoadedMetadata={(event) => enforceMutedPlayback(event.currentTarget)}
                        onPlay={(event) => enforceMutedPlayback(event.currentTarget)}
                        onError={() => markVideoAsFailed(card.id)}
                        style={{ objectPosition: card.imagePosition ?? "center" }}
                        className="absolute inset-0 h-full w-full rounded-2xl object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-110"
                      />
                    ) : showImage ? (
                      <Image
                        src={imageSrc ?? fallbackImageSrc}
                        alt={displayTitle}
                        width={480}
                        height={360}
                        quality={56}
                        sizes="(max-width: 640px) 77vw, 236px"
                        loading="lazy"
                        fetchPriority="auto"
                        decoding="async"
                        onError={() => markImageAsFailed(card.id)}
                        style={{ objectPosition: card.imagePosition ?? "center" }}
                        className="absolute inset-0 h-full w-full rounded-2xl object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-black" aria-hidden="true" />
                    )}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-black/82 via-black/24 to-black/0" />
                  <div className="relative z-10 flex h-full flex-col justify-end p-5 text-white sm:p-6">
                    <Icon className="mb-3 h-5 w-5 text-primary sm:h-6 sm:w-6" />
                    <h3 className="font-serif text-2xl font-semibold leading-none tracking-normal sm:text-3xl">
                      {displayTitle}
                    </h3>
                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white/82">
                      Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
