"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useLocale } from '@/lib/i18n/locale-context';

export type UserRole = 'admin' | 'editor' | 'owner' | 'viewer_logged' | 'viewer';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  getDashboardPath: (role: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_USER_CACHE_KEY = 'algarve_auth_user_cache_v1';
const userBuildInFlight = new Map<string, Promise<User>>();
let memoryCachedUser: User | null = null;

function getCachedUser(userId: string): User | null {
  if (memoryCachedUser?.id === userId) {
    return memoryCachedUser;
  }

  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(AUTH_USER_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as User;
    if (parsed?.id !== userId) return null;

    memoryCachedUser = parsed;
    return parsed;
  } catch {
    return null;
  }
}

function setCachedUser(user: User) {
  memoryCachedUser = user;
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(user));
  } catch {
    // Ignore storage errors in private mode / restricted environments.
  }
}

function clearCachedUser() {
  memoryCachedUser = null;
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(AUTH_USER_CACHE_KEY);
  } catch {
    // Ignore storage errors in private mode / restricted environments.
  }
}

function resolveGoogleOAuthRedirectUrl(): string {
  if (typeof window === "undefined") {
    return "https://algarveofficial.com/auth/callback";
  }

  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const configuredOrigin =
    envSiteUrl && /^https?:\/\//i.test(envSiteUrl)
      ? envSiteUrl.replace(/\/+$/, "")
      : null;

  const localLikeHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.endsWith(".local");

  const origin = configuredOrigin
    ?? (localLikeHost
      ? window.location.origin
      : (window.location.hostname === "www.algarveofficial.com"
        ? "https://algarveofficial.com"
        : window.location.origin));

  return `${origin}/auth/callback`;
}

// Helper to fetch user role using the database function with proper hierarchy
async function fetchUserRole(userId: string): Promise<UserRole> {
  try {
    const { data, error } = await supabase.rpc('get_user_role', { _user_id: userId });

    if (error) {
      console.warn('Could not fetch user role via RPC, defaulting to viewer_logged:', error);
      return 'viewer_logged';
    }

    if (!data) {
      console.warn('No role found for user, defaulting to viewer_logged');
      return 'viewer_logged';
    }

    return data as UserRole;
  } catch (err) {
    console.error('Error in fetchUserRole:', err);
    return 'viewer_logged';
  }
}

// Helper to fetch user profile
async function fetchUserProfile(userId: string): Promise<{ full_name: string; avatar_url: string | null } | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Could not fetch user profile:', error);
    return null;
  }

  return data;
}

// Build User object from Supabase auth user
async function buildUser(supabaseUser: SupabaseUser, options?: { forceRefresh?: boolean }): Promise<User> {
  const userId = supabaseUser.id;
  const forceRefresh = options?.forceRefresh === true;

  if (!forceRefresh) {
    const cached = getCachedUser(userId);
    if (cached) return cached;

    const inFlight = userBuildInFlight.get(userId);
    if (inFlight) return inFlight;
  }

  const buildPromise = (async () => {
    const [role, profile] = await Promise.all([
      fetchUserRole(userId),
      fetchUserProfile(userId),
    ]);

    // Parse name from profile or user metadata
    let firstName = '';
    let lastName = '';

    if (profile?.full_name) {
      const nameParts = profile.full_name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    } else if (supabaseUser.user_metadata?.full_name) {
      const nameParts = supabaseUser.user_metadata.full_name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    const appUser: User = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      firstName,
      lastName,
      role,
      avatar: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url,
    };

    setCachedUser(appUser);
    return appUser;
  })();

  userBuildInFlight.set(userId, buildPromise);
  try {
    return await buildPromise;
  } finally {
    if (userBuildInFlight.get(userId) === buildPromise) {
      userBuildInFlight.delete(userId);
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const locale = useLocale();

  // Initialize auth state with onAuthStateChange FIRST, then getSession
  useEffect(() => {
    let mounted = true;

    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          // Use setTimeout to avoid potential race conditions with Supabase
          setTimeout(async () => {
            if (!mounted) return;
            try {
              const appUser = await buildUser(session.user);
              setUser(appUser);
            } catch (err) {
              console.error('Error building user on SIGNED_IN:', err);
            } finally {
              setIsLoading(false);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          clearCachedUser();
          setUser(null);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Re-hydrate user on token refresh (served from session cache in normal flow).
          // IMPORTANT: defer to avoid Supabase auth lock re-entrancy (can surface as
          // "AbortError: signal is aborted without reason" and abort unrelated queries).
          setTimeout(async () => {
            if (!mounted) return;
            try {
              const appUser = await buildUser(session.user);
              setUser(appUser);
            } catch (err) {
              console.error('Error rebuilding user on TOKEN_REFRESHED:', err);
            }
          }, 0);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          const appUser = await buildUser(session.user);
          setUser(appUser);
        } else if (mounted) {
          clearCachedUser();
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const getDashboardPath = (role: UserRole): string => {
    switch (role) {
      case 'admin':
      case 'editor':
        return '/admin';
      case 'owner':
        return '/owner';
      case 'viewer_logged':
        return '/dashboard';
      default:
        return '/';
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const appUser = await buildUser(data.user);
        setUser(appUser);
        setIsLoading(false);
        
        // Redirect to appropriate dashboard
        const from =
          (typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("from")
            : null) || (pathname !== "/login" ? pathname : undefined);
        const dashboardPath = getDashboardPath(appUser.role);
        router.replace(from || dashboardPath);
        
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: `${firstName} ${lastName}`.trim(),
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        setIsLoading(false);
        return { 
          success: true, 
          error: 'Please check your email to confirm your account before signing in.' 
        };
      }

      if (data.user && data.session) {
        const appUser = await buildUser(data.user);
        setUser(appUser);
        setIsLoading(false);
        
        // Redirect to user dashboard
        router.replace('/dashboard');
        
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: resolveGoogleOAuthRedirectUrl(),
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // OAuth will redirect, so we don't need to handle success here
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to initiate Google login' };
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) {
        throw error;
      }
      clearCachedUser();
      setUser(null);
      // Redirect to the localized homepage after logout
      router.replace(`/${locale}`);
    } catch (error) {
      console.error('Error signing out:', error);
      // Always clear local app auth state even if remote sign-out fails.
      clearCachedUser();
      setUser(null);
      router.replace(`/${locale}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      signup,
      loginWithGoogle,
      logout,
      getDashboardPath,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context !== undefined) {
    return context;
  }

  if (typeof window === "undefined") {
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: async () => ({ success: false, error: "Auth context unavailable during SSR." }),
      signup: async () => ({ success: false, error: "Auth context unavailable during SSR." }),
      loginWithGoogle: async () => ({ success: false, error: "Auth context unavailable during SSR." }),
      logout: async () => {},
      getDashboardPath: () => "/",
    } satisfies AuthContextType;
  }

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
