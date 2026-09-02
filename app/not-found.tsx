"use client";

/**
 * 404 page — shown when a route doesn't exist.
 * Why: a friendly message beats a browser error page. Also helps SEO.
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="max-w-md text-muted-foreground">
        We couldn&apos;t find that page. The weather is fine here though — maybe try
        searching for a city instead.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Go home
      </Link>
    </div>
  );
}