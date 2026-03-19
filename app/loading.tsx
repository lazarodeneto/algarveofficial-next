export default function AppLoading() {
  return (
    <main className="min-h-[50vh] flex items-center justify-center" role="status" aria-live="polite">
      <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      <span className="sr-only">Loading</span>
    </main>
  );
}
