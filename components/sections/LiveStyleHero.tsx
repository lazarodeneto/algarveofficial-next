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

      <div className={cn("relative z-10 text-center text-white space-y-6 px-4 max-w-4xl mx-auto", contentClassName)}>
        <Badge variant="gold" className="uppercase tracking-[0.22em] text-[11px] px-4 py-1.5">
          {badge}
        </Badge>
        <h1 className={cn("font-serif text-5xl md:text-7xl font-light leading-tight", titleClassName)}>{title}</h1>
        <div className="w-24 h-1 bg-[#C9A96E] mx-auto rounded-full shadow-[0_0_15px_rgba(201,169,110,0.5)]" />
        <p className={cn("text-base md:text-xl font-light max-w-2xl mx-auto text-white/90 leading-relaxed", subtitleClassName)}>
          {subtitle}
        </p>
        {ctas ? <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">{ctas}</div> : null}
        {children}
      </div>
    </section>
  );
}
