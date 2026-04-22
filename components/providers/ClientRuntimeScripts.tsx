"use client";

import { useEffect } from "react";

interface ClientRuntimeScriptsProps {
  googleTagId: string;
}

type AnalyticsWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
  __algarveGtagConfigured?: Set<string>;
};

const GOOGLE_TAG_SCRIPT_ID = "google-tag-manager-script";
const THEME_STORAGE_KEY = "algarve-theme";

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

function configureGoogleTag(googleTagId: string) {
  if (!googleTagId) return;

  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  analyticsWindow.gtag =
    analyticsWindow.gtag ||
    function gtag(...args: unknown[]) {
      analyticsWindow.dataLayer?.push(args);
    };

  if (!analyticsWindow.__algarveGtagConfigured) {
    analyticsWindow.__algarveGtagConfigured = new Set<string>();
  }
  if (analyticsWindow.__algarveGtagConfigured.has(googleTagId)) {
    return;
  }

  analyticsWindow.gtag("js", new Date());
  analyticsWindow.gtag("config", googleTagId);
  analyticsWindow.__algarveGtagConfigured.add(googleTagId);
}

export function ClientRuntimeScripts({ googleTagId }: ClientRuntimeScriptsProps) {
  useEffect(() => {
    applyThemeFromStorage();
  }, []);

  useEffect(() => {
    if (!googleTagId) return;
    ensureGoogleTagScript(googleTagId);
    configureGoogleTag(googleTagId);
  }, [googleTagId]);

  return null;
}
