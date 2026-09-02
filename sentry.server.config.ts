import * as Sentry from "@sentry/nextjs";

/**
 * Sentry server init (Node.js runtime — route handlers, server components).
 * Why: only initializes when a DSN is present. Scrubs request body/URL so
 * no location data or diary content is ever transmitted.
 */
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // GDPR: strip sensitive request data server-side too
    beforeSend(event) {
      if (event.user) {
        delete event.user.email;
        delete event.user.id;
      }
      if (event.request) {
        delete event.request.data; // never log request bodies (may contain diary/mood)
        delete event.request.headers;
      }
      return event;
    },

    ignoreErrors: [
      // These are expected, non-actionable errors
      "NEXT_HTTP_ERROR_FALLBACK",
      "fetch failed",
      "Load failed",
      "AbortError",
    ],
  });
}
