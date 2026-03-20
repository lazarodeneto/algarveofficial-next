import { redirect } from "next/navigation";

export default async function AuthCallbackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  redirect("/auth/callback");
}