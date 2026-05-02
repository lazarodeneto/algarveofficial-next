export interface PartnerFeatureRow {
  label: string;
  free: boolean;
  verified: boolean;
  signature: boolean;
  addOn?: boolean;
}

export const VERIFIED_PARTNER_FEATURES: string[] = [
  "Verified trust badge",
  "Enhanced business profile",
  "Photo gallery (up to 10 images)",
  "Map priority placement",
  "Social media links",
  "WhatsApp integration",
  "CTA (Call-To-Action) button",
  "Direct contact from travelers",
];

export const SIGNATURE_PARTNER_FEATURES: string[] = [
  "Everything in Verified",
  "Photo gallery (up to 20 images)",
  "Signature Selection eligibility",
  "Video interview (up to 3 min)",
  "Video commercial (up to 1 min)",
  "Social media mentions",
  "Priority visibility",
  "Homepage featured placement add-on",
];

export const PARTNER_FEATURE_ROWS: PartnerFeatureRow[] = [
  { label: "Directory listing", free: true, verified: true, signature: true },
  { label: "Map visibility", free: true, verified: true, signature: true },
  { label: "Basic business profile", free: true, verified: true, signature: true },
  { label: "Verified trust badge", free: false, verified: true, signature: true },
  { label: "Enhanced business profile", free: false, verified: true, signature: true },
  { label: "Photo gallery (up to 10 images)", free: false, verified: true, signature: true },
  { label: "Photo gallery (up to 20 images)", free: false, verified: false, signature: true },
  { label: "Social media links", free: false, verified: true, signature: true },
  { label: "Social media mentions", free: false, verified: false, signature: true },
  { label: "Video interview (up to 3 min)", free: false, verified: false, signature: true },
  { label: "Video commercial (up to 1 min)", free: false, verified: false, signature: true },
  { label: "Direct contact from travelers", free: false, verified: true, signature: true },
  { label: "Map priority placement", free: false, verified: true, signature: true },
  { label: "CTA (Call-To-Action) button", free: false, verified: true, signature: true },
  { label: "Signature Selection eligibility", free: false, verified: false, signature: true },
  { label: "WhatsApp integration", free: false, verified: true, signature: true },
  { label: "Priority visibility", free: false, verified: false, signature: true },
  { label: "Homepage featured placement", free: false, verified: false, signature: false, addOn: true },
];

export const ORDERED_PARTNER_FEATURE_ROWS: PartnerFeatureRow[] = [
  ...PARTNER_FEATURE_ROWS.filter((feature) => !feature.addOn && !(feature.signature && !feature.verified)),
  ...PARTNER_FEATURE_ROWS.filter((feature) => !feature.addOn && feature.signature && !feature.verified),
  ...PARTNER_FEATURE_ROWS.filter((feature) => feature.addOn),
];
