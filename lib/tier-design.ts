import { cn } from "@/lib/utils";

export type ListingTier = "unverified" | "verified" | "signature" | "curated";

export interface TierConfig {
  name: string;
  card: {
    base: string;
    hover: string;
    border: string;
    shadow: string;
  };
  badge: {
    base: string;
    sizeSm: string;
    sizeMd: string;
    icon: string;
  };
  image: {
    zoom: string;
    overlay: string;
  };
  content: {
    titleWeight: string;
    titleHover: string;
  };
  spacing: {
    padding: string;
    gap: string;
  };
}

const TIER_CONFIG: Record<ListingTier, TierConfig> = {
  unverified: {
    name: "unverified",
    card: {
      base: "bg-card border-border/40 rounded-xl",
      hover: "hover:shadow-md hover:border-border/60",
      border: "border border-border/40",
      shadow: "shadow-sm",
    },
    badge: {
      base: "hidden",
      sizeSm: "",
      sizeMd: "",
      icon: "",
    },
    image: {
      zoom: "group-hover:scale-[1.03]",
      overlay: "",
    },
    content: {
      titleWeight: "font-normal",
      titleHover: "group-hover:text-foreground/90",
    },
    spacing: {
      padding: "p-4",
      gap: "gap-3",
    },
  },
  verified: {
    name: "verified",
    card: {
      base: "bg-card border-emerald-200/50 dark:border-emerald-800/30 rounded-xl",
      hover: "hover:shadow-lg hover:-translate-y-0.5 hover:border-emerald-300/60 dark:hover:border-emerald-700/50",
      border: "border border-emerald-200/50 dark:border-emerald-800/30",
      shadow: "shadow-md shadow-emerald-950/5",
    },
    badge: {
      base: "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white ring-1 ring-emerald-300/50 dark:ring-emerald-600/30 shadow-md shadow-emerald-950/10",
      sizeSm: "gap-1.5 px-2.5 py-1 text-[10px]",
      sizeMd: "gap-2 px-3.5 py-1.5 text-[11px]",
      icon: "",
    },
    image: {
      zoom: "group-hover:scale-[1.05]",
      overlay: "opacity-60 group-hover:opacity-80",
    },
    content: {
      titleWeight: "font-medium",
      titleHover: "group-hover:text-emerald-700 dark:group-hover:text-emerald-400",
    },
    spacing: {
      padding: "p-4",
      gap: "gap-3",
    },
  },
  signature: {
    name: "signature",
    card: {
      base: "bg-card border-[#C7A35A]/30 dark:border-[#C7A35A]/40 rounded-2xl",
      hover: "hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01] hover:border-[#C7A35A]/50",
      border: "border border-[#C7A35A]/30 dark:border-[#C7A35A]/40",
      shadow: "shadow-lg shadow-[#C7A35A]/10",
    },
    badge: {
      base: "bg-gradient-to-r from-[#C7A35A] via-[#D4AF37] to-[#C7A35A] text-black ring-1 ring-[#C7A35A]/50 shadow-lg shadow-[#C7A35A]/30",
      sizeSm: "gap-1.5 px-3 py-1 text-[10px]",
      sizeMd: "gap-2 px-4 py-1.5 text-[11px]",
      icon: "",
    },
    image: {
      zoom: "group-hover:scale-[1.08]",
      overlay: "opacity-70 group-hover:opacity-90",
    },
    content: {
      titleWeight: "font-light italic",
      titleHover: "group-hover:text-[#C7A35A]",
    },
    spacing: {
      padding: "p-5",
      gap: "gap-4",
    },
  },
  curated: {
    name: "curated",
    card: {
      base: "bg-gradient-to-br from-card via-[#FAF9F6] to-[#F5F0E8] dark:from-card dark:via-[#1a1a18] dark:to-[#1f1d18] border-[#C7A35A]/40 dark:border-[#C7A35A]/50 rounded-3xl overflow-hidden",
      hover: "hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:-translate-y-1.5 hover:scale-[1.02] hover:border-[#C7A35A]/60",
      border: "border-2 border-[#C7A35A]/40 dark:border-[#C7A35A]/50",
      shadow: "shadow-xl shadow-[#C7A35A]/15",
    },
    badge: {
      base: "bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] text-[#C7A35A] ring-1 ring-[#C7A35A]/60 shadow-xl shadow-black/20 backdrop-blur-md",
      sizeSm: "gap-2 px-4 py-1.5 text-[10px] tracking-[0.15em]",
      sizeMd: "gap-2.5 px-5 py-2 text-[11px] tracking-[0.18em]",
      icon: "",
    },
    image: {
      zoom: "group-hover:scale-[1.1]",
      overlay: "opacity-80 group-hover:opacity-95",
    },
    content: {
      titleWeight: "font-light italic",
      titleHover: "group-hover:text-[#C7A35A]",
    },
    spacing: {
      padding: "p-6",
      gap: "gap-5",
    },
  },
};

