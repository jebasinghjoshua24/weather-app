export async function register() {
  // Next.js calls this once at server startup.
  // Sentry's Next SDK auto-initializes via instrumentation; explicit imports
  // are handled by the wrapper in next.config.mjs.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Server-side instrumentation is handled by sentry.server.config.ts
    // which the Sentry webpack plugin injects automatically.
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime has separate, lighter initialization handled by the SDK.
  }
}
