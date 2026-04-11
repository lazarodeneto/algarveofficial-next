import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  const shouldRedirectByRole = Boolean(allowedRoles && user && !allowedRoles.includes(user.role));

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

  // Dashboard routes are server-guarded in App Router layouts. Keep the client
  // layer non-authoritative so it doesn't issue contradictory redirects during
  // hydration or auth refresh.
  if (!isAuthenticated || shouldRedirectByRole) {
    return null;
  }

  return <>{children}</>;
}
