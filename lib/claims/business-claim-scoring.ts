function getHostname(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const candidate = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    return hostname || null;
  } catch {
    return null;
  }
}

function getEmailDomain(value: string | null | undefined): string | null {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) return null;
  const domain = trimmed.split("@").pop()?.replace(/^www\./, "") ?? "";
  return domain || null;
}

function domainsMatch(candidate: string | null, expected: string | null) {
  if (!candidate || !expected) return false;
  return candidate === expected || candidate.endsWith(`.${expected}`) || expected.endsWith(`.${candidate}`);
}

function normalizePhone(value: string | null | undefined) {
  return value?.replace(/\D/g, "") ?? "";
}

export interface BusinessClaimConfidenceInput {
  claimantEmail?: string | null;
  companyWebsite?: string | null;
  claimantPhone?: string | null;
  listingWebsite?: string | null;
  listingPhone?: string | null;
}

export function calculateBusinessClaimConfidence(input: BusinessClaimConfidenceInput) {
  const emailDomain = getEmailDomain(input.claimantEmail);
  const companyDomain = getHostname(input.companyWebsite);
  const listingDomain = getHostname(input.listingWebsite);
  const claimantPhone = normalizePhone(input.claimantPhone);
  const listingPhone = normalizePhone(input.listingPhone);

  let score = 0;

  if (domainsMatch(emailDomain, listingDomain)) {
    score += 40;
  }

  if (domainsMatch(companyDomain, listingDomain)) {
    score += 20;
  }

  if (claimantPhone.length >= 6 && listingPhone.length >= 6 && claimantPhone === listingPhone) {
    score += 10;
  }

  return score;
}
