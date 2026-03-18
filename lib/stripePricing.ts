/**
 * Stripe Price and Product ID mappings for subscription tiers
 * These IDs correspond to the products/prices created in Stripe
 */

export type SubscriptionTier = 'verified' | 'signature';
export type BillingPeriod = 'monthly' | 'annual';

export const STRIPE_PRICES: Record<SubscriptionTier, Record<BillingPeriod, string>> = {
  verified: {
    monthly: 'price_1SuHGIJHEK40cBF6OW9W4Fjw',  // €49/month
    annual: 'price_1SuHM6JHEK40cBF6yH7mtYGt',   // €490/year
  },
  signature: {
    monthly: 'price_1SuHMaJHEK40cBF6ScrwEg0M',  // €199/month
    annual: 'price_1SuHMtJHEK40cBF62wcq2bJu',   // €1,990/year
  },
};

export const STRIPE_PRODUCTS: Record<SubscriptionTier, string[]> = {
  verified: ['prod_Ts1IodwkL1rgFz', 'prod_Ts1Ou4hxYoKZuS'],
  signature: ['prod_Ts1Pc4ZNUG49ux', 'prod_Ts1Pv6mV6K1S1h'],
};

/**
 * Get the price ID for a given tier and billing period
 */
export function getPriceId(tier: SubscriptionTier, billingPeriod: BillingPeriod): string {
  return STRIPE_PRICES[tier][billingPeriod];
}

/**
 * Determine tier from a Stripe product ID
 */
export function getTierFromProductId(productId: string): SubscriptionTier | null {
  for (const [tier, productIds] of Object.entries(STRIPE_PRODUCTS)) {
    if (productIds.includes(productId)) {
      return tier as SubscriptionTier;
    }
  }
  return null;
}
