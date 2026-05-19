"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { stripLocaleFromPathname } from "@/lib/i18n/routing";

const FloatingCookieSettingsButton = dynamic(
  withDeferredImportRetry(() =>
    import("@/components/gdpr/FloatingCookieSettingsButton").then(
      (module) => module.FloatingCookieSettingsButton,
    ),
  ),
  { ssr: false },
);

const WhatsAppChatButtonWrapper = dynamic(
  withDeferredImportRetry(() =>
    import("@/components/ui/WhatsAppChatButtonWrapper").then(
      (module) => module.WhatsAppChatButtonWrapper,
    ),
  ),
  { ssr: false },
);

function isRetriableChunkError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();
  return (
    normalized.includes("chunkloaderror") ||
    normalized.includes("loading chunk") ||
    normalized.includes("failed to fetch dynamically imported module") ||
    normalized.includes("importing a module script failed") ||
    normalized.includes("error loading dynamically imported module")
  );
}

function withDeferredImportRetry<T>(loader: () => Promise<T>) {
  return async () => {
    try {
      return await loader();
    } catch (error) {
      if (!isRetriableChunkError(error)) {
        throw error;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 250));
      return loader();
    }
  };
}

function scheduleAfterInitialWork(callback: () => void) {
  let disposed = false;
  let timeoutId: number | null = null;

  const run = () => {
    if (disposed) return;
    disposed = true;
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
    window.removeEventListener("pointerdown", run);
    window.removeEventListener("keydown", run);
    window.removeEventListener("scroll", run);
    callback();
  };

  timeoutId = window.setTimeout(run, 15000);
  window.addEventListener("pointerdown", run, { once: true, passive: true });
  window.addEventListener("keydown", run, { once: true });
  window.addEventListener("scroll", run, { once: true, passive: true });

  return () => {
    disposed = true;
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
    window.removeEventListener("pointerdown", run);
    window.removeEventListener("keydown", run);
    window.removeEventListener("scroll", run);
  };
}

export function DeferredPublicWidgets() {
  const pathname = usePathname() ?? "/";
  const [enabled, setEnabled] = useState(false);
  const barePath = stripLocaleFromPathname(pathname);

  useEffect(() => scheduleAfterInitialWork(() => setEnabled(true)), []);

  if (barePath.startsWith("/blog-writer")) return null;
  if (!enabled) return null;

  return (
    <>
      <WhatsAppChatButtonWrapper />
      <FloatingCookieSettingsButton />
    </>
  );
}
