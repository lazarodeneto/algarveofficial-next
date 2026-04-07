"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getValidAccessToken } from "@/lib/authToken";
import type {
  PricingCatalogSnapshot,
  ResolvedPrice,
} from "@/lib/pricing/pricing-resolver";
import { extractPricingApiErrorMessage } from "@/lib/subscriptions/pricing-api";
import { toast } from "sonner";
import type { TFunction } from "i18next";

export interface SubscriptionPricing {
  id: string;
  tier: "verified" | "signature";
  billing_period: string;
  price: number;
  price_cents: number;
  stripe_price_id: string | null;
  currency: string;
  display_price: string;
  note: string;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean;
  period_length: number | null;
  period_unit: "days" | "months" | null;
  period_start_date: string | null;
  period_end_date: string | null;
  monthly_equivalent: string | null;
  savings: number | null;
  created_at: string;
  updated_at: string;
}

export interface PromotionalCode {
  id: string;
  name: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  applicable_tiers: string[];
  applicable_billing: string[];
  start_date: string;
  end_date: string;
  is_active: boolean;
  max_uses: number | null;
  period_length: number | null;
  period_unit: "days" | "months" | null;
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
  validFrom?: string | null;
  validTo?: string | null;
  isPromo?: boolean;
}

export interface MembershipTier {
  id: string;
  name: string;
  monthly: PricingOption;
  annual: PricingOption;
  promo?: PricingOption;
  benefits: string[];
  limitations: string[];
  highlight: boolean;
}

interface PricingCatalogApiResponse {
  ok: true;
  generatedAt: string;
  tiers: PricingCatalogSnapshot["tiers"];
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

  const data = (await response.json().catch(() => null)) as unknown;
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

const tierBenefitKeys = {
  unverified: {
    benefits: ["tiers.free.benefits.createListing", "tiers.free.benefits.standardVisibility"],
    limitations: [
      "tiers.free.limitations.limitedVisibility",
      "tiers.free.limitations.noPrioritySupport",
      "tiers.free.limitations.notEligibleCurated",
    ],
  },
  verified: {
    benefits: [
      "tiers.verified.benefits.badge",
      "tiers.verified.benefits.searchRanking",
      "tiers.verified.benefits.prioritySupport",
      "CTA or WhatsApp button",
    ],
    limitations: [],
  },
  signature: {
    benefits: [
      "tiers.signature.benefits.badge",
      "tiers.signature.benefits.topRanking",
      "tiers.signature.benefits.eligibleCurated",
      "tiers.signature.benefits.accountManager",
      "Listed on homepage",
      "Photo Gallery enhanced",
      "Video interview (up to 3 min)",
      "Video commercial (up to 1 min)",
      "Social media mentions",
      "CTA or WhatsApp button",
    ],
    limitations: [],
  },
};

function buildPricingOption(
  price: ResolvedPrice | null | undefined,
  fallbackNote: string,
): PricingOption {
  if (!price) {
    return {
      price: 0,
      display: "€0",
      note: fallbackNote,
    };
  }

  return {
    price: price.priceCents,
    display: price.displayPrice,
    note: price.note || fallbackNote,
    monthlyEquivalent: price.monthlyEquivalent ?? undefined,
    savings: price.savings ?? undefined,
    validFrom: price.validFrom,
    validTo: price.validTo,
    isPromo: price.billingPeriod === "promo",
  };
}

export function useSubscriptionPricing(t?: TFunction) {
  const queryClient = useQueryClient();
  const isAdminMode = !t;

  const pricingQuery = useQuery({
    queryKey: ["subscription-pricing", "admin"],
    enabled: isAdminMode,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_pricing")
        .select("*")
        .order("tier", { ascending: true })
        .order("billing_period", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SubscriptionPricing[];
    },
  });

  const pricingCatalogQuery = useQuery({
    queryKey: ["subscription-pricing", "catalog"],
    queryFn: async () => {
      const response = await fetch("/api/pricing", { cache: "no-store" });
      const data = (await response.json().catch(() => null)) as
        | PricingCatalogApiResponse
        | { error?: { message?: string } }
        | null;

      if (!response.ok || !data || !("ok" in data) || !data.ok) {
        const errorMessage =
          data && "error" in data && data.error?.message
            ? data.error.message
            : "Failed to load pricing catalog.";
        throw new Error(errorMessage);
      }

      return data;
    },
  });

  const promotionsQuery = useQuery({
    queryKey: ["promotional-codes"],
    enabled: isAdminMode,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotional_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PromotionalCode[];
    },
  });

