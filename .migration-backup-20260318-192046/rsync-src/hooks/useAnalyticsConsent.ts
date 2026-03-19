"use client";
import { useState, useEffect, useCallback } from "react";
import {
  COOKIE_CONSENT_CHANGE_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  saveCookieConsent,
  parseCookieConsentRecord,
} from "@/lib/cookieConsent";

const CONSENT_KEY = "analytics_consent";
const CONSENT_TIMESTAMP_KEY = "analytics_consent_timestamp";

export type ConsentStatus = "pending" | "accepted" | "rejected";

interface ConsentState {
  status: ConsentStatus;
  timestamp: number | null;
}

function readConsentStateFromStorage(): ConsentState {
  if (typeof window === "undefined") {
    return { status: "pending", timestamp: null };
  }

  const storedConsent = localStorage.getItem(CONSENT_KEY) as ConsentStatus | null;
  const storedTimestamp = localStorage.getItem(CONSENT_TIMESTAMP_KEY);

  if (storedConsent === "accepted" || storedConsent === "rejected") {
    return {
      status: storedConsent,
      timestamp: storedTimestamp ? parseInt(storedTimestamp, 10) : null,
    };
  }

  const modernConsent = parseCookieConsentRecord(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
  if (modernConsent) {
    return {
      status: modernConsent.analytics ? "accepted" : "rejected",
      timestamp: modernConsent.timestamp ?? null,
    };
  }

  return { status: "pending", timestamp: null };
}

/**
 * Hook to manage GDPR analytics consent
 * Stores consent in localStorage and provides methods to accept/reject
 */
export function useAnalyticsConsent() {
  const [consent, setConsent] = useState<ConsentState>({
    status: "pending",
    timestamp: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoaded(true);
      return;
    }

    const syncConsent = () => {
      setConsent(readConsentStateFromStorage());
    };

    syncConsent();
    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, syncConsent);
    window.addEventListener("storage", syncConsent);
    setIsLoaded(true);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, syncConsent);
      window.removeEventListener("storage", syncConsent);
    };
  }, []);

  const acceptConsent = useCallback(() => {
    const timestamp = Date.now();
    saveCookieConsent({
      essential: true,
      functional: false,
      analytics: true,
      marketing: false,
      timestamp,
      version: "legacy-analytics-banner-v2",
    });
    localStorage.setItem(CONSENT_KEY, "accepted");
    localStorage.setItem(CONSENT_TIMESTAMP_KEY, timestamp.toString());
    setConsent({ status: "accepted", timestamp });
  }, []);

  const rejectConsent = useCallback(() => {
    const timestamp = Date.now();
    saveCookieConsent({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp,
      version: "legacy-analytics-banner-v2",
    });
    localStorage.setItem(CONSENT_KEY, "rejected");
    localStorage.setItem(CONSENT_TIMESTAMP_KEY, timestamp.toString());
    setConsent({ status: "rejected", timestamp });

    // Clear any existing session ID when consent is rejected
    localStorage.removeItem("algarve_session_id");
  }, []);

  const resetConsent = useCallback(() => {
    localStorage.removeItem(CONSENT_KEY);
    localStorage.removeItem(CONSENT_TIMESTAMP_KEY);
    setConsent({ status: "pending", timestamp: null });
  }, []);

  const hasConsented = consent.status === "accepted";
  const showBanner = isLoaded && consent.status === "pending";

  return {
    consent,
    isLoaded,
    hasConsented,
    showBanner,
    acceptConsent,
    rejectConsent,
    resetConsent,
  };
}

/**
 * Utility function to check if analytics consent has been given
 * Can be used outside of React components
 */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;

  const legacyConsent = localStorage.getItem(CONSENT_KEY);
  if (legacyConsent === "accepted") return true;
  if (legacyConsent === "rejected") return false;

  const modernConsent = parseCookieConsentRecord(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
  if (!modernConsent) return false;
  return modernConsent.analytics;
}
