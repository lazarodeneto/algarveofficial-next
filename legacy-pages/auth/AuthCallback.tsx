"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { buildLocalizedPath } from '@/lib/i18n/routing';
import { useCurrentLocale } from '@/hooks/useCurrentLocale';
import { resolvePostAuthRedirectPath } from '@/lib/authRedirect';
import { getLocaleFromPathname, hasLocalePrefix, isValidLocale } from '@/lib/i18n/locale-utils';

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
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', exchangeData.session.user.id)
              .order('role')
              .limit(1)
              .maybeSingle();

            const role = roleData?.role || 'viewer_logged';
            const defaultRedirect =
              role === 'admin' || role === 'editor'
                ? '/admin'
                : role === 'owner'
                  ? '/owner'
                  : '/dashboard';
            router.replace(resolvePostAuthRedirectPath(requestedPath, resolvedLocale, defaultRedirect));
            return;
          }
        }

        if (session?.user) {
          // Fetch user role to determine redirect
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .order('role')
            .limit(1)
            .maybeSingle();

          const role = roleData?.role || 'viewer_logged';
          const defaultRedirect =
            role === 'admin' || role === 'editor'
              ? '/admin'
              : role === 'owner'
                ? '/owner'
                : '/dashboard';
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
