"use client";

/**
 * Root error boundary — catches rendering errors on any route.
 * Why: without this, a crash in any component shows a blank white page.
 * With it, the user sees a friendly message and can try again.
 * Think: the safety net under a trapeze artist.
 */

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground">
        We couldn&apos;t load this page. This usually happens when we can&apos;t reach
        the weather service. Try again, or check back in a moment.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}