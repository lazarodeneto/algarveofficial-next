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
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full border border-[#C7A35A] bg-[#C7A35A] text-amber-950 shadow-lg shadow-amber-700/15 transition-all hover:scale-[1.03] hover:bg-[#B79245] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Open concierge on WhatsApp"
        title="Open concierge on WhatsApp"
      >
        <ConciergeBell className="relative z-10 h-7 w-7 text-amber-950" />
        <span className="sr-only">Open concierge on WhatsApp</span>
      </button>
    </div>
  );
}
