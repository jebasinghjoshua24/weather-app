"use client";

import { useEffect } from "react";

/**
 * Global error boundary — catches errors that even error.tsx can't handle
 * (e.g. errors in the root layout itself).
 * Why: it's the last line of defense before a white screen.
 * Note: this component must NOT rely on the root layout (it replaces it).
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to Sentry in production
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__sentry_capture?.("error", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-3xl font-semibold">Something went very wrong</h1>
          <p className="max-w-md text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}