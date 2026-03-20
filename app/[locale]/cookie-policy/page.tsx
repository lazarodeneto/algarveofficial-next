import { redirect } from "next/navigation";

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  redirect("/cookie-policy");
}