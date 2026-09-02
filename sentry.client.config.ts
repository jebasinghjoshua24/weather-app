import * as Sentry from "@sentry/nextjs";

/**
 * Sentry client (browser) init.
 * Why: only initializes when a DSN is present, and scrubs PII before anything
 * leaves the browser — GDPR requires we never send raw IPs, coordinates, or
 * search terms.
 */
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    // ── GDPR: strip personal data before it reaches Sentry ──
    beforeSend(event) {
      if (event.user) {
        delete event.user.email;
        delete event.user.id;
        delete event.user.username;
      }
      if (event.request) {
        delete event.request.url;
        delete event.request.headers;
      }
      // Strip lat/lon from query strings
      if (event.request?.query_string) {
        event.request.query_string = "REDACTED";
      }
      return event;
    },

    beforeBreadcrumb(breadcrumb) {
      // Don't record URL breadcrumbs (may contain coordinates)
      if (breadcrumb.category === "fetch" || breadcrumb.category === "xhr") {
        breadcrumb.data = { ...breadcrumb.data, url: "REDACTED" };
      }
      return breadcrumb;
    },

    // Disable integrations that could capture sensitive UI data
    integrations: [],
  });
}
