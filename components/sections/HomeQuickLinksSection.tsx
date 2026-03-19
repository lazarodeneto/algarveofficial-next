import { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { BedSingle, Binoculars, CalendarDays, LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { useLangPrefix, buildLangPath } from "@/hooks/useLangPrefix";
import {
  HOME_QUICK_LINK_CARDS,
  HOME_QUICK_LINK_SETTING_KEYS,
} from "@/lib/homeQuickLinks";

const CARD_ICONS: Record<"stay" | "see-do" | "whats-on", LucideIcon> = {
  "see-do": Binoculars,
  stay: BedSingle,
  "whats-on": CalendarDays,
};

export function HomeQuickLinksSection() {
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();
  const { settings, isLoading } = useGlobalSettings({ keys: HOME_QUICK_LINK_SETTING_KEYS });

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

  const cardsWithAdminImages = useMemo(
    () =>
      HOME_QUICK_LINK_CARDS.map((card) => ({
        ...card,
        imageUrl: settingMap[card.imageSettingKey]?.trim() || "",
        videoUrl: settingMap[card.videoSettingKey]?.trim() || "",
      })).filter((card) => card.imageUrl.length > 0 || card.videoUrl.length > 0),
    [settingMap],
  );

  // Avoid flashing fallback artwork while settings are loading.
  if (isLoading) {
    return null;
  }

  if (cardsWithAdminImages.length === 0) {
    return null;
  }

  return (
    <section id="home-quick-links" className="relative z-20 -mt-2 pb-8 sm:-mt-14 sm:pb-10 lg:-mt-20 lg:pb-14">
      <div className="app-container">
        <div className="mx-auto flex w-full snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 sm:grid sm:max-w-[780px] sm:grid-cols-2 sm:justify-items-center sm:gap-4 sm:overflow-visible sm:px-0 md:grid-cols-3 min-[940px]:grid-cols-3">
          {cardsWithAdminImages.map((card) => {
            const Icon = CARD_ICONS[card.id];
            const displayTitle = t(card.translationKey, card.title);

            return (
              <Link
                key={card.id}
                to={buildLangPath(langPrefix, `/directory?category=${card.categorySlug}`)}
                className="glass-box glass-box-silver-liquid glass-box-contour group relative isolate block w-[min(77vw,17rem)] flex-none snap-center rounded-[24px] font-sans transition-transform duration-300 hover:-translate-y-1 sm:w-full sm:max-w-[236px]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-20 rounded-[24px] border-[2px] border-[hsl(43,86%,58%)] shadow-[0_0_10px_hsla(43,86%,58%,0.34)]"
                />

                <div className="relative z-10 flex flex-col items-center gap-2 px-3.5 pb-3 pt-5 sm:gap-2.5 sm:px-4 sm:pt-6 text-center">
                  <h3 className="font-sans text-[0.98rem] sm:text-[1.15rem] lg:text-[1.3rem] font-semibold uppercase tracking-[0.03em] leading-tight text-black dark:text-white">
                    {displayTitle}
                  </h3>
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-[hsl(43,74%,49%)]" />
                </div>

                <div className="relative z-10 p-3.5 pt-1.5 sm:p-4 sm:pt-2">
                  <div className="overflow-hidden rounded-xl border border-white/35 bg-white/25 dark:border-white/15 dark:bg-black/20">
                    {card.videoUrl ? (
                      <video
                        src={card.videoUrl}
                        poster={card.imageUrl || undefined}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        ref={enforceMutedPlayback}
                        onLoadedMetadata={(event) => enforceMutedPlayback(event.currentTarget)}
                        onPlay={(event) => enforceMutedPlayback(event.currentTarget)}
                        style={{ objectPosition: card.imagePosition ?? "center" }}
                        className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <img
                        src={card.imageUrl}
                        alt={displayTitle}
                        loading="lazy"
                        style={{ objectPosition: card.imagePosition ?? "center" }}
                        className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
