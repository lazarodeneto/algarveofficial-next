"use client";

import { supabase } from "@/integrations/supabase/client";
import { hasAnalyticsConsent } from "@/hooks/useAnalyticsConsent";
import { getSessionId } from "@/lib/sessionId";

export type PlatformTrackingEventName =
  | "listing_click"
  | "block_impression"
  | "block_click";

export type PlatformTrackingPayload = {
  listingId?: string;
  cityId?: string;
  categoryId?: string;
  tier?: string;
  position?: number;
  blockId?: string;
  pageId?: string;
  selection?: "manual" | "tier-driven" | "hybrid";
  [key: string]: string | number | boolean | null | undefined;
};

const isBrowser = () => typeof window !== "undefined";

function toPlainEventData(payload: PlatformTrackingPayload): Record<string, string | number | boolean | null> {
  const out: Record<string, string | number | boolean | null> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      out[key] = value;
      continue;
    }
    if (value === null) {
      out[key] = null;
    }
  }

  return out;
}

export async function trackEvent(
  eventName: PlatformTrackingEventName,
  payload: PlatformTrackingPayload,
): Promise<void> {
  if (!isBrowser()) return;
  if (!hasAnalyticsConsent()) return;

  const eventData = toPlainEventData(payload);

  const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    gtag("event", eventName, eventData);
  }

  const sessionId = getSessionId();
  if (!sessionId) return;

  const listingId = typeof payload.listingId === "string" && payload.listingId.trim()
    ? payload.listingId.trim()
    : null;

  const { error } = await supabase.from("analytics_events").insert({
    event_type: eventName,
    event_data: eventData,
    listing_id: listingId,
    session_id: sessionId,
    consent_given: true,
    referrer: document.referrer || null,
    user_agent: navigator.userAgent || null,
  });

  if (error && process.env.NODE_ENV !== "production") {
    console.warn("[analytics] Failed to persist event", eventName, error.message);
  }
}

export async function trackListingClick(payload: {
  listingId: string;
  cityId?: string | null;
  categoryId?: string | null;
  tier?: string | null;
  position?: number;
  blockId?: string;
  pageId?: string;
  selection?: "manual" | "tier-driven" | "hybrid";
}) {
  await trackEvent("listing_click", {
    listingId: payload.listingId,
    cityId: payload.cityId ?? undefined,
    categoryId: payload.categoryId ?? undefined,
    tier: payload.tier ?? undefined,
    position: payload.position,
    blockId: payload.blockId,
    pageId: payload.pageId,
    selection: payload.selection,
  });
}

export async function trackBlockImpression(payload: {
  blockId: string;
  pageId: string;
  selection?: "manual" | "tier-driven" | "hybrid";
}) {
  await trackEvent("block_impression", {
    blockId: payload.blockId,
    pageId: payload.pageId,
    selection: payload.selection,
  });
}
