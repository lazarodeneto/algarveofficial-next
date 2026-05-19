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

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

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

function runWhenVisible(callback: () => void) {
  if (document.visibilityState === "visible") {
    callback();
    return () => {};
  }

  const onVisible = () => {
    if (document.visibilityState !== "visible") return;
    document.removeEventListener("visibilitychange", onVisible);
    callback();
  };

  document.addEventListener("visibilitychange", onVisible);
  return () => document.removeEventListener("visibilitychange", onVisible);
}

function scheduleAfterInitialWork(callback: () => void) {
  const runtimeWindow = window as IdleWindow;
  let cleanupVisibility = () => {};
  const run = () => {
    cleanupVisibility = runWhenVisible(callback);
  };

  if (
    typeof runtimeWindow.requestIdleCallback === "function" &&
    typeof runtimeWindow.cancelIdleCallback === "function"
  ) {
    const idleId = runtimeWindow.requestIdleCallback(run, { timeout: 5000 });
    return () => {
      runtimeWindow.cancelIdleCallback?.(idleId);
      cleanupVisibility();
    };
  }

  const timeoutId = window.setTimeout(run, 3000);
  return () => {
    window.clearTimeout(timeoutId);
    cleanupVisibility();
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
