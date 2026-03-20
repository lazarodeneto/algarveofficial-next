import { redirect } from "next/navigation";

export default async function PartnerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  redirect("/partner");
}