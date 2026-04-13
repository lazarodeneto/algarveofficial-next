import { permanentRedirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

export default function RootPage() {
  permanentRedirect(`/${DEFAULT_LOCALE}`);
}
