"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { SubscriptionTier, BillingPeriod } from '@/lib/stripePricing';

export interface SubscriptionState {
  subscribed: boolean;
  tier: 'unverified' | SubscriptionTier;
  planType: 'monthly' | 'yearly' | 'fixed_2026' | null;
  billingPeriod: BillingPeriod | null;
  status:
    | 'pending'
    | 'active'
    | 'trialing'
    | 'past_due'
    | 'unpaid'
    | 'canceled'
    | 'expired'
    | 'incomplete'
    | 'incomplete_expired'
    | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  trialEnd: string | null;
  endDate: string | null;
  hasStripeCustomer: boolean;
}

interface UseStripeSubscriptionReturn {
  subscription: SubscriptionState;
  isLoading: boolean;
  error: string | null;
  checkSubscription: () => Promise<void>;
  createCheckout: (tier: SubscriptionTier, billingPeriod: BillingPeriod) => Promise<void>;
  changePlan: (tier: SubscriptionTier, billingPeriod: BillingPeriod) => Promise<{
    ok: boolean;
    immediate?: boolean;
    message?: string;
    error?: string;
    code?: string;
  }>;
  openCustomerPortal: () => Promise<void>;
}

const DEFAULT_SUBSCRIPTION: SubscriptionState = {
  subscribed: false,
  tier: 'unverified',
  planType: null,
  billingPeriod: null,
  status: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  canceledAt: null,
  trialEnd: null,
  endDate: null,
  hasStripeCustomer: false,
};

function normalizeBillingPeriodForUi(value: unknown): BillingPeriod | null {
  if (value === 'monthly') return 'monthly';
  if (value === 'annual' || value === 'yearly') return 'annual';
  return null;
}

async function callSubscriptionApi<T>(
  path: string,
  method: 'GET' | 'POST',
  body?: unknown,
): Promise<T> {
  const response = await fetch(path, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => null) as T & { error?: string };
  if (!response.ok) {
    throw new Error(
      (data as { error?: string } | null)?.error || `Request failed (${response.status})`,
    );
  }
  return data;
}

async function callSubscriptionApiRaw<T>(
  path: string,
  method: 'GET' | 'POST',
  body?: unknown,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const response = await fetch(path, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => null) as T | null;
  return { ok: response.ok, status: response.status, data };
}

export function useStripeSubscription(): UseStripeSubscriptionReturn {
  const { user, isAuthenticated } = useAuth();
  const isBrowser = typeof window !== 'undefined';
  const [subscription, setSubscription] = useState<SubscriptionState>(DEFAULT_SUBSCRIPTION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    if (!isBrowser || !isAuthenticated) {
      setSubscription(DEFAULT_SUBSCRIPTION);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await callSubscriptionApi<{
        subscribed: boolean;
        tier: string;
        planType: string | null;
        billingPeriod: string | null;
        status: string | null;
        currentPeriodEnd: string | null;
        cancelAtPeriodEnd: boolean;
        canceledAt: string | null;
        trialEnd: string | null;
        endDate: string | null;
        hasStripeCustomer: boolean;
      }>('/api/subscriptions/current', 'GET');

      setSubscription({
        subscribed: data.subscribed ?? false,
        tier: (data.tier as SubscriptionState['tier']) ?? 'unverified',
        planType: (data.planType as SubscriptionState['planType']) ?? null,
        billingPeriod: normalizeBillingPeriodForUi(data.billingPeriod),
        status: (data.status as SubscriptionState['status']) ?? null,
        currentPeriodEnd: data.currentPeriodEnd ?? null,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
        canceledAt: data.canceledAt ?? null,
        trialEnd: data.trialEnd ?? null,
        endDate: data.endDate ?? null,
        hasStripeCustomer: data.hasStripeCustomer ?? false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check subscription';
      setError(message);
      console.error('Error checking subscription:', message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isBrowser]);

  const createCheckout = useCallback(
    async (tier: SubscriptionTier, billingPeriod: BillingPeriod) => {
      if (!isBrowser) throw new Error('Checkout is unavailable during server rendering');
      if (!isAuthenticated) throw new Error('You must be logged in to subscribe');

      setIsLoading(true);
      setError(null);

      try {
        const data = await callSubscriptionApi<{ url?: string }>(
          '/api/stripe/checkout',
          'POST',
          { tier, billing_period: billingPeriod },
        );

        if (!data?.url) throw new Error('No checkout URL returned');
        window.location.href = data.url;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create checkout session';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, isBrowser],
  );

  const changePlan = useCallback(
    async (tier: SubscriptionTier, billingPeriod: BillingPeriod) => {
      if (!isBrowser) {
        return { ok: false, error: 'Plan change is unavailable during server rendering' };
      }
      if (!isAuthenticated) {
        return { ok: false, error: 'You must be logged in to change your plan' };
      }

      setIsLoading(true);
      setError(null);

      try {
        const normalizedBillingPeriod = billingPeriod === 'annual' ? 'yearly' : 'monthly';
        const response = await callSubscriptionApiRaw<{
          ok?: boolean;
          immediate?: boolean;
          message?: string;
          error?: string;
          code?: string;
        }>(
          '/api/subscriptions/change-plan',
          'POST',
          { tier, billing_period: normalizedBillingPeriod },
        );

        if (!response.ok || !response.data?.ok) {
          const message =
            response.data?.error
            || response.data?.message
            || `Request failed (${response.status})`;
          setError(message);
          return {
            ok: false,
            error: message,
            code: response.data?.code,
          };
        }

        return {
          ok: true,
          immediate: Boolean(response.data.immediate),
          message: response.data.message,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to change subscription plan';
        setError(message);
        return { ok: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, isBrowser],
  );

  const openCustomerPortal = useCallback(async () => {
    if (!isBrowser) throw new Error('Customer portal is unavailable during server rendering');
    if (!isAuthenticated) throw new Error('You must be logged in to manage your subscription');

    setIsLoading(true);
    setError(null);

    try {
      const data = await callSubscriptionApi<{ url?: string }>(
        '/api/stripe/billing-portal',
        'POST',
      );

      if (!data?.url) throw new Error('No portal URL returned');
      window.open(data.url, '_blank');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open customer portal';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isBrowser]);

  // Check subscription on mount and when auth changes
  useEffect(() => {
    if (!isBrowser) return;
    if (isAuthenticated && user?.role === 'owner') {
      checkSubscription();
    } else {
      setSubscription(DEFAULT_SUBSCRIPTION);
    }
  }, [isAuthenticated, user?.role, checkSubscription, isBrowser]);

  // Check subscription on URL params (after Stripe redirect)
  useEffect(() => {
    if (!isBrowser) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === '1') {
      const timer = setTimeout(() => {
        checkSubscription();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [checkSubscription, isBrowser]);

  // Periodic refresh every 60 seconds when subscribed
  useEffect(() => {
    if (!isBrowser || !subscription.subscribed) return;
    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);
    return () => clearInterval(interval);
  }, [subscription.subscribed, checkSubscription, isBrowser]);

  return {
    subscription,
    isLoading,
    error,
    checkSubscription,
    createCheckout,
    changePlan,
    openCustomerPortal,
  };
}
