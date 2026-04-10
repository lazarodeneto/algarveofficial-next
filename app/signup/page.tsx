import { redirectUnlocalizedAliasPath } from "@/lib/i18n/serverRedirect";

interface SignupAliasPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SignupAliasPage({ searchParams }: SignupAliasPageProps) {
  await redirectUnlocalizedAliasPath("/signup", await searchParams);
}
