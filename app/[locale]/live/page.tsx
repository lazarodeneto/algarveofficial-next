import { redirect } from "next/navigation";

export default function LivePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/live`);
}