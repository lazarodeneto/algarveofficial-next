export function buildInternationalPhone(countryDialCode: string, localPhone: string): string | undefined {
  const local = localPhone.trim();
  if (!local) return undefined;
  if (local.startsWith("+")) return local;
  return `${countryDialCode}${local}`;
}

