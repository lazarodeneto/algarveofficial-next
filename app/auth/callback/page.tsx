import { redirectUnlocalizedAliasPath } from "@/lib/i18n/serverRedirect";

interface AuthCallbackAliasPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AuthCallbackAliasPage({
  searchParams,
}: AuthCallbackAliasPageProps) {
  await redirectUnlocalizedAliasPath("/auth/callback", await searchParams);
}
