"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const FloatingCookieSettingsButton = dynamic(
  () =>
    import("@/components/gdpr/FloatingCookieSettingsButton").then(
      (module) => module.FloatingCookieSettingsButton,
    ),
  { ssr: false },
);

const WhatsAppChatButtonWrapper = dynamic(
  () =>
    import("@/components/ui/WhatsAppChatButtonWrapper").then(
      (module) => module.WhatsAppChatButtonWrapper,
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

function scheduleAfterInitialWork(callback: () => void) {
  const runtimeWindow = window as IdleWindow;

  if (
    typeof runtimeWindow.requestIdleCallback === "function" &&
    typeof runtimeWindow.cancelIdleCallback === "function"
  ) {
    const idleId = runtimeWindow.requestIdleCallback(callback, { timeout: 5000 });
    return () => runtimeWindow.cancelIdleCallback?.(idleId);
  }

  const timeoutId = window.setTimeout(callback, 3000);
  return () => window.clearTimeout(timeoutId);
}

export function DeferredPublicWidgets() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => scheduleAfterInitialWork(() => setEnabled(true)), []);

  if (!enabled) return null;

  return (
    <>
      <WhatsAppChatButtonWrapper />
      <FloatingCookieSettingsButton />
    </>
  );
}
