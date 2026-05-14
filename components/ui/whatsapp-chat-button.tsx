"use client";

import { ConciergeBell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useMobileChromeScrollState } from "@/hooks/useMobileChromeScrollState";

import { toWhatsAppDigits } from "@/lib/contactPhone";

interface WhatsAppChatButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export function WhatsAppChatButton({
  phoneNumber = toWhatsAppDigits("+351927071708"),
  defaultMessage = "Hello! I'm interested in learning more about your premium services in Algarve.",
}: WhatsAppChatButtonProps) {
  const { isUserScrolling } = useMobileChromeScrollState();

  const handleOpenWhatsApp = () => {
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+5.7rem)] right-4 z-40 lg:bottom-4 lg:right-6 transition-transform duration-200 ease-out",
        isUserScrolling &&
          "translate-y-[calc(100%+env(safe-area-inset-bottom)+5.7rem+1rem)] lg:translate-y-0",
      )}
    >
      <Button
        type="button"
        variant="gold"
        size="icon"
        onClick={handleOpenWhatsApp}
        className="pointer-events-auto h-14 w-14 rounded-full [&_svg]:size-7"
        aria-label="Open concierge on WhatsApp"
        title="Open concierge on WhatsApp"
      >
        <ConciergeBell className="relative z-10" />
        <span className="sr-only">Open concierge on WhatsApp</span>
      </Button>
    </div>
  );
}
