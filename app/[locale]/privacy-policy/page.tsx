import { redirect } from "next/navigation";

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  redirect("/privacy-policy");
}