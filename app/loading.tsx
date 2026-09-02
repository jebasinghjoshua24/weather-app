/**
 * Route loading fallback — shown while a page streams in.
 * Why: a skeleton beats a flash of blank. Users see structure immediately.
 */

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="size-10 animate-spin rounded-full border-4 border-muted border-t-primary" aria-hidden="true" />
      <p className="sr-only">Loading weather…</p>
    </div>
  );
}