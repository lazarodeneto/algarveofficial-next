"use client";

/* eslint-disable no-console */

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { RouteMessageState } from "@/components/layout/RouteMessageState";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function getErrorDiagnostics(error: Error & { digest?: string }) {
  return {
    name: error.name,
    message: error.message,
    digest: error.digest,
    stack: typeof error.stack === "string" ? error.stack.split("\n").slice(0, 4).join("\n") : undefined,
  };
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error("App route error boundary caught an error:", getErrorDiagnostics(error));
  }, [error]);

  return (
    <main id="main-content" className="app-container py-20">
      <RouteMessageState
        eyebrow={t("errorPage.title")}
        title={t("errorPage.eyebrow")}
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
