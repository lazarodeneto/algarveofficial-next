"use client";

import { useEffect, useRef, useState } from "react";
import { ConciergeBell } from "lucide-react";

import { toWhatsAppDigits } from "@/lib/contactPhone";

interface WhatsAppChatButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export function WhatsAppChatButton({
  phoneNumber = toWhatsAppDigits("+351927071708"),
  defaultMessage = "Hello! I'm interested in learning more about your premium services in Algarve.",
}: WhatsAppChatButtonProps) {
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsUserScrolling(true);
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsUserScrolling(false);
      }, 180);
    };

    const scrollTarget = document.documentElement;
    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scrollTarget.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleOpenWhatsApp = () => {
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] right-4 z-40 lg:bottom-4 lg:right-6 transition-transform duration-200 ease-out ${
      isUserScrolling ? "lg:translate-y-0 translate-y-[calc(100%+env(safe-area-inset-bottom)+4.5rem+2rem)]" : ""
    }`}>
      <button
        type="button"
        onClick={handleOpenWhatsApp}
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/40 dark:border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] transition-all hover:scale-[1.03] hover:bg-white/30 dark:hover:bg-white/15"
        aria-label="Open concierge on WhatsApp"
        title="Open concierge on WhatsApp"
      >
        <ConciergeBell className="relative z-10 h-7 w-7 text-white drop-shadow-md" />
        <span className="sr-only">Open concierge on WhatsApp</span>
      </button>
    </div>
  );
}
