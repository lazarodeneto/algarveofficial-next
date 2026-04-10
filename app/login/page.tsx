import { redirectUnlocalizedAliasPath } from "@/lib/i18n/serverRedirect";

interface LoginAliasPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LoginAliasPage({ searchParams }: LoginAliasPageProps) {
  await redirectUnlocalizedAliasPath("/login", await searchParams);
}
