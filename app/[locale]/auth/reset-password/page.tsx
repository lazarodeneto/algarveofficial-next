import { redirect } from "next/navigation";

export default async function AuthResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  redirect("/auth/reset-password");
}