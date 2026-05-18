"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { stripLocaleFromPathname } from "@/lib/i18n/routing";

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
