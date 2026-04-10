import { redirectUnlocalizedAliasPath } from "@/lib/i18n/serverRedirect";

interface AuthResetPasswordAliasPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AuthResetPasswordAliasPage({
  searchParams,
}: AuthResetPasswordAliasPageProps) {
  await redirectUnlocalizedAliasPath("/auth/reset-password", await searchParams);
}
