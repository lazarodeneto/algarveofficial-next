"use client";

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
  const handleOpenWhatsApp = () => {
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] right-4 z-40 lg:bottom-4 lg:right-6">
      <button
        type="button"
        onClick={handleOpenWhatsApp}
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_18px_38px_-18px_rgba(15,23,42,0.55)] transition-all hover:scale-[1.03] hover:shadow-[0_22px_46px_-18px_rgba(15,23,42,0.6)]"
        aria-label="Open concierge on WhatsApp"
        title="Open concierge on WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-black/10 pointer-events-none" />
        <span className="absolute inset-1 rounded-full border border-white/20 pointer-events-none" />
        <ConciergeBell className="relative z-10 h-7 w-7 drop-shadow-sm" />
        <span className="sr-only">Open concierge on WhatsApp</span>
      </button>
    </div>
  );
}
