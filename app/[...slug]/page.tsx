import Link from "next/link";

interface LegacyRoutePageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function LegacyRoutePage({ params }: LegacyRoutePageProps) {
  const resolved = await params;
  const path = `/${(resolved.slug || []).join("/")}`;

  return (
    <main className="app-container py-20">
      <h1 className="text-3xl font-semibold">Page in Migration</h1>
      <p className="mt-4 text-muted-foreground">
        The route <code>{path}</code> is being migrated to the Next.js App Router.
      </p>
      <div className="mt-8">
        <Link href="/" className="text-primary underline underline-offset-4">
          Back to homepage
        </Link>
      </div>
    </main>
  );
}

