"use client";
import { Star } from "lucide-react";
import { GoogleIcon } from "@/components/ui/google-icon";
import { cn } from "@/lib/utils";

interface GoogleRatingBadgeProps {
  rating: number;
  reviewCount?: number | null;
  variant?: "overlay" | "themed";
  size?: "sm" | "default";
  className?: string;
}

export function GoogleRatingBadge({
  rating,
  reviewCount,
  variant = "overlay",
  size = "default",
  className,
}: GoogleRatingBadgeProps) {
  const baseStyles = "inline-flex items-center gap-1.5";

  const variantStyles = {
    overlay: "rounded-full bg-black/70 backdrop-blur-sm",
    themed: "rounded bg-card border border-border",
  };

  const sizeStyles = {
    sm: "px-2 py-1",
    default: "px-2.5 py-1.5",
  };

  const textStyles = {
    overlay: "text-white",
    themed: "text-foreground",
  };

  const reviewCountStyles = {
    overlay: "text-white/70",
    themed: "text-muted-foreground",
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      <GoogleIcon className="h-3.5 w-3.5" />
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      <span className={cn("text-xs font-medium", textStyles[variant])}>
        {rating}
        {reviewCount != null && (
          <span className={cn("ml-0.5", reviewCountStyles[variant])}>
            ({reviewCount})
          </span>
        )}
      </span>
    </div>
  );
}
