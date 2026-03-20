import { redirect } from "next/navigation";

export default async function RealEstatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  redirect("/real-estate");
}