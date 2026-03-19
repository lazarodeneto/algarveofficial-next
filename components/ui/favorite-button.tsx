import { useState, MouseEvent } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/ui/login-modal";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "glassmorphism" | "solid" | "ghost";
}

export function FavoriteButton({
  isFavorite,
  onToggle,
  className,
  size = "md",
  variant = "glassmorphism",
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    onToggle();
    
    if (isFavorite) {
      toast.success("Removed from favorites");
    } else {
      toast.success("Added to favorites");
    }
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
    glassmorphism: "bg-black/30 backdrop-blur-xl border border-white/20 hover:bg-black/40 hover:border-red-400/30",
    solid: "bg-card/80 hover:bg-card border border-border",
    ghost: "bg-transparent hover:bg-muted/50",
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
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
