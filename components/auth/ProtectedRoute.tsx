import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, getDashboardPath } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  const shouldRedirectToLogin = !isAuthenticated;
  const shouldRedirectByRole = Boolean(allowedRoles && user && !allowedRoles.includes(user.role));

  useEffect(() => {
    if (isLoading) return;

    if (shouldRedirectToLogin) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (shouldRedirectByRole && user) {
      router.replace(getDashboardPath(user.role));
    }
  }, [
    getDashboardPath,
    isLoading,
    pathname,
    router,
    shouldRedirectByRole,
    shouldRedirectToLogin,
    user,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (shouldRedirectToLogin || shouldRedirectByRole) {
    return null;
  }

  return <>{children}</>;
}
