"use client";

import { useState, MouseEvent } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/ui/login-modal";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useToggleFavorite } from "@/hooks/useToggleFavorite";

type FavoriteType = "listing" | "category" | "city" | "region";

interface FavoriteButtonProps {
  isFavorite: boolean;
  type: FavoriteType; // ✅ NEW
  id: string;         // ✅ NEW
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "glassmorphism" | "solid" | "ghost";
}

export function FavoriteButton({
  isFavorite,
  type,
  id,
  className,
  size = "md",
  variant = "glassmorphism",
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const toggleMutation = useToggleFavorite();

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    toggleMutation.mutate(
      { type, id },
      {
        onSuccess: (res) => {
          if (res.action === "added") {
            toast.success("Added to favorites");
          } else {
            toast.success("Removed from favorites");
          }
        },
        onError: () => {
          toast.error("Something went wrong");
        },
      }
    );
  };

  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const variantClasses = {
    glassmorphism:
      "bg-black/30 backdrop-blur-xl border border-white/20 hover:bg-black/40 hover:border-red-400/30",
    solid: "bg-card/80 hover:bg-card border border-border",
    ghost: "bg-transparent hover:bg-muted/50",
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={toggleMutation.isPending} // ✅ prevents spam clicks
        className={cn(
          sizeClasses[size],
          variantClasses[variant],
          "rounded-full transition-all duration-300",
          className
        )}
      >
        <Heart
          className={cn(
            iconSizes[size],
            "transition-all duration-300",
            isFavorite
              ? "fill-red-500 text-red-500"
              : variant === "glassmorphism"
                ? "text-white hover:text-red-400"
                : "text-muted-foreground hover:text-red-400"
          )}
        />
      </Button>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </>
  );
}