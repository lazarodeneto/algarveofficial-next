"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { RouteMessageState } from "@/components/layout/RouteMessageState";

interface LocaleErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleError({ error, reset }: LocaleErrorProps) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error("Locale route error boundary caught an error:", error);
  }, [error]);

  return (
    <main id="main-content" className="app-container py-20">
      <RouteMessageState
        eyebrow={t("errorPage.eyebrow")}
        title={t("errorPage.title")}
        description={t("errorPage.description")}
        icon={<AlertTriangle className="h-10 w-10" />}
        minHeightClassName="min-h-[70vh]"
        actions={(
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center rounded-full border border-primary/40 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
          >
            {t("errorPage.tryAgain")}
          </button>
        )}
      />
    </main>
  );
}