export function getTier(tier: string | null | undefined): ListingTier {
  if (tier === "signature" || tier === "curated") return tier as ListingTier;
  if (tier === "verified") return "verified";
  return "unverified";
}

export function getTierConfig(tier: string | null | undefined): TierConfig {
  return TIER_CONFIG[getTier(tier)];
}

export function getTierCardClasses(tier: string | null | undefined): string {
  const config = getTierConfig(tier);
  return cn(
    "relative transition-all duration-300 ease-out",
    config.card.base,
    config.card.hover,
    config.card.shadow
  );
}

export function getTierCardBorder(tier: string | null | undefined): string {
  const config = getTierConfig(tier);
  return config.card.border;
}

export function getTierCardShadow(tier: string | null | undefined): string {
  const config = getTierConfig(tier);
  return config.card.shadow;
}

export function getTierBadgeClasses(tier: string | null | undefined, size: "sm" | "md" = "md"): string {
  const config = getTierConfig(tier);
  
  if (tier === "unverified" || !tier) return "hidden";
  
  const baseClasses = "inline-flex items-center rounded-full font-bold uppercase backdrop-blur-sm";
  const sizeClass = size === "sm" ? config.badge.sizeSm : config.badge.sizeMd;
  
  if (tier === "verified") {
    return cn(baseClasses, sizeClass, "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white ring-1 ring-emerald-300/50 shadow-md shadow-emerald-950/10");
  }
  
  if (tier === "signature") {
    return cn(baseClasses, sizeClass, "bg-gradient-to-r from-[#C7A35A] via-[#D4AF37] to-[#C7A35A] text-black ring-1 ring-[#C7A35A]/50 shadow-lg shadow-[#C7A35A]/30");
  }
  
  if (tier === "curated") {
    return cn(baseClasses, sizeClass, "bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] text-[#C7A35A] ring-1 ring-[#C7A35A]/60 shadow-xl shadow-black/20");
  }
  
  return "";
}

export function getTierBadgeIcon(tier: string | null | undefined): boolean {
  return tier === "verified" || tier === "signature" || tier === "curated";
}

export function getTierImageZoom(tier: string | null | undefined): string {
  const config = getTierConfig(tier);
  return config.image.zoom;
}

export function getTierImageOverlay(tier: string | null | undefined): string {
  const config = getTierConfig(tier);
  return cn(
    "absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent transition-opacity duration-300",
    config.image.overlay
  );
}

export function getTierTitleClasses(tier: string | null | undefined): string {
  const config = getTierConfig(tier);
  return cn(
    "font-serif leading-tight line-clamp-1",
    config.content.titleWeight,
    config.content.titleHover
  );
}

export function getTierSpacing(tier: string | null | undefined): { padding: string; gap: string } {
  const config = getTierConfig(tier);
  return config.spacing;
}

export function isPremiumTier(tier: string | null | undefined): boolean {
  return tier === "signature" || tier === "curated";
}

export function isTrustedTier(tier: string | null | undefined): boolean {
  return tier === "verified" || tier === "signature" || tier === "curated";
}
