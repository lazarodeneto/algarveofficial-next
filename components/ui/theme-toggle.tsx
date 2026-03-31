import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "default" | "header";
  className?: string;
}

export function ThemeToggle({ variant = "default", className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (variant === "header") {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "relative flex h-10 w-[4.65rem] items-center rounded-full border border-black/10 bg-white/75 p-1 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-all hover:border-primary/30 dark:border-white/25 dark:bg-white/15 dark:hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        role="switch"
        aria-checked={isDark}
      >
        <motion.span
          className="absolute top-1 z-0 h-8 w-8 rounded-full bg-primary/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_8px_18px_-12px_rgba(184,134,11,0.55)] dark:bg-primary/22"
          animate={{ x: isDark ? 34 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
        />
        <span className="relative z-10 flex h-8 w-8 items-center justify-center">
          <Sun className={cn("h-4 w-4 transition-colors", isDark ? "text-white/60" : "text-primary")} />
        </span>
        <span className="relative z-10 flex h-8 w-8 items-center justify-center">
          <Moon className={cn("h-4 w-4 transition-colors", isDark ? "text-foreground" : "text-muted-foreground/70")} />
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative flex h-8 w-16 items-center rounded-full glass-box border border-white/20 p-1 transition-all hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      role="switch"
      aria-checked={isDark}
    >
      {/* Track icons - subtle and muted */}
      <Sun className="absolute left-2 h-4 w-4 text-foreground/40" />
      <Moon className="absolute right-2 h-4 w-4 text-foreground/40" />
      
      {/* Sliding thumb with glass effect */}
      <motion.div
        className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg"
        animate={{ x: isDark ? 30 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-foreground" />
        )}
      </motion.div>
    </button>
  );
}