  const translateKeys = (keys: string[]): string[] => {
    if (!t) return keys;
    return keys.map((key) => t(key));
  };

  const getMembershipTiers = (): MembershipTier[] => {
    const catalog = pricingCatalogQuery.data?.tiers;

    const freeTier: MembershipTier = {
      id: "unverified",
      name: t ? t("tiers.free.name") : "Free",
      monthly: { price: 0, display: "€0", note: t ? t("tiers.free.alwaysFree") : "Always free" },
      annual: { price: 0, display: "€0", note: t ? t("tiers.free.alwaysFree") : "Always free" },
      benefits: translateKeys(tierBenefitKeys.unverified.benefits),
      limitations: translateKeys(tierBenefitKeys.unverified.limitations),
      highlight: false,
    };

    const verifiedTier: MembershipTier = {
      id: "verified",
      name: t ? t("tiers.verified.name") : "Verified",
      monthly: buildPricingOption(catalog?.verified.monthly, "per month"),
      annual: buildPricingOption(catalog?.verified.yearly, "per year"),
      promo: buildPricingOption(catalog?.verified.promo, "Promotional rate"),
      benefits: translateKeys(tierBenefitKeys.verified.benefits),
      limitations: translateKeys(tierBenefitKeys.verified.limitations),
      highlight: false,
    };

    const signatureTier: MembershipTier = {
      id: "signature",
      name: t ? t("tiers.signature.name") : "Signature",
      monthly: buildPricingOption(catalog?.signature.monthly, "per month"),
      annual: buildPricingOption(catalog?.signature.yearly, "per year"),
      promo: buildPricingOption(catalog?.signature.promo, "Promotional rate"),
      benefits: translateKeys(tierBenefitKeys.signature.benefits),
      limitations: translateKeys(tierBenefitKeys.signature.limitations),
      highlight: true,
    };

    return [freeTier, verifiedTier, signatureTier];
  };

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
        price_cents: pricing.price_cents ?? pricing.price,
        display_price: pricing.display_price,
        note: pricing.note,
        stripe_price_id: pricing.stripe_price_id,
        currency: pricing.currency ?? "EUR",
        valid_from: pricing.valid_from ?? pricing.period_start_date,
        valid_to: pricing.valid_to ?? pricing.period_end_date,
        is_active: pricing.is_active,
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
      queryClient.invalidateQueries({ queryKey: ["subscription-pricing"] });
      toast.success("Pricing updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update pricing: ${error.message}`);
    },
  });

  const createPricing = useMutation({
    mutationFn: async (
      pricing: Omit<SubscriptionPricing, "id" | "created_at" | "updated_at">,
    ) => {
      await callAdminPricingApi("POST", {
        tier: pricing.tier,
        billing_period: pricing.billing_period,
        price_cents: pricing.price_cents ?? pricing.price,
        display_price: pricing.display_price,
        note: pricing.note,
        stripe_price_id: pricing.stripe_price_id,
        currency: pricing.currency ?? "EUR",
        valid_from: pricing.valid_from ?? pricing.period_start_date,
        valid_to: pricing.valid_to ?? pricing.period_end_date,
        is_active: pricing.is_active,
        monthly_equivalent: pricing.monthly_equivalent,
        savings: pricing.savings,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-pricing"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create pricing: ${error.message}`);
    },
  });

  const createPromotion = useMutation({
    mutationFn: async (
      promo: Omit<PromotionalCode, "id" | "created_at" | "updated_at" | "current_uses">,
    ) => {
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
      queryClient.invalidateQueries({ queryKey: ["promotional-codes"] });
      toast.success("Promotion created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create promotion: ${error.message}`);
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["promotional-codes"] });
      toast.success("Promotion updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update promotion: ${error.message}`);
    },
  });

  const deletePromotion = useMutation({
    mutationFn: async (id: string) => {
      await callAdminPromotionsApi("DELETE", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotional-codes"] });
      toast.success("Promotion deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete promotion: ${error.message}`);
    },
  });

  const togglePromotion = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await callAdminPromotionsApi("PATCH", { id, is_active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotional-codes"] });
      toast.success("Promotion status updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update promotion: ${error.message}`);
    },
  });

  return {
    pricing: pricingQuery.data || [],
    pricingCatalog: pricingCatalogQuery.data?.tiers || null,
    promotions: promotionsQuery.data || [],
    membershipTiers: getMembershipTiers(),
    isLoading: pricingCatalogQuery.isLoading || (isAdminMode ? pricingQuery.isLoading : false),
    isLoadingPromotions: promotionsQuery.isLoading,
    updatePricing,
    createPricing,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotion,
  };
}
