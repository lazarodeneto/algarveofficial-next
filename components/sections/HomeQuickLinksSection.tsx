import { useCallback, useMemo, useState, type ComponentProps } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { ArrowRight, BedSingle, Binoculars, Building2, CalendarDays, LucideIcon } from "lucide-react";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { useLocalePath } from "@/hooks/useLocalePath";
import {
  HOME_QUICK_LINK_CARDS,
  HOME_QUICK_LINK_SETTING_KEYS,
} from "@/lib/homeQuickLinks";
import { buildSupabaseImageUrl } from "@/lib/imageUrls";
import { useTranslation } from "react-i18next";

function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}

const CARD_ICONS: Record<"stay" | "see-do" | "events" | "real-estate", LucideIcon> = {
  "see-do": Binoculars,
  stay: BedSingle,
  events: CalendarDays,
  "real-estate": Building2,
};

export function HomeQuickLinksSection() {
  const l = useLocalePath();
  const { t } = useTranslation();
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
      <section id="home-quick-links" className="relative z-10 bg-background pb-10 pt-8 sm:pb-12 sm:pt-10 lg:pb-14 lg:pt-12" aria-hidden="true">
        <div className="app-container">
          <div className="mx-auto grid w-full grid-cols-2 gap-3 px-1 sm:max-w-[1120px] sm:gap-5 sm:px-0 lg:grid-cols-4 lg:gap-5">
            {HOME_QUICK_LINK_CARDS.map((card) => (
              <div
                key={card.id}
                className="relative isolate aspect-[4/3] overflow-hidden rounded-2xl bg-muted/35 shadow-sm"
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
    <section id="home-quick-links" className="relative z-10 bg-background pb-10 pt-8 sm:pb-12 sm:pt-10 lg:pb-14 lg:pt-12">
      <div className="app-container content-max">
        <div className="mx-auto grid w-full grid-cols-2 gap-3 px-1 sm:gap-5 sm:px-0 lg:grid-cols-4 lg:gap-5">
          {quickLinkCards.map((card) => {
            const Icon = CARD_ICONS[card.id];
            const displayTitle = t(card.translationKey);
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
                className="group relative isolate aspect-[4/3] overflow-hidden rounded-2xl bg-black font-sans shadow-card transition-all duration-300 ease-out [backface-visibility:hidden] motion-reduce:transition-none hover:-translate-y-1 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out will-change-transform motion-reduce:transition-none group-hover:scale-[1.05]"
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
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out will-change-transform motion-reduce:transition-none group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-black" aria-hidden="true" />
                    )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white text-shadow-card sm:p-5">
                    <h3 className="font-serif text-[1.65rem] font-semibold not-italic leading-tight min-[480px]:text-[1.875rem] sm:text-[2.25rem]">
                      {displayTitle}
                    </h3>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-white/85 sm:mt-2 sm:gap-1.5">
                      <Icon className="h-7 w-7" strokeWidth={1.8} />
                      {t("sections.homepage.common.explore")}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
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
