import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

export default function DestinationsPage() {
  redirect(`/${DEFAULT_LOCALE}/destinations`);
}
