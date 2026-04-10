import { redirectUnlocalizedAliasPath } from "@/lib/i18n/serverRedirect";

interface ForgotPasswordAliasPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ForgotPasswordAliasPage({
  searchParams,
}: ForgotPasswordAliasPageProps) {
  await redirectUnlocalizedAliasPath("/forgot-password", await searchParams);
}
