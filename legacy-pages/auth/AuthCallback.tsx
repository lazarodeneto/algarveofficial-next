"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { buildLocalizedPath } from '@/lib/i18n/routing';
import { useCurrentLocale } from '@/hooks/useCurrentLocale';
import { resolvePostAuthRedirectPath } from '@/lib/authRedirect';
import { type AppRole, normalizeAppRole } from '@/lib/auth/roles';
import { getLocaleFromPathname, hasLocalePrefix, isValidLocale } from '@/lib/i18n/locale-utils';

async function fetchRedirectRole(userId: string): Promise<AppRole> {
  const { data, error } = await supabase.rpc('get_user_role', { _user_id: userId });
  if (error) {
    console.warn('Could not fetch user role during auth callback:', error);
  }
  return normalizeAppRole(data);
}

function dashboardPathForRole(role: AppRole) {
  if (role === 'admin' || role === 'editor') return '/admin';
  if (role === 'owner') return '/owner';
  return '/dashboard';
}

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const requestedPath = searchParams.get('next') || searchParams.get('from');
    const requestedLocale = searchParams.get('locale');
    const resolvedLocale =
      (requestedPath && hasLocalePrefix(requestedPath) ? getLocaleFromPathname(requestedPath) : null) ||
      (requestedLocale && isValidLocale(requestedLocale) ? requestedLocale : null) ||
      locale;

    const handleCallback = async () => {
      try {
        // Surface OAuth errors returned by Supabase/Google in the callback URL
        const oauthError = searchParams.get('error');
        const oauthErrorDescription = searchParams.get('error_description');
        if (oauthError) {
          const message = oauthErrorDescription
            ? decodeURIComponent(oauthErrorDescription.replace(/\+/g, ' '))
            : oauthError;
          console.error('OAuth callback error:', oauthError, message);
          setError(message);
          return;
        }

        // With @supabase/ssr's createBrowserClient (PKCE + detectSessionInUrl: true),
        // the code exchange happens automatically during client init. getSession()
        // awaits that initialization before returning.
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Auth callback error:', sessionError);
          setError(sessionError.message);
          return;
        }

        // If the PKCE exchange silently failed (e.g. verifier missing, code expired),
        // try an explicit exchange as a fallback before giving up.
        const code = searchParams.get('code');
        if (!session && code) {
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            setError(exchangeError.message);
            return;
          }
          if (exchangeData.session?.user) {
            const defaultRedirect = dashboardPathForRole(
              await fetchRedirectRole(exchangeData.session.user.id),
            );
            router.replace(resolvePostAuthRedirectPath(requestedPath, resolvedLocale, defaultRedirect));
            return;
          }
        }

        if (session?.user) {
          const defaultRedirect = dashboardPathForRole(await fetchRedirectRole(session.user.id));
          const redirectTarget = resolvePostAuthRedirectPath(
            requestedPath,
            resolvedLocale,
            defaultRedirect,
          );

          router.replace(redirectTarget);
        } else {
          // No session, redirect to login
          router.replace(buildLocalizedPath(resolvedLocale, '/login'));
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setError('An unexpected error occurred');
      }
    };

    handleCallback();
  }, [locale, router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => {
              const requestedPath = searchParams.get('next') || searchParams.get('from');
              const requestedLocale = searchParams.get('locale');
              const resolvedLocale =
                (requestedPath && hasLocalePrefix(requestedPath) ? getLocaleFromPathname(requestedPath) : null) ||
                (requestedLocale && isValidLocale(requestedLocale) ? requestedLocale : null) ||
                locale;
              router.push(buildLocalizedPath(resolvedLocale, '/login'));
            }}
            className="text-primary hover:underline"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
