"use client";

import { Button } from "@/components/ui/Button";
import { Cookie } from "lucide-react";
import { useTranslation } from "react-i18next";
import { openCookiePreferences } from "@/lib/cookieConsent";

export function CookiePreferencesButton() {
  const { t } = useTranslation();

  return (
    <Button onClick={openCookiePreferences}>
      <Cookie className="w-4 h-4 mr-2" />
      {t("cookie.managePreferences")}
    </Button>
  );
}
