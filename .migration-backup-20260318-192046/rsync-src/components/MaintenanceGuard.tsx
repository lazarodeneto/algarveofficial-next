"use client";

import { ReactNode, useState, useEffect, useRef, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Maintenance = lazy(() => import("@/pages/Maintenance"));

interface MaintenanceGuardProps {
  children: ReactNode;
}

const IP_TIMEOUT_MS = 5000;

export function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const { user } = useAuth();
  const pathname = usePathname() ?? "/";
  const [clientIp, setClientIp] = useState<string | null>(null);
  const [ipTimedOut, setIpTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Whitelist routes that should always be accessible (with or without language prefix)
  const whitelistedRoutes = ['/login', '/signup', '/forgot-password', '/auth/callback', '/auth/reset-password'];
  const normalizedPathname = pathname.replace(/^\/(?:pt-pt|fr|de|es|it|nl|sv|no|da|en)(?=\/|$)/, '') || '/';
  const isWhitelisted = whitelistedRoutes.some(
    (route) => pathname.startsWith(route) || normalizedPathname.startsWith(route),
  );

  // Check if current user is admin/editor
  const isAdmin = user?.role === 'admin' || user?.role === 'editor';

  const { settings, isLoading } = useSiteSettings();

  // Only fetch client IP when maintenance mode is enabled
  useEffect(() => {
    // Don't fetch IP if maintenance mode is off, or user is admin/whitelisted
    if (!settings?.maintenance_mode || isAdmin || isWhitelisted || clientIp !== null) {
      return;
    }

    const fetchClientIp = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-client-ip');
        if (!error && data?.ip) {
          setClientIp(data.ip);
        } else {
          setClientIp('unknown');
        }
      } catch (err) {
        console.error('Failed to fetch client IP:', err);
        setClientIp('unknown');
      }
    };

    fetchClientIp();

    // Set timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      if (clientIp === null) {
        console.warn('[MaintenanceGuard] IP detection timed out');
        setIpTimedOut(true);
        setClientIp('timeout');
      }
    }, IP_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [settings?.maintenance_mode, isAdmin, isWhitelisted, clientIp]);

  // Check if the current IP is in the whitelist
  const isIpWhitelisted = clientIp && settings?.maintenance_ip_whitelist?.some((ip: string) => {
    return clientIp === ip || clientIp.startsWith(ip);
  });

  // Don't block first paint while loading settings.
  // Render children optimistically — maintenance mode is off 99% of the time.
  // We also skip maintenance checks on the server (during pre-rendering/build)
  // to avoid potential hangs from database queries in the build worker.
  if (isLoading || typeof window === "undefined") {
    return <>{children}</>;
  }

  // If maintenance mode is OFF, render children immediately
  if (!settings?.maintenance_mode) {
    return <>{children}</>;
  }

  // Maintenance mode is ON - check bypass conditions
  if (isAdmin || isWhitelisted) {
    return <>{children}</>;
  }

  // Wait for IP check (with timeout protection)
  if (clientIp === null && !ipTimedOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If IP is whitelisted, allow access
  if (isIpWhitelisted) {
    return <>{children}</>;
  }

  // Otherwise, show maintenance page
  return <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}><Maintenance /></Suspense>;
}
