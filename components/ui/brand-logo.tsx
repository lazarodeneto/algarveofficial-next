"use client";
import { Link } from "next/link";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLangPrefix } from "@/hooks/useLangPrefix";
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
  const logoUrl = settings?.logo_url;

  const content = (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon ? (
        logoUrl ? (
          <img src={logoUrl} alt={settings?.site_name || "AlgarveOfficial"} className={cn(config.icon, "object-contain", iconClassName)} width={48} height={48} loading="eager" />
        ) : (
          <Crown className={cn(config.icon, "text-primary", iconClassName)} />
        )
      ) : null}
      {showText && (
        <span className={cn(config.text, "font-serif font-normal tracking-tight")}>
          <span className="brand-logo-algarve text-gradient-gold">{settings?.site_name?.split(" ")[0] || "Algarve"}</span>
          <span className="brand-logo-official text-foreground">{settings?.site_name?.split(" ").slice(1).join(" ") || "Official"}</span>
        </span>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link href={langPrefix || "/"} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
