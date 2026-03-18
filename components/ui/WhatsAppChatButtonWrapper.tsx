"use client";
import { useState } from "react";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { WhatsAppChatButton } from "./whatsapp-chat-button";

export function WhatsAppChatButtonWrapper() {
  const [shouldLoadSettings, setShouldLoadSettings] = useState(false);
  const { settings } = useGlobalSettings({
    enabled: shouldLoadSettings,
    keys: ["whatsapp_number", "whatsapp_default_message"],
  });

  const phoneNumber = settings.find((s) => s.key === "whatsapp_number")?.value || "351910000000";
  const defaultMessage =
    settings.find((s) => s.key === "whatsapp_default_message")?.value ||
    "Hello! I'm interested in learning more about your premium services in Algarve.";

  return (
    <WhatsAppChatButton
      phoneNumber={phoneNumber}
      defaultMessage={defaultMessage}
      onFirstOpen={() => setShouldLoadSettings(true)}
    />
  );
}
