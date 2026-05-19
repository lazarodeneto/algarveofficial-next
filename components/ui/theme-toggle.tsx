import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
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
          "flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/75 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-all hover:border-primary/30 dark:border-white/70 dark:bg-white/15 dark:hover:border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        <span className="inline-flex transition-[opacity,transform] duration-200 ease-out">
          {isDark ? (
            <Sun className="h-4 w-4 text-white" />
          ) : (
            <Moon className="h-4 w-4 text-foreground/80" />
          )}
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
      <span
        className={cn(
          "relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/30 bg-white/20 shadow-lg backdrop-blur-sm transition-transform duration-200 ease-out",
          isDark ? "translate-x-[30px]" : "translate-x-0",
        )}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-foreground" />
        )}
      </span>
    </button>
  );
}
