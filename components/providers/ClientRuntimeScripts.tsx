"use client";

import { useEffect } from "react";
import {
  applyDefaultConsent,
  loadConsent,
  updateGoogleConsent,
} from "@/lib/consent/consent-mode";

interface ClientRuntimeScriptsProps {
  googleTagId: string;
}

type IdleCallbackWindow = Window & {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

type AnalyticsWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
  __algarveGtagConfigured?: Set<string>;
};

const GOOGLE_TAG_SCRIPT_ID = "google-tag-manager-script";
const THEME_STORAGE_KEY = "algarve-theme";
const CACHE_RECOVERY_EPOCH = "2026-05-04-main-cache-refresh-1";
const CACHE_RECOVERY_STORAGE_KEY = "algarveofficial:cache-recovery-epoch";
const CACHE_RECOVERY_SESSION_KEY = "algarveofficial:cache-recovery-reloaded";

function isStaleAssetError(value: unknown) {
  const text = (() => {
    if (value instanceof Error) return `${value.name} ${value.message}`;
    if (typeof value === "string") return value;
    if (value && typeof value === "object") {
      const candidate = value as { message?: unknown; reason?: unknown; type?: unknown };
      return [candidate.type, candidate.message, candidate.reason]
        .filter((part) => typeof part === "string")
        .join(" ");
    }
    return "";
  })().toLowerCase();

  return (
    text.includes("chunkloaderror") ||
    text.includes("loading chunk") ||
    text.includes("failed to fetch dynamically imported module") ||
    text.includes("importing a module script failed") ||
    text.includes("error loading dynamically imported module")
  );
}

async function clearBrowserControlledCaches() {
  const tasks: Array<Promise<unknown>> = [];

  if ("caches" in window) {
    tasks.push(
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
    );
  }

  if ("serviceWorker" in navigator) {
    tasks.push(
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(
            registrations.map((registration) => registration.unregister()),
          ),
        ),
    );
  }

  await Promise.allSettled(tasks);
}

function hardReloadOnce(reason: string) {
  try {
    const sessionKey = `${CACHE_RECOVERY_SESSION_KEY}:${CACHE_RECOVERY_EPOCH}:${reason}`;
    if (window.sessionStorage.getItem(sessionKey) === "1") return;

    window.sessionStorage.setItem(sessionKey, "1");
    window.setTimeout(() => {
      window.location.reload();
    }, 50);
  } catch {
    window.location.reload();
  }
}

function scheduleCacheRecovery(reason: string) {
  void clearBrowserControlledCaches().finally(() => hardReloadOnce(reason));
}

function recoverOutdatedBrowserCache() {
  try {
    const currentEpoch = window.localStorage.getItem(CACHE_RECOVERY_STORAGE_KEY);
    if (currentEpoch === CACHE_RECOVERY_EPOCH) return;

    window.localStorage.setItem(CACHE_RECOVERY_STORAGE_KEY, CACHE_RECOVERY_EPOCH);
    scheduleCacheRecovery("epoch");
  } catch {
    scheduleCacheRecovery("epoch-storage-unavailable");
  }
}

function installStaleAssetRecoveryListeners() {
  const onError = (event: ErrorEvent) => {
    if (isStaleAssetError(event.error) || isStaleAssetError(event.message)) {
      scheduleCacheRecovery("asset-error");
    }
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (isStaleAssetError(event.reason)) {
      scheduleCacheRecovery("asset-rejection");
    }
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
  };
}

function applyThemeFromStorage() {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "light";
    const resolvedTheme =
      storedTheme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : storedTheme;

    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(resolvedTheme);
  } catch {
    // Ignore localStorage/matchMedia access issues in restrictive environments.
  }
}

function ensureGoogleTagScript(googleTagId: string) {
  if (!googleTagId) return;

  const existingScript = document.getElementById(GOOGLE_TAG_SCRIPT_ID);
  if (existingScript) return;

  const script = document.createElement("script");
  script.id = GOOGLE_TAG_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${googleTagId}`;
  document.head.appendChild(script);
}

function ensureGoogleTagLayer() {
  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
  analyticsWindow.gtag = analyticsWindow.gtag ?? ((...args: unknown[]) => {
    (analyticsWindow.dataLayer ??= []).push(args);
  });
  return analyticsWindow;
}

function configureGoogleTag(googleTagId: string) {
  if (!googleTagId) return;

  const analyticsWindow = ensureGoogleTagLayer();
  applyDefaultConsent();
  const savedConsent = loadConsent();
  if (savedConsent) {
    updateGoogleConsent(savedConsent);
  }

  if (!analyticsWindow.__algarveGtagConfigured) {
    analyticsWindow.__algarveGtagConfigured = new Set<string>();
  }
  if (analyticsWindow.__algarveGtagConfigured.has(googleTagId)) {
    return;
  }

  analyticsWindow.gtag?.("js", new Date());
  analyticsWindow.gtag?.("config", googleTagId, { send_page_view: false });
  analyticsWindow.__algarveGtagConfigured.add(googleTagId);
}

function scheduleGoogleTagInitialization(googleTagId: string) {
  if (!googleTagId) {
    return () => {};
  }

  const runtimeWindow = window as IdleCallbackWindow;

  const run = () => {
    ensureGoogleTagScript(googleTagId);
    configureGoogleTag(googleTagId);
  };

  if (
    typeof runtimeWindow.requestIdleCallback === "function" &&
    typeof runtimeWindow.cancelIdleCallback === "function"
  ) {
    const idleId = runtimeWindow.requestIdleCallback(run, { timeout: 2500 });
    return () => runtimeWindow.cancelIdleCallback?.(idleId);
  }

  const timeoutId = window.setTimeout(run, 1200);
  return () => window.clearTimeout(timeoutId);
}

export function ClientRuntimeScripts({ googleTagId }: ClientRuntimeScriptsProps) {
  useEffect(() => {
    recoverOutdatedBrowserCache();
    return installStaleAssetRecoveryListeners();
  }, []);

  useEffect(() => {
    applyThemeFromStorage();
  }, []);

  useEffect(() => {
    if (!googleTagId) return;
    applyDefaultConsent();
    const savedConsent = loadConsent();
    if (savedConsent) {
      updateGoogleConsent(savedConsent);
    }
    return scheduleGoogleTagInitialization(googleTagId);
  }, [googleTagId]);

  return null;
}
