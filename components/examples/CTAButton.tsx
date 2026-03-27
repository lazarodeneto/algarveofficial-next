"use client";

import { useTranslation } from "react-i18next";
import { useLocaleRouter } from "@/hooks/useLocaleRouter";

export function CTAButton() {
  const { t } = useTranslation();
  const { push } = useLocaleRouter();

  return (
    <button
      type="button"
      onClick={() => push("/contact")}
      className="rounded-lg border px-4 py-2"
    >
      {t("nav.contact", "Contact")}
    </button>
  );
}
