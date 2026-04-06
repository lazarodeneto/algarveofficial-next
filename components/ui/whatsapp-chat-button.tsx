"use client";

import { useEffect, useRef, useState } from "react";
import { ConciergeBell } from "lucide-react";
import { cn } from "@/lib/utils";

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

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
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
    <div
      className={cn(
        "pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] right-4 z-40 lg:bottom-4 lg:right-6 transition-transform duration-200 ease-out",
        isUserScrolling &&
          "translate-y-[calc(100%+env(safe-area-inset-bottom)+4.5rem+1rem)] lg:translate-y-0",
      )}
    >
      <button
        type="button"
        onClick={handleOpenWhatsApp}
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full border border-[hsl(43_74%_49%/0.45)] bg-[linear-gradient(145deg,hsla(43,74%,49%,0.34),hsla(43,74%,49%,0.16))] backdrop-blur-xl shadow-[0_10px_30px_-14px_rgba(199,163,90,0.8)] transition-all hover:scale-[1.03] hover:border-[hsl(43_74%_49%/0.62)] hover:bg-[linear-gradient(145deg,hsla(43,74%,49%,0.44),hsla(43,74%,49%,0.22))]"
        aria-label="Open concierge on WhatsApp"
        title="Open concierge on WhatsApp"
      >
        <ConciergeBell className="relative z-10 h-7 w-7 text-[hsl(43_82%_68%)] drop-shadow-[0_1px_6px_rgba(199,163,90,0.65)]" />
        <span className="sr-only">Open concierge on WhatsApp</span>
      </button>
    </div>
  );
}
