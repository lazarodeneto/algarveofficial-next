import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

export default function InvestPage() {
  redirect(`/${DEFAULT_LOCALE}/real-estate`);
}
