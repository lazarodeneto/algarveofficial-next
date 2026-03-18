/**
 * Session ID utility for view tracking deduplication
 * Generates or retrieves a persistent session ID stored in localStorage
 * GDPR compliant: Only creates session ID if user has consented to analytics
 */

import { hasAnalyticsConsent } from '@/hooks/useAnalyticsConsent';

const SESSION_ID_KEY = 'algarve_session_id';

/**
 * Get or create a session ID for view tracking
 * Session ID persists across page loads but not across browsers/devices
 * Returns null if:
 * - User has not consented to analytics tracking
 */
export function getSessionId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Check GDPR consent before creating/returning session ID
  if (!hasAnalyticsConsent()) {
    return null;
  }

  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Clear the session ID (used when consent is revoked)
 */
export function clearSessionId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_ID_KEY);
  }
}
