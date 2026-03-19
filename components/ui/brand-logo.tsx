"use client";

import Image from "next/image";
import { Link } from "react-router-dom";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLangPrefix } from "@/hooks/useLangPrefix";
import { useHydrated } from "@/hooks/useHydrated";
import { useSiteSettings } from "@/hooks/useSiteSettings";

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

export function BrandLogo({
  size = "md",
  showIcon = false,
  showText = true,
  asLink = true,
  className,
  iconClassName,
}: BrandLogoProps) {
  const config = sizeConfig[size];
  const langPrefix = useLangPrefix();
  const { settings } = useSiteSettings();
  const hydrated = useHydrated();
  const hydratedSettings = hydrated ? settings : null;
  const logoUrl = hydratedSettings?.logo_url;
  const siteName = hydratedSettings?.site_name || "Algarve Official";
  const [siteFirstWord, ...siteRestWords] = siteName.split(" ");

  const content = (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon ? (
        logoUrl ? (
          <Image
            loader={passthroughImageLoader}
            unoptimized
            src={logoUrl}
            alt={siteName}
            className={cn(config.icon, "object-contain", iconClassName)}
            width={48}
            height={48}
            priority
          />
        ) : (
          <Crown className={cn(config.icon, "text-primary", iconClassName)} />
        )
      ) : null}
      {showText && (
        <span className={cn(config.text, "font-serif font-normal tracking-tight")}>
          <span className="brand-logo-algarve text-gradient-gold">{siteFirstWord || "Algarve"}</span>
          <span className="brand-logo-official text-foreground">{siteRestWords.join(" ") || "Official"}</span>
        </span>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link to={langPrefix || "/"} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
