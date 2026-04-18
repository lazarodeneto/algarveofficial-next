"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { RouteMessageState } from "@/components/layout/RouteMessageState";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("App route error boundary caught an error:", error);
  }, [error]);

  return (
    <main className="app-container py-20">
      <RouteMessageState
        eyebrow="Something went wrong"
        title="Unexpected Error"
        description="We couldn’t load this page right now. Please try again."
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
