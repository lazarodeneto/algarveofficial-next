export type ClaimPricingTier = "free" | "verified" | "signature";
export type ClaimPricingBillingPeriod = "monthly" | "yearly" | "promo";

export interface ClaimTierPricingOption {
  billingPeriod: ClaimPricingBillingPeriod;
  priceLabel: string;
  cadenceLabel: string;
  supportingLabel: string | null;
}

export interface ClaimTierPricingDetail {
  priceLabel: string;
  cadenceLabel: string;
  supportingLabel: string | null;
  billingPeriod: ClaimPricingBillingPeriod | null;
  checkoutBillingPeriod: ClaimPricingBillingPeriod | null;
  options: ClaimTierPricingOption[];
}

export type ClaimTierPricingDetails = Record<ClaimPricingTier, ClaimTierPricingDetail>;
