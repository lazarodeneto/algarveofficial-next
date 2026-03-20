"use client";

import { useEffect } from "react";

interface CookieInfo {
  name: string;
  category: "essential" | "functional" | "analytics" | "marketing";
  description: string;
  duration: string;
}

const KNOWN_COOKIES: Record<string, CookieInfo> = {
  "cookie_consent_preferences": {
    name: "Cookie Consent Preferences",
    category: "essential",
    description: "Stores your cookie consent choices",
    duration: "1 year",
  },
  "_ga": {
    name: "Google Analytics",
    category: "analytics",
    description: "Distinguishes users and tracks site visits",
    duration: "2 years",
  },
  "_gid": {
    name: "Google Analytics",
    category: "analytics",
    description: "Distinguishes users and tracks site visits",
    duration: "24 hours",
  },
  "_gat": {
    name: "Google Analytics",
    category: "analytics",
    description: "Rate limiting requests",
    duration: "1 minute",
  },
  "_gat_gtag_*": {
    name: "Google Analytics",
    category: "analytics",
    description: "Rate limiting requests",
    duration: "1 minute",
  },
  "_gac_*": {
    name: "Google Analytics",
    category: "analytics",
    description: "Campaign-related information",
    duration: "90 days",
  },
  "algarve-theme": {
    name: "Theme Preference",
    category: "functional",
    description: "Stores your light/dark mode preference",
    duration: "1 year",
  },
  "algarve_session_id": {
    name: "Session ID",
    category: "essential",
    description: "Anonymous session identifier",
    duration: "Session",
  },
  "sb-access-token": {
    name: "Supabase Auth",
    category: "essential",
    description: "Authentication token",
    duration: "Session",
  },
  "sb-refresh-token": {
    name: "Supabase Auth",
    category: "essential",
    description: "Token refresh session",
    duration: "30 days",
  },
};

export function CookieScanner() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const scanCookies = () => {
      const cookies = document.cookie.split(";").map((c) => c.trim());
      const detectedCookies: string[] = [];

      cookies.forEach((cookie) => {
        const name = cookie.split("=")[0];
        if (name && !detectedCookies.includes(name)) {
          detectedCookies.push(name);
        }
      });

      if (process.env.NODE_ENV === "development" && detectedCookies.length > 0) {
        console.group("[GDPR Cookie Scanner] Detected Cookies:");
        detectedCookies.forEach((name) => {
          const known = Object.entries(KNOWN_COOKIES).find(
            ([pattern]) =>
              pattern === name || (pattern.includes("*") && name.startsWith(pattern.replace("*", "")))
          );
          const info = known ? known[1] : null;
          console.log(
            `${name}: ${info ? `${info.category} - ${info.description}` : "Unknown"}`
          );
        });
        console.groupEnd();
      }
    };

    scanCookies();

    const observer = new MutationObserver(scanCookies);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
