"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Analytics = dynamic(
  () => import("@vercel/analytics/next").then((mod) => mod.Analytics),
  { ssr: false },
);

const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
  { ssr: false },
);

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function scheduleAfterInitialLoad(callback: () => void) {
  const runtimeWindow = window as IdleWindow;

  if (
    typeof runtimeWindow.requestIdleCallback === "function" &&
    typeof runtimeWindow.cancelIdleCallback === "function"
  ) {
    const idleId = runtimeWindow.requestIdleCallback(callback, { timeout: 4000 });
    return () => runtimeWindow.cancelIdleCallback?.(idleId);
  }

  const timeoutId = window.setTimeout(callback, 2500);
  return () => window.clearTimeout(timeoutId);
}

export function VercelTelemetry() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => scheduleAfterInitialLoad(() => setEnabled(true)), []);

  if (!enabled) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
