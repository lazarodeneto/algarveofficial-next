"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useHydrated } from "@/hooks/useHydrated";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { buildSupabaseImageUrl } from "@/lib/imageUrls";
import { useTheme } from "@/contexts/ThemeContext";

type BrandLogoIconTone = "auto" | "gold" | "black" | "white";

interface BrandLogoProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Whether to show the text */
  showText?: boolean;
  /** Whether to wrap in a Link to home */
  asLink?: boolean;
  /** Additional className for the container */
  className?: string;
  /** Additional className for the icon */
  iconClassName?: string;
  /** Official icon tone */
  iconTone?: BrandLogoIconTone;
}

const sizeConfig = {
  sm: {
    icon: "h-5 w-5",
    text: "text-lg",
  },
  md: {
    icon: "h-[2.125rem] w-[2.125rem] lg:h-[2.55rem] lg:w-[2.55rem]",
    text: "text-xl lg:text-[1.65rem] xl:text-2xl",
  },
  lg: {
    icon: "h-16 w-16",
    text: "text-3xl md:text-4xl",
  },
};

const passthroughImageLoader = ({ src }: { src: string }) => src;

const officialIconSrcByTone: Record<Exclude<BrandLogoIconTone, "auto">, string> = {
  gold: "/algarveofficial-icon-gold.png",
  black: "/algarveofficial-icon-black.png",
  white: "/algarveofficial-icon-white.png",
};

export function BrandLogo({
  size = "md",
  showIcon = false,
  showText = true,
  asLink = true,
  className,
  iconClassName,
  iconTone = "auto",
}: BrandLogoProps) {
  const config = sizeConfig[size];
  const l = useLocalePath();
  const { settings } = useSiteSettings();
  const { resolvedTheme } = useTheme();
  const hydrated = useHydrated();
  const hydratedSettings = hydrated ? settings : null;
  const logoUrl = hydratedSettings?.logo_url;
  const optimizedLogoUrl =
    buildSupabaseImageUrl(logoUrl, {
      width: 96,
      quality: 72,
      format: "webp",
      resize: "contain",
    }) || logoUrl;
  const siteName = hydratedSettings?.site_name || "Algarve Official";
  const [siteFirstWord, ...siteRestWords] = siteName.split(" ");
  const effectiveIconTone =
    iconTone === "auto" ? (hydrated && resolvedTheme === "dark" ? "white" : "gold") : iconTone;
  const officialIconSrc = officialIconSrcByTone[effectiveIconTone];

  const content = (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon ? (
        optimizedLogoUrl ? (
          <Image
            loader={passthroughImageLoader}
            unoptimized
            src={optimizedLogoUrl}
            alt={siteName}
            className={cn(config.icon, "object-contain", iconClassName)}
            width={48}
            height={48}
            priority
          />
        ) : (
          <Image
            src={officialIconSrc}
            alt={`${siteName} crown mark`}
            className={cn(config.icon, "object-contain", iconClassName)}
            width={48}
            height={48}
            priority
          />
        )
      ) : null}
      {showText && (
        <span className={cn(config.text, "font-serif font-normal tracking-tight")}>
          <span className="brand-logo-algarve text-gradient-gold">{siteFirstWord ?? "Algarve"}</span>
          <span className="brand-logo-official text-foreground">{siteRestWords.join(" ") ?? "Official"}</span>
        </span>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link href={l("/")} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
