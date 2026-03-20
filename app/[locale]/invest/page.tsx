import { redirect } from "next/navigation";

export default async function InvestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  redirect("/invest");
}