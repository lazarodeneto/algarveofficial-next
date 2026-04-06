"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format as formatDate } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { getValidAccessToken } from "@/lib/authToken";
import { extractPricingApiErrorMessage } from "@/lib/subscriptions/pricing-api";
import { toast } from "sonner";
import { TFunction } from "i18next";

export interface SubscriptionPricing {
  id: string;
  tier: 'verified' | 'signature';
  billing_period: string;
  price: number;
  display_price: string;
  note: string;
  period_length: number | null;
  period_unit: 'days' | 'months' | null;
  period_start_date: string | null;
  period_end_date: string | null;
  monthly_equivalent: string | null;
  savings: number;
  updated_at: string;
}

export interface PromotionalCode {
  id: string;
  name: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  applicable_tiers: string[];
  applicable_billing: string[];
  start_date: string;
  end_date: string;
  is_active: boolean;
  max_uses: number | null;
  period_length: number | null;
  period_unit: 'days' | 'months' | null;
  current_uses: number;
  created_at: string;
  updated_at: string;
}

export interface PricingOption {
  price: number;
  display: string;
  note: string;
  monthlyEquivalent?: string;
  savings?: number;
  originalPrice?: number;
  originalDisplay?: string;
}

export interface MembershipTier {
  id: string;
  name: string;
  monthly: PricingOption;
  annual: PricingOption;
  period?: PricingOption;
  benefits: string[];
  limitations: string[];
  highlight: boolean;
}

