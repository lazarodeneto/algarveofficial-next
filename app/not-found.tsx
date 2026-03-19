import Link from "next/link";

export default function NotFound() {
  return (
    <main className="app-container flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-xs uppercase tracking-[0.24em] text-primary">404</p>
      <h1 className="mt-4 font-serif text-4xl text-foreground sm:text-5xl">Page Not Found</h1>
      <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
        The page you requested could not be found. Let&apos;s get you back to curated experiences in the Algarve.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-full border border-primary/40 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
      >
        Back to Home
      </Link>
    </main>
  );
}

