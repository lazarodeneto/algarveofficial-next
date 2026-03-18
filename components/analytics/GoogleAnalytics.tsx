import { useEffect, useRef } from "react";
import { useLocation } from "next/link";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { useSiteColors } from "@/hooks/useSiteSettings"; // Using lightweight hook to get settings

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

const GOOGLE_ANALYTICS_SCRIPT_ID = "google-analytics-script";

function expireCookie(name: string, domain?: string) {
  const domainPart = domain ? `; domain=${domain}` : "";
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}; SameSite=Lax`;
}

function clearGoogleAnalyticsCookies() {
  if (typeof document === "undefined") return;

  const cookieNames = document.cookie
    .split(";")
    .map((entry) => entry.trim().split("=")[0])
    .filter((name) => name && (name.startsWith("_ga") || name.startsWith("_gid") || name.startsWith("_gat") || name.startsWith("_gac_")));

  const hostname = window.location.hostname;
  const hostnameParts = hostname.split(".").filter(Boolean);
  const rootDomain =
    hostnameParts.length >= 2 ? `.${hostnameParts.slice(-2).join(".")}` : undefined;
  const domains = [undefined, hostname, `.${hostname}`, rootDomain].filter(
    (value, index, array): value is string | undefined => array.indexOf(value) === index,
  );

  for (const cookieName of cookieNames) {
    for (const domain of domains) {
      expireCookie(cookieName, domain);
    }
  }
}

function teardownGoogleAnalytics(measurementId?: string) {
  if (typeof window === "undefined") return;

  if (measurementId) {
    window[`ga-disable-${measurementId}`] = true;
  }

  const existingScript = document.getElementById(GOOGLE_ANALYTICS_SCRIPT_ID);
  existingScript?.remove();
  clearGoogleAnalyticsCookies();
}

/**
 * Google Analytics 4 integration.
 * Only loads the gtag.js script after the user accepts cookies (GDPR).
 * Sends page_view events on route changes.
 */
export function GoogleAnalytics() {
  const { canUseCategory } = useCookieConsent();
  const location = useLocation();
  const scriptLoaded = useRef(false);
  const settings = useSiteColors(); // This returns the settings object

  // Use dynamic ID from settings or fallback to hardcoded (migration safety)
  // const GA_MEASUREMENT_ID = "G-T989074CQL"; 
  const GA_MEASUREMENT_ID = settings?.ga_measurement_id || "G-T989074CQL";
  const hasAnalyticsConsent = canUseCategory("analytics");

  // Load gtag.js when consent is given
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    if (!hasAnalyticsConsent) {
      teardownGoogleAnalytics(GA_MEASUREMENT_ID);
      scriptLoaded.current = false;
      return;
    }

    if (scriptLoaded.current) {
      window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
      return;
    }

    // Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false, // We send manually on route change
      anonymize_ip: true,
    });

    // Inject the script
    const script = document.createElement("script");
    script.id = GOOGLE_ANALYTICS_SCRIPT_ID;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);
    scriptLoaded.current = true;
  }, [hasAnalyticsConsent, GA_MEASUREMENT_ID]); // Re-run if ID changes (though usually static per session)

  // Track page views on route change
  useEffect(() => {
    if (!hasAnalyticsConsent || !scriptLoaded.current || !window.gtag) return;

    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location.pathname, location.search, hasAnalyticsConsent]);

  return null;
}
