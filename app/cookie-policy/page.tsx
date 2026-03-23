import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

export default function CookiePolicyPage() {
  redirect(`/${DEFAULT_LOCALE}/cookie-policy`);
}
