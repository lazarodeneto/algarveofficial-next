"use client";

import { Button } from "@/components/ui/button";
import { openCookiePreferences } from "@/lib/cookieConsent";

interface CookieSettingsButtonProps {
  label?: string;
  className?: string;
}

export function CookieSettingsButton({
  label = "Cookie Settings",
  className,
}: CookieSettingsButtonProps) {
  return (
    <Button
      type="button"
      variant="gold"
      className={className}
      onClick={openCookiePreferences}
    >
      {label}
    </Button>
  );
}
