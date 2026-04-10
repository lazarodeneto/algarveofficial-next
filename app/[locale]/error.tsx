"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { RouteMessageState } from "@/components/layout/RouteMessageState";

interface LocaleErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleError({ error, reset }: LocaleErrorProps) {
  useEffect(() => {
    console.error("Locale route error boundary caught an error:", error);
  }, [error]);

  return (
    <main className="app-container py-20">
      <RouteMessageState
        eyebrow="Unexpected Error"
        title="Something Went Wrong"
        description="We couldn&apos;t load this page right now. Please try again."
        icon={<AlertTriangle className="h-10 w-10" />}
        minHeightClassName="min-h-[70vh]"
        actions={(
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center rounded-full border border-primary/40 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
          >
            Try Again
          </button>
        )}
      />
    </main>
  );
}
