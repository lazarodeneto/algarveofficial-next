import { useCallback, useMemo, useState, type ComponentProps } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { BedSingle, Binoculars, CalendarDays, LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
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

const CARD_ICONS: Record<"stay" | "see-do" | "whats-on", LucideIcon> = {
  "see-do": Binoculars,
  stay: BedSingle,
  "whats-on": CalendarDays,
};

export function HomeQuickLinksSection() {
  const { t } = useTranslation();
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
        imageUrl: settingMap[card.imageSettingKey]?.trim() || "",
        videoUrl: settingMap[card.videoSettingKey]?.trim() || "",
      })),
    [settingMap],
  );

  if (isLoading) {
    return null;
  }

  return (
    <section id="home-quick-links" className="relative z-20 -mt-2 pb-4 sm:-mt-14 sm:pb-5 lg:-mt-20 lg:pb-7">
      <div className="app-container">
        <div className="mx-auto flex w-full flex-col gap-4 px-1 pb-2 sm:grid sm:max-w-[780px] sm:grid-cols-2 sm:justify-items-center sm:gap-4 sm:px-0 md:grid-cols-3 min-[940px]:grid-cols-3">
          {quickLinkCards.map((card) => {
            const Icon = CARD_ICONS[card.id];
            const displayTitle = t(card.translationKey, card.title);
            const customImageUrl = card.imageUrl;
            const customVideoUrl = card.videoUrl;
            const prefersFallbackImage = failedImageMedia[card.id] === true;
            const prefersFallbackVideo = failedVideoMedia[card.id] === true;
            const resolvedImageSrc =
              !prefersFallbackImage && customImageUrl
                ? buildSupabaseImageUrl(customImageUrl, {
                    width: 480,
                    quality: 56,
                    format: "webp",
                    resize: "cover",
                  }) || customImageUrl
                : null;
            const imageSrc =
              resolvedImageSrc || card.fallbackImageUrl;
            const videoPosterSrc =
              resolvedImageSrc
                ? buildSupabaseImageUrl(customImageUrl, {
                    width: 640,
                    quality: 52,
                    format: "webp",
                    resize: "cover",
                  }) || customImageUrl
                : card.fallbackImageUrl;
            const showVideo = Boolean(customVideoUrl) && !prefersFallbackVideo;

            return (
              <Link
                key={card.id}
                href={card.customHref ? l(card.customHref) : l(`/visit?category=${card.categorySlug}`)}
                className="glass-box glass-box-silver-liquid glass-box-contour group relative isolate flex h-full w-full flex-col rounded-[24px] font-sans transition-transform duration-300 hover:-translate-y-1 sm:max-w-[236px]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-20 rounded-[24px] border-[2px] border-[hsl(43,86%,58%)] shadow-[0_0_10px_hsla(43,86%,58%,0.34)]"
                />

                <div className="relative z-10 flex items-center justify-center gap-2.5 px-3.5 pt-4 pb-1 sm:gap-3 sm:px-4 sm:pt-5 sm:pb-1.5">
                  <Icon className="h-5 w-5 shrink-0 sm:h-6 sm:w-6 text-[hsl(43,74%,49%)]" />
                  <h3 className="font-['Archivo_Narrow'] text-[0.78rem] font-semibold uppercase leading-tight tracking-[0.02em] text-black dark:text-white sm:text-[0.88rem] lg:text-[0.96rem]">
                    {displayTitle}
                  </h3>
                </div>

                <div className="relative z-10 mt-auto p-3 pt-1 sm:p-3.5 sm:pt-1.5">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/35 bg-white/25 dark:border-white/15 dark:bg-black/20">
                    {showVideo ? (
                      <video
                        src={customVideoUrl}
                        poster={videoPosterSrc || undefined}
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
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <Image
                        src={imageSrc}
                        alt={displayTitle}
                        width={480}
                        height={360}
                        quality={56}
                        sizes="(max-width: 640px) 77vw, 236px"
                        loading="lazy"
                        decoding="async"
                        onError={() => markImageAsFailed(card.id)}
                        style={{ objectPosition: card.imagePosition ?? "center" }}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
