"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { SubscriptionTier, BillingPeriod } from '@/lib/stripePricing';

export interface SubscriptionState {
  subscribed: boolean;
  tier: 'unverified' | SubscriptionTier;
  billingPeriod: BillingPeriod | null;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | null;
  currentPeriodEnd: string | null;
  hasStripeCustomer: boolean;
}

interface UseStripeSubscriptionReturn {
  subscription: SubscriptionState;
  isLoading: boolean;
  error: string | null;
  checkSubscription: () => Promise<void>;
  createCheckout: (tier: SubscriptionTier, billingPeriod: BillingPeriod) => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const DEFAULT_SUBSCRIPTION: SubscriptionState = {
  subscribed: false,
  tier: 'unverified',
  billingPeriod: null,
  status: null,
  currentPeriodEnd: null,
  hasStripeCustomer: false,
};

async function extractFunctionErrorMessage(fnError: unknown, fallback: string): Promise<string> {
  const err = fnError as { message?: string; context?: Response } | null;
  const message = err?.message || fallback;

  const context = err?.context;
  if (!context) return message;

  try {
    const body = await context.clone().json() as { error?: string; message?: string };
    if (body?.error) return body.error;
    if (body?.message) return body.message;
  } catch {
    try {
      const text = await context.clone().text();
      if (text?.trim()) return text.trim();
    } catch {
      // no-op
    }
  }

  return message;
}

export function useStripeSubscription(): UseStripeSubscriptionReturn {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionState>(DEFAULT_SUBSCRIPTION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (typeof window === "undefined") {
    return {
      subscription: DEFAULT_SUBSCRIPTION,
      isLoading: false,
      error: null,
      checkSubscription: async () => {},
      createCheckout: async () => {},
      openCustomerPortal: async () => {},
    };
  }

  const checkSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      setSubscription(DEFAULT_SUBSCRIPTION);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('check-subscription');

      if (fnError) {
        throw new Error(await extractFunctionErrorMessage(fnError, 'Failed to check subscription'));
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setSubscription({
        subscribed: data.subscribed ?? false,
        tier: data.tier ?? 'unverified',
        billingPeriod: data.billingPeriod ?? null,
        status: data.status ?? null,
        currentPeriodEnd: data.currentPeriodEnd ?? null,
        hasStripeCustomer: data.hasStripeCustomer ?? false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check subscription';
      setError(message);
      console.error('Error checking subscription:', message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const createCheckout = useCallback(async (tier: SubscriptionTier, billingPeriod: BillingPeriod) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to subscribe');
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
        body: { tier, billingPeriod },
      });

      if (fnError) {
        throw new Error(await extractFunctionErrorMessage(fnError, 'Failed to create checkout session'));
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.url) {
        throw new Error('No checkout URL returned');
      }

      // Open Stripe Checkout in a new tab
      window.open(data.url, '_blank');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create checkout session';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const openCustomerPortal = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to manage your subscription');
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('customer-portal');

      if (fnError) {
        throw new Error(await extractFunctionErrorMessage(fnError, 'Failed to open customer portal'));
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.url) {
        throw new Error('No portal URL returned');
      }

      // Open Stripe Customer Portal in a new tab
      window.open(data.url, '_blank');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open customer portal';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Check subscription on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated && user?.role === 'owner') {
      checkSubscription();
    } else {
      setSubscription(DEFAULT_SUBSCRIPTION);
    }
  }, [isAuthenticated, user?.role, checkSubscription]);

  // Check subscription on URL params (after Stripe redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      // Delay to allow Stripe webhook to process
      const timer = setTimeout(() => {
        checkSubscription();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [checkSubscription]);

  // Periodic refresh every 60 seconds when subscribed
  useEffect(() => {
    if (!subscription.subscribed) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => clearInterval(interval);
  }, [subscription.subscribed, checkSubscription]);

  return {
    subscription,
    isLoading,
    error,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
}