async function callAdminPricingApi(
  method: "POST" | "PATCH",
  payload: Record<string, unknown>,
) {
  const accessToken = await getValidAccessToken();
  const response = await fetch("/api/admin/subscriptions/pricing", {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const fallbackMessage =
      method === "POST"
        ? "Failed to create subscription pricing."
        : "Failed to update subscription pricing.";
    throw new Error(extractPricingApiErrorMessage(data, fallbackMessage));
  }
}

async function callAdminPromotionsApi(
  method: "POST" | "PATCH" | "DELETE",
  payload: Record<string, unknown>,
) {
  const accessToken = await getValidAccessToken();
  const response = await fetch("/api/admin/subscriptions/promotions", {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as
    | { ok?: boolean; error?: { message?: string } }
    | null;

  if (!response.ok || !data?.ok) {
    throw new Error(data?.error?.message || "Failed to update promotional code.");
  }
}

// Static benefits/limitations keys for translation
const tierBenefitKeys = {
  unverified: {
    benefits: ['tiers.free.benefits.createListing', 'tiers.free.benefits.standardVisibility'],
    limitations: ['tiers.free.limitations.limitedVisibility', 'tiers.free.limitations.noPrioritySupport', 'tiers.free.limitations.notEligibleCurated'],
  },
  verified: {
    benefits: ['tiers.verified.benefits.badge', 'tiers.verified.benefits.searchRanking', 'tiers.verified.benefits.prioritySupport', 'CTA or WhatsApp button'],
    limitations: [],
  },
  signature: {
    benefits: [
      'tiers.signature.benefits.badge',
      'tiers.signature.benefits.topRanking',
      'tiers.signature.benefits.eligibleCurated',
      'tiers.signature.benefits.accountManager',
      'Listed on homepage',
      'Photo Gallery enhanced',
      'Video interview (up to 3 min)',
      'Video commercial (up to 1 min)',
      'Social media mentions',
      'CTA or WhatsApp button',
    ],
    limitations: [],
  },
};

export function useSubscriptionPricing(t?: TFunction) {
  const queryClient = useQueryClient();

  // Fetch subscription pricing
  const pricingQuery = useQuery({
    queryKey: ['subscription-pricing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_pricing')
        .select('*')
        .order('tier', { ascending: true })
        .order('billing_period', { ascending: true });

      if (error) throw error;
      return data as SubscriptionPricing[];
    },
  });

  // Fetch promotional codes (admin only)
  const promotionsQuery = useQuery({
    queryKey: ['promotional-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotional_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PromotionalCode[];
    },
  });

  // Get active promotion (if any, based on dates and is_active)
  const getActivePromotion = (tier: string, billingPeriod: string): PromotionalCode | null => {
    if (!promotionsQuery.data) return null;

    const normalizedBilling = billingPeriod.toLowerCase();
    const isStandardBilling = normalizedBilling === "monthly" || normalizedBilling === "annual";

    const now = new Date();
    return promotionsQuery.data.find(promo => {
      if (!promo.is_active) return false;
      const start = new Date(promo.start_date);
      const end = new Date(promo.end_date);
      if (now < start || now > end) return false;
      if (promo.max_uses !== null && promo.current_uses >= promo.max_uses) return false;
      if (!promo.applicable_tiers.includes(tier) && !promo.applicable_tiers.includes('all')) return false;
      const matchesExactBilling = promo.applicable_billing.includes(normalizedBilling);
      const matchesCustomPeriod = !isStandardBilling && promo.applicable_billing.includes("period");
      if (!matchesExactBilling && !matchesCustomPeriod && !promo.applicable_billing.includes('all')) return false;
      return true;
    }) || null;
  };

  // Helper to translate benefit/limitation keys
  const translateKeys = (keys: string[]): string[] => {
    if (!t) return keys;
    return keys.map(key => t(key));
  };

  // Transform pricing data into MembershipTier format
  const getMembershipTiers = (): MembershipTier[] => {
    const pricing = pricingQuery.data || [];
    
    // Free tier (always static)
    const freeTier: MembershipTier = {
      id: 'unverified',
      name: t ? t('tiers.free.name') : 'Free',
      monthly: { price: 0, display: '€0', note: t ? t('tiers.free.alwaysFree') : 'Always free' },
      annual: { price: 0, display: '€0', note: t ? t('tiers.free.alwaysFree') : 'Always free' },
      benefits: translateKeys(tierBenefitKeys.unverified.benefits),
      limitations: translateKeys(tierBenefitKeys.unverified.limitations),
      highlight: false,
    };

    // Build verified and signature tiers from database
    const buildTierPricing = (tierId: 'verified' | 'signature'): { monthly: PricingOption; annual: PricingOption; period?: PricingOption } => {
      const monthlyData = pricing.find(p => p.tier === tierId && p.billing_period === 'monthly');
      const annualData = pricing.find(p => p.tier === tierId && p.billing_period === 'annual');
      const periodData = pricing.find(p => p.tier === tierId && p.billing_period === 'period');

      // Apply promotions if applicable
      const monthlyPromo = getActivePromotion(tierId, 'monthly');
      const annualPromo = getActivePromotion(tierId, 'annual');
      const periodPromo = periodData ? getActivePromotion(tierId, 'period') : null;

      const applyDiscount = (price: number, promo: PromotionalCode | null): { finalPrice: number; originalPrice?: number } => {
        if (!promo) return { finalPrice: price };
        const originalPrice = price;
        const discount = promo.discount_type === 'percentage' 
          ? Math.round(price * (promo.discount_value / 100))
          : promo.discount_value * 100; // fixed discount is in euros, price is in cents
        return { finalPrice: Math.max(0, price - discount), originalPrice };
      };

      const monthlyDiscount = monthlyData ? applyDiscount(monthlyData.price, monthlyPromo) : { finalPrice: 0 };
      const annualDiscount = annualData ? applyDiscount(annualData.price, annualPromo) : { finalPrice: 0 };
      const periodDiscount = periodData ? applyDiscount(periodData.price, periodPromo) : { finalPrice: 0 };

      const formatCents = (cents: number) => `€${(cents / 100).toLocaleString('en-IE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
      const getPeriodNote = (
        length: number | null | undefined,
        unit: 'days' | 'months' | null | undefined,
        startDate: string | null | undefined,
        endDate: string | null | undefined
      ) => {
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
            return `${formatDate(start, "MMM d, yyyy")} - ${formatDate(end, "MMM d, yyyy")}`;
          }
        }
        if (!length || !unit) return t ? t('admin.subscriptions.periodAdminDefined', 'Admin-defined period') : 'Admin-defined period';
        const singularUnit = unit === 'days' ? 'day' : 'month';
        const pluralUnit = unit === 'days' ? 'days' : 'months';
        return `per ${length} ${length === 1 ? singularUnit : pluralUnit}`;
      };

      return {
        monthly: {
          price: monthlyDiscount.finalPrice,
          display: monthlyDiscount.originalPrice != null
            ? formatCents(monthlyDiscount.finalPrice)
            : monthlyData?.display_price || '€0',
          note: monthlyData?.note || 'per month',
          originalPrice: monthlyDiscount.originalPrice,
          originalDisplay: monthlyDiscount.originalPrice != null ? monthlyData?.display_price : undefined,
        },
        annual: {
          price: annualDiscount.finalPrice,
          display: annualDiscount.originalPrice != null
            ? formatCents(annualDiscount.finalPrice)
            : annualData?.display_price || '€0',
          note: annualData?.note || 'per year',
          monthlyEquivalent: annualData?.monthly_equivalent || undefined,
          savings: annualData?.savings || 0,
          originalPrice: annualDiscount.originalPrice,
          originalDisplay: annualDiscount.originalPrice != null ? annualData?.display_price : undefined,
        },
        period: periodData
          ? {
              price: periodDiscount.finalPrice,
              display: periodDiscount.originalPrice != null
                ? formatCents(periodDiscount.finalPrice)
                : periodData.display_price || '€0',
              note: periodData.note || getPeriodNote(
                periodData.period_length,
                periodData.period_unit,
                periodData.period_start_date,
                periodData.period_end_date
              ),
              originalPrice: periodDiscount.originalPrice,
              originalDisplay: periodDiscount.originalPrice != null ? periodData.display_price : undefined,
            }
          : undefined,
      };
    };

    const verifiedTier: MembershipTier = {
      id: 'verified',
      name: t ? t('tiers.verified.name') : 'Verified',
      ...buildTierPricing('verified'),
      benefits: translateKeys(tierBenefitKeys.verified.benefits),
      limitations: translateKeys(tierBenefitKeys.verified.limitations),
      highlight: false,
    };

    const signatureTier: MembershipTier = {
      id: 'signature',
      name: t ? t('tiers.signature.name') : 'Signature',
      ...buildTierPricing('signature'),
      benefits: translateKeys(tierBenefitKeys.signature.benefits),
      limitations: translateKeys(tierBenefitKeys.signature.limitations),
      highlight: true,
    };

    return [freeTier, verifiedTier, signatureTier];
  };

  // Update pricing mutation
  const updatePricing = useMutation({
    mutationFn: async (
      pricing: Partial<SubscriptionPricing> & {
        id?: string;
        tier: SubscriptionPricing["tier"];
        billing_period: SubscriptionPricing["billing_period"];
      },
    ) => {
      const payload = {
        tier: pricing.tier,
        billing_period: pricing.billing_period,
        price: pricing.price,
        display_price: pricing.display_price,
        note: pricing.note,
        period_length: pricing.period_length,
        period_unit: pricing.period_unit,
        period_start_date: pricing.period_start_date,
        period_end_date: pricing.period_end_date,
        monthly_equivalent: pricing.monthly_equivalent,
        savings: pricing.savings,
      };

      const id = typeof pricing.id === "string" ? pricing.id.trim() : "";
      await callAdminPricingApi("PATCH", {
        ...(id ? { id } : {}),
        ...payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-pricing'] });
      toast.success("Pricing updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update pricing: ${error.message}`);
    },
  });

  // Create pricing mutation (used to provision missing billing periods)
  const createPricing = useMutation({
    mutationFn: async (pricing: Omit<SubscriptionPricing, 'id' | 'updated_at'>) => {
      await callAdminPricingApi("POST", {
        tier: pricing.tier,
        billing_period: pricing.billing_period,
        price: pricing.price,
        display_price: pricing.display_price,
        note: pricing.note,
        period_length: pricing.period_length,
        period_unit: pricing.period_unit,
        period_start_date: pricing.period_start_date,
        period_end_date: pricing.period_end_date,
        monthly_equivalent: pricing.monthly_equivalent,
        savings: pricing.savings,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-pricing'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create pricing: ${error.message}`);
    },
  });

  // Create promotion mutation
  const createPromotion = useMutation({
    mutationFn: async (promo: Omit<PromotionalCode, 'id' | 'created_at' | 'updated_at' | 'current_uses'>) => {
      await callAdminPromotionsApi("POST", {
        name: promo.name,
        code: promo.code.toUpperCase(),
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        applicable_tiers: promo.applicable_tiers,
        applicable_billing: promo.applicable_billing,
        start_date: promo.start_date,
        end_date: promo.end_date,
        is_active: promo.is_active,
        max_uses: promo.max_uses,
        period_length: promo.period_length,
        period_unit: promo.period_unit,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-codes'] });
      toast.success("Promotion created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create promotion: ${error.message}`);
    },
  });

  // Update promotion mutation
  const updatePromotion = useMutation({
    mutationFn: async (promo: Partial<PromotionalCode> & { id: string }) => {
      await callAdminPromotionsApi("PATCH", {
        id: promo.id,
        name: promo.name,
        code: promo.code?.toUpperCase(),
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        applicable_tiers: promo.applicable_tiers,
        applicable_billing: promo.applicable_billing,
        start_date: promo.start_date,
        end_date: promo.end_date,
        is_active: promo.is_active,
        max_uses: promo.max_uses,
        period_length: promo.period_length,
        period_unit: promo.period_unit,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-codes'] });
      toast.success("Promotion updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update promotion: ${error.message}`);
    },
  });

  // Delete promotion mutation
  const deletePromotion = useMutation({
    mutationFn: async (id: string) => {
      await callAdminPromotionsApi("DELETE", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-codes'] });
      toast.success("Promotion deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete promotion: ${error.message}`);
    },
  });

  // Toggle promotion active status
  const togglePromotion = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await callAdminPromotionsApi("PATCH", { id, is_active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-codes'] });
      toast.success("Promotion status updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update promotion: ${error.message}`);
    },
  });

  return {
    pricing: pricingQuery.data || [],
    promotions: promotionsQuery.data || [],
    membershipTiers: getMembershipTiers(),
    isLoading: pricingQuery.isLoading,
    isLoadingPromotions: promotionsQuery.isLoading,
    updatePricing,
    createPricing,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotion,
    getActivePromotion,
  };
}
