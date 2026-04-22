import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STANDARD_PUBLIC_HERO_SURFACE_CLASS } from "@/components/sections/hero-layout";

interface LiveStyleHeroProps {
  badge: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  media?: ReactNode;
  ctas?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  overlayOpacity?: number;
}

export function LiveStyleHero({
  badge,
  title,
  subtitle,
  media,
  ctas,
  children,
  className,
  contentClassName,
  titleClassName,
  subtitleClassName,
  overlayOpacity = 0.35,
}: LiveStyleHeroProps) {
  return (
    <section
      className={cn(
        STANDARD_PUBLIC_HERO_SURFACE_CLASS,
        className,
      )}
    >
      <div className="absolute inset-0">
        {media ?? <div className="h-full w-full bg-slate-900" />}
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" style={{ opacity: overlayOpacity }} />
      </div>

      <div className={cn("relative z-10 mx-auto max-w-4xl space-y-4 px-4 text-center text-white sm:space-y-6", contentClassName)}>
        <Badge variant="gold" className="px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] sm:px-4 sm:text-[11px]">
          {badge}
        </Badge>
        <h1 className={cn("font-serif text-[clamp(2rem,8.6vw,2.9rem)] font-light leading-[1.05] sm:text-5xl sm:leading-tight md:text-7xl", titleClassName)}>{title}</h1>
        <div className="w-24 h-1 bg-[#C9A96E] mx-auto rounded-full shadow-[0_0_15px_rgba(201,169,110,0.5)]" />
        <p className={cn("mx-auto max-w-[35ch] text-sm font-light leading-relaxed text-white/90 sm:max-w-2xl sm:text-base md:text-xl", subtitleClassName)}>
          {subtitle}
        </p>
        {ctas ? (
          <div className="mx-auto flex w-full max-w-md flex-col items-stretch justify-center gap-3 pt-1 sm:max-w-none sm:flex-row sm:items-center sm:pt-2 [&>*]:w-full sm:[&>*]:w-auto">
            {ctas}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
