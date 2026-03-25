import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { createLocalizedHref } from '@/lib/i18n/navigation';
import { isValidLocale } from '@/lib/i18n/config';
import { useLocale } from '@/lib/i18n/locale-context';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const requestedLocale = searchParams.get('locale');
    const resolvedLocale = requestedLocale && isValidLocale(requestedLocale) ? requestedLocale : locale;

    const handleCallback = async () => {
      try {
        // Get the session from the URL hash (OAuth callback)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Auth callback error:', sessionError);
          setError(sessionError.message);
          return;
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

          // Redirect based on role
          switch (role) {
            case 'admin':
            case 'editor':
              router.replace(createLocalizedHref('/admin', resolvedLocale));
              break;
            case 'owner':
              router.replace(createLocalizedHref('/owner', resolvedLocale));
              break;
            default:
              router.replace(createLocalizedHref('/dashboard', resolvedLocale));
          }
        } else {
          // No session, redirect to login
          router.replace(createLocalizedHref('/login', resolvedLocale));
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
              const requestedLocale = searchParams.get('locale');
              const resolvedLocale = requestedLocale && isValidLocale(requestedLocale) ? requestedLocale : locale;
              router.push(createLocalizedHref('/login', resolvedLocale));
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
