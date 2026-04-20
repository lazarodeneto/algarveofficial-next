"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "exit-intent-shown";

export function useExitIntent(enabled: boolean = true) {
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // Delay registration so the hook doesn't fire immediately on page load
    // (browser sometimes sends a spurious mouseleave right after mount).
    const timer = setTimeout(() => {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          setTriggered(true);
          sessionStorage.setItem(SESSION_KEY, "1");
        }
      };
      document.addEventListener("mouseleave", handleMouseLeave);
      // Store cleanup reference
      (window as any).__exitIntentCleanup = () =>
        document.removeEventListener("mouseleave", handleMouseLeave);
    }, 3000);

    return () => {
      clearTimeout(timer);
      (window as any).__exitIntentCleanup?.();
    };
  }, [enabled]);

  const dismiss = () => setTriggered(false);

  return { triggered, dismiss };
}
