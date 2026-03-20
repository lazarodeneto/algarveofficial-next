"use client";

import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { openCookiePreferences } from "@/lib/cookieConsent";

export function CookiePreferencesButton() {
  return (
    <Button onClick={openCookiePreferences}>
      <Cookie className="w-4 h-4 mr-2" />
      Manage Cookie Preferences
    </Button>
  );
}
