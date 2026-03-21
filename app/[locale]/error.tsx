"use client";

import { useEffect } from "react";

interface LocaleErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleError({ error, reset }: LocaleErrorProps) {
  useEffect(() => {
    console.error("Locale route error boundary caught an error:", error);
  }, [error]);

  return (
    <main className="app-container flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-xs uppercase tracking-[0.24em] text-primary">Unexpected Error</p>
      <h1 className="mt-4 font-serif text-4xl text-foreground sm:text-5xl">Something Went Wrong</h1>
      <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
        We couldn&apos;t load this page right now. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center rounded-full border border-primary/40 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
      >
        Try Again
      </button>
    </main>
  );
}
