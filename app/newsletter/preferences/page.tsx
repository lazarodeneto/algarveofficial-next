import { NewsletterPreferencesForm } from "@/components/newsletter/NewsletterPreferencesForm";

interface PageProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

export const dynamic = "force-dynamic";

export default async function NewsletterPreferencesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  return <NewsletterPreferencesForm token={token ?? ""} />;
}
