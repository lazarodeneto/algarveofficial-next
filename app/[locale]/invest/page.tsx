import { redirect } from "next/navigation";

export default function InvestPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/invest`);
}