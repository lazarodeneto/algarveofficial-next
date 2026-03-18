import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

const SESSION_RENEW_WINDOW_SECONDS = 90;
export const SESSION_EXPIRED_MESSAGE = "Your session expired. Please sign in again.";

function shouldRefreshSession(session: Session): boolean {
  const expiresAt = session.expires_at ?? 0;
  const now = Math.floor(Date.now() / 1000);
  return expiresAt - now <= SESSION_RENEW_WINDOW_SECONDS;
}

async function refreshAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.refreshSession();
  const refreshedToken = data.session?.access_token;

  if (error || !refreshedToken) {
    throw new Error(SESSION_EXPIRED_MESSAGE);
  }

  return refreshedToken;
}

export async function getValidAccessToken(options: { forceRefresh?: boolean } = {}): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  const session = data.session;

  if (error || !session?.access_token) {
    throw new Error(SESSION_EXPIRED_MESSAGE);
  }

  if (options.forceRefresh || shouldRefreshSession(session)) {
    try {
      return await refreshAccessToken();
    } catch {
      // Refresh failed but a session token exists — return it and let
      // the server decide if it's still valid rather than signing out.
      return session.access_token;
    }
  }

  return session.access_token;
}
