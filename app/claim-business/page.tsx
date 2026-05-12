import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function RootClaimBusinessPage() {
  await redirectToPreferredLocalePath("/claim-business");
}
