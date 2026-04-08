"use client";

import { usePathname } from "next/navigation";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { PRIMARY_WHATSAPP_NUMBER, toWhatsAppDigits } from "@/lib/contactPhone";
import { useHydrated } from "@/hooks/useHydrated";
import { stripLocaleFromPathname } from "@/lib/i18n/routing";
import { WhatsAppChatButton } from "./whatsapp-chat-button";

const HIDDEN_ROUTE_PREFIXES = ["/admin", "/owner", "/dashboard"];

export function WhatsAppChatButtonWrapper() {
  const pathname = usePathname() || "/";
  const mounted = useHydrated();
  const { settings } = useGlobalSettings({
    enabled: mounted,
    keys: ["whatsapp_number", "whatsapp_default_message"],
  });
  const barePath = stripLocaleFromPathname(pathname);
  const shouldHide = HIDDEN_ROUTE_PREFIXES.some((prefix) => barePath.startsWith(prefix));

  const phoneNumber = toWhatsAppDigits(
    settings.find((s) => s.key === "whatsapp_number")?.value || PRIMARY_WHATSAPP_NUMBER,
  );
  const defaultMessage =
    settings.find((s) => s.key === "whatsapp_default_message")?.value ||
    "Hello! I'm interested in learning more about your premium services in Algarve.";

  if (!mounted || shouldHide) {
    return null;
  }

  return <WhatsAppChatButton phoneNumber={phoneNumber} defaultMessage={defaultMessage} />;
}
